//app.js
var version= '1.2.0';
var aldstat= require("./utils/ald-stat.js")
var bugOut =  null;
var network =null;
// bugOut = require('./utils/bugOut.min.js')
// bugOut.init(true, '26ef61b3d178a546e4df9eeddd2d55b0', version); 
App({
	logindone:function(res,that){
		// console.log(res);
	},
  onLaunch: function (options) {
		wx.removeStorage({
			key:"cusdataMapForInfomation"
    })
    var that = this;
    //具体的初始化动作，需要在具体的页面做。
    var um = wx.getUpdateManager();
    um.onUpdateReady(function () {
      network = require('./utils/network.js');
      //请求，服务器，要不要，重启，马上拉取新代码。 和修改项
      var ud = {
        funcNo:"9997",
        version:version
      }
      network.postRequest(ud).then(function(r){
        if(r.error_no == '0'){
          var reload = r.reload;
          if(reload == '1'){
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，即将重启应用',
              showCancel:false, 
              success(res) {
                if (res.confirm) {
                  um.applyUpdate()
                }
              }
            })
          }
        }else{
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，即将重启应用',
            showCancel:false, 
            success(res) {
              if (res.confirm) {
                um.applyUpdate()
              }
            }
          })
        }
      });
    })
    wx.getStorage({
      key:"launchTime4Mini",
      success:function(r){
        var t = r.data;
        t++;
        wx.setStorageSync("launchTime4Mini",t);
        wx.setStorageSync("launchFlag4Mini","1");
      }
    });
    
    /* wx.getStorage({
      key:"launchTime4Public",
      success:function(r){
        if(options["scene"] != '1043') return;
        var t = r.data;
        t++;
        wx.setStorageSync("launchTime4Public",t);
        wx.setStorageSync("launchFlag4Public","1");
      }
    }); */

    /* wx.getStorageInfo({success:function(r){
      console.log(r);
    }}); */
  },onError: function(res) {
    if(bugOut)
      bugOut.track(res)
 },onPageNotFound(res){
  if(bugOut)
    bugOut.track(res)
 },
	onShow:function(options){
    if(options["shareTicket"]){
      wx.setStorageSync("shareTicket",options["shareTicket"]);
      /*  */
    }
    var that = this;
    var arr = ['iPhone X']
    wx.getSystemInfo({
      success: function(res) {
        var sys = res.system.search(/ios/i)
        if(sys !='-1'){
          that.globalData.sysPhone = true
        }else{
          that.globalData.sysPhone = false
        }
        arr.forEach(item=>{
          var model = res.model.search(item)
          if (model != '-1') {
            that.globalData.AppleX = true
          } else {
            that.globalData.AppleX = false
          }
        })
        if (that.globalData.AppleX){
          that.globalData.scHeight = (res.windowHeight * (750 / res.windowWidth))-50
        }else{
          that.globalData.scHeight = (res.windowHeight * (750 / res.windowWidth))
        }
        that.globalData.rHeight = res.windowWidth/750
        that.globalData.gHeight = 750 / res.windowWidth
        that.globalData.contentHeight = ((res.windowHeight * (750 / res.windowWidth)) - 217);
      },
    })
	},
  globalData: {
    userInfo: {},
	messageQueue:[],
	thispage:{},
	appOnShow:null,
    AppleX:false,
    sysPhone:true,
    scHeight:'',
    rHeight:'',
    gHeight:'',
    contentHeight:'',
    bugOut: bugOut ,
    version:version
  }
})