// pages/poster/poster.js
var util = require('../../utils/util.js')
var network = require('../../utils/network.js')
var app = getApp()
var that = null;

import drawQrcode from '../../utils/weapp.qrcode.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    txt:'长按图片发送给同事，推荐三人免费获得一年会员。推荐更多同事，每位赠送会员30天。'
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    wx.hideShareMenu();
    let h = util.systemTop();
    let ch = util.systemTop()+88;
    var apple = app.globalData.AppleX
    if (apple) {
      this.setData({
        bm: 50
      })
    } else {
      this.setData({
        bm: 0
      })
    }
    this.setData({
      H:h,
      cH:ch,
    })
    wx.login({
      success(res){
        var code = res['code'];
        var rdata = {
          funcNo:'1012',
          code:code
        }
        network.postRequest(rdata).then((r)=>{
          if(r.error_no == '0'){
            if(r['manager'].length >= 1){
              var managerData = r['manager'][0];
              var name = managerData.user_name?managerData.user_name:managerData.cn_name
              var data = {
                localpath : managerData.portrait_path,
                name:name,
                id:managerData.id
              }
              that.posterBind(data)
            }
          }else{

          }
        })
      }
    })
    // this.posterBind()
  },
  backTo(e){
    wx.redirectTo({url:'../index/index'})
  },
  preview(e){
    var img = e.currentTarget.dataset.url
    wx.previewImage({
      urls:[img]
    })
  },
  shareBind(e){
    var img = e.currentTarget.dataset.img
    wx.showLoading({title:'保存中...'})
    wx.saveImageToPhotosAlbum({
      filePath: img,
      success(res) { 
        wx.setClipboardData({
          data: that.data.txt,
          success: function () {
            wx.hideLoading()
            wx.showToast({
              title: '图片已保存，文案已复制',
              icon: 'none'
            })
          }
        })
      },
    })
  },

  posterBind(data){
    var that = this;
    var localpath = data.localpath
    var name = data.name
    var rd = {
      funcNo:'1075',
      id:data.id
    }
    network.postRequest(rd).then(function(r){
      if(r.error_no == 0){
        wx.showLoading({
          title: '正在生成中...',
        })
        that.drawQ(localpath,r.theurl,name)
      }
    })
  },
  drawQ(localpath,url,name){
    var localIdPath = null
    var that = this
    drawQrcode({
      width: 180,
      height: 180,
      x: 10,
      y: 10,
      canvasId: 'myQrcode',
      ctx: wx.createCanvasContext('myQrcode'),
      typeNumber: 5,
      text: url,
      correctLevel:1,
      callback(e) {
        setTimeout(() => {
          wx.canvasToTempFilePath({
            /* x: 0,
            y: 0,
            width: 200,
            height: 200,
            destWidth: 200,
            destHeight:200 ,  */
            canvasId: 'myQrcode',
            success(res) {
              localIdPath = res.tempFilePath
              var baseImg = 'https://www.willsfintech.cn:9004/staticFile/image/base.png'
              that.getImageInfo([localpath, localIdPath,baseImg], function (arr) {
                if (arr[0] != undefined && arr[1] != undefined && arr[2] != undefined) {
                  that.draw(arr[0], arr[1],arr[2], name)
                };
              });
            }
          })
        }, 1000);
      }
    })
  },
  draw(localpath, localIdPath,base, name){
    const ctx = wx.createCanvasContext('shareCanvas');
    ctx.setFillStyle('#f2f2f2');
    ctx.fillRect(0, 0, 750, 1224);
    ctx.drawImage(base, 0, 0, 750, 1224);
    ctx.font = 'normal normal 28px PingFangSC';
    ctx.setFillStyle('#e3ca84')
    ctx.fillText(name, 166, 69);
    ctx.fillText('邀请你使用', 166, 117);
    ctx.save()
    this.drawRoundRect(ctx, 30 , 30, 110, 110, 55);
    ctx.clip()
    ctx.drawImage(localpath, 30, 30, 110, 110);
    ctx.restore()
    ctx.save()
    this.drawRoundRect(ctx, 515, 975, 205 , 205, 0);
    ctx.clip()
    ctx.drawImage(localIdPath, 515, 975, 205, 205 );
    ctx.restore()
    ctx.draw(false, function () {
      wx.canvasToTempFilePath({
        canvasId: 'shareCanvas',
        success: function (res) {
          wx.hideLoading()
          that.setData({imgPath:res.tempFilePath})
        }
      }, this)
    })
  },
  getImageInfo(url, callback) {    //  图片缓存本地的方法
    var arr = []
    url.forEach((item, index) => {
      wx.getImageInfo({   //  小程序获取图片信息API
        src: item,
        success: function (res) {
          arr[index] = res.path
          callback(arr);
        },
        fail(err) {
        }
      })
    })
  },
  drawRoundRect(ctx, x, y, width, height, radius) {
    ctx.strokeStyle = "#1d1f1d";
    ctx.stroke();
    ctx.setFillStyle('#ffffff');
    ctx.beginPath();
    ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
    ctx.lineTo(width - radius + x, y);
    ctx.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
    ctx.lineTo(width + x, height + y - radius);
    ctx.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2);
    ctx.lineTo(radius + x, height + y);
    ctx.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI);
    ctx.closePath();
    ctx.fill();
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

  },toVipPage(e){
    util.getFormId(e)
		wx.navigateTo({
			url:"/pages/member/member"
		});
	},closeVipView(){
		that.setData({vipView:false});
	},freeMonth(e){
    util.getFormId(e)
		var freeText =  e.currentTarget.dataset.freetext;
		if(freeText == '已试用') return;
		var md = app.globalData.managerData;
		util.freeMonth(md.id,function(expire){
			that.setData({vipView:false});
			md.expire = expire;
			md.state = "1";
		});
	}
})
