// pages/clientb/view/view.js
var util= require('../../../../utils/util.js')
var network = require('../../../../utils/network.js');
var app =getApp()
var toviewpagedata = null;
var that = null;
var key = null;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    mengShow:false,
		contentJson:[],
		managerData:null,
		headimg:"",
    exist:true,
    pShowAdd:'true'
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    key = null;
    wx.hideShareMenu();
		that = this;
    var ch = util.systemTop() + 88
    var sh = util.systemHeight()-ch
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
      cH:ch,
      sH:sh,
    })
    toviewpagedata = wx.getStorageSync("toviewpagedata");
    var managerData = null;
    var headImgUrl = null;
    
    if(key){
      var city = toviewpagedata.city
      city = city.replace(/,/g,'')
      managerData = {
        company : toviewpagedata.company,
        position : toviewpagedata.position,
        user_name :toviewpagedata.user_name,
        profile : toviewpagedata.profile,
        city : city,
        mobile_phone : toviewpagedata.mobile_phone
      };
      headImgUrl= toviewpagedata.portrait_path
    }else{
      var city = app.globalData.managerData.city
      city = city.replace(/,/g,'')
      managerData = app.globalData.managerData;
      managerData.city = city
      headImgUrl = managerData.portrait_path;
    }

    //company和position为空时候设置默认值
    if(!managerData.company)managerData.company ='';
    if(!managerData.position)managerData.position ='';
    if(!managerData.company && !managerData.position){
      managerData.company = '您身边的专业顾问'
      managerData.position = ''
    }
    this.getcompanyPosition(managerData)
    
		if(headImgUrl !=null && headImgUrl.indexOf("wills")!=-1)
      headImgUrl = headImgUrl.substr(0,headImgUrl.length - 4)+"s.jpg";
    this.composeLength(managerData)
		this.setData({
			headimg:headImgUrl,
			managerData:managerData
		})
		if(toviewpagedata){
			var src = "https://www.willsfintech.cn:9001/article?articleid="+toviewpagedata.id
			network.get(src).then(function(r){
        if(r == "delete"){
          that.setData({
            exist:false
          });
          return;
        }
				var c = [
          {
            name:'div',
            attrs:{
              style:'width:92%;height:auto;margin:20px auto;font-size:17px;line-height:1.6'
            },
            children:[]
          }
        ];
        c[0].children.push(r); // 文章扒取 不是数组 所以需要一个数组去加载。
        //给个父级，控制边距
        if(toviewpagedata.type == '0'){
          that.setData({
            articleTitle:toviewpagedata.title,
            fromName:toviewpagedata.nickname
          })
        }
				that.setData({
					contentJson:c
				});
      })
      this.getProduct();
    }
    var Tj = wx.getStorageSync('Tj')
    if(Tj == '0'){ this.data.pShowAdd = false }else{
      this.data.pShowAdd = true
    }
    this.setData({pShowAdd:this.data.pShowAdd})
  },
  //公司职位定位
  getcompanyPosition(data){
    if(!data)return ;
		var len =0;
		if(data.company){
			len += data.company.length;
		}
		if(data.position){
			len += data.position.length
		}
    if (len > 13){
      this.setData({
        companyPosition:true
      })
    }else{
      this.setData({
        companyPosition: false
      })
    }
  },
  //关闭shareShow
  closemeng(){
    this.setData({
      mengShow: false,
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
    that = this
    util.backexecute(function(){that.getProduct();},'product')
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

  },
  //控制公司名称与职位的位置
  composeLength(data) {
    if(data.company == null)data.company = '';
    if(data.position == null)data.position = '';
    if((data.company == null || data.company == '') && (data.position == null || data.position == ''))data.company = '您身边的专属顾问';
    if ((data.company != null || data.company != '') && (data.position != null || data.position != '')) {
      let composeLength = data.company.length + data.position.length
      if (composeLength <= 16) {
        data.compose = true
      } else {
        data.compose = false
      }
    } else {
      data.compose = true
    }
  },
  toproductlist(e) {
    util.getFormId(e)
    util.setBackexecute(0,'product');
    var tj = '0'
    wx.setStorageSync('Tj',tj)
    wx.navigateTo({
      url: "../../jobs/product/product"
    });
  },
  toproduct() {
    wx.setStorageSync("toproductreadpage", {
      data: this.data.product
    });
    wx.navigateTo({
      url: "../../jobs/productread/productread"
    })
  },
  getProduct() {
    var rd = {
      funcNo: "1044",
      creator: app.globalData.managerData.id
    }
    network.postRequest(rd).then(function(r) {
      if (r.error_no == '0') {
        var l = r.data;
        var p = null;
        for (var i = 0; i < l.length; i++) {
          var one = l[i];
          if (one["private"] == '1') {
            continue;
          }
          if (one.tags) {
            one.tagsarr = one.tags.split(",");
          }
          if (one.keyp1 == null) {
            one.keyp1 = "";
          }
          if (one.keyp2 == null) {
            one.keyp2 = "";
          }
          if (one.keyp3 == null) {
            one.keyp3 = "";
          }
          p = one;
          break;
        }
        that.setData({
          product: p
        });
      }
    });
  },copeMy(){
    var rd = {
      funcNo:'1074',
      entityid:toviewpagedata.id,
      toid:app.globalData.managerData.id
    }
    network.postRequest(rd).then(function(r){
      if(r.error_no == '0'){
        toviewpagedata.id = r.entityid;
        toviewpagedata.pathid = r.pathid;
        wx.setStorageSync("toviewpagedata",toviewpagedata);
        wx.redirectTo({
          url:"../../view/view"
        });
      }
    });
  }
})
