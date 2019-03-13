var o = {
};
function messageSaveProcess(msd){
	var app = getApp();
	var message = wx.getStorageSync("MESSAGE");  //聊天列表
	if(message == "") message = {};
	var cusid = msd["cusid"];
	var cusData = message[cusid];
	var direction = msd["direction"];
	if(!cusData){ // 第一条消息
		cusData = {id:cusid,unread:0};
		message[cusid] = cusData;
	}
	var torealchatpagedata = wx.getStorageSync("torealchatpage");
	var nowonchatid = "";
	if(torealchatpagedata){
		nowonchatid = torealchatpagedata["id"];
	}
	if(direction == 'receive' && cusid != nowonchatid){// 新消息 需要记录   当前正在聊天的人不记录
		message[cusid].unread = message[cusid].unread+1;
	}
	var messagesList =  wx.getStorageSync("messageList"+cusid); //  单个人的聊天数据
	if(messagesList == ""){
		messagesList = [];
	}
	var timeline = new Date().getTime();
	var newmsd = {
		//  send  or receive
		direction:msd["direction"],
		content:msd['content'],
		contenttype:msd['contenttype'],
		messagetype:msd["messagetype"],
		timeline:msd["timeline"]?msd["timeline"]:timeline
	};
	if(msd.senderr){
		newmsd["senderr"] = true;
	}
	messagesList.push(newmsd);
	wx.setStorageSync("messageList"+cusid,messagesList);
	wx.setStorageSync("MESSAGE",message);
	app.globalData.saveProcessRunning  = false;
}

/**
 * 
 一条消息的产生， 发出或者接收
 @param object{ cusid ,portrait,nickname,content,contenttype,direction}
 */

o.saveMessageToStorage = function(msd){
		messageSaveProcess(msd);
}

o.saveGroupMessageToStorage = function(msd){
	var message = wx.getStorageSync("GOUPMESSAGE");  //聊天列表
	var groupid = msd["groupid"];
	// var timeline = new Date().getTime()-10;// 确保 时间戳有差别
	var messagesList =  wx.getStorageSync("groupMessageList"+groupid); //聊天记录
	if(messagesList == ""){
		messagesList = [];
	}
	messagesList.push({
		content:msd["content"],
		contenttype:msd["contenttype"],
		timeline:msd["timeline"],
		senderr:msd["senderr"]
	});
	wx.setStorageSync("groupMessageList"+groupid,messagesList);
	wx.setStorageSync("GOUPMESSAGE",message);
}




module.exports= o;