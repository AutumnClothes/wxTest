// pages/accredit/accredit.js
var network = require('../../utils/network')
var util = require('../../utils/util.js')
var message = require('../../utils/cusmessage.js')
var app = getApp()
var shareoptions = null
var byWho = null;
var that = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    accreditType:'',
    getUserCallBack:null,
  },closeaccredit(){
    that.setData({
      accreditType:null
    });
  },
  setAccredit(e){
    that.data.getUserCallBack = 'addManegerF';
    util.getFormIdB(e);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    byWho = null;
    if(options["byWho"]){
      byWho = options["byWho"];
    }
    wx.hideShareMenu();
    var h = util.systemHeight()
    this.setData({
      H:h
    }) 
    wx.login({
      success(res){
        var code = res['code'];
        var rdata = {
          funcNo:'1012',
          code:code
        }
        network.postRequest(rdata).then(function(r){
          if(r.error_no == '0'){
            wx.setStorageSync("openidFromCode", r.openid);
            if(r['manager'].length >=1){//如果有顾问身份
              app.globalData['managerData'] = r['manager'][0]
              if(r['customer'].length >=1){
                app.globalData['customerData'] = r['customer'][0]  
              }
              wx.redirectTo({url:'../clienta/clienta'})
            }else if(r['customer'].length >=1){
              app.globalData['managerData'] = null
              app.globalData['customerData'] = r['customer'][0]
              that.data.getUserCallBack = 'addManegerF'
              that.setTing()
            }else{//权限
              that.data.getUserCallBack = 'addUser'
              that.setTing()
            }
          }
        })
      }
    })
  },
  setTing(){
    var that =this
    wx.getSetting({
      success(e){
        if(e.authSetting['scope.userInfo']){//已经授权
          wx.getUserInfo({
            success(s){
              if(that.data.getUserCallBack == 'addManegerF')that.addManagerF(s);
              if(that.data.getUserCallBack == 'addUser')that.addUser(s)
            },
          });
        }else if(e.authSetting['scope.userInfo'] == undefined){//没有授权
          that.setData({accreditType:'toget'})
        }else{
          that.setData({accreditType:'toset'})
        }
      }
    })
  },
  addManagerF(e){
    if(!e)return;
    var ui = e.userInfo;
    var openidFromCode = wx.getStorageSync('openidFromCode')
    var addData = {
      openid : openidFromCode,
      portrait:ui.avatarUrl,
      nickname:ui.nickName,
      iv:e.iv,
      encryptedData:e.encryptedData
    }
    if(app.globalData['customerData'] && app.globalData['customerData'].unionid){
      addData['unionid'] = app.globalData['customerData'].unionid
    }
    wx.setStorageSync('fromcardboxTocard',addData);
    wx.redirectTo({url:'../clienta/mine/card/card'})
  },
  onGotUserInfo(r){
    var that = this
    var userInfo = r.detail['userInfo']
    if(userInfo){//如果有
      if(that.data.getUserCallBack == 'addManegerF')that.addManagerF(r.detail);
      else if(that.data.getUserCallBack == 'addUser'){//没有授权，且拒绝的情况下，创建匿名身份，此时
        that.addUser(r.detail)
      }else{//先拒绝再同意的情况，有了匿名身份，去更新
        that.updateUserInfo(r.detail)
      }
    }else{//没有,getUserCallBack第一次进入为addUser，第二次进入为null，
      if(that.data.getUserCallBack == "addUser")this.addUser(null);
      if(that.data.getUserCallBack == 'addManegerF'){
        wx.showToast({
          title: "需要授权去创建名片",
          icon:"none",
          duration: 3000
        });
      }
    }
  },
  opensetting(r){
    var that = this
    if(r.detail.authSetting['scope.userInfo'] == true){
      wx.getUserInfo({
        success(e){
          if(that.data.getUserCallBack == 'addManegerF')that.addManagerF(e);
          else if(that.data.getUserCallBack == 'addUser'){//第一次拒绝，第二次同意，标志为创建新客户身份
            that.addUser(e)
          }else{
            that.updateUserInfo(e)
          };
        }
      })
    }else{
      if(that.data.getUserCallBack == "addUser")this.addUser(null);
      if(that.data.getUserCallBack == 'addManegerF'){
        wx.showToast({
          title: "需要授权去创建名片",
          icon:"none",
          duration: 3000
        });
      }
    }
  },
  updateUserInfo(res){
		var ui = res.userInfo;
		var o =  app.globalData.customerData;
		o.portraitpath = o.portraitpath == null ? "" : o.portraitpath;
		if(o.nickname != ui.nickName || o.portraitpath != ui.avatarUrl || !o.unionid){
			var upData = {
				funcNo:"1021",
				cusid:app.globalData["customerData"].id,
				portrait:ui.avatarUrl,
				nickname:ui.nickName,
				openid:app.globalData.customerData.openid
			}
			if(!o.unionid){ // 传iv和 未解密数据
				upData["iv"]  = res.iv;
				upData["encryptedData"] = res.encryptedData;
			}else{
				upData["unionid"] = o.unionid;
			}
			network.postRequest(upData).then(function(r){
				if(o.nickname != ui.nickName){
					var msd = {};
					var fromid = app.globalData.customerData.id;
					var toid = 6;
					message.sendMessage(fromid,toid,"我是"+o.nickname+",我更新了我的昵称",
					"update");
        }
        that.addManagerF(res)
			})
		}
	},
  addUser(res){
    var ui = null;
    if(res){
      ui = res.userInfo;
    }

    var openidFromCode = wx.getStorageSync('openidFromCode')
		var that = this;
		var addData = {
      funcNo:"1021",
			openid:openidFromCode
		}
		if(res){
      addData["portrait"]=ui.avatarUrl;
			addData['nickname'] =ui.nickName;
			addData["iv"]  = res.iv;
			addData["encryptedData"] = res.encryptedData;
		}else{
		}
		network.postRequest(addData,5,3000,true).then(function(addData){
      app.globalData.customerData = {};
      app.globalData.customerData.id = addData.cusid;   //TODO  接口返回值没有cusid，可能是还没有创建成功
      app.globalData.customerData.unionid = addData.unionid;
			if(res){
				app.globalData.customerData.nickname = ui.nickName;
        app.globalData.customerData.portraitpath = ui.avatarUrl;
			}else	{
				app.globalData.customerData.nickname = "匿名客户"+addData.cusid;
      }
      //都是有 eventkey 的情况。
      if(byWho){
        that.addRelation(byWho,app.globalData.customerData.id,function(r){
            if(r.error_no == '0'){ //
              message.openConection(app.globalData.customerData.id,byWho,function(){
                message.sendBehavior(app.globalData.customerData.id,byWho,null,'fc',null,null,function(){
                  message.closeConnection(function(){
                    that.addManagerF(res);
                  });
                });
              });
              var msd = {data:'{"fromid":"'+byWho+'","contenttype":"text","content":"你好啊。。这是一条初始化消息","direction":"receive"}'}
              message.receiveMessage(msd);
            }
        });
      }else{
        that.addManagerF(res);
      }
    })
  },
  addRelation(managerId,cusid,callback){
		//  创建关联关系
		var createRelation = {
			funcNo:'1024',
			cusid:cusid,
			managerid:managerId,
			entrancetype:'3'
    }
    // createRelation["entranceid"] = shareoptions["productid"];
		network.postRequest(createRelation).then(function(res){
      callback(res);
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