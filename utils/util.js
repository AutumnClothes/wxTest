var network = require("../utils/network.js")
var app = getApp();
var api = require("../utils/api.js")
/**
 * 年月日时分秒
 * @param {*} date 
 */
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return year+'年' + month+'月' + day+'日' + ' ' + hour+'时' + minute+'分'+ second+'秒'
}
/**
 * 聊天列表的时间展示
 * 当天
 * 昨天
 * @param {*} timeline 
 */
function formatTimeLine(timeline){
	if(!timeline) return "";
	var md = new Date(timeline);
	var now =  new Date();
	var str = "";
	if(md.getYear() ==  now.getYear() 
		&& md.getMonth() == now.getMonth() 
		&& md.getDate() == now.getDate()){
		str = (md.getHours()<10?("0"+md.getHours()):md.getHours()) +":"
		+(md.getMinutes()<10?("0"+md.getMinutes()):md.getMinutes()); //+":"+md.getSeconds()
	}else{
		str = md.getFullYear()+"/"+
		((md.getMonth()+1)<10?"0"+(md.getMonth()+1):(md.getMonth()+1))
		+"/"+(md.getDate()<10?"0"+md.getDate():md.getDate());
	}
	return str;
}
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
//获取设备height =>rpx
var app = getApp();
function systemHeight() {
	let scHeight = app.globalData.scHeight
  return scHeight
}
//设备rpx值
function rHeight() {
	let rHeight = app.globalData.rHeight
  return rHeight
}
//设备PT值
function gHeight() {
  let gHeight = app.globalData.gHeight
  return gHeight
}

//计算content的高度
function systemForm(){
  let contentHeight = app.globalData.contentHeight
  return contentHeight
}

//返回左上margin-top
function  systemTop() {
  let sysPhone = app.globalData.sysPhone
  let num = null
  let topHeight = null
  if (sysPhone) {
    num = 4
  } else {
    num = 8
  }
  wx.getSystemInfo({
    success: function (res) {
      topHeight = ((res.statusBarHeight + num) * (750 / res.windowWidth))
    }
  })
  return topHeight
}

//键盘弹起
function onTotalReady(selector,time = 50,callback){
  const query = wx.createSelectorQuery()
  let timer = setInterval(()=>{
    query.select(selector).boundingClientRect(rect=>{
      if (rect !== null && time !== null) {
        clearInterval(timer)
        timer = null
        callback(rect)
      }
    }).exec()
  },time)
}
function contenttype(type){
	var contenttype = "";
	switch(type){
		case 'fc':
		contenttype = '首次查看了名片' ; break;
		case 'rc':
		contenttype = '查看了名片' ; break;
		case 'tc':
		contenttype = '转发了名片' ; break;
		case 'rp':
		contenttype = '查看了产品' ; break;
		case 'tp':
		contenttype = '转发了产品' ; break;
		case 'rt':
		contenttype = '阅读了文章' ; break;
		case 'tt':
		contenttype = '转发了文章' ; break;
		case 'rm':
		contenttype = '查看了个人专栏' ; break;
		case 'sc':
		contenttype = '保存了电话' ; break;
	}
	return contenttype;
}
// 在onshow里注册
function backexecute(execute,funcflag){
	var pageStack = getCurrentPages();
	var nowPage = pageStack[pageStack.length-1];
	var backexecuteFlag = nowPage.backexecuteFlag;
	var func = nowPage.funcflag;
	var param = nowPage.backexecuteparam;
	if(funcflag == null) funcflag = 'default';
	if(backexecuteFlag && func == funcflag){
		execute(param);
		nowPage.backexecuteFlag = false;
		nowPage.funcflag = "";
		nowPage.backexecuteparam = "";
	}
}
// 上一个页 是1    设标志 回到第几页，回调那个方法。
function setBackexecute(index,funcflag,param){
	if(funcflag == null) funcflag = 'default';
	if(param == null) param = "nullparam";
	var pageStack = getCurrentPages();
	var thepage = pageStack[pageStack.length - 1 - index];
	thepage.backexecuteFlag = true;
	thepage.funcflag = funcflag;
	thepage.backexecuteparam = param;
	
}
//获取formId
function getFormId(e){
	try {
		var pageStack = getCurrentPages();
    var route = pageStack[pageStack.length - 1].route
		var formid = e.detail.formId;
		var formkey = e.currentTarget.dataset.formkey
		if(!formkey){formkey = e.detail.target.dataset.formkey}
		var fd = {
			funcNo: "9999",
			creator: app.globalData.managerData.id,
			formid: formid,
			router: route,
			formkey:formkey
		}
		network.postRequest(fd,null ,null ,null ,true);	
	} catch (error) {
	}
}
//客户端获取formId
function getFormIdB(e) {
	try {
		var pageStack = getCurrentPages();
    var route = pageStack[pageStack.length-1].route
		var formid = e.detail.formId;
		var formkey = e.currentTarget.dataset.formkey
		if(!formkey){formkey = e.detail.target.dataset.formkey}
		var fd = {
			funcNo: "9999",
			creator: app.globalData.customerData.id,
			formid: formid,
			router: route,
			formkey:formkey
		}
		network.postRequest(fd,null ,null ,null ,true);		
	} catch (error) {
		
	}
}
/**
 * yyyymmmdd
 * @param {*} time 
 */
 
function getPathDateStr(time){
		var theDate =  new Date(time);
		var fullyear = theDate.getFullYear();
		var month = theDate.getMonth()+1;
		month = month > 9 ? month : ("0"+month)   ;
		var day =  theDate.getDate();
		day = day >9 ? day :('0'+day);
		
		var str = fullyear+""+month+""+day;
		return str;
	}

/**
 *  ymd hm
 * @param {*} time 
 */
function	getShowTimeStr(time){
		var theDate =  new Date(time);
		var fullyear = theDate.getFullYear();
		var month = theDate.getMonth()+1;
		month = month > 9 ? month : ("0"+month)   ;
		var day =  theDate.getDate();
		day = day >9 ? day :('0'+day);
		
		var hour = theDate.getHours();
		hour = hour>9 ? hour: ('0'+hour);
		
		var minute = theDate.getMinutes();
		minute =  minute> 9  ? minute: "0"+minute;
		
		var finalStr = fullyear+"/"+month+"/"+day+" "+hour+":"+minute;
		return finalStr;
	}
	
	function getArticleTitleImg(one){
		if(one.type=='2' ){// 自编
			var img = 'https://www.willsfintech.cn:9004/staticFile/image/articletitle1.png'
			return img;
		}else if(one.type == '1'){ // 收录
			var img = 'https://www.willsfintech.cn:9004/staticFile/image/articletitle2.png'
			return img;
		}else if(one.type =='0'){
			var pathDate = getPathDateStr(one.scratchtime);
			var pathid = one.pathid;
			var img = 'https://www.willsfintech.cn:9004/articleHtml/'+pathDate+"/"+pathid+"/title.jpg";
			return img;
		}else if(one.type){
			return one.type;
		}
	}
	function getLastMessageShowContent(lastRecord){
		if(lastRecord["contenttype"] == 'img'){
			return "[图片]"
		}else if(lastRecord["contenttype"] == 'article'){
				if (typeof  lastRecord["content"] ==  "string")
					lastRecord["content"] = JSON.parse(lastRecord["content"]);
				return "[资讯] "+lastRecord["content"].title;
		}else if(lastRecord["contenttype"] == 'product'){
			if (typeof  lastRecord["content"] ==  "string")
					lastRecord["content"] = JSON.parse(lastRecord["content"]);
			return "[产品] "+lastRecord["content"].title;
		}else{
			return lastRecord["content"];
		}
	}
	//clientb访问image路径不对
	function clientbImage(url){
		if(typeof url != 'string')return;
		if(url != null && url != undefined){
			if(url.search('image/img') != -1){
				url = url.replace('../../../../image/img','../../../image/img')
			}
		}
		return url
	}
	//canvas长文本换行逻辑(文本，最大宽度,起始高度，字体大小，字间距,行间距,是否居中)
	//起始高度应该为文本top值 + margin-top + 行高
	function longTextEnter(text,maxWidth,startHeight,fontSize,sapcing,lineHeight,keys,keysX){
		var p = /^[0-9a-z]*$/i;
		var pc = /^[A-Z]*$/;
		var u = /[\uD83C|\uD83D|\uD83E]/;//匹配表情
    var arr = [];
    var width = 0;
		var height = startHeight;
    if(typeof text != 'string')return;
    for (var i = 0; i < text.length; i++) {
			var a = text.charAt(i)
			var re = u.test(a)
			if(re){
				var a = text.charCodeAt(i);
        var b = text.charCodeAt(i + 1);
        var ca = String.fromCharCode(a);
        var cb = String.fromCharCode(b);
        a = ca.concat(cb);
        i++
			}
      arr.push(a)
    }
    var j = 0
    arr.forEach((item,index)=>{
      var b = p.test(item)
      if(b){
        var obj = {
					text:item,
					x:width,
					y:height
				}
        if((width+fontSize) > maxWidth ){
          width = 0;
          j++;
          height = startHeight + lineHeight * j;
        }else{
					var bc = pc.test(item)
					if(bc){
						width = width+(fontSize)*0.8 + sapcing
					}else{
						width = width+(fontSize)*0.5 + sapcing
					}
				}
      }else{
        var obj = {
          text:item,
          x:width,
          y:height
        }
        if((width+fontSize) > maxWidth ){
          width = 0;
          j++;
          height = startHeight + lineHeight * j;
        }else{
          width = width + fontSize + sapcing
				}
			}
      arr[index] = obj
    })
		//居中逻辑
		if(keys){
			var indarr = []
			var startind = 0;
			arr.forEach((item,index)=>{
				if(item.x + fontSize > maxWidth){
					var obj = {
						startind : startind,
						ind : index,
						itemx : (750 - item.x - fontSize)/2
					}
					indarr.push(obj)
					startind = index + 1
				}
				if(index == arr.length-1){
					var obj = {
						startind : startind,
						ind : index,
						itemx : (750 - item.x - fontSize)/2
					}
					indarr.push(obj)
				}
			})
			indarr.forEach(item=>{
				for(var i=item.startind;i<=item.ind;i++){
					var one = arr[i];
					arr[i].x = arr[i].x + item.itemx
				}
			})
		}else{
			arr.forEach(item=>{
				item.x = item.x + keysX
			})
		}
    return arr;
	}
	function nextCourseText(course,nottoserver){
		if(!nottoserver){
			nottoserver = false;
		}
		var courselist = ["",
			{title:"完成任务，获得5天会员",desc:"递出的名片石沉大海，活跃在各种微信群，仍苦苦发掘不到客户？在这里，任意访问即可获客",button:"获得一位客户",free:5,to:"information1"},
			{title:"完成任务，获得5天会员",desc:"世界上最遥远的距离是，客户明明在群里，而我却加不到微信。在这里，不加微信即可沟通",button:"主动推送消息",free:5,to:"information1"},
			{title:"完成任务，获得3天会员",desc:"手头产品、资讯那么少，拿什么服务客户？在这里，轻松打造专属资讯库",button:"新增一篇资讯",free:5,to:"job"},
			{title:"完成任务，获得3天会员",desc:"朋友圈发了那么多的资讯海报，客户到底看没看？给海报加上二维码，客户访问立即跟进。",button:"推荐一篇资讯",free:3,to:"job"},
			{title:"完成任务，获得5天会员",desc:"客户来了，留不住又有什么用？运用专栏留下你值得信赖的专业形象吧",button:"发布一篇专栏",free:3,to:"job"},
			{title:"完成任务，获得3天会员",desc:"一般图文资讯如何展现金融产品特点？在这里，金融产品定制封面，关键信息快速传递。",button:"新增一款产品",free:3,to:"job"},
			{title:"完成任务，获得3天会员",desc:"除了微信，微博、论坛、贴吧等平台如何获客呢？名片海报来帮你",button:"生成名片海报",free:3,to:"mine"},
			{title:"完成任务，获得3天会员",desc:"完善内容后，获得5名客户，即可完成教程。领取30天会员，永久解锁主动获客功能。",button:"获得5名客户",free:3,to:"customer1"}];
		if(!course){
			course = wx.getStorageSync("course");
		}
		var done = 0;
		var next = 0;
		for(var i = 1 ; i< course.length; i++){
			var one = course[i];
			if(one){
				done++;
			}else if(next == 0){
				next = i;
			}
		}
		var o = courselist[next];
		if(done <7){
			o.button="下一步："+o.button;
		}else if(done == 7){
			o.button="最后一步："+o.button;
		}else{
			courseDone(app.globalData.managerData.id,function(expire){
				app.globalData.managerData.expire = expire;
				app.globalData.managerData.state = '2';
			});
			o = {title:"恭喜完成教程",desc:"主动推送消息功能已解锁，可免费使用。累计获得会员时长45天",button:"加入种子用户群",free:0,to:"showCard"};
			wx.setStorageSync("launchTime4Mini",0); // 教程完成，开始计时。
			wx.setStorageSync("launchTime4Public",0); // 教程完成
			wx.setStorageSync("goodTool","1");
		}
		o.rate = done+'/8';
		if(done !=8 && !nottoserver){
			courseStateToServer(course);
		}
		o.done = done;
		return o;
	}
	function toNextCourse(o,callback){
		var pages =  getCurrentPages();
		if(pages.length == 1){
			if(callback)callback();
			return;
		}
		setBackexecute(pages.length-1,"courseNext",o.to);
		wx.navigateBack({
			delta:pages.length-1
		});
	}
	function freeMonth(id,callback){
		var d = {
			funcNo:"1052",
			id:id,
			state:"1"
		};
		network.postRequest(d).then(function(r){
			
			if(r.error_no == '0'){
				callback(r.expire);
			}
		});
	}
	function courseDone(id,callback){
		var d = {
			funcNo:"1052",
			id:id,
			state:"2"
		};
		network.postRequest(d).then(function(r){
			
			if(r.error_no == '0'){
				callback(r.expire);
			}
		});
	}
	function courseStateToServer(course){
		var d = {
			funcNo:"1055",
			id:app.globalData.managerData.id,
			course:course
		};
		network.postRequest(d);
	}
module.exports = {
  formatTime: formatTime,
  systemHeight: systemHeight,
  systemForm:systemForm,
	formatTimeLine:formatTimeLine,
  systemTop: systemTop,
	contenttype:contenttype,
	backexecute:backexecute,
	setBackexecute:setBackexecute,
  gHeight: gHeight,
  rHeight: rHeight,
  getFormId: getFormId,
  getFormIdB: getFormIdB,
	getPathDateStr:getPathDateStr,
	getShowTimeStr:getShowTimeStr,
	getArticleTitleImg:getArticleTitleImg,
	getLastMessageShowContent:getLastMessageShowContent,
	clientbImage:clientbImage,
	longTextEnter:longTextEnter,
	nextCourseText:nextCourseText,
	toNextCourse:toNextCourse,
	freeMonth:freeMonth
}