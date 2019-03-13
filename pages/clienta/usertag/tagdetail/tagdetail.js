// pages/clienta/grouphair/grouphair.js
var util = require("../../../../utils/util.js");
var network = require("../../../../utils/network.js");
var tagid = "";
var backExecuteFlag = false;
var distance = 0;
var startmove = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //群名称
    tagname:'',
    crowdId:'',//群组id
    //群人数
    num:'0',
    addShow:true,//添加成员点击后切换显示
    //测试数据
    //群成员list
    cusList:[
    ]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
wx.hideShareMenu();
    let h = util.systemTop() + 100
    let sh = util.systemHeight()-h-218
    this.setData({
      cH: h,
      sH:sh
    })
		var totagdetailpage = wx.getStorageSync("totagdetailpage");
		this.setData({
			tagname:totagdetailpage.tagname
		})
		tagid = totagdetailpage.tagid;
		this.loadData();
  },
	loadData(){
		var that = this;
		var listData = {
			funcNo:'1030',
			tagid:tagid
		};
		network.postRequest(listData).then(function(res){
			if(res.error_no == '0'){
				var num = res.data.length;
				that.setData({
					cusList:res.data,
					num:num
				});
			}
		});
	},
	tocusdatapage(e){
		var tocusdatapage = {
			id:e.currentTarget.dataset.id
		}
		wx.setStorageSync("tocusdatapage",tocusdatapage);
		wx.navigateTo({
			url:"../../cusdata/cusdata"
		})
	},
	
  bindAdd(e){
    let id = e.currentTarget.dataset.addid;
		var ids = [];
		for(var i = 0 ; i< this.data.cusList.length;i++){
			var one = this.data.cusList[i];
			ids.push(one.cusid);
		}
		var toaddcuspagedata = {
				tagid:tagid,
				selectedcusid:ids
		}
		wx.setStorageSync("toaddcuspagedata",toaddcuspagedata);
    wx.navigateTo({
      url: '../addcus/addcus',
    })
  },
  deleteTap(e){
		var that = this;
    let id = e.currentTarget.dataset.id;
		var index = e.currentTarget.dataset.index;
    var deleteData = {
			funcNo:'1033',
			tagid:tagid,
			cusid:id
		}
		network.postRequest(deleteData).then(function(res){
			if(res.error_no == '0'){
				util.setBackexecute(1);
				var list =  that.data.cusList;
				list.splice(index,1);
				that.setData({
					cusList:list,
					num:list.length
				});
			}
		});
  },
  touchS(e) {
    this.data.startx = e.changedTouches[0].clientX
    this.data.starty = e.changedTouches[0].clientY
    this.data.cusList.forEach(item => {
      item.txtStyle = 0;
    })
    this.setData({ cusList: this.data.cusList })
    startmove =null;
    distance =0;
  },
  touchM(e) {
    if (e.touches.length == 1) {
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
        this.data.txtStyle = movex;
        if(movex>0)return ;
        if( Math.abs(e.changedTouches[0].clientX - distance)<50){
          return ;
        }else{
          distance = e.changedTouches[0].clientX;
        }
        if (this.data.txtStyle < -160) this.data.txtStyle = 160;
        let ind = e.currentTarget.dataset.ind;
        this.data.cusList[ind].txtStyle = this.data.txtStyle;
        this.setData({
          cusList: this.data.cusList
        })
      }else{
        this.setData({
          scrolly: true,
        })
        this.data.txtStyle = 0
      };
    }
  },
  touchE(e){
    let endx = this.data.startx - e.changedTouches[0].clientX
    let ind = e.currentTarget.dataset.ind
    if(endx <= 60){
      this.data.cusList[ind].txtStyle = 0
    }else{
      this.data.cusList[ind].txtStyle = -160
    }
    console.log('over')
    this.setData({
      cusList: this.data.cusList,
      scrolly: true
    })
  },
  tagnameBlur(e){
		var that = this;
		var newTagname = e.detail.value;
		if(that.data.tagname == newTagname )return ;
		 var modifyData ={
			funcNo:"1031",
			tagid:tagid,
			tagname:newTagname
		}
		network.postRequest(modifyData).then(function(res){
			if(res.error_no == '0'){
				util.setBackexecute(1);
				that.setData({
					tagname:newTagname
				});
			}
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
		var that = this;
		util.backexecute(function(){
			that.loadData();
			util.setBackexecute(1);
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
