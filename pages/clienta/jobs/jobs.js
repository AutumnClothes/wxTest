var util = require('../../../utils/util.js')
var that = null;
Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    tab3: {
      type: Boolean,
      value: ''
    }
  },
  data: {
    jobList:[
      { title: '顾问群', imgputh: 'https://www.willsfintech.cn:9004/staticFile/image/general_small.png', to: '/pages/circle/circle',style:'width:52rpx;height:52rpx;'  },
      { title: '资讯', imgputh: '/image/img/newmsg.png',to:'jobs/newmsg/newmsg',style:'width:50rpx;height:50rpx;'},
      { title: '常用语',imgputh: '/image/img/common.png', to:'jobs/common/common',style:'width:50rpx;height:50rpx;' },
      { title: '产品及服务',imgputh: '/image/img/product.png', to: 'jobs/product/product',style:'width:50rpx;height:50rpx;' },
      { title: '个人专栏', imgputh: '/image/img/column.png', to: 'jobs/column/column',style:'width:50rpx;height:41rpx;'  },
      
    ],
    guidance1:false,//新增一篇资讯
    guidance2:false,//推荐一篇资讯
    guidance3:false,//上架一款产品
    guidance4:false,//发布一篇专栏
  },
  attached() {
    that = this;
  },
  methods: {
    tapchange() {
      
      var bb = this.data.tab3
      if (bb) {
        var guidanceonceData =  wx.getStorageSync("guidanceonceData");
        if(guidanceonceData && guidanceonceData["job"]){
          this.setData({
            guidance:true
          });
        }
      }
      this.checkStatue();
    },checkStatue(){ // 检查状态 更新 展示状态
      wx.getStorage({
        key:"course",
        success:function(r){
          var ad = r.data;
          if(!ad){
            return ;
          }
          if(!ad[3]){ 
           that.setData({
             guidance1:true
           });
          }else if(!ad[4]){
            // 推荐资讯
            that.setData({
              guidance1:false,
              guidance2:true
            });
          }else{
            that.setData({
              guidance1:false,
              guidance2:false
            });
          }
          if(!ad[5]){
            //发专栏
            that.setData({
              guidance3:true
            });
          }else{
            that.setData({
              guidance3:false
            });
          }
          if(!ad[6]){ 
            // 新增产品
            that.setData({
              guidance4:true
            });
          }else{
            that.setData({
              guidance4:false
            });
          }
        }
      })
    },
    nextTo(e) {
      let url = e.currentTarget.dataset.toUrl

      if(url == 'jobs/newmsg/newmsg'){
        var guidanceonceData =  wx.getStorageSync("guidanceonceData");
        if(guidanceonceData && guidanceonceData["job"]){
          guidanceonceData["job"] = false;
          console.log(guidanceonceData);
          wx.setStorage({
            key:"guidanceonceData",
            data:guidanceonceData
          })
          this.setData({
            guidance:false
          });
        }
      }
      

      wx.navigateTo({
        url: url
      })
    }
  }
  
})