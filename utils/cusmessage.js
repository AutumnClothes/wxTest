var config =require("../config.js");
var util = require("./util.js");
var network = require("./network.js");
//----------------------
var app = getApp();
var socketTask = null;

var socketIsOpen = false; // 连接是否开启的。
var tryopenING = false;// 正在尝试打开连接。
var closeConnection = false;// 手动关闭的。
var theCloseCallBack = null;
var hbintervalid = null; //心跳
var tryconnetionIntervalid = null; // 重连
var lastIntervalExecuteFlag = true;  // 重连是否执行的。


var thisobject = {};

function save(msd) {
	if(msd["contenttype"] == 'update')return;
	var oppoid =  msd.managerid;
	var timeline = new Date().getTime();
	msd["timeline"] =msd["timeline"]?msd["timeline"]:timeline;
	var list =  wx.getStorageSync("messagelist"+oppoid);
	if(!list){
		list = [];
	}
	list.push(msd);
	wx.setStorageSync("messagelist"+oppoid,list);
}
thisobject.getStatus = function(){
	return socketIsOpen;
}
thisobject.gettryopenING = function(){
	return tryopenING;
}
thisobject.closeConnection = function(callback){
	console.log("close state:"+tryopenING+","+closeConnection+","+socketIsOpen);
	
	if(tryopenING){ // 正在尝试连接的时候。操作没反应。
		return ;
	}
	if(closeConnection)return;
	closeConnection = true;
	if(callback){
		theCloseCallBack = callback;
	}

	if(tryconnetionIntervalid!=null){ // 关闭interval
		clearInterval(tryconnetionIntervalid);
		tryconnetionIntervalid=null;
	}

	if(!socketIsOpen){
		theCloseCallBack= null;
		callback();
		closeConnection = false;
		return ;
	}
	// 本身就是关闭的
	socketTask.close({});
}
thisobject.openConection =  function(id,toid,callback){

	if(closeConnection){
		console.log("closing ,wating",id,toid,callback);
		setTimeout(function(){
			thisobject.openConection(id,toid,callback);
		},300);
		return ;
	}

    // 打开连接 
	if(socketIsOpen){
		if(tryconnetionIntervalid!=null){ // 关闭interval
			clearInterval(tryconnetionIntervalid);
			tryconnetionIntervalid=null;
		}
		return ;
	}
	if(tryopenING){ // 正在尝试连接的时候。操作没反应。
		return ;
	}
	tryopenING = true;
	console.log("try open",util.formatTimeLine(new Date().getTime()),":"+new Date().getTime());
    socketTask =  wx.connectSocket({
      url: config.websocketurl
    });
    socketTask.onError(function(r){
		console.log("errorb "+new Date().getTime());
		tryopenING = false;
		lastIntervalExecuteFlag = true;
		socketIsOpen = false;
		socketTask = null;
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
		
	socketTask.onOpen(function (r) {
		tryopenING = false;
		console.log("openb "+new Date().getTime());
			lastIntervalExecuteFlag = true;
			socketIsOpen  = true;
      //发送创建连接消息
      var msd = {id:id, messagetype: "c",toid:toid };
      socketTask.send({
        data: JSON.stringify(msd)
    });
			//创建心跳
	if(hbintervalid==null){
			hbintervalid =  setInterval(function(){
					console.log("hearbeatb",new Date().getSeconds());
					socketTask.send({
						data: "heartbeat"
					});
			},5000); 
	}
	if(callback)
		callback();
	})
	
	socketTask.onClose(function(e){
			socketIsOpen = false;  // 
			socketTask = null;
			console.log("closeb",util.formatTimeLine(new Date().getTime()));
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
						
						console.log("intervalb",new Date().getSeconds());
						if(!lastIntervalExecuteFlag){ // 上一个执行没有结果，下一个不执行。
							return;
						}
						lastIntervalExecuteFlag = false;
						thisobject.openConection(id,toid,function(){ // 重连成功了需要做的。
							// console.log("reconnection success",util.formatTimeLine(new Date().getTime()));
							// 新消息 1011 报错到本地，之后去调用 thispage的渲染
							
							if(tryconnetionIntervalid!=null){ // 关闭interval
								clearInterval(tryconnetionIntervalid);
								tryconnetionIntervalid=null;
							}
							
							var rdata = {
								funcNo:"1002",
								mineid:id,
								opponentid:toid,
								timeline:0
							}
							var message = wx.getStorageSync("messagelist"+toid);
							network.postRequest(rdata).then(function(res){
								if(res.error_no != '0') return;
								var newdata =res.data;
								for(var i = 0 ; i< newdata.length ; i++){
									var one = newdata[i];
									var direction = one.toid == toid? "send":'receive';
									var obj = {
										managerid:toid,
										contenttype:one.contenttype,content:one.content,direction:direction,
										timeline:one.timeline
									}
									message.push(obj);
								}
								wx.setStorageSync("messagelist"+toid,message);
								app.globalData.renderPage.rerender(); // 重新渲染。
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
			if(app.globalData.renderPage.data.pageid != 'chat'){
				var unread = wx.getStorageSync("bunread");
				if(unread){
					unread = unread +1;
				}else{
					unread = 1;
				}
				wx.setStorageSync("bunread",unread);
			}
			app.globalData.renderPage.rerender();
		});
	}
	
	thisobject.receiveMessage = function(r){
		// console.log('message.js receiveMessage');
		// console.log(r);
		var data = JSON.parse(r.data);
		var oppoid =data.fromid;
		var msd = {managerid:oppoid,
			contenttype:data.contenttype,content:data.content,direction:"receive"};
		save(msd);
	};
	
	/**
	 * 
	 */
	thisobject.sendMessage = function(fromid,toid,content,contenttype,callback){
		var timeline = new Date().getTime();
		var msd = {managerid:toid,
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
			var msdsend =  {fromid:fromid,toid:toid,messagetype:"s",contenttype:contenttype,content:content};
			var messageObject = JSON.stringify(msdsend);
			socketTask.send({
				data:messageObject
			});
		}
		//-----------保存到本地库
		save(msd);
		if(callback)
			callback(socketIsOpen,timeline);
		/**
		 * 	       	消息类型 ，   c 创建连接，      s 单点消息        g群发      b  behavior
	*		内容类型          text  img   article   
	*      {fromid:"1",toid:"2",messagetype:"c",contenttype:"t",content:""}
	*      {messagetype:"c",id:"1"}
		 */
		
	}
	
	/**
	 * tfromwho 是 资讯产品，通过谁看到的。 
	 */
	thisobject.sendBehavior =function(fromid,toid,content,contenttype,fromwho,eid,callback){
		if(!socketIsOpen){
			wx.showToast({
				title:"网络错误,请稍后重试",
				icon:"none",
				duration: 3000,
				mask:true
			});
			return false;
		}
		var msd =  {fromid:fromid,toid:toid,messagetype:"b",contenttype:contenttype,content:content};
		if((contenttype == 'rt' || contenttype == 'rp')   && !!fromwho){
			msd["fromwho"]  = fromwho;
		}
		if(eid){
			msd["entityid"]  = eid;
		}
		var messageObject = JSON.stringify(msd);
		socketTask.send({
			data:messageObject
		});
		if(callback)callback();
	}
module.exports= thisobject;