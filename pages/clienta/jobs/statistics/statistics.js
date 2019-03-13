// pages/clienta\jobs\statistics/statistics.js
var util = require('../../../../utils/util.js')
var network = require('../../../../utils/network.js')
var app = getApp();
var entityid = null;
var that = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curr:0,
    current:0,
    tagTitle:'',
    tagcolor: ['#fba537', '#f8669c', '#72c976', '#71a8f4', '#b577f8'],
		taglist:[],
    //测试数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this
    let h = util.systemTop() + 100
    let sh = util.systemHeight() - h
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
    this.setData({
      cH: h,
      sH: sh
    })
    var product = wx.getStorageSync("tostatisticspage");
    var st = null;
    if(product && (product.data.style == '1'||product.data.style == '2' || product.data.style == '3')){
      st = sh - 548;
    }else if(product && product.data.style == '4'){
      st = sh- 436
    }else{
      st = sh- 308
    }
    this.setData({sT:st})
    entityid = product.data.id;
    var rd = {
      funcNo:"1063",
      mid:app.globalData.managerData.id,
      entityid:entityid
    }
    network.postRequest(rd).then(function(r){
      if(r.error_no == '0'){
        var viewData =  r.view; // 数组
        var transferData =r.transfer; 

        /**结构
         *  transfer 推荐情况。
         * 字段
         *  portraitpath  推荐人头像
              pplist   被推荐人头像列表。
              tc    推荐客户数
              tcid  推荐人 id
              tcname  推荐人名字
              tt 推荐次数

            viewData浏览情况
              cid     浏览客户id
              cname   浏览客户名字
              date    日期  yyyyMMdd
              portraitpath 浏览客户头像
              tcname  推荐人名字
              times 查看次数
         */
        console.log('transferData',transferData)
        that.setData({
          viewData:viewData,
          transferData:transferData
        })

        var  cusTagList = r.cusTagList;
        var tagList = r.tagList;
        var mapTag = {};
        for(var i = 0 ; i<tagList.length ; i++){
          var one = tagList[i];
          if(!one.tagid){
            mapTag[one.id] ={
              groupid:one.id,
              groupname:one.groupname,
              list:[]
            }
          }
        }
        for(var i = 0 ; i<tagList.length ; i++){
          var one = tagList[i];
          if(!one.tagid){
          }else{
            var selectFalg = false;
            for(var j = 0  ; j<cusTagList.length ; j++){
              var oneTagId = cusTagList[j];
              if(oneTagId == one.tagid){
                selectFalg = true;
                break;
              }
            }
            mapTag[one.id].list.push({
              tagid:one.tagid,
              tagname:one.tagname,
              select:selectFalg
            });
          }
        }
        var showList = [];
        for(var i in mapTag){
          showList.push(mapTag[i]);
        }
        that.tagColor(showList);


      }
    });
    if(product.data.articleid){
      this.setData({product:product.data,tagTitle:'产品标签'})
    }else{
      product.data.img = util.getArticleTitleImg(product.data)
      product.data.scratchTime = util.getShowTimeStr(product.data.scratchtime);
      this.setData({newmsg:product.data,tagTitle:'资讯标签'})
    }
    wx.removeStorage({key:"tostatisticspage"})

    



  }, tagBind(e){
    util.getFormId(e)
    let lis = this.data.taglist
    let index = e.currentTarget.dataset.groupindex
    let ind = e.currentTarget.dataset.tagindex;
		var tagid = e.currentTarget.dataset.tagid;
		
    lis[index].list[ind].select = !lis[index].list[ind].select;
		
		
		var rd = null;
		if(lis[index].list[ind].select){ // 增加
			rd = {
				funcNo:"1071",
				tagid:tagid,
				creator:app.globalData.managerData.id,
				cusid:entityid
			}
		}else{// 删除
			rd = {
				funcNo:"1072",
				tagid:tagid,
				cusid:entityid
			}
		}
		network.postRequest(rd).then(function(res){
			if(res.error_no == '0'){
					that.setData({
						taglist:lis
					});
			}
		});
  },tagColor(data){
    let color = this.data.tagcolor
    let list = data
    for (color.length; color.length < list.length;) {
      color = [...color, ...color]
    }
    list.forEach((item, index) => {
      list[index].color = color[index]
    })
    this.setData({
      taglist:list
    })
  },
  //tabs标签点击事件
  tabBind(e) {
    util.getFormId(e)
    let id = e.target.dataset.id
    this.setData({
      current: id
    })
  }, 
  //左右滑动
  swiperChange(e) {
    let cId = e.detail.current
    this.setData({
      curr: cId
    })
  },
  dynamicBind(e){
    var tocusdatapage = {
      id: e.currentTarget.dataset.id
    }
    wx.setStorageSync("tocusdatapage", tocusdatapage);
    wx.navigateTo({
      url: "../../cusdata/cusdata"
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