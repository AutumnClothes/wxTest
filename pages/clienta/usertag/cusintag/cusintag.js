// pages/clienta/information/grouptag/grouptag.js
var util = require("../../../../utils/util.js");
var network = require("../../../../utils/network.js");
var app = getApp();
var tagid = "";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    tagName: '',//标签名字
    checkAdd:false,//是否全选
    //测试数据
    //列表项
    list: [
    ]
  },
	/**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
wx.hideShareMenu();
		var tocusintagpage = wx.getStorageSync("tocusintagpage");
		tagid = tocusintagpage.tagid;
		this.setData({
			tagName:tocusintagpage.tagname
		});
    let h = util.systemTop() + 100
    let sh = util.systemHeight() - h - 192
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
      cH: h,
      sH:sh,
      apple: apple
    })
		
		var that = this;
		var listData = {
			funcNo:'1030',
			tagid:tagid
		};
		network.postRequest(listData).then(function(res){
			if(res.error_no == '0'){
				that.setData({
					list:res.data
				});
			}
		});
		
  },
  //全选
  bindAdd(){
    if (this.data.checkAdd){
      this.data.list.forEach((item)=>{
        item.check = '0';
        this.data.checkAdd = false
      })
    }else{
      this.data.list.forEach((item) => {
        item.check = '1';
        this.data.checkAdd = true
      })
    }
    this.setData({
      list:this.data.list,
      checkAdd: this.data.checkAdd
    })
  },
  //列表项点击行数
  itemBind(e) {
    console.log(e.currentTarget.dataset)
    let ind = e.currentTarget.dataset.ind
    if (this.data.list[ind].check == '0' || !this.data.list[ind].check) {
      this.data.list[ind].check = '1'
    } else {
      this.data.list[ind].check = '0'
    }
    this.setData({
      list: this.data.list
    })
  },
  //完成按钮
  bindTrue() {
    let lis = this.data.list
    let arr = []
    lis.forEach((item) => {
      if (item.check == '1') {
        arr.push(item.cusid);
      }
    })
		wx.setStorageSync("choosecusintag",arr);
		util.setBackexecute(2);
		wx.navigateBack({
			delta:2
		});
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
