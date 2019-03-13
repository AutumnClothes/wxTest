// pages/clienta/mine/uploadhi/uploadhi.js
var util = require('../../../../utils/util.js')
var app = getApp();
var that = null;
var backflag = false;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:'头像',
    txt:'上传头像',
    img:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
wx.hideShareMenu();
    that = this;
    this.data.img = options.img
    let h = util.systemTop()
    let ch = util.systemTop()+100
    this.setData({
      H:h,
      cH: ch
    })
    backflag = false;
  },
  picBindOn() {
    if (this.data.img!=null && this.data.img !=undefined && this.data.img!=""){
      wx.chooseImage({
        count:1,
        sizeType:["compressed"],
        success(res){
          that.data.img = res.tempFilePaths[0]
          wx.showToast({
            title: '图片替换完成。',
            icon:'none'
          })
          that.setData({
            headimg: that.data.img
          })
          backflag = true;
          wx.navigateBack({
            delta:1
          });
        }
      })
    }else{
      wx.navigateTo({
        url: '/pages/picture/picture'
      })
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
    var that = this
    if(this.data.img!=null && this.data.img !=undefined && this.data.img!=""){
      this.setData({
        headimg: this.data.img,
        title:'图片',
        txt:'更换图片'
      })
    }else{
      var headimg = app.globalData.managerData.portrait_path;
      if (headimg != null && headimg.indexOf("qlogo") != -1) {
        headimg = headimg.substr(0, headimg.length - 3) + "0";
      }
      this.setData({
        headimg: headimg
      })
    }
    util.backexecute(res=>{
      var head = res.head
      if(head){
        wx.showToast({
          title:'上传'+ that.data.title +'成功',
          icon:'none'
        })
      }
    },'uploadhi')
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
    if(backflag)
      util.setBackexecute(1,'img',this.data.img)
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
