// pages/home/home.js
var util = require('../../../utils/util.js');
var network = require('../../../utils/network.js');
var app = getApp();
var that = null;
var movetime = 0;
var sh = null;
var moveTime = 0;
var moveTop = 0;
var len = 5;

Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    tab5: {
      type: Boolean,
      value: ''
    }
  },
  /**
   * 页面的初始数据
   */
  data: {
    pageData:null,
    msgList:null,
    dropKey:0,//只用于下拉加载更多以及左下刷新按钮
    labelList: [{
        name: '入群交流',
      },
      {
        name: '推荐同事，免费获得一年会员'
      }
    ],
    tabTitleList:[
      '热门','财经','证券','保险','理财','基金','顾问'
    ],
    msgList0:[],
    msgList1:[],
    msgList2:[],
    msgList3:[],
    msgList4:[],
    msgList5:[],
    msgList6:[],
    lengthTrue:true,
    label: '入群交流',
    advert:false,
    tabTop:0,
    tabTitleInd:0,
    current:0,
    dHeight:null,
    sysHeight:0,
  },
  attached() {
    that = this;
    movetime = 0;
    sh = null;
    moveTime = 0;
    moveTop = 0;
    len = 5;
    var h = util.systemTop()
    sh = util.systemHeight()
    let gh = util.gHeight()
    this.setData({
      H:h,
      cH:h+60,
      sH:sh-100,
      gH:gh
    })
    this.data.sysHeight = util.systemHeight()*util.rHeight()
    this.data.tabTop =570 - h - 80
    this.data.dHeight = util.systemHeight()-750
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
  },
  methods:{
    tapchange(){
      var bb = this.data.tab5
      if (bb) {
        var managerData = app.globalData.managerData
        this.setData({
          managerPortrait:managerData.portrait_path
        })
        var ml = wx.getStorageSync("MESSAGE");
        var allUnread = 0;
        if (!ml) ml = {};
        for (var id in ml) {
          var cusData = ml[id];
          allUnread = cusData["unread"] + allUnread;
        }
        var bu = wx.getStorageSync("behaviorUnread");
        this.setData({
          unreadNews: allUnread,
          cusDynamic:bu
        });
        if(this.data.msgList == null){
          this.refreshpage()
        }
      }
    },
    groupToMsg(e){
      util.getFormId(e);
      wx.navigateTo({url:'./jobs/newmsg/newmsg'})
    },
    //请求资讯列表
    refreshpage(){
      var that = this;
      var rd = {
        funcNo:"1037",
        creator:0
      }
      network.postRequest(rd).then(function(r){
        if(r.error_no == '0'){
          that.data.msgList0 = [];
          that.data.msgList1 = [];
          that.data.msgList2 = [];
          that.data.msgList3 = [];
          that.data.msgList4 = [];
          that.data.msgList5 = [];
          that.data.msgList6 = [];
          var d = r.data;
          that.data.pageData = d;
          for(var i = 0 ; i<d.length ;i++){
            var one = d[i];
            var scratchTime = util.getShowTimeStr(one.scratchtime);
            var pathDate = util.getPathDateStr(one.scratchtime);
            var pathid = one.pathid;
            one.pathDate = pathDate;
            
            var aa = {
              id:one.id,
              img: util.getArticleTitleImg(one),
              text: one.title,
              time: scratchTime,
              iteLeft: ''
            };
            var ar =  one.tag.split(',');
            for(var j=0; j<ar.length; j++){
              var two = ar[j]
              var bl = two.indexOf('000')
              if(bl == 0){
                var tagkey = two.substr(3,1);
                if(tagkey == '0'){
                  that.data.msgList0.push(aa)
                }else if(tagkey == '1'){
                  that.data.msgList1.push(aa)
                }else if(tagkey == '2'){
                  that.data.msgList2.push(aa)
                }else if(tagkey == '3'){
                  that.data.msgList3.push(aa)
                }else if(tagkey == '4'){
                  that.data.msgList4.push(aa)
                }else if(tagkey == '5'){
                  that.data.msgList5.push(aa)
                }else if(tagkey == '6'){
                  that.data.msgList6.push(aa)
                }
              }
            }
          }
          that.msgTab(that.data.dropKey)
        }
      });
    },
    toInformationNews(e){
      util.getFormId(e);
      var data = {key:'information',from:'unreadNews'}
      this.triggerEvent('handleChange',data)
    },
    toInformationDynamic(e){
      util.getFormId(e);
      wx.setStorageSync("behaviorUnread", 0);
      this.setData({
        cusDynamic:0
      })
      var data = {key:'information',from:'cusDynamic'}
      this.triggerEvent('handleChange',data)
    },
    toManagerCard(e){
      util.getFormId(e);
      wx.navigateTo({
        url:'./mine/card/card'
      })
    },
    labelBind(e) {
      util.getFormId(e)
      var itm = e.currentTarget.dataset
      var index = itm.index;
      if(index == 0){
        this.setData({
          advert:true,
          advertTxt:'加入理财顾问交流群，与金融同业资源互换，学习交流。点击按钮后，回复数字“8”马上入群',
          advertBtn:'回复数字“8”马上入群'
        })
      }
      if(index == 1){
        var managerData = app.globalData.managerData
          //二维码
        var data = {
          name : managerData.user_name?managerData.user_name:managerData.cn_name,
          localpath : managerData.portrait_path, //用户头像
          localIdPath : 'https://www.willsfintech.cn:9004/qrcode/' + 6 + '.jpg'
        }
        this.triggerEvent('posterBind', data);
      }
    },
    closeBind(e){
      util.getFormId(e)
      this.setData({
        advert:false
      })
    },
    publicGuide(e){
      util.getFormId(e)
    },
    //资讯阅读
    toviewpage(e){
      var id = e.currentTarget.dataset.id;
      var d = this.data.pageData;
      var o = null;
      for (var i = 0; i < d.length; i++) {
        var one = d[i];
        if (one.id == id) {
          o = one;
          break;
        }
      }
      wx.setStorageSync("toviewpagedata", o);
      wx.navigateTo({
        url: "./home/view/view"
      })
    },
    //吸顶功能
    scrollBind(e){
      var newTop = e.detail.scrollTop/util.rHeight()
      var topKeys
      if(newTop>this.data.tabTop){
        topKeys = true
      }else{
        topKeys = false
      }
      this.setData({
        topKeys:topKeys
      })
      var now = new Date().getTime();
      var nowTop = e.detail.scrollTop + this.data.sysHeight
      if(now>moveTime+50 && topKeys){//当资讯列表扩至全屏时  每0.1s执行一次
        moveTime = now
        var m = nowTop + this.data.sysHeight*1.2
        if(m > e.detail.scrollHeight){
          var b = 2;
          if(moveTop != 0){//根据用户滑动速度判断加载数量
            var a = nowTop - moveTop
            b = Math.round(a/100)
            if(b<2)b=2
          }
          moveTop = nowTop
          var key = that.data.dropKey
          len = len + b
          that.msgTab(key)
        }
      }
    },
    // queryDome(){
    //   var query = wx.createSelectorQuery().in(this)
    //   query.select('#getId').boundingClientRect(function(res){
    //     var gTop = res.top/util.rHeight()
    //     if(gTop<sh && that.data.lengthTrue){
    //       that.data.lengthTrue = false
    //       var key = that.data.dropKey
    //       len = len + 10
    //       that.msgTab(key)
    //     }
    //   }).exec()
    // },
    tabTitleBind(e){
      var ind = e.currentTarget.dataset.ind
      this.data.dropKey = ind
      this.setData({
        current:ind,
      })
    },
    swiperChange(e){
      var itemId = e.detail.currentItemId
      var indLeft = itemId*107+21
      len = 5
      this.data.dropKey = itemId
      this.msgTab(itemId)
      this.setData({
        tabTitleInd:itemId,
        indLeft:indLeft,
      })
    },
    //数据切换
    msgTab(key){
      var showList = []
      if(key == 0){
        if(len > this.data.msgList0.length){
          showList = this.data.msgList0
        }else{
          for(var i=0 ;i<this.data.msgList0.length;i++){
            if(i>len){break;}
            var one = this.data.msgList0[i]
            showList.push(one)
          }
        }
      }else if(key == 1){
        if(len > this.data.msgList1.length){
          showList = this.data.msgList1
        }else{
          for(var i=0 ;i<this.data.msgList1.length;i++){
            if(i>len){break;}
            var one = this.data.msgList1[i]
            showList.push(one)
          }
        }
      }else if(key == 2){
        if(len > this.data.msgList2.length){
          showList = this.data.msgList2
        }else{
          for(var i=0 ;i<this.data.msgList2.length;i++){
            if(i>len){break;}
            var one = this.data.msgList2[i]
            showList.push(one)
          }
        }
      }else if(key == 3){
        if(len > this.data.msgList3.length){
          showList = this.data.msgList3
        }else{
          for(var i=0 ;i<this.data.msgList3.length;i++){
            if(i>len){break;}
            var one = this.data.msgList3[i]
            showList.push(one)
          }
        }
      }else if(key == 4){
        if(len > this.data.msgList4.length){
          showList = this.data.msgList4
        }else{
          for(var i=0 ;i<this.data.msgList4.length;i++){
            if(i>len){break;}
            var one = this.data.msgList4[i]
            showList.push(one)
          }
        }
      }else if(key == 5){
        if(len > this.data.msgList5.length){
          showList = this.data.msgList5
        }else{
          for(var i=0 ;i<this.data.msgList5.length;i++){
            if(i>len){break;}
            var one = this.data.msgList5[i]
            showList.push(one)
          }
        }
      }else if(key == 6){
        if(len > this.data.msgList6.length){
          showList = this.data.msgList6
        }else{
          for(var i=0 ;i<this.data.msgList6.length;i++){
            if(i>len){break;}
            var one = this.data.msgList6[i]
            showList.push(one)
          }
        }
      }
      var swiperH = showList.length*200
      this.setData({
        msgList:showList,
        swiperHeight:swiperH
      })
      this.data.lengthTrue = true
    }
  }
})