// pages/clienta/circle/circle.js
var util = require('../../../utils/util.js')
var network = require('../../../utils/network.js')
var app = getApp()
var distance = 0;
var startmove = null;
var that = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    //滑动
    startx:'',
    starty:'',
    endx:'',
    endy:'',
    iteLeft: '',
    scrolly:true,
    editButton:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showShareMenu({
      withShareTicket:true
    })
    that =this;
    let h = util.systemTop() + 88
    let sch = util.systemHeight() - h
    var apple = app.globalData.AppleX;
    if (apple) {
      this.setData({
        bm: 50
      });
    } else {
      this.setData({
        bm: 0
      });
    }
    this.setData({
      cH: h,
      scH:sch
    })

    var rd = {
      funcNo:"1057",
      mid:app.globalData.managerData.id
    };
    network.postRequest(rd).then(function(r){
      if(r.error_no == '0'){
        var list = r.data;
        var templist = [];
        for(var i = 0 ; i< list.length;i++){
          var one = list[i];
          var o = {
            portrait:'../../../image/img/circle.png',//群头像
            iteLeft:0,
            gid:one.gid
          }
          templist.push(o);
        }
        that.setData({
          list:templist
        });
      }
    });


  },
  touchS(e) {
    this.data.startx = e.changedTouches[0].clientX
    this.data.starty = e.changedTouches[0].clientY
    this.data.list.forEach(item => {
      item.iteLeft = 0;
    })
    this.setData({ list: this.data.list })
    startmove =null;
    distance =0;
  },
  touchM(e) {
    if(distance == 0){
      distance = this.data.startx;
    }
    let movex = e.changedTouches[0].clientX - this.data.startx
    let movey = e.changedTouches[0].clientY - this.data.starty
    if(startmove ==null){
      if(Math.abs(movex) > 20 || Math.abs(movey)>20){
        if(Math.abs(movex)>Math.abs(movey) ){
          startmove = true;
        }else{
          startmove = false;
        }
      }
    }
    if (startmove){
      this.setData({
        scrolly: false
      })
      this.data.iteLeft = movex;
      if(movex>0)return ;
      if( Math.abs(e.changedTouches[0].clientX - distance)<50){
        return ;
      }else{
        distance = e.changedTouches[0].clientX;
      }
      if (this.data.iteLeft < -136) this.data.iteLeft = 136;
      let ind = e.currentTarget.dataset.ind;
      this.data.list[ind].iteLeft = this.data.iteLeft;
      this.setData({
        list: this.data.list
      })
    }else{
      this.setData({
        scrolly: true,
      })
      this.data.iteLeft = 0
    };
  },
  touchE(e) {
    let endx = this.data.startx - e.changedTouches[0].clientX
    let ind = e.currentTarget.dataset.ind
    if(endx <= 60){
      this.data.list[ind].iteLeft = 0
    }else{
      this.data.list[ind].iteLeft = -136
    }
    this.setData({
      list: this.data.list,
      scrolly: true
    })
  },
  pageTo(e){
    var gid = e.currentTarget.dataset.gid;
    wx.navigateTo({
      url: 'member/member?gid='+gid
    });
  },deleteTap(e){
    var gid = e.currentTarget.dataset.gid;
    var mid = app.globalData.managerData.id;
    var rd = {
      funcNo:"1058",
      gid:gid,
      mid:mid
    }
    network.postRequest(rd).then(function(r){
      if(r.error_no == '0'){
        var list =  that.data.list;
        var di = null;
        for(var i = 0 ; i<list.length ;i++){
          var one = list[i];
          if(one.gid == gid){
            di =i;
            break;
          }
        }
        list.splice(i,1);
        that.setData({
          list:list
        });
      }
    });
  },
  accreditTo(e){
    if(app.globalData.managerData){
      util.getFormId(e)
    }else{
      util.getFormIdB(e)
    }
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
    var shareobj = {
      title: "快来与群成员交换名片，共享资讯吧。"
    }
    shareobj["path"] = "/pages/index/index?fromShareTo=qun";
    shareobj["imageUrl"] = "https://www.willsfintech.cn:9004/staticFile/qunsharecard.png";
    return shareobj;
  }
})