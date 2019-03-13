// pages/clienta/information/groupcus/groupcus.js
var util = require("../../../../utils/util.js");
var network = require("../../../../utils/network.js");
var api = require('../../../../utils/api.js');
var app =getApp();
var tagid = "";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //测试数据
    //列表项
		showList:[],
		list:[],
    soulis:[],
		selectedNum:0
  },
	/**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
wx.hideShareMenu();
    let h = util.systemTop() + 100
    let sh = util.systemHeight() - h - 178
    this.setData({
      cH: h,
      sH: sh
    })
		
		var toaddcuspagedata = wx.getStorageSync("toaddcuspagedata");
		tagid = toaddcuspagedata.tagid;
		var storeList = toaddcuspagedata.selectedcusid;
		var nn = storeList.length;
		var  myid = app.globalData.managerData.id;
		var rdata = { managerid:myid, funcNo: '1001' };
		network.postRequest(rdata).then(res => {
			if(res.error_no == '0'){
				var resData = res.data;
				for(var i = 0 ; i < resData.length ; i++){
					var one = resData[i];
					var cusid = one.id;
					for(var j = 0 ; j <storeList.length ;j++){
						var two = storeList[j];
						if(two == cusid){
							one["store"] = '1';
							break;
						}
					}
				}
				this.data.list = resData;
				this.setData({
					showList:resData,
					selectedNum:nn
				})
			}
		})
  },
  //列表项点击行数
  itemBind(e){
    let id = e.currentTarget.dataset.id
		var l = this.data.list;
		var n = this.data.selectedNum;
		for(var i = 0 ; i< l.length ; i++){
			var one = l[i];
			if(one.id == id){
				if (one.check == '0' || one.check == undefined) { 
					one.check = '1'
					n++;
				}else{ 
					one.check = '0' 
					n--;
				}
				break;
			}
		}
    this.setData({
      showList: this.data.showList,
			selectedNum:n
    })
  },
  //完成按钮
  bindTrue(){
    let lis = this.data.list
    let arr = []
    lis.forEach((item)=>{
      if(item.check == '1'){
        arr.push(item.id);
      }
    });
		if(arr.length == 0 )return ;
		
		var members = "";
		for(var i = 0  ;i<arr.length ; i++){
			if(i == 0){
				members+=arr[i];
			}else{
				members+=','+arr[i]
			}
		}
		var addcustotagData = {
			funcNo:"1032",
			tagid:tagid,
			creator:app.globalData.managerData.id,
			cusid:members
		}
		network.postRequest(addcustotagData).then(function(res){
			if(res.error_no == '0'){
				// 回去
				util.setBackexecute(1);				
				wx.navigateBack({
					delta:1
				})
			}
		});
  },
  //搜索
  inputM(e){
    this.data.soulis=[];
    this.searchM(e)
  },
  searchM(e) {
    var that = this;
    let entry = e.detail.value
    var arr = that.data.list
    if (entry.length == 0){
      that.setData({
        showList: that.data.list
      })
    }else{
      arr.forEach((item) => {
        let nameArr = item.name?item.name:item.nickname;
				var reg = new RegExp(entry,'i'); 
				if (nameArr.match(reg) != null && entry.length != 0) {
        // if (nameArr.search(entry) != -1 && entry.length != 0) {
          that.data.soulis.push(item)
        }
      })
      this.setData({
        showList: that.data.soulis
      })
    }
  },
  //跳标签
  bindTag(){
    wx.navigateTo({
      url: '../usertag',
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
		var that = this;
		util.backexecute(function(){
			var choosecusintag =  wx.getStorageSync("choosecusintag");
			wx.removeStorage({
				key:"choosecusintag"
			});
			var listdata =that.data.list;
			for(var i = 0 ; i<listdata.length; i++){
				var one = listdata[i];
				for(var j = 0 ; j<choosecusintag.length; j++){
					var two =  choosecusintag[j];
					if(one.id == two && one.store != '1' ){
						one.check = '1';
						break;
					}
				}
			}
			var ll = 0;
			for(var i = 0  ; i< listdata.length; i++){
				var one =  listdata[i];
				if(one.check == '1' || one.store == '1'){
					ll++;
				}
			}
			that.setData({
				showList:listdata,
				selectedNum: ll
			})
		});
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
		wx.removeStorage({
			key:'toaddcuspagedata'
		})
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
