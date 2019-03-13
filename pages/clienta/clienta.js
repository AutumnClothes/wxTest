var network = require('../../utils/network.js');
var util = require('../../utils/util.js');
var message = require('../../utils/message.js');
var app = getApp();
var firstShow = true;
var that = null;
var guidanceDoneObject = null;
import drawQrcode from '../../utils/weapp.qrcode.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    count: 0,
    current: 'home',
    homeTitle:'刷新',
    taboneKey: true,
    tabtwoKey: true,
    tabthreeKey: true,
    tabfourKey: true,
    tabfiveKey: true,
    //公众号相关
    guidance:false,
    guidancePublic:false,
    guidanceMini:false,
    guidancemeng:false,
    //引导相关
    guidanceDone:false,
    donetitle:"",
    donedesc:"",
    donebutton:"",
    donerate:"",  
    guidance3:false//加入种子群
  },

  /**
   * 生命周期函数--监听页面加载
   * 有消息，直接加载未读。
   * 无消息，拉列表---对应一个人的聊天框中再拉取具体的聊天记录。
   * 
   */
  onLoad: function(options) {
    wx.hideShareMenu();
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
    that = this;
    this.loadFuntion();
    message.openConection(app.globalData.managerData.id, function() {});
    wx.getStorage({
      key:"launchTime4Mini",
      success:function(r){
        var t = r.data;
        var launchFlag4Public = wx.getStorageSync("launchFlag4Mini");
        if(!launchFlag4Public)return;
        var goodTool = wx.getStorageSync("goodTool");
        if(goodTool){
          t--;
          wx.setStorageSync("launchTime4Mini",t);
          return;
        }
        if(t == 1){
          that.addToMyMiniWithMeng();
        }else if(t==2 || t==4 || t==7 ||t==10 || t==15){
          that.selectComponent("#tabone").addToMyMini();
        }
        wx.removeStorage({key:"launchFlag4Mini"});
      }
    });
    /* wx.getStorage({
      key:"launchTime4Public",
      success:function(r){
        var launchFlag4Public = wx.getStorageSync("launchFlag4Public");
        if(!launchFlag4Public)return;
        var t = r.data;
        var md = app.globalData.managerData;
        if(!(t==1|| t==2||t==4||t==7||t==15)){
          return;
        }
        var now = new Date().getTime();
        if(!md.public_openid){
          //do noting
        }else if(!md.time || ( now - md.time >24 *60 *60 *1000)){
          // 文字变更
        }else{
          wx.setStorageSync("launchTime4Public",0);
          return;
        }
        that.setData({
          guidance:true,
          guidancemeng:true
        });
        wx.removeStorage({key:"launchFlag4Public"});
      }
    }); */
    wx.getStorage({
      key:"course",
      success:function(r){
        var ad = r.data;
        if(!ad){
          return ;
        }
        if(ad[0]){
          var sumDone = 0;
          for(var i = 1 ; i< 9 ; i++){
            if(ad[i]){
              sumDone ++;
            }
          }
          if(sumDone == 8){ // 完成就删。不执行后续。
            wx.removeStorageSync("course");
            return ;
          }
          guidanceDoneObject = util.nextCourseText(ad,true);
          if(guidanceDoneObject.done != 8)
            that.setData({
              guidanceDone:true,
              donetitle: "新手教程",
              donedesc:guidanceDoneObject.desc,
              donebutton: guidanceDoneObject.button,
              donerate : guidanceDoneObject.rate
            });
        }
      }
    })
    this.selectComponent("#tabfive").tapchange();
    if(options["fromPublicTo"] == 'behavior'){
      that.menuClick("information");
    }
  },
  loadFuntion: function() { // 身份信息加载完毕之后。消息初始化
    var MESSAGE = wx.getStorageSync("MESSAGE");
    if (MESSAGE) { // 拉取新消息
      var unreadData = {
        funcNo: "1011",
        id: app.globalData.managerData.id
      }
      network.postRequest(unreadData).then(function(res) {
        if (res.error_no == '0') {
          var theData = res.data;
          var unreadBehaviorList = res.unreadBehavior;
          for (var i = 0; i < theData.length; i++) {
            var one = theData[i];
            one["messagetype"] = 's';
            var r = {
              data: JSON.stringify(one)
            }
            message.receiveMessage(r);
          }
          for (var i = 0; i < unreadBehaviorList.length; i++) {
            var one = unreadBehaviorList[i];
            one["messagetype"] = 'b';
            var r = {
              data: JSON.stringify(one)
            }
            message.receiveMessage(r);
          }
          that.rerender();
        }
      });
    } else { // 拉取列表，并拉取新消息
      // 1003
      var listData = {
        funcNo: "1003",
        id: app.globalData.managerData.id
      }
      network.postRequest(listData).then(function(res) {
        var message = {};
        var theData = res["userChatList"];
        for (var i = 0; i < theData.length; i++) { // 聊天列表
          var one = theData[i];
          var oppo = {};
          oppo["id"] = one["id"];
          oppo["nickname"] = one["nickname"];
          oppo["portrait"] = one["portraitpath"];
          oppo["unread"] = 0;
          message[one["id"]] = oppo;

          var messgeListFDB = one["message"]; // 未读消息，或者最近的十条
          var messageListFS = wx.getStorageSync("messageList" + one.id);
          if (!messageListFS) messageListFS = [];
          for (var j = 0; j < messgeListFDB.length; j++) { // 跟某一个人的聊天记录
            var oneMessage = messgeListFDB[j];
            var unread = oneMessage["unread"];
            var direction = "";
            if (oneMessage["fromid"] != one.id) {
              direction = 'send';
            } else {
              direction = 'receive';
              if (unread == '1') message[one["id"]]["unread"]++;
            }
            messageListFS.push({
              direction: direction,
              content: oneMessage['content'],
              contenttype: oneMessage['contenttype'],
              timeline: oneMessage["timeline"]
            });
          }
          wx.setStorageSync("messageList" + one.id, messageListFS);
        }
        wx.setStorageSync("MESSAGE", message);
        theData = res["groupChatList"];
        message = {};
        for (var i = 0; i < theData.length; i++) {
          var one = theData[i];
          var groupid = one["id"];
          var groupname = one["groupname"];
          var groupcount = one["cussum"];
          message[groupid] = {
            groupid: groupid,
            groupname: groupname,
            groupcount: groupcount
          };

          var list = one["message"];
          var messageList = [];
          list = list == null ? [] : list;
          for (var j = 0; j < list.length; j++) {
            var two = list[j];
            var content = two["content"];
            var contenttype = two["contenttype"];
            var timeline = two["timeline"];
            var aMessage = {
              content: content,
              contenttype: contenttype,
              timeline: timeline
            };
            messageList.push(aMessage);
          }
          wx.setStorageSync("groupMessageList" + groupid, messageList);
        }
        wx.setStorageSync("GROUPMESSAGE", message);
        theData = res['behaviorList'];
        var unreadBehavior = 0;
        var bl = [];
        for (var i = 0; i < theData.length; i++) {
          var one = theData[i];
          var unread = one["unread"] * 1;
          unreadBehavior += unread;
          bl.push({
            cusid: one.fromid,
            portrait: one.portraitpath,
            nickname: one.nickname,
            contenttype: one.contenttype,
            content: one.content,
            newcus: one.newcus,
            timeline: one.timeline
          });
        }
        wx.setStorageSync("behaviorList", bl);
        wx.setStorageSync("behaviorUnread", unreadBehavior);
        that.rerender();
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  course8Control(){
    // 展示卡片完成的框

  },
  /**
   * 生命周期函数--监听页面显示
   * 更新infomation的新消息数，消息导航栏的新消息数。
   */
  rerender() {
    this.selectComponent("#tabone").getChatList();
    var ml = wx.getStorageSync("MESSAGE");
    var allUnread = 0;
    if (!ml) ml = {};
    for (var id in ml) {
      var cusData = ml[id];
      allUnread = cusData["unread"] + allUnread;
    }
    var bu = wx.getStorageSync("behaviorUnread");
    if (bu) {
      allUnread = allUnread + bu;
    }
    this.setData({
      count: allUnread
    });
  },
  onShow: function() {
    app.globalData.renderPage = this;
    util.backexecute(function() { //  执行回调标志为“updateUserList”的回调
      that.selectComponent("#tabtwo").onShow();
    }, "updateUserList");
    that.selectComponent("#tabfour").onShow();
    
    if (!firstShow) { // 第一次show 不执行渲染。
      that.rerender();
    }
    var fromDone = false;
    util.backexecute(function(to){
      if(to == 'information1'){
        that.menuClick("information");
      }else if(to == 'showCard'){
        fromDone = true;
        that.setData({
          guidance3:true
        });
      }else if(to == 'job'){
        that.menuClick("jobs");
      }else if(to == 'mine'){
        that.menuClick("mine");
      }else if(to == 'customer1'){
        that.menuClick("customer");
      }
    },"courseNext");
    if(!fromDone  && !this.data.guidanceDone){
      var goodTool = wx.getStorageSync("goodTool");
      if(goodTool){
        this.setData({guidance4:true});
        setTimeout(function(){
          wx.removeStorageSync("goodTool");
        },1000);
      }
    }
  },
  updateUnread: function(e) { // 来自infomation page 的update请求。
    var ml = wx.getStorageSync("MESSAGE");
    if (!ml) return;
    var allUnread = 0;
    for (var id in ml) {
      var cusData = ml[id];
      allUnread = cusData["unread"] + allUnread;
    }
    var bu = wx.getStorageSync("behaviorUnread");
    if (bu) {
      allUnread = allUnread + bu;
    }
    this.setData({
      count: allUnread
    });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    firstShow = false;
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    var flag = message.gettryopenING();
    if (flag) {
      setTimeout(function() {
        that.onUnload();
      }, 500);
    } else {
      message.closeConnection(function() {
        console.log("close success by clienta", new Date());
      });
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(e) {
    var path = '/pages/clientb/clientb?sharefrom=' + app.globalData.managerData.id;
    var opentype =e.target.dataset.opentype;
    var cusdata = wx.getStorageSync("cusdataMapForInfomation");
    if (!cusdata|| opentype) {
      path += "&guidance=1";
    }
    var title = "您好，这是我的名片，请惠存：";
    var md = app.globalData.managerData;
    if (md.company) {
      title += md.company;
    }
    if (md.position) {
      title += md.position;
    }
    if (md.user_name) {
      title += md.user_name;
    }
    if(opentype){
      title = '同样的产品，他却总能获客成交？试试理财顾问名片就知道';
    }
    var shareobj = {
      title: title,
    }
    shareobj["path"] = path;
    shareobj["imageUrl"] = "https://www.willsfintech.cn:9004/shareCard/" +
      app.globalData.managerData.id + ".jpg" + "?time=" + new Date().getTime();
    return shareobj;
  },
  handleChange({
    detail
  }) {
    if(this.data.current == detail.key && detail.key == 'home'){
      this.selectComponent("#tabfive").refreshpage();
      return;
    }
    this.setData({
      current: detail.key
    });
    if (detail.key == 'information') {
      this.selectComponent("#tabone").tapchange();
      if(detail.from){
        wx.setNavigationBarColor({
          frontColor: '#000000',
          backgroundColor: '',
          animation: {
            duration: 400,
            timingFunc: 'easeIn'
          }
        })
        if(detail.from == 'cusDynamic'){
          var e = {target:{dataset:{id:1}}};
          this.selectComponent("#tabone").tabBind(e);
        }
        if(detail.from == 'unreadNews'){
          var e = {target:{dataset:{id:0}}};
          this.selectComponent("#tabone").tabBind(e);
        }
      }
      this.setData({
        taboneKey: false
      })
    } else if (detail.key == 'customer') {
      this.selectComponent("#tabtwo").tapchange();
      this.setData({
        tabtwoKey: false
      })
    } else if (detail.key == 'jobs') {
      this.selectComponent("#tabthree").tapchange()
      this.setData({
        tabthreeKey: false
      })
    } else if (detail.key == 'mine') {
      this.selectComponent("#tabfour").tapchange()
      this.setData({
        tabfourKey: false
      })
    }else if (detail.key == 'home') {
      this.selectComponent("#tabfive").tapchange()
      this.setData({
        tabfiveKey: false,
        homeTitle:'刷新'
      })
    }
    if(detail.key == 'home'){
      this.data.homeTitle = '刷新'
    }else{
      this.data.homeTitle = '主页'
    }
    this.setData({homeTitle:this.data.homeTitle})
  },menuClick(key){
    this.setData({
      current: key
    });
    if (key == 'information') {
      this.selectComponent("#tabone").tapchange();
      this.selectComponent("#tabone").toCourse();
      this.setData({
        taboneKey: false
      })
    } else if (key == 'customer') {
      this.selectComponent("#tabtwo").tapchange();
      this.selectComponent("#tabtwo").toCourse();
      this.setData({
        tabtwoKey: false
      })
    } else if (key == 'jobs') {
      this.selectComponent("#tabthree").tapchange()
      this.setData({
        tabthreeKey: false
      })
    } else if (key == 'mine') {
      this.selectComponent("#tabfour").tapchange()
      this.setData({
        tabfourKey: false
      })
    }else if (key == 'home') {
      this.selectComponent("#tabfive").tapchange()
      this.setData({
        tabfourKey: false
      })
    }
  },
  //公众号相关
  closeBind(){
    if(this.data.guidance3){
      this.setData({guidance4:true});
      wx.removeStorage({key:'goodTool'});
    }
    this.setData({
      guidance:false,
      guidancePublic:false,
      guidanceMini:false,
      guidancemeng:false,
      guidance3:false
    })
    
  },
  addToMyMiniWithMeng(){ //
    this.setData({
      guidanceMini:true,
      guidancemeng:true
    })
  },publicGuide(){
    this.setData({
      guidancePublic:true
    });
  },toNextButton(e){
    var o = e.detail;
    guidanceDoneObject = o;
    if(o.show){
      this.setData({
        guidanceDone:true,
        donetitle: o.title,
				donedesc:o.desc,
				donebutton: o.button,
				donerate : o.rate
      });
    }
  },clickNextButton(e){
    util.getFormId(e)
    this.setData({
      guidanceDone:false
    });
    var to = guidanceDoneObject.to;
    
    if(to == 'information1'){
      that.menuClick("information");
    }else if(to == 'showCard'){
      this.setData({
        guidance3:true
      });
    }else if(to == 'job'){
      that.menuClick("jobs");
    }else if(to == 'mine'){
      that.menuClick("mine");
    }else if(to == 'customer1'){
      that.menuClick("customer");
    }
  },closeNextButton(){
    if(this.data.guidanceDone){
      var goodTool =  wx.getStorageSync('goodTool');
      if(goodTool){
        this.setData({guidance4:true});
        wx.removeStorage({key:"goodTool"});
      }
    }
    this.setData({
      guidanceDone:false
    });
  },closeGoodToolButton(e){
    util.getFormId(e)
    this.setData({
      guidance4:false
    });
  },
  saveQrcode(e){
    util.getFormId(e)
    wx.showLoading({
      title:" . . . .",
      mask:true
    });
    
    this.setData({guidance4:true});
    wx.removeStorage({key:'goodTool'});

    wx.getImageInfo({
      src: "https://www.willsfintech.cn:9004/systemimg/mem-qr.jpg",
      success:function(res){
        wx.saveImageToPhotosAlbum({
          filePath:res.path,
          success:function(){
            that.setData({
              guidance3:false
            });
          },complete:function(){
            wx.hideLoading({});
          }
        });
      }
    })
  },
  posterBind(data){
    var that = this;
    var localpath = data.detail.localpath
    var name = data.detail.name
    var rd = {
      funcNo:'1075',
      id:app.globalData.managerData.id
    }
    network.postRequest(rd).then(function(r){
      if(r.error_no == 0){
        wx.showLoading({
          title: '正在生成中...',
        })
        that.drawQ(localpath,r.theurl,name)
      }
    })
  },
  drawQ(localpath,url,name){
    var localIdPath = null
    var that = this
    drawQrcode({
      width: 180,
      height: 180,
      x: 10,
      y: 10,
      canvasId: 'myQrcode',
      ctx: wx.createCanvasContext('myQrcode'),
      typeNumber: 5,
      text: url,
      correctLevel:1,
      // image: {
      //   imageResource: '',
      //   dx: 70,
      //   dy: 70,
      //   dWidth: 60,
      //   dHeight: 60
      // },
      callback(e) {
        setTimeout(() => {
          wx.canvasToTempFilePath({
            /* x: 0,
            y: 0,
            width: 200,
            height: 200,
            destWidth: 200,
            destHeight: 200, */
            canvasId: 'myQrcode',
            success(res) {
              localIdPath = res.tempFilePath
              var baseImg = 'https://www.willsfintech.cn:9004/staticFile/image/base.png'
              that.getImageInfo([localpath, localIdPath,baseImg], function (arr) {
                if (arr[0] != undefined && arr[1] != undefined && arr[2] != undefined) {
                  that.draw(arr[0], arr[1], arr[2], name)
                };
              });
            }
          })
        }, 1000);
        
      }
    })
  },
  draw(localpath, localIdPath,base, name){
    const ctx = wx.createCanvasContext('shareCanvas');
    ctx.setFillStyle('#f2f2f2');
    ctx.fillRect(0, 0, 750, 1224);
    ctx.drawImage(base, 0, 0, 750, 1224);
    ctx.font = 'normal normal 28px PingFangSC';
    ctx.setFillStyle('#e3ca84')
    ctx.fillText(name, 166, 69);
    ctx.fillText('邀请你使用', 166, 117);
    ctx.save()
    this.drawRoundRect(ctx, 30 , 30, 110, 110, 55);
    ctx.clip()
    ctx.drawImage(localpath, 30, 30, 110, 110);
    ctx.restore()
    ctx.save()
    this.drawRoundRect(ctx, 515, 975, 205 , 205, 0);
    ctx.clip()
    ctx.drawImage(localIdPath, 515, 975, 205, 205 );
    ctx.restore()
    ctx.draw(false, function () {
      wx.canvasToTempFilePath({
        canvasId: 'shareCanvas',
        success: function (res) {
          wx.hideLoading()
          wx.navigateTo({
            url: '../poster/poster?img=' + res.tempFilePath+'&keys=advert',
          })
        }
      }, this)
    })
  },
  getImageInfo(url, callback) {    //  图片缓存本地的方法
    var arr = []
    url.forEach((item, index) => {
      wx.getImageInfo({   //  小程序获取图片信息API
        src: item,
        success: function (res) {
          arr[index] = res.path
          callback(arr);
        },
        fail(err) {
        }
      })
    })
  },
  drawRoundRect(ctx, x, y, width, height, radius) {
    ctx.strokeStyle = "#1d1f1d";
    ctx.stroke();
    ctx.setFillStyle('#ffffff');
    ctx.beginPath();
    ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
    ctx.lineTo(width - radius + x, y);
    ctx.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
    ctx.lineTo(width + x, height + y - radius);
    ctx.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2);
    ctx.lineTo(radius + x, height + y);
    ctx.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI);
    ctx.closePath();
    ctx.fill();
  },
})