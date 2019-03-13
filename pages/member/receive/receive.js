// pages/member/receive/receive.js
var util = require('../../../utils/util.js')
var network = require('../../../utils/network.js')
var app = getApp();
var fromTemplateTo = null;
var that = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //测试数据
    num:3,
    colleague:[],
    numsArr:[],
    guidance:false,//推荐给同事
    guidance1:false,//关注公众号
    guidancePublic:false,//关注公众号教程
    recommended:false
  },
  bindback(){
    if(fromTemplateTo){
      wx.redirectTo({
        url: '/pages/clienta/clienta'
      });
    }else{
      wx.navigateBack({
        delta:1
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    fromTemplateTo = null;
    if(options["fromTemplateTo"]){
      fromTemplateTo = true;
    }
    wx.hideShareMenu();
    var h = util.systemTop()+88
    var sh = util.systemHeight()-h
    this.setData({
      cH:h,
      sH:sh
    });
    var apple = app.globalData.AppleX
    if (apple) {
      this.setData({
        bm: 50,
      })
    } else {
      this.setData({
        bm: 0,
      })
    } 
    var rd = {
      funcNo:"1051",
      id:app.globalData.managerData.id
    };
    network.postRequest(rd).then(function(r){
      if(r.error_no == '0'){
        var sum = r.sum;
        var recommended = app.globalData.managerData.recommended;
        if(sum){
          var tmparr = [];
          for(var i =0 ; i< 5;i++){
            if(i< (5-sum.length)){
              tmparr.push("0");
            }else{
              var c = sum[i+ sum.length -5];
              tmparr.push(c);
            }
          }
          that.setData({
            numsArr:tmparr
          });
        }
        var l = r.data;
        var tempArr = [];
        var rs = 0;
        for(var i = 0 ; i< l.length; i++){
          var one =  l[i];
          //   portraitpath   create_time
          var o ={
            portrait:one.portraitpath,//可直接替换成网络图
            // keys:keys,//or img
            // time:'23:59',
            // keys:'time',//or img
            // time:'23:59',
          }
          var ct = one.create_time;
          var now = new Date().getTime();
          var bet = (24* 60 *60 *1000) + ct -now;
          // num
          if(one.mid){
            rs++;
            o.keys="img";
            o.img=true;
          } else if(  bet >0  ){
            o.keys = 'time';
            var s =  Math.floor(bet/1000);
            var hour = Math.floor(s/(60*60)); // 小时
            var minute = Math.floor((s-(hour * 60 * 60))/60);
            if(minute < 10){
              minute = "0"+minute;
            }
            o.time = hour+":"+minute;
          }else{
            o.keys="img";
            o.img= false;
          }
          tempArr.push(o);
        }
        var theNum = 3-rs;
        that.setData({
          colleague:tempArr,
          num:theNum>0?theNum:0,
          recommended:recommended=='1'?true:false
        });
      }
    });
  },
  recommendBind(e){
    util.getFormId(e)
  },
  oneYearBind(e){
    util.getFormId(e);
    var yd = {
      funcNo:"1053",
      id:app.globalData.managerData.id
    };
    network.postRequest(yd).then(function(r){
      if(r.error_no == '0'){
        app.globalData.managerData.expire = r.expire;
        app.globalData.managerData.recommended = '1';
        that.setData({
          recommended:true
        });
      }
    });
    this.setData({
      guidance:true
    })
  },closeGuidance(){
    this.setData({
      guidance:false
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },subscribePublic(){
    this.setData({
      guidance1:!this.data.guidance1
    });
  },openpublic(e){
    util.getFormId(e)
    this.setData({
      guidance1:false
    });
    this.setData({
      guidancemeng:!this.data.guidancemeng,
      guidancePublic:!this.data.guidancePublic
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    //
    var id = app.globalData.managerData.id;
    var path = '/pages/clientb/clientb?sharefrom=' +id ;
    path += "&guidance=1";
    var title = "同样的产品，他却总能获客成交？试试理财顾问名片就知道";
    var shareobj = {
      title: title,
    }
    shareobj["path"] = path;
    shareobj["imageUrl"] = "https://www.willsfintech.cn:9004/shareCard/" +
      id + ".jpg" + "?time=" + new Date().getTime();
    return shareobj;
  },accreditTo(e){
    util.getFormId(e)
  }
})