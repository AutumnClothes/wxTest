var config =require("../config.js");
var util = require("./util.js");
var network = require("./network.js");
var storage = require("storage.js");
var app = getApp();
//----------------------
var socketTask = null;

var socketIsOpen = false; // 连接是否开启的。
var closeConnection = false;// 手动关闭的。
var tryopenING = false;  // 正在尝试打开连接。
var theCloseCallBack = null;
var hbintervalid = null; //心跳
var tryconnetionIntervalid = null; // 重连
var lastIntervalExecuteFlag = true;  // 重连是否执行的。
var thisobject = {
};

thisobject.getStatus = function(){
	return socketIsOpen;
}
thisobject.gettryopenING = function(){
	return tryopenING;
}
thisobject.closeConnection = function(callback){
	console.log("close state:"+tryopenING+","+closeConnection+","+socketIsOpen);
	if(tryopenING){ //正在尝试连接的时候。操作没反应。
		return ;
	}

	if(closeConnection)return;
	closeConnection = true;

	if(tryconnetionIntervalid!=null){ // 关闭interval
		clearInterval(tryconnetionIntervalid);
		tryconnetionIntervalid=null;
	}
	
	if(callback){
			theCloseCallBack = callback;
	}
	if(!socketIsOpen){
		theCloseCallBack= null;
		callback();
		closeConnection = false;
		return ;
	}
	socketTask.close({});
}
thisobject.openConection = function(id,callback){
	// lastIntervalExecuteFlag = true;
	if(socketIsOpen) {
		if(tryconnetionIntervalid!=null){ // 关闭interval
			clearInterval(tryconnetionIntervalid);
			tryconnetionIntervalid=null;
		}
		return;
	}
	if(tryopenING){ // 正在尝试连接的时候。操作没反应。
		return ;
	}
	tryopenING = true;
	console.log("try connection",util.formatTimeLine(new Date().getTime()));
	socketTask=	wx.connectSocket({url: config.websocketurl});
    // 打开连接 
	socketTask.onError(function(r){
		console.log("errora "+new Date().getTime());
		tryopenING = false;
		lastIntervalExecuteFlag = true;
		socketIsOpen = false;
		socketTask =null;
		if(closeConnection){
			if(theCloseCallBack)theCloseCallBack();
			theCloseCallBack = null;
			closeConnection = false;
				// console.log("close by normal");
			return;
		}
		// 展示网络错误提示
		wx.showToast({
			title:"网络错误",
			icon:"none",
			duration: 2000
		});
	})
    // 当连接创建。
    socketTask.onOpen(function (r) {
		tryopenING = false;
		console.log("opena "+new Date().getTime());
		lastIntervalExecuteFlag = true;
		socketIsOpen  = true;
      //发送创建连接消息
      var msd = {id:id, messagetype: "c" };
      socketTask.send({
        data: JSON.stringify(msd)
      });
			//创建心跳
			if(hbintervalid==null){
					hbintervalid =  setInterval(function(){
						console.log("hearbeata",new Date().getSeconds());
						socketTask.send({
								data: "heartbeat"
							});
					},5000); 
			}
			if(callback)
				callback();
    })
	socketTask.onClose(function(e){
			console.log("closea",new Date().getSeconds());
			socketIsOpen = false;  // 
			socketTask = null;
			if(hbintervalid!=null){
				clearInterval(hbintervalid);
				hbintervalid=null;
			}
			if(closeConnection){
				if(theCloseCallBack)theCloseCallBack();
				theCloseCallBack = null;
				closeConnection = false;
					// console.log("close by normal");
				return;
			}
			console.log("close by exception",util.formatTimeLine(new Date().getTime()));
			
			// 任何非手动关闭，开启尝试，非kill process的动作
			if(tryconnetionIntervalid == null){
				tryconnetionIntervalid =  setInterval(function(){
						console.log("intervala",new Date().getSeconds());
						// console.log("interval",util.formatTimeLine(new Date().getTime()));
						if(!lastIntervalExecuteFlag){ // 上一个执行没有结果，下一个不执行。
							return;
						}
						lastIntervalExecuteFlag = false;
						thisobject.openConection(id,function(){ // 重连成功了需要做的。
							// console.log("reconnection success",util.formatTimeLine(new Date().getTime()));
							// 新消息 1011 报错到本地，之后去调用 thispage的渲染
							
							if(tryconnetionIntervalid!=null){ // 关闭interval
								clearInterval(tryconnetionIntervalid);
								tryconnetionIntervalid=null;
							}
							var unreadData = {
								funcNo:"1011",
								id:app.globalData.managerData.id
							}
							network.postRequest(unreadData).then(function(res){
								if(res.error_no == '0'){
									var theData = res.data;
									var unreadBehaviorList = res.unreadBehavior;
									for(var i = 0 ; i< theData.length;i++){
										var one = theData[i];
										one["messagetype"] = 's';
										var r = {data:JSON.stringify(one)}
										thisobject.receiveMessage(r);
									}
									for(var i = 0 ; i< unreadBehaviorList.length ; i++){
										var one = unreadBehaviorList[i];
										one["messagetype"] = 'b';
										var r = {data:JSON.stringify(one)}
										thisobject.receiveMessage(r);
									}
									app.globalData.renderPage.rerender(); // 重新渲染。
								}
							})
						});
				},5000);
			}
		});
		socketTask.onMessage(function(r){
			var md = JSON.parse(r.data);
			if(md.token){
				socketTask.send({
					data:JSON.stringify({messagetype:"r",token:md.token})
				});
			}
			thisobject.receiveMessage(r);
			app.globalData.renderPage.rerender();
		});
  }
	
	thisobject.receiveMessage = function(r){
			var data = JSON.parse(r.data);
			var messageType = data.messagetype ;
			if(messageType == 'b'){
				if(data.contenttype == 'fc'){// 第一次阅读名片   记录入 新客户列表    潜在客户列表。
					wx.removeStorageSync("cusdataMapForInfomation");
					var record = wx.getStorageSync("newCusRecord");
					if(!record){
						record = {singleDotList:[],topDotList:[],reloadFlag:false};
					}
					record.singleDotList.push(data.fromid);
					record.topDotList.push(data.fromid);
					record.reloadFlag = true;
					wx.setStorageSync("newCusRecord",record);
				}
				var bl = wx.getStorageSync("behaviorList");
				if(!bl) bl = [];
				var timeline = "";
				if(data["timeline"]){
					timeline = data["timeline"];
				}else{
					timeline = new Date().getTime();
				}
				
				bl.push({cusid:data.fromid,
				contenttype:data.contenttype,content:data.content,timeline:timeline});
				wx.setStorageSync("behaviorList",bl);
				var bu =  wx.getStorageSync("behaviorUnread");
				if(!bu) bu = 0;
				bu++;
				wx.setStorageSync("behaviorUnread",bu);
			}else{
				if(data.contenttype == 'update'){
					wx.removeStorageSync("cusdataMapForInfomation");
				}
				var msd = {cusid:data.fromid,
					contenttype:data.contenttype,content:data.content,direction:"receive"};
				storage.saveMessageToStorage(msd);
			}
		};
	/**
	 * 
	 */
	// thisobject.sendMessage = function(fromid,toid,portrait,nickname,content,contenttype){
		thisobject.sendMessage = function(fromid,toid,content,contenttype,callback){
			var timeline = new Date().getTime();
			var msd = {cusid:toid,
				contenttype:contenttype,content:content,direction:"send",timeline:timeline};
		
		if(!socketIsOpen){
			wx.showToast({
				title:"网络错误,请稍后重试",
				icon:"none",
				duration: 3000,
				mask:true
			});
			msd.senderr = true;
		}else{
			var  msdsend =  {fromid:fromid,toid:toid,messagetype:"s",
			contenttype:contenttype,content:content};
			var messageObject = JSON.stringify(msdsend);
			socketTask.send({
				data:messageObject
			});
		}
		//-----------保存到本地库
		
		storage.saveMessageToStorage(msd);
		
		if(callback)
			callback(socketIsOpen,timeline);
	}
	thisobject.immediately = function(fromid,toid){
		if(!socketIsOpen){
			wx.showToast({
				title:"网络错误,请稍后重试",
				icon:"none",
				duration: 3000,
				mask:true
			});
		}else{
			var msd = {fromid:fromid,toid:toid,messagetype:"o"};
			var messageObject = JSON.stringify(msd);
			socketTask.send({
				data:messageObject
			});
		}
	}
	
	thisobject.sendGroupMessage = function(fromid,togroupid,content,contenttype,members,callback){
		var timeline = new Date().getTime();
		var msd = {groupid:togroupid,
			contenttype:contenttype,content:content,timeline:timeline};
		if(!socketIsOpen){
			wx.showToast({
				title:"网络错误,请稍后重试",
				icon:"none",
				duration: 3000,
				mask:true
			});
			msd.senderr = true;
		}else{
			for(var i = 0 ; i<members.length ; i++){
				var one =  members[i];
				var msdsend = {cusid:one["id"],
					contenttype:contenttype,content:content,direction:"send",messagetype:'g',timeline:timeline};
				storage.saveMessageToStorage(msdsend);
			}
			var msdg =  {fromid:fromid,togroupid:togroupid,messagetype:"g",contenttype:contenttype,content:content};
			var messageObject = JSON.stringify(msdg);
			socketTask.send({
				data:messageObject
			});
		}
		//-----------保存到本地库
		storage.saveGroupMessageToStorage(msd);
		if(callback)
			callback(socketIsOpen,timeline);
	}
	thisobject.updateUserChatList = function (userList){
	}
module.exports= thisobject;