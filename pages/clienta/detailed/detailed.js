// pages/clienta/detailed/detailed.js
var util = require('../../../utils/util.js')
var network = require('../../../utils/network.js')
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalMeng:false,
    modalInput: false,
    modalTextarea: false,
    title:'',
		editField:"",
    sexArray: ['男', '女'],
    education: ['小学', '初中', '高中', '中专', '大专', '本科', '硕士', '博士'],
    // thisName:'曾照南',
    // referee:'曾照南',
    // source:'实打实大',
		cusData:{},
    //基础资料
    fList: [ {
        name: '备注名',
        text: 'name',
        title: '请输入备注名'
      }, {
        name: '性别',
        text: 'gender',
        title: '请输入性别'
      }, {
        name: '生日',
        text: 'birthday',
        title: '请输入生日日期'
      }, {
        name: '联系电话',
        text: 'mobilephone',
        title: '请输入联系电话'
      }, {
        name: '备用电话',
        text: 'telephone',
        title: '请输入备用电话'
      }, {
        name: '邮箱',
        text: 'email',
        title: '请输入邮箱'
      }, {
        name: '身份证',
        text: 'identificationno',
        title: '请输入身份证号码'
      }, {
        name: '资金账户',
        text: 'account',
        title: '请输入资金账户'
      }, {
        name: '开户日期',
        text: 'openaccount',
        title: '请输入开户日期'
      }, {
        name: '佣金率',
        text: 'brokerage',
        title: '请输入佣金率'
      }, 
    ],
    //个性资料
    lList:[
      {
        name: '投资经验',
        text: 'investexperience',
        title: '请填写投资经验',
        bindtap: "textareaOn"
      }, {
        name: '投资偏好',
        text: 'investhabit',
        title: '请填写投资偏好',
        bindtap: "textareaOn"
      }, {
        name: '学历',
        text: 'edu',
        title: '请输入学历'
      }, {
        name: '行业',
        text: 'industry',
        title: '请填写行业'
      }, {
        name: '职业',
        text: 'position',
        title: '请填写职业'
      }, {
        name: '工作单位',
        text: 'company',
        title: '请填写工作单位',
        bindtap: "textareaOn"
      }, {
        name: '地址',
        text: 'address',
        title: '请填写地址',
				bindtap:"textareaOn"
      }, {
        name: '兴趣爱好',
        text: 'hobby',
        title: '请填写兴趣爱好',
        bindtap: "textareaOn"
      }, {
        name: '客户需求',
        text: 'demand',
        title: '请填写客户需求',
				bindtap:"textareaOn"
      }, {
        name: '备注',
        text: 'remark',
        title: '请填写备注',
				bindtap:"tominput"
      },
    ],
  },
  //存通讯录
  storageBind(e){
    let phone = e.currentTarget.dataset.phonenum
    let name = e.currentTarget.dataset.name
    if (phone.length > 3){
      wx.addPhoneContact({
        firstName: name,//姓名
        mobilePhoneNumber: phone,//手机
      })
    }else{
      wx.showModal({
        title:'存入通讯录',
        content:'请正确输入联系电话'
      })
    }
  },
  //弹出input输入
  inputOn(e){
    console.log(e.currentTarget.dataset);
		var dataset = e.currentTarget.dataset;
		this.data.editField = dataset.field;
		if(!dataset.value){
			dataset.value = ""
		}
    this.setData({
      modalMeng: true,
      modalInput: true,
      typeon: e.currentTarget.dataset.type,
      title:e.currentTarget.dataset.title,
      maxL: e.currentTarget.dataset.maxl,
			value:dataset.value
    });
  },
  textareaOn(e){
		var dataset = e.currentTarget.dataset;
		this.data.editField = dataset.field;
		if(!dataset.value){
			dataset.value = ""
		}
    this.setData({
      modalTextarea: true,
      modalMeng: true,
      title: e.currentTarget.dataset.title,
      value:dataset.value,
      cursor:(dataset.value.length)
    })
  },
  inputOver(e) {
    util.getFormId(e)
    this.setData({
      modalInput: false,
      modalMeng: false,
    });
		// 发起修改请求。修改 cusdata , 重新渲染
		console.log(this.data.editField);
		console.log(this.data.value);
		this.modify(this.data.editField,this.data.value);
  },
  textareaOver(e) {
    util.getFormId(e)
    this.setData({
      modalTextarea: false,
      modalMeng: false,
    });
		this.modify(this.data.editField,this.data.value);
  },modify(key,value){
		var that = this;
		if(value == null || value == undefined) return;
		var md = {
			funcNo:'1027',
			cusid:this.data.cusData.id,
			managerid:app.globalData.managerData.id,
		}
		md[key] = value;
    console.log(md)
		network.postRequest(md).then(function(res){
			if(res.error_no == '0'){
				that.data.cusData[key] = value;
				that.setData({
					cusData:that.data.cusData
				})
				if(key == 'name'){
					var pagesStack =  getCurrentPages();
					if(pagesStack[1].route == "pages/clienta/realchat/realchat"){
						util.setBackexecute(pagesStack.length-2,"updateTarget",{target:value});
					}
					
					util.setBackexecute(pagesStack.length-1,"updateUserList");
					wx.removeStorage({
						key:"cusdataMapForInfomation"
					})
				}
			}
		});
	},
  inputEnd(e){
    let val = e.detail.value
		this.data.value = val;
  }/* ,
  textareaEnd(e){
    let val = e.detail.value
    if (val.length != 0) {
      this.data.lList.forEach((item, index) => {
        if (item.title == this.data.title) {
          this.data.lList[index].text = val
        }
      })
    }
    this.setData({
      lList: this.data.lList
    })
  } */,
  modalCancel(e) {
    util.getFormId(e)
    this.setData({
      modalInput: false,
      modalTextarea: false,
      modalMeng: false,
    })
  },
	tominput(e){
		var ed = e.currentTarget.dataset;
		wx.setStorageSync("tominputpage",{
			key:ed.field,
			funcNo:"1027",
			value:ed.value,
			id:this.data.cusData.id,
			target:ed.title
		});
		wx.navigateTo({
			url:"../../minput/minput"
		})
	},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
wx.hideShareMenu();
    let h = util.systemTop() + 100
    let sh = util.systemHeight()-h
    this.getNewDay()
    this.setData({
      cH: h,
      sH:sh 
    })
		var toCusDetailPgae = wx.getStorageSync("toCusDetailPgae");
		var newCusData = {};
		for(var i in toCusDetailPgae){
			if(toCusDetailPgae[i])
				newCusData[i] = toCusDetailPgae[i];
		}
    this.setbindPickerChange(newCusData.gender)
    this.setbindTimeChange(newCusData.birthday)
    this.setbindKtimeChange(newCusData.openaccount)
    this.seteducationChange(newCusData.edu)
		this.setData({
			cusData:newCusData
		});
  },
  //获取年月日
  getNewDay(){
    var myDate = new Date();
    var day = myDate.getDate()
    var month = myDate.getMonth()
    var year = myDate.getFullYear()
    var newday = year + '-' + month + '-' + day
    console.log(newday)
    this.setData({
      newday: newday
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log(this.data.cusData)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
		var that = this;
    util.backexecute(function (r) {
      that.data.cusData[r.key] = r.value;
      that.setbindPickerChange(that.data.cusData.gender)
      that.setbindTimeChange(that.data.cusData.birthday)
      that.setbindKtimeChange(that.data.cusData.openaccount)
      that.seteducationChange(that.data.cusData.edu)
      that.setData({
        cusData: that.data.cusData
      });
    });
		util.backexecute(function(r){
      wx.showModal({
        title: '',
        content: '是否保存已编辑内容',
        cancelColor:'#b0b3ba',
        confirmText:'保存',
        confirmColor:'#ff8a01',
        success:function(res){
          if (res.confirm){
            that.data.cusData[r.key] = r.value;
            that.setData({
              cusData: that.data.cusData
            });
          }
        }
      })
    },'value');
  },
  //性别选择
  bindPickerChange: function (e) {
    var id = e.detail.value
    if(id == '0'){
      this.data.cusData.gender = '男'
    }else{
      this.data.cusData.gender = '女'
    }
    this.modify('gender', this.data.cusData.gender);
    this.setData({
      index: e.detail.value
    })
  },
  setbindPickerChange(data){
    if(data == '女'){
      data = '1'
    }else{
      data = '0'
    }
    this.setData({
      index: data
    })
  },
  //生日
  bindTimeChange: function (e) {
    this.data.cusData.birthday = e.detail.value
    this.modify('birthday', this.data.cusData.birthday);
    this.setData({
      time: e.detail.value
    })
  },
  setbindTimeChange(data){
    if(data){
      this.setData({
        time: data
      })
    }
  },
  //开户日期
  bindKtimeChange: function (e) {
    this.data.cusData.openaccount = e.detail.value
    this.modify('openaccount', this.data.cusData.openaccount);
    this.setData({
      Ktime: e.detail.value
    })
  },
  setbindKtimeChange(data){
    if(data){
      this.setData({
        Ktime: data
      })
    }
  },
  //学历
  educationChange: function (e) {
    var ind = e.detail.value
    this.data.cusData.edu = this.data.education[ind]
    this.modify('edu', this.data.cusData.edu);
    this.setData({
      eindex: e.detail.value
    })
  },
  seteducationChange(data){
    var ind = this.data.education.indexOf(data)
    this.setData({
      eindex: ind
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
		wx.setStorageSync("backToCusdataPgae",this.data.cusData);
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
