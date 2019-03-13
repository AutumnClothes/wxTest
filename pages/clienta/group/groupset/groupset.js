// pages/clienta/grouphair/grouphair.js
var util = require("../../../../utils/util.js");
var network = require("../../../../utils/network.js");
var groupid = null;
var app = getApp();
var startmove;
var distance;
var willupdate={
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    startx:'',
    starty:'',
    txtStyle:'',
    scrolly:true,
    //群名称
    groupname:'',
    //群人数
    num:'',
    addShow:true,//添加成员点击后切换显示
    //测试数据
    //群成员list
		
    grouplist:[
    ]
  },/**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
wx.hideShareMenu();
		willupdate = {};
    let h = util.systemTop() + 100
    let sh = util.systemHeight()-h-218
    this.setData({
      cH: h,
      sH:sh
    })
		var togroupsetpage =  wx.getStorageSync("togroupsetpage");
		groupid = togroupsetpage.groupid;
		this.setData({
			groupname:togroupsetpage.groupname,
			grouplist:togroupsetpage.theMemberList,
			num:togroupsetpage.theMemberList.length
		});
		// console.log(togroupsetpage);
  },tocusdatapage(e){
		var tocusdatapage = {
			id:e.currentTarget.dataset.id
		}
		wx.setStorageSync("tocusdatapage",tocusdatapage);
		wx.navigateTo({
			url:"../../cusdata/cusdata"
		})
	},
  bindAdd(e){
		var ids = [];
		for(var i = 0 ; i< this.data.grouplist.length;i++){
			var one = this.data.grouplist[i];
			ids.push(one.id);
		}
		var togroupcuspagedata = {
				groupid:groupid,
				selectedcusid:ids
		}
		wx.setStorageSync("togroupcuspagedata",togroupcuspagedata);
		
    wx.navigateTo({
      url: '../groupcus/groupcus',
    })
  },
  crowdTo(e){
    let id = e.currentTarget.dataset.id
    console.log('点击事件：跳，id为',id)
  },
  touchS(e) {
    this.data.startx = e.changedTouches[0].clientX
    this.data.starty = e.changedTouches[0].clientY
    this.data.grouplist.forEach(item => {
      item.txtStyle = 0;
    })
    this.setData({ grouplist: this.data.grouplist })
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
      this.data.txtStyle = movex;
      if(movex>0)return ;
      if( Math.abs(e.changedTouches[0].clientX - distance)<50){
        return ;
      }else{
        distance = e.changedTouches[0].clientX;
      }
      if (this.data.txtStyle < -160) this.data.txtStyle = 160;
      let ind = e.currentTarget.dataset.ind;
      this.data.grouplist[ind].txtStyle = this.data.txtStyle;
      this.setData({
        grouplist: this.data.grouplist
      })
    }else{
      this.setData({
        scrolly: true,
      })
      this.data.txtStyle = 0
    };
  },
  touchE(e) {
    let endx = this.data.startx - e.changedTouches[0].clientX
    let ind = e.currentTarget.dataset.ind
    if(endx <= 60){
      this.data.grouplist[ind].txtStyle = 0
    }else{
      this.data.grouplist[ind].txtStyle = -160
    }
    console.log(0)
    this.setData({
      grouplist: this.data.grouplist,
      scrolly: true
    })
  },
  bindinput(e){
		var value = e.detail.value;
		if(value !=null && value.length >10){
			value = value.substr(0,10);
		}
		return value;
	},
  crowdBlur(e){
		if(e.detail.value == ""){
			e.detail.value = '群发'
		}
    if(e.detail.value == this.data.groupname)return ;
		var newGroupname = e.detail.value;
		var that = this;
		var modifyData = {
			funcNo:'1034',
			groupid:groupid,
			groupname:newGroupname
		}
		network.postRequest(modifyData).then(function(res){
			if(res.error_no == '0'){
				that.setData({
					groupname:newGroupname
				})
				willupdate["groupname"] = newGroupname;
				util.setBackexecute(1,'update',willupdate);
				
				var gml = wx.getStorageSync("GROUPMESSAGE");
				var group = gml[groupid];
				group["groupname"] = newGroupname;
				wx.setStorageSync("GROUPMESSAGE",gml);
			}
		});
  },deleteTap(e){
		var that = this;
    let id = e.currentTarget.dataset.id;
		var index = e.currentTarget.dataset.index;
    var deleteData = {
			funcNo:'1035',
			groupid:groupid,
			member:id
		}
		network.postRequest(deleteData).then(function(res){
			if(res.error_no == '0'){
				
				var list =  that.data.grouplist;
				list.splice(index,1);
				that.setData({
					grouplist:list,
					num:list.length
				});
				willupdate["grouplist"] = list;
				util.setBackexecute(1,'update',willupdate);
				
				var gml = wx.getStorageSync("GROUPMESSAGE");
				var group = gml[groupid];
				group["groupcount"] = list.length;
				wx.setStorageSync("GROUPMESSAGE",gml);
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
			var groupmemberListData = {
				funcNo:"1005",
				groupchatid:groupid,
				creator:app.globalData.managerData.id
			}
			network.postRequest(groupmemberListData).then(function(res){
				if(res.error_no == '0'){
					var members = res.data;
					if(members!=null){
						that.setData({
							grouplist:members,
							num:members.length
						});
						
						willupdate["grouplist"] = members;
						util.setBackexecute(1,'update',willupdate);
						
						var gml = wx.getStorageSync("GROUPMESSAGE");
						var group = gml[groupid];
						group["groupcount"] = members.length;
						wx.setStorageSync("GROUPMESSAGE",gml);
					}
				}
			});
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
