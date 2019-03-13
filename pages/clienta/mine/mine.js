var app =  getApp();
var util = require('../../../utils/util.js')
var config = require('../../../config.js');
var message = require('../../../utils/message.js');
var that = null;
Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    tab4: {
      type: Boolean,
      value: ''
    }
  },
  data: {
		headImgUrl:"",
    text: 'mine',
		show:'none',
    newline:'',
    //页面列表
    mineList:[
      {
        title: '个人名片',
        icon: '/image/img/idcard.png',
        style: 'width: 32rpx;height:27rpx;',
        to:'/pages/clienta/mine/card/card'
      }, {
        title: '切换身份',
        icon: '/image/img/identity.png',
        style: 'width: 32rpx;height: 28rpx;',
        to:'/pages/clientb/clientb'
      }, {
        title: '立即购买',
        icon: '/image/img/purchase.png',
        style:'width:32rpx;height:34rpx',
        to:'../../member/member'
      }, {
        title: '意见反馈',
        icon: '/image/img/feedback.png',
        style: 'width: 32rpx;height: 31rpx;',
        to:'/pages/clienta/jobs/compile/compile'
      },
    ],
    //用户数据
    managerInfo: { },
    guidance1:false,//生成名片海报
  },
  attached() {
    that = this;
    let h = util.systemTop() + 100
		// var headImgUrl = config.headImgUrl;
    this.setData({
      cH: h
    })
  },
	
  methods: {
		onShow(){
			var headImgUrl = null;
			headImgUrl = app.globalData.managerData.portrait_path;
			if(headImgUrl !=null && headImgUrl.indexOf("wills")!=-1)
				headImgUrl = headImgUrl.substr(0,headImgUrl.length - 4)+"s.jpg";
      this.allunde(app.globalData.managerData)
			this.setData({
				headImgUrl:headImgUrl,
        managerInfo: app.globalData.managerData
			});
      this.cpnewline()
		},
		changeRole : function(){
			this.setData({
				show:"block"
			});
			/* var watchManagerData = app.globalData.managerData;
			wx.setStorageSync("watchManagerData",watchManagerData);
			wx.redirectTo({
				url:'/pages/clientb/clientb'
			}); */
		},
    tapchange() {
      var bb = this.data.tab4
      if (bb) {
        console.log("mine");
        this.setData({
					managerInfo : app.globalData.managerData
				})
				var headImgUrl = null;
				headImgUrl = this.data.managerInfo.portrait_path;
				if(headImgUrl !=null && headImgUrl.indexOf("wills")!=-1)
					headImgUrl = headImgUrl.substr(0,headImgUrl.length - 4)+"s.jpg";
				this.setData({
					headImgUrl:headImgUrl
        })
        var guidanceonceData =  wx.getStorageSync("guidanceonceData");
        if(guidanceonceData && guidanceonceData["mine"]){
          this.setData({
            guidance:true
          });
        }
        this.cpnewline();
      }
      wx.getStorage({
        key:"course",
        success:function(r){
          var ad = r.data;
          if(!ad){
            return ;
          }
          if(!ad[7]){ 
            that.setData({
              guidance1:true
            })
          }else{
            that.setData({
              guidance1:false
            })
          }
        }
      })
    },
    mineTo(e){
      let to = e.currentTarget.dataset.to
			let index = e.currentTarget.dataset.index;
			if(index ==1){
        var guidanceonceData =  wx.getStorageSync("guidanceonceData");
        if(guidanceonceData && guidanceonceData["mine"]){
          guidanceonceData["mine"] = false;
          console.log(guidanceonceData);
          wx.setStorage({
            key:"guidanceonceData",
            data:guidanceonceData
          })
        }
				message.closeConnection(function(){
					wx.setStorageSync("clienttype",'b');
					wx.setStorageSync("frommanager",{id:app.globalData.managerData.id});
					wx.redirectTo({
						url: to
					});
        });
				return ;
			}
      if(index == 2 ){
        wx.navigateTo({
          url: to,
        })
        return ;
      }
			if( index == 3){
				wx.showToast({
					title:"未开放",
					icon:"none"
				})
				return ;
			}
      wx.navigateTo({
        url: to
      })
    },
    //公司职位都为空时的缺省
    allunde(md) {
      var company = md.company
      var position = md.position
      if (company == null || company == '') {
        if (position == null || position == '') {
          this.setData({
            mdcompany: false
          })
        }
      } else {
        this.setData({
          mdcompany: true
        })
      }
    },
    //公司职位换行
    cpnewline(){
      
      var len =0;
      if(app.globalData.managerData.company){
        len += app.globalData.managerData.company.length;
      }
      if(app.globalData.managerData.position){
       len += app.globalData.managerData.position.length;
      }
      
      if(len > 16){
        this.setData({
          newline:true
        })
      }else{
        this.setData({
          newline: false
        })
      }
    }
  }
})