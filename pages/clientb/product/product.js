// pages/clienta/jobs/product/product.js
var util = require('../../../utils/util.js');
var network = require('../../../utils/network.js');
var app =getApp()
var that = null;

Component({
  options: {
    addGlobalClass: true,
  },
  properties:{
    tab3: {
      type: Boolean,
      value: ''
    }
  },
  data: {
      onload:false,
			list:[],
			privatelist:[]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  attached() {
		that = this;
    var ch = util.systemTop()+88;
    var sh = util.systemHeight()-ch-98;
    var apple = app.globalData.AppleX
    if (apple){
      this.setData({
        bm:50
      })
    }else{
      this.setData({
        bm:0
      })
    }
    this.setData({
      cH : ch,
      sH : sh,
    });
  },
  methods:{
    tapchange() {
      var bb = this.data.tab3
      if (bb) {
        this.datalist()
      }
    },
    datalist() {
      var managerData = wx.getStorageSync("tochatpagewmanager");
      var mid = managerData.id
      var rd = {
        funcNo: "1044",
        creator: mid
      }
      network.postRequest(rd).then(function (r) {
        if (r.error_no == '0') {
          var l = r.data;
          var pul = [];
          for (var i = 0; i < l.length; i++) {
            var one = l[i];
            one.imgurl = util.clientbImage(one.imgurl)
            if (one.tags) {
              one.tagsarr = one.tags.split(",");
            }
            if(one.keyp1 == null){
              one.keyp1 = "";
            }
            if(one.keyp2 == null){
              one.keyp2 = "";
            }
            if(one.keyp3 == null){
              one.keyp3 = "";
            }
            if (one["private"] == '1') {
            } else {
              pul.push(one);
            }
          }
          that.setData({
            list: pul
          });
        }
        that.setData({
          onload:true
        });
      },function(r){
        wx.showToast({
          title:r,
          duration:3000
        });
        that.setData({
          onload:true
        });
      })
    },
    toRead(e) {
      var i = e.currentTarget.dataset.i;
      var p = e.currentTarget.dataset.p;
      var one = null;
      if (p == "public") {
        one = this.data.list[i];
      } else {
        one = this.data.privatelist[i];
      }
      wx.setStorageSync("toproductreadpage", { data: one });
      wx.navigateTo({
        url: "product/productread/productread"
      })
    },
  },
})