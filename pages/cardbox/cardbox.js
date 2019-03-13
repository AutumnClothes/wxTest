// pages/cardbox/cardbox.js
var util = require('../../utils/util.js')
var network = require('../../utils/network.js')
var config = require('../../config.js')
var app = getApp();
var compose;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    topHeight: '',
    // accreditShow:"true",
    accreditType: null,
    //测试数据
    list: [],
    getUserCallBack: "",
    // leftupText:"123"
    //引导数据
    guidance1:false,//整个蒙层以及蒙层上的所有弹框
  },
  know(){
    this.setData({
      guidance1:false
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    wx.removeStorage({
      key:"bCardRedDot"
    });
    
    wx.hideShareMenu();
    var that = this;

    var leftupText = "创建我的名片";
    if (app.globalData.managerData) {
      leftupText = '我是顾问';
    }
    this.setData({
      leftupText: leftupText
    });
    wx.getStorage({ // 引导。
      key: "BGuidanceFlow",
      success: function(r) {
        if (!r || !r.data) {
          return;
        }
        var bgf = r.data;
        if (bgf["cardBox"]) {
          that.setData({
            guidance: true
          });
          bgf["cardBox"] = false;
          wx.setStorageSync("BGuidanceFlow", bgf);
          setTimeout(function() {
            that.setData({
              guidance: false
            });
          }, 5000);
        }
      }
    });

    wx.getStorage({
      key:"guidanceonceData",
      success:function(r){
        if(!r || !r.data){
          return;
        }
        var gd =  r.data;
        if(gd.cardbox){
          that.setData({
            guidanceOnce:true
          });

          gd.cardbox = false;
          wx.setStorageSync("guidanceonceData",gd);
        }
      }
    });
    let h = util.systemTop()
    let ch = util.systemTop() + 80
    let sh = util.systemHeight() - ch
    let gh = 32 * util.gHeight()
    let gt = h+gh+14
    this.setData({
      H: h,
      cH: ch,
      sH: sh,
      gH: gh,
      gT: gt
    })
    that.setData({
      topHeight: that.data.topHeight
    });

    if (!app.globalData.customerData) {
      this.data.getUserCallBack = 'addUser';
      this.getSetting(this.addUser);
      return;
    } else {
    }
    var ldata = {
      funcNo: "1023",
      cusid: app.globalData.customerData.id
    }

    network.postRequest(ldata,5,3000,true).then(function(res) {
      if (res.error_no == '0') {
        var theData = res.data;
        var cardsequence = wx.getStorageSync("cardsequence");
        if (cardsequence) {
          var newDataList = [];
          var other = [];
          for (var i = 0; i < cardsequence.length; i++) {
            var oneId = cardsequence[i];
            var j = 0;
            var loopEndFlag = true;
            for (; j < theData.length; j++) {
              var twoObj = theData[j];
              if (oneId == twoObj.id) {
                newDataList.push(twoObj);
                loopEndFlag = false;
                break;
              }
            }
            if (!loopEndFlag)
              theData.splice(j, 1);
          }
          theData = newDataList.concat(theData);
        }

        for (var i = 0; i < theData.length; i++) {
          var one = theData[i];
          var headImgUrl = one.portrait_path
          if (headImgUrl != null && headImgUrl.indexOf("wills") != -1)
            headImgUrl = headImgUrl.substr(0, headImgUrl.length - 4) + "s.jpg";
          one.headImgUrl = headImgUrl;
          if(one.city)
            one.city = one.city.replace(",", "").replace(",", "").replace(",", "");
        }
        that.composeLength(theData)
        
        that.setData({
          list: theData
        })
      }
    });
    if(options["fromTemplateTo"]){
      this.setData({
        guidance:true
      });
    }
    // var options
  },
  //控制公司名称与职位的位置
  composeLength(md) {
    md.forEach((item, index) => {
      if(item.company == null)item.company = '';
      if(item.position == null)item.position = '';
      if((item.company == null || item.company == '') && (item.position == null || item.position == ''))item.company = '您身边的专属顾问';
      if ((item.company != null || item.company != '') && (item.position != null || item.position != '')) {
        let composeLength = item.company.length + item.position.length
        if (composeLength <= 16) {
          md[index].compose = true
        } else {
          md[index].compose = false
        }
      } else {
        md[index].compose = true
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  leftup(res) {
    util.getFormIdB(res);
    if (app.globalData.managerData) {
      wx.showLoading({
        mask: true,
        title: "loading"
      })
      wx.setStorageSync("clienttype", 'a');
      wx.redirectTo({
        url: "/pages/index/index"
      })
    } else {
      this.data.getUserCallBack = 'addManager';
      this.getSetting(this.addManager);
    }
  },
  listtap: function(res) {
    var tomanagerid = res.currentTarget.dataset.id;
    var cardsequence = wx.getStorageSync("cardsequence");
    if (!cardsequence) cardsequence = [];
    var i = 0;
    var equelFlag = false;
    for (; i < cardsequence.length; i++) {
      var oneid = cardsequence[i];
      if (tomanagerid == oneid) {
        equelFlag = true;
        break;
      }
    }
    if (!equelFlag) { // 栈里没有，就添加
      cardsequence.push(tomanagerid);
    } else { // 栈里有，就删掉，加到栈顶。
      cardsequence.splice(i, 1);
      cardsequence.unshift(tomanagerid);
    }
    wx.setStorageSync("cardsequence", cardsequence);


    wx.setStorageSync("fromcardbox", {
      id: tomanagerid
    });
    wx.redirectTo({
      url: '/pages/clientb/clientb'
    });
  },
  getSetting(success) {
    var that = this;
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              success(res);
            }
          })
        } else if (res.authSetting['scope.userInfo'] == undefined) { // 没有授权
          that.setData({
            accreditType: "toget"
          });
        } else { // 拒绝授权
          that.setData({
            accreditType: "toset"
          });
        }
      }
    })
  },
  addUser(res) {
    var that = this;
    
    var openidFromCode = wx.getStorageSync("openidFromCode");
    var addData = {
      funcNo: "1021",
      openid: openidFromCode
    }
    if (res) {
      var ui = res.userInfo;
      addData["portrait"] = ui.avatarUrl;
      addData['nickname'] = ui.nickName;
      addData["iv"] = res.iv;
      addData["encryptedData"] = res.encryptedData;
    } else {
      // addData["portrait"]=null;
      // addData['nickname'] =null;
    }
    network.postRequest(addData,5,3000,true).then(function(addData) {
      app.globalData.customerData = {};
      app.globalData.customerData.id = addData.cusid;
      app.globalData.customerData.unionid = addData.unionid;
      if (res) {
        var ui = res.userInfo;
        app.globalData.customerData.nickname = ui.nickName;
        app.globalData.customerData.portraitpath = ui.avatarUrl;
      } else {
        app.globalData.customerData.nickname = "匿名客户" + addData.cusid;
      }
    })
  },
  addManager(res) {
    var ui = res.userInfo;
    var openidFromCode = wx.getStorageSync("openidFromCode");
    var addData = {
      openid: openidFromCode,
      portrait: ui.avatarUrl,
      nickname: ui.nickName,
      iv: res.iv,
      encryptedData: res.encryptedData
    }
    if(app.globalData["customerData"] && app.globalData["customerData"].unionid){
      addData["unionid"] = app.globalData["customerData"].unionid;
    }
    wx.setStorageSync("fromcardboxTocard", addData);
    wx.redirectTo({
      url: "../clienta/mine/card/card"
    });
  },
  onGotUserInfo: function(res) {
    // 从 授权框回来的，detail里。
    // detail 失败时 只有errmsg 字段。
    var userInfo = res.detail["userInfo"];
    if (userInfo) { // 如果有客户资料
      if (this.data.getUserCallBack == 'addManager') {
        this.addManager(res.detail);
      } else if (this.data.getUserCallBack == 'addUser') {
        this.addUser(res.detail);
      }
    } else { // 没有
      if (this.data.getUserCallBack == 'addUser') {
        this.addUser(null);
      } else {
        wx.hideLoading();
        //TODO  错误提示，没有权限不能创建
        wx.showToast({
          title: "需要授权去创建名片",
          icon:"none",
          duration: 3000
        });
      }
    }
  },
  opensetting: function(res) {
    // 去设置页之后的回调。
    // 从设置页回来，只能拿到状态，之后用getUserInfo 去取值
    var that = this;
    if (res.detail.authSetting["scope.userInfo"] == true) { // 如果有了权限
      wx.getUserInfo({
        success: function(res) { // 获取资料。
          if (that.data.getUserCallBack == 'addManager') { // 判断是需要更新
            that.addManager(res);
          } else if (that.data.getUserCallBack == 'addUser') { // 还是创建新的客户身份
            that.addUser(res);
          }
        }
      })
    } else { // 如果没有权限。 不需要更新，  判断是否创建新的客户身份 用匿名
      if (that.data.getUserCallBack == 'addUser') {
        that.addUser(null);
      } else {
        wx.hideLoading();
        wx.showToast({
          title: "需要授权去创建名片",
          icon:"none",
          duration: 3000
        });
      }
    }
  },
  closeaccredit() {
    this.setData({
      accreditType: null
    })
  },
  accreditTo(e){
    console.log('formid',e)
    util.getFormIdB(e);
  }
})