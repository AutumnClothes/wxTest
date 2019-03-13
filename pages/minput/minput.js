// pages/minput/minput.js
var util = require('../../utils/util.js')
var network = require('../../utils/network.js')
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
		tominputpage:{},
    title:'',
		text:"",
    backTrue:true,
    inputTrue:false,
    maxL:-1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
wx.hideShareMenu();
    var h = util.systemTop()
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
      tH: h+100,
      cH:h,
      sH:util.systemHeight()-h-200
    });
		var tominputpage = wx.getStorageSync("tominputpage");
    console.log(tominputpage)
    if (tominputpage.funcNo == '1027'){
      this.setData({
        maxL:5000
      })
    }
    if (tominputpage.funcNo == '1016' || tominputpage.funcNo == '1018') {
      this.setData({
        maxL: 200
      })
    }
		this.data.tominputpage = tominputpage;
		if(!tominputpage.value){
			tominputpage.value = "";
		}
		this.setData({
			title:tominputpage.target,
			text:tominputpage.value
		});
  },
  backto(e){
		wx.navigateBack({
			delta:1
		})
  },
  bindTrue(e){
    util.getFormId(e)
    this.data.backTrue = false;
		this.update();
  },
	bindinput(e){
    this.data.inputTrue = true
    var theValue = e.detail.value;
    if (e.detail.keycode == 10){
      theValue = theValue.substr(0,theValue.length-1)
      theValue += '\n'
    }
		this.data.text = e.detail.value;
	},
	update(){
		var that = this;
		// 更新 managerData
    var tominputpage = this.data.tominputpage;
		if(tominputpage.funcNo == '1025'){
			var updateData = {
				funcNo:tominputpage.funcNo,
				id:tominputpage.id
			}
			updateData[tominputpage.key] = this.data.text;
			network.postRequest(updateData).then(function(res){
				if(res.error_no == "0"){
					app.globalData.managerData[tominputpage.key] = that.data.text;
          wx.navigateBack({
            delta: 1
          })
				}
			});
    } else if (tominputpage.funcNo == '100'){ // product add
      if(!this.data.text){
        wx.showToast({
          title:"请添加内容",
          icon:"none"
        });
        return ;
      }
      var value = that.data.text;
      that.data.tominputpage = tominputpage.funcNo
			util.setBackexecute(1,"productcontentedit",{value:value});
      wx.navigateBack({
        delta: 1
      })
    } else if (tominputpage.funcNo == '1016' || tominputpage.funcNo == '1018'){
      if(!this.data.text){
        wx.showToast({
          title:"请添加内容",
          icon:"none"
        });
        return ;        
      }
      that.data.tominputpage = tominputpage.funcNo
      util.setBackexecute(1, tominputpage.funcNo , { value: that.data.text, key: tominputpage.key });
      console.log('key:' ,tominputpage.key)
      wx.navigateBack({
        delta: 1
      })
    }else{
			var md = {
				funcNo:tominputpage.funcNo,
				cusid:tominputpage.id,
				managerid:app.globalData.managerData.id,
			}
			md[tominputpage.key] = this.data.text;
			network.postRequest(md).then(function(res){
				if(res.error_no == '0'){
					util.setBackexecute(1,null,{value:that.data.text,key:tominputpage.key});
          wx.navigateBack({
            delta: 1
          })
				}
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
    var that = this
    if (!this.data.text) return;
    if (this.data.backTrue && this.data.inputTrue){
      var tominputpage = this.data.tominputpage;
      util.setBackexecute(1, 'value', { value: that.data.text, key: tominputpage.key });
    }
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
