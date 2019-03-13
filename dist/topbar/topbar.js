// dist/topbar/topbar.js
var app = getApp()
var network = require('../../utils/network.js')
var util = require('../../utils/util.js')

Component({
  externalClasses: ['top-box-style'],
  properties: {
    text:{
      type:String,
      value:''
    },
    backBox:{
      type:Boolean,
      value:false
    },
    delta:{
      type:Number,
      value:''
    },
    backmethod:{
      type:String,
      value:""
    }
  },
  data: {
    // topHeight:'',
    cH:''
  },

  attached(){
    this.systemForm()
    let ch = util.systemTop()
    let th = 32*util.gHeight()
    // topHeight = this.data.topHeight,
    this.setData({
      cH: ch,
      tH:th,
      backBox: this.data.backBox
    })
  },
  methods: {
    systemForm() {
      var that = this
      wx.getSystemInfo({
        success: function (res) {
          // that.data.topHeight = ((res.statusBarHeight * (750 / res.windowWidth)) + 10)
          that.data.cH = ((res.statusBarHeight * (750 / res.windowWidth)) + 100)
        }
      })
    },
    backTo(e){
      var backmethod = this.data.backmethod;
      if(backmethod){
        this.triggerEvent(backmethod, {}, {})
        return;
      }
      var formid = e.detail.formId;
      var pageStack = getCurrentPages();
      var route = pageStack[pageStack.length-1].route
      var formkey = e.currentTarget.dataset.formkey
      var fd = {
        funcNo: "9999",
        formid: formid,
        router: route,
        formkey:formkey
      }
      var routekey = route.indexOf('clientb')//判断
      if(routekey != '-1'){
        if(app.globalData.customerData){
          fd["creator"] = app.globalData.customerData.id;
          network.postRequest(fd);
        }
      }else{
        if(app.globalData.managerData){
          fd["creator"] = app.globalData.managerData.id;
          network.postRequest(fd);
        } 
      }
      let toNum = this.data.delta;
      wx.navigateBack({
        delta: toNum
      })
    }
  }
})
