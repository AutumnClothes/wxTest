// pages/member/member.js
var util = require('../../utils/util.js')
var network = require('../../utils/network.js')
var app = getApp();
var memBoxShow = false;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    time:'-',//后台获取，格式
    list:[
      {
        term: '客户动态',
        free: true,
        mem: true,
      }, {
        term: '客户咨询回复',
        free: true,
        mem: true,
      }, {
        term: '主动消息推送',
        free: false,
        mem: true,
      }, {
        term: '群发消息',
        free: false,
        mem: true,
      }, {
        term: '客户标签管理',
        free: true,
        mem: true,
      }, {
        term: '客户画像',
        free: true,
        mem: true,
      }, {
        term: '对话收录',
        free: false,
        mem: true,
      }, {
        term: '点评与推荐',
        free: true,
        mem: true,
      }, {
        term: '资讯创作',
        free: true,
        mem: true,
      }, {
        term: '资讯群发',
        free: false,
        mem: true,
      }, {
        term: '常用语',
        free: false,
        mem: true,
      }, {
        term: '产品及服务',
        free: true,
        mem: true,
      }, {
        term: '个人专栏',
        free: true,
        mem: true,
      }, {
        term: '自定义海报',
        free: false,
        mem: true,
      }
    ],
    guidance:false,//完成教程解锁
    guidanceTxt:'完成教程解锁'//文字可替换
    ,freeText:"免费试用"
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
    var h = util.systemTop()
    var sh = util.systemHeight()-h
    this.setData({
      cH:h+88,
      sH:sh
    })
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
    var md = app.globalData.managerData;
    if(md.state && md.state>'0'){
      this.setData({
        freeText:"已试用"
      });
    }
    if(md.state && md.state == '2'){
      this.setData({
        guidanceTxt:"已解锁"
      });
    }
    if(md.expire ){
      md.expire = md.expire*1;
      var now = new Date().getTime();
      if(now > md.expire){
        this.setData({time:"已到期"});
      }else{
        var s = util.getPathDateStr(md.expire);
        var timeStr = s.substring(0,4)+'-'+s.substring(4,6)+'-'+s.substring(6,8)
        this.setData({time:timeStr});
      }
    }else{
      this.setData({time:"未开通会员"});
    }
  },
  freeBind(e){
    util.getFormId(e);
    var freeText =  e.currentTarget.dataset.freetext;
		if(freeText == '已试用') return;
		var md = app.globalData.managerData;
		util.freeMonth(md.id,function(expire){
			that.setData({freeText:"已试用"});
			md.expire = expire;
			md.state = "1";
		});
  },
  memBind(e){
    util.getFormId(e);
    wx.navigateTo({
      url:"./receive/receive"
    });
  },
  closeBind(e){
    util.getFormId(e);
    this.setData({
      memBoxShow:false
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})