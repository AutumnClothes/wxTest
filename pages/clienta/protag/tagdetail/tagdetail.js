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
    tagname:'123',
    crowdId:'',//群组id
    //群人数
    num:'0',
    addShow:true,//添加成员点击后切换显示
    //测试数据
    //群成员list
    cusList:[
    ],
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
wx.hideShareMenu();
    let h = util.systemTop() + 100
    let sh = util.systemHeight()-h-110
    this.setData({
      cH: h,
      sH:sh
    })
		var totagdetailpage = wx.getStorageSync("totagdetailpage");
		this.setData({
      tagname:totagdetailpage.tagname,
      tagcd:totagdetailpage.tagcd
		})
    tagid = totagdetailpage.tagid;
    
		this.loadData();
  },
	loadData(){
		var that = this;
		var listData = {
			funcNo:'1073',
			tagid:tagid
		};
		network.postRequest(listData).then(function(res){
			if(res.error_no == '0'){
        console.log(res.data)
        var data = res.data
        for(var i=0; i<data.length; i++){
          var one = data[i];
          if(!one.articleid){
            one.imgurl = util.getArticleTitleImg(one)
            one.scratchTime = util.getShowTimeStr(one.scratchtime);
          }
          if(one.keyp1 == null)one.keyp1 = ''
          if(one.keyp2 == null)one.keyp2 = ''
          if(one.keyp3 == null)one.keyp3 = ''
        }
				that.setData({
					cusList:data,
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
  articleDelete(e){
    var that = this;
    wx.showModal({
      content: '确定要删除这篇文章吗？',
      cancelColor: '#333301',
      confirmText: '确定',
      confirmColor: '#ffa019',
      success: (result) => {
        if(result.confirm){
          var list = that.data.cusList
          let ind = e.currentTarget.dataset.ind
          var data = that.data.cusList[ind]
          var dalData = {
            funcNo:"1072",
            tagid:tagid,
            cusid:data.id
          }
          network.postRequest(dalData).then(function(res){
            if(res.error_no == '0'){
              util.setBackexecute(1);
              list.splice(ind,1)
              that.setData({cusList:list})
            }
          })
        }
      }
    });
  },
  tagnameBlur(e){
		var that = this;
		var newTagname = e.detail.value;
		if(that.data.tagname == newTagname )return ;
		 var modifyData ={
			funcNo:"1070",
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
  toReadPage(e){
    console.log(this.data.cusList)
    var ind = e.currentTarget.dataset.ind
    var td = this.data.cusList[ind]
    if(td.articleid != null){
      wx.setStorageSync("toproductreadpage", {
        data: td
      });
      wx.navigateTo({
        url: "../../jobs/productread/productread"
      })
    }else{
      wx.setStorageSync('toviewpagedata',td)
      wx.navigateTo({
        url:'../../view/view'
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
