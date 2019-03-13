// pages/clienta/mine/editcard/editcard.js
var util = require('../../../../utils/util.js')
var network = require('../../../../utils/network.js')
var config = require('../../../../config.js');
var app =getApp();
var fromcardboxTocard = null;
var that = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //input弹窗显示控制
		headImgUrl:"",
    modalInput:false,//show
    inputId:'',
    inputValue:'',
    textareaValue:'',
    typeStr:'text',
    inputClass:false,
    maxLength:'',
    //input数据
    inputList:[{
      id:'name',
      text:'请输入姓名',
      title:'请输入姓名'
    }, {
      id: 'company',
      text: '请输入公司简称',
      title: '请输入公司简称'
    },  {
      id: 'job',
      text: '请输入您的职位',
      title: '请输入您的职位'
    },{
      id: 'telephone',
      text: '请输入电话号码',
      title: '请输入电话号码'
    },  {
      id: 'fixedTelephone',
      text: '请输入座机号码',
      title: '请输入座机号码'
    },  {
      id: 'weixin',
      text: '请输入微信号码',
      title: '请输入微信号码'
    },  {
      id: 'email',
      text: '请输入电子邮箱地址',
      title: '请输入电子邮箱地址'
    } ],
    index:0,
    textareaList:[
      {
        id: 'address',
        text: '请输入街道、楼牌等',
        title: '请输入街道、楼牌等'
      }, {
        id: 'brightSpot',
        text: '请简要介绍您的亮点：身份标签、长处优势、个人成就、亮点数据、产品服务、价值观、座右铭等',
        title: '请输入亮点介绍'
      }, {
        id: 'personal',
        text: '请详细介绍您自己。一份好的自我介绍文案就像连接客户的桥梁，您可以：1、通过身份标签与长处优势引起客户兴趣；2、通过个人成就与亮点数据赢得客户信任；3、通过产品服务与价值观表达您的渴望；最后，呼吁客户立刻行动。',
        title: '个人简介编辑'
      },
    ],
    
    //产品
		managerData:{
		},
    region: ['', '', ''],
    confirmText:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
wx.hideShareMenu();
    that = this;
    let h = util.systemTop() + 100
    let sh = h
    let ch = util.systemHeight()-sh
    let sch = util.systemHeight() - sh - 100
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
      cH: h,
      sH: sh,
      cH:ch,
      scH:sch
    })
    var headImgUrl = null;
    fromcardboxTocard = wx.getStorageSync("fromcardboxTocard");
    if(fromcardboxTocard){
      wx.removeStorage({
        key:"fromcardboxTocard"
      });
      that.data.managerData["user_name"] =  fromcardboxTocard["nickname"];
      that.data.managerData["portrait_path"] =  fromcardboxTocard["portrait"];
      that.setData({
        guidance:true,
        confirmText:false
      });
      setTimeout(function(){
        that.setData({guidance:false});
      },50000);
      headImgUrl = that.data.managerData["portrait_path"] ;
    }else{
      headImgUrl = app.globalData.managerData.portrait_path;
    }
		
		if(headImgUrl !=null && headImgUrl.indexOf("wills")!=-1)
			headImgUrl = headImgUrl.substr(0,headImgUrl.length - 4)+"s.jpg";
    var str = app.globalData.managerData.key_word
    if (typeof (str) == 'string' && str.length != 0){
      app.globalData.managerData.key_word = str.split(',')
    }
		this.setData({
        headImgUrl:headImgUrl,
        managerData : app.globalData.managerData
    })
		var city =  app.globalData.managerData.city;
		if(city!="" && city!=null){
      var region =  city.split(",");
      this.setData({
        region:region
      });
		}
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
    var that = this
		var headImgUrl = null;
    headImgUrl = app.globalData.managerData.portrait_path;
    util.backexecute(function(r){
      wx.showModal({
        content: '是否保存已编辑内容',
        cancelColor: '#b0b3ba',
        confirmText: '保存',
        confirmColor: '#ff8a01',
        success:function(res){
          if(res.confirm){
            app.globalData.managerData.introduce = r.value
            that.setData({
              managerData: app.globalData.managerData
            })
          }
        }
      })
    },'value')
		if(headImgUrl !=null && headImgUrl.indexOf("wills")!=-1)
			headImgUrl = headImgUrl.substr(0,headImgUrl.length - 4)+"s.jpg";
		this.setData({
      headImgUrl:headImgUrl,
      managerData : app.globalData.managerData
		})
  },
  //保存
  cardSave(e){
    util.getFormId(e)
    wx.navigateBack({
      delta:'1'
    })
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
  //form表单
  formSubmit(){},
  //头像上传
  changeAvatar(e){
    wx.navigateTo({
      url: '../uploadhi/uploadhi'
    })
  },
  //跳往编辑
  
  //吊起输入modal
  inputOn(e){
    let id = e.currentTarget.dataset.id
    let tp = e.currentTarget.dataset.type
    let length = e.currentTarget.dataset.maxl;
    let tit = e.currentTarget.dataset.title
		let value =e.currentTarget.dataset.value
		this.data.inputValue = value;
		if(!length){length = 100;}
		if(!value)value ="";
    this.data.inputId = id
    this.setData({
      modalInput:true,
      modalMeng: true,
      inputMaxL: length,
      typeStr:tp,
      title:tit,
			value:value
    })
  },
  textareaOn(e){
    let id = e.currentTarget.dataset.id;
    let length = e.currentTarget.dataset.maxlength;
    let tit = e.currentTarget.dataset.title;
    let value = e.currentTarget.dataset.value;
    if(!value)value = '';
		this.data.inputValue = value;
    this.data.inputId = id;
		if(!length){
			length = 100;
		}
    this.setData({
      modalTextarea: true,
      modalMeng: true,
      modalarea:true,
      title: tit,
      maxLength: length,
      value:value,
      cursor:(value.length)
    })
  },
  modalCancel(e){
    util.getFormId(e)
    this.setData({
      modalInput: false,
      modalTextarea: false,
      modalMeng: false
    })
  },
  //input,textarea焦点失去后上传value
  inputEnd(e) {
    this.data.inputValue = e.detail.value
  },
  textareaEnd(e) {
    this.data.textareaValue = e.detail.value
  },
  inputOver(e){
    util.getFormId(e)
    if (this.data.inputId == 'key_word'){
      if (this.data.managerData.key_word == '' || this.data.managerData.key_word == null){
        var list = []
      }else{
        var list = this.data.managerData.key_word
      }
      list.push(this.data.inputValue)
      this.data.inputValue = list.join(',')
    }
    this.setData({
      modalInput: false,
      modalTextarea: false,
      modalMeng: false,
      inputClass:true
    })
    if(this.data.inputId == 'user_name' && this.data.inputValue == ''){
      this.data.inputValue = this.data.managerData.cn_name;
    }
		this.update(this.data.inputId,this.data.inputValue);
  },
  textareaOver(e){
    util.getFormId(e)
    this.setData({
      modalInput: false,
      modalTextarea: false,
      modalMeng: false,
      inputClass: true
    })
		this.update(this.data.inputId,this.data.textareaValue);
  },
	update(key,value){
		var that = this;
    // 更新 managerData
    that.setData({guidance:false});
		var updateData = {
			funcNo:"1025",
			id:this.data.managerData.id
		}
    if (key == 'key_word' && value.length == 0){
      updateData[key] = ''
    } else { 
      updateData[key] = value
    };
		network.postRequest(updateData).then(function(res){
			if(res.error_no == "0"){
        that.data.managerData[key] = value;
        if (key == 'key_word'){
          if (value == ''){
            var list = ''
          }else{
            var list = value.split(',')
          }
          that.data.managerData.key_word = list
        }
        that.setData({
          managerData: that.data.managerData
        });
				app.globalData.managerData = that.data.managerData;
			}
		});
	},toBiginput(){
		wx.setStorageSync("tominputpage",{
			key:"introduce",
			funcNo:"1025",
			value:app.globalData.managerData.introduce,
			id:app.globalData.managerData.id,
			target:"个人简介编辑"
		});
		wx.navigateTo({
			url:"../../../minput/minput"
		})
	},
  //个人产品上传
  productBindAdd(){
    let aa = 'https://ss2.baidu.com/-vo3dSag_xI4khGko9WTAnF6hhy/image/h%3D300/sign=0eaa7d0c75f0f736c7fe4a013a54b382/f603918fa0ec08faf4f358d454ee3d6d54fbdad6.jpg'
    this.data.product.productImg = aa
    this.setData({
      product: this.data.product
    })
  },
  //省市区三级联动
  bindRegionChange: function (e) {
		var city = "";
		for(var i = 0 ; i< e.detail.value.length; i++){
			var one = e.detail.value[i];
			if(i!=0)
				city+=",";
			city+=one;
		}
    this.setData({
      region: e.detail.value
    })
    var citylist = city.split(',')
    let cityl = [...new Set(citylist)]
    city = cityl.join(',')
		this.update("city",city);
  },
  //我的标签-> 添加   //少交互
  bindTagAdd(e){
    let id = e.currentTarget.dataset.id;
    this.setData({
      modalMeng:true,
      modalInput:true,
      inputMaxL:200,
      typeStr:'text',
      title: "添加标签",
    })
  },
  //bindTagAddErr
  bindTagAddErr(e){
    var that = this
    let id = e.currentTarget.dataset.id
    wx.showModal({
      content: '确定将该标签移除？',
      cancelColor: '#333301',
      confirmText: '删除',
      confirmColor: '#ffa019',
      success:function(res){
        if (res.confirm) { 
          var list = that.data.managerData.key_word
          list.splice(id, 1)
          if (list.length != 0){
            list = list.join(',')
          }else{
            list = ''
          }
          that.update('key_word',list);
        }
      }
    })
  }
})
