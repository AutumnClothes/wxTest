// pages/clienta/jobs/common/common.js
var util = require('../../../../utils/util.js')
var network = require('../../../../utils/network.js')
var app = getApp();
var myid = null;
var distance = 0;
var startmove = null;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    editTop:'120%',
    inputlength:'0',
    inputAuto:false,
    lengthTop:'50',
    funHidden:'',
    leftList: [],
    scrollY:true,
    scrolly:true,
    itemId:'',
		maxlength:200,
		textareavalue:"",
    backBox:'true',
    classShow:true,
    pid:'',
    often: false,
    startx:'',
    starty:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
wx.hideShareMenu();
    var that = this;
		myid = app.globalData.managerData.id;
    let h = util.systemTop() + 100
    let scH = util.systemHeight()- h - 100
    var apple = app.globalData.AppleX
    if (apple) {
      this.setData({
        bm: 50,
        scrollHeight: scH + 50,
        cH: h
      })
    } else {
      this.setData({
        bm: 0,
        scrollHeight: scH,
        cH: h
      })
    } 
    this.realchatto(options)
		var rdata = {
			funcNo:"1019",
			creator:myid
		}
		network.postRequest(rdata).then(function(res){
			if(res.error_no == '0'){
				var theData = res.data;
				var arr = {};
				for(var i = 0 ;i < theData.length; i++){
					var one = theData[i];
					var typeid = one.typeid;
					if(!one.statementid){
						arr[typeid] = {
							title:one.typename,
							id:one.typeid,
							list:[]
						};
					}
				}
				for(var i = 0 ;i < theData.length; i++){
					var one = theData[i];
					var typeid = one.typeid;
					if(one.statementid){
						arr[typeid].list.push({
							text:one.content,
							id:one.statementid
						});
					}
				}
				var newArr = [];
				for(var i in arr){
					newArr.push(arr[i])
				}
				var itemId = "";
				if(newArr.length != 0 )
					 itemId= newArr[0].id;
				that.setData({
					leftList:newArr,
					itemId:itemId
				})
			}
		})
  },
  realchatto(options){
    var key = options.key
    if (key == 'often'){
      this.setData({
        often:true
      })
    }else{
      this.setData({
        often: false
      })
    }
  },
  //点击发送=>realchat
  realchatback(value){
    util.setBackexecute(1,'common',value)
    wx.navigateBack({
      delta: 1
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
    // var newCommon = app.globalData.managerData.commonitem;
    var that = this
    util.backexecute(res=>{
      that.minputBack(res)
    },'1016')
    util.backexecute(res => {
      this.getEditBind(res)
    }, '1018')
    util.backexecute(res => {
      wx.showModal({
        cancelColor: '#333301',
        confirmText: '保存',
        confirmColor: '#ffa019',
        content: '是否保存已编辑内容',
        success:function(r){
          if(r.confirm){
            that.minputBack(res)
          }
        }
      })
    }, 'value')
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
  //左上返回

  //index选中
  bindLeft(e){
    let iteId = e.currentTarget.dataset.iteId
    this.data.tit = e.currentTarget.dataset.iteTitle
    this.setData({
      itemId:iteId
    });
  } ,
  modalCancel(e) {
    util.getFormId(e)
    this.setData({
      modalMeng: false,
      modalInput: false
    })
  },
  inputOver(){
    var that = this;
    that.setData({
      modalMeng: false,
      modalInput: false
    });
    var name = this.data.textareavalue;
    var addData = {
      funcNo: "1014",
      creator: myid,
      name: name
    }
    network.postRequest(addData).then(function (r) {
      if (r.error_no == '0') {
        var typeid = r.data[0].typeid;
        that.data.leftList.push({ title: name, id: typeid });
        that.setData({
          leftList: that.data.leftList,
          textareavalue: "",
        });
      }
    })
  },
  //新增组
  bindAddL(e){
    util.getFormId(e)
    this.setData({
      maxL: 6,
      inputlength:'0',
      modalMeng: true,
      modalInput: true,
    })
  },
  //删除组
  bindDel(e){
    util.getFormId(e)
    var that = this;
    var id = this.data.itemId;
		var that = this;
		var deleteData =  {
			funcNo:"1015",
			typeid:id
		}
    if (this.data.itemId !=''){
      var title = null;
      this.data.leftList.forEach(item=>{
        if(item.id == id){
          title = item.title
        }
      })
      wx.showModal({
        content:'确认删除 “'+ title + '” 及组内所有常用语？',
        cancelColor: '#333301',
        confirmText: '删除',
        confirmColor: '#ffa019',
        success: function (res) {
          if (res.confirm) {
            network.postRequest(deleteData).then(function (r) {
              if (r.error_no == '0') {
                var arr = that.data.leftList;
                var newArr = [];
                for (var i = 0; i < arr.length; i++) {
                  var one = arr[i];
                  if (one.id != id) {
                    newArr.push(one);
                  }
                }
                that.setData({
                  leftList: newArr
                })
                that.data.itemId = ''
              }
            })
          }
        }
      });
    }else{
      wx.showToast({
        title: '请选择要删除的组',
        icon: 'none',
      })
    }
  },
  //新增单项
  bindAddR(e){
    util.getFormId(e)
    if(this.data.itemId != ''){
      wx.setStorageSync("tominputpage", {
        key: "commonitem",
        funcNo: "1016",
        value: '',
        id: app.globalData.managerData.id,
        target: "新增常用语"
      });
      wx.navigateTo({
        url: '../../../minput/minput',
      })
    }else{
      wx.showToast({
        title: '请选择要添加常用语的组',
        icon: 'none',
      })
    }
  },
  minputBack(data){
    var that = this;
    var id = that.data.itemId;
    var name = data.value;
    var addData =  {
      funcNo:"1016",
      creator:myid,
      typeid:id,
      content:name
    }
    network.postRequest(addData).then(function(r){
      if(r.error_no == '0'){
        var statementid = r.data[0].statementid;
        var arr = that.data.leftList;
        for(var i = 0 ; i< arr.length; i++){
          var one = arr[i];
          if(one.id ==id ){
            var innerlist =  one.list;
            if(!innerlist)
              innerlist = [];
              innerlist.push({
              text:name,
              id:statementid
            })
            one.list = innerlist;
          }
        }
        that.setData({
          leftList:arr
        })
      }
    })
  },
  realchatTo(e){
    var that = this
    if (this.data.often) {
      wx.showModal({
        content: '确定要发送这条内容吗？',
        cancelColor: '#333301',
        confirmText: '发送',
        confirmColor: '#ffa019',
        success(res) {
          if (res.confirm) {
            var value = e.currentTarget.dataset.value
            that.realchatback(value)
          }
        }
      })
    }
  },
  //手指刚放到屏幕触发
  touchS(e) {
    if (!this.data.often) {
      this.data.startx = e.changedTouches[0].clientX
      this.data.starty = e.changedTouches[0].clientY
      let index = e.currentTarget.dataset.index
      let ind = e.currentTarget.dataset.ind
      this.data.leftList[index].list.forEach(item => {
        item.txtStyle = 0;
      })
      this.setData({ leftList: this.data.leftList })
      startmove =null;
      distance =0;
    }
  },
  //触摸时触发，手指在屏幕上每移动一次，触发一次
  touchM(e) {
    if (!this.data.often) {
      if(distance == 0){
        distance = this.data.startx;
      }
      let movex = e.changedTouches[0].clientX - this.data.startx
      let movey = e.changedTouches[0].clientY - this.data.starty
      if(startmove ==null){
        if(Math.abs(movex) > 20 || Math.abs(movey)>20){
          if(Math.abs(movex)>Math.abs(movey) ){
            startmove = true;
          }else{
            startmove = false;
          }
        }
      }
      if (startmove){
        this.setData({
          scrolly: false
        })
        this.data.iteLeft = movex;
        if(movex>0)return ;
        if( Math.abs(e.changedTouches[0].clientX - distance)<50){
          return ;
        }else{
          distance = e.changedTouches[0].clientX;
        }
        if (this.data.iteLeft < -320) this.data.iteLeft = 320;
        let index = e.currentTarget.dataset.index
        let ind = e.currentTarget.dataset.ind
        this.data.leftList[index].list[ind].txtStyle = this.data.iteLeft
        this.setData({
          leftList: this.data.leftList
        })
      }else{
        this.setData({
          scrolly: true,
        })
        this.data.iteLeft = 0
      };
    }
  },
  touchE(e) {
    if (!this.data.often) {
      let endx = this.data.startx - e.changedTouches[0].clientX
      let index = e.currentTarget.dataset.index
      let ind = e.currentTarget.dataset.ind
      if(endx <= 100){
        this.data.leftList[index].list[ind].txtStyle = 0
      }else{
        this.data.leftList[index].list[ind].txtStyle = -320
      }
      this.setData({
        leftList: this.data.leftList,
        scrolly: true
      })
    }
  },
  //删除
  itedelBind(e){
		var that = this;
		var id = e.currentTarget.dataset.id;
		var pid = e.currentTarget.dataset.pid;
		var addData =  {
			funcNo:"1017",
			statementid:id,
		}
    this.setData({
      classShow: false
    })
		wx.showModal({
      content:"确认删除",
      cancelColor: '#333301',
      confirmText: '删除',
      confirmColor: '#ffa019',
			success:function(res){
				if(res.confirm){
						network.postRequest(addData).then(function(r){
							if(r.error_no == '0'){
								
								var arr = that.data.leftList;
								for(var i = 0 ; i< arr.length; i++){
									var one = arr[i];
									if(one.id ==pid ){
										var innerlist =  one.list;
										var willDelete = null;
										for(var j = 0 ; j< innerlist.length ; j++ ){
											var two = innerlist[j];
											if(two.id == id){
												willDelete = j;
												break;
											}
										}
										if(willDelete!=null){
											innerlist.splice(willDelete,1);
											break;
										}
									}
								}
								that.setData({
									leftList:arr
								})
							}
						})
				}
			},
      complete:function(){
        that.resetList()
      }
		});
  },
  //编辑
  editBind(res){
    var d = res.currentTarget.dataset;
    var text = d.text;
    var id = d.id;
    this.data.pid = d.pid;
    wx.setStorageSync("tominputpage", {
      key:id,
      funcNo: "1018",
      value: text,
      id: id,
      target: "常用语编辑"
    });
    this.resetList()
    wx.navigateTo({
      url: '../../../minput/minput',
    })
    
  },
  getEditBind(data){
    var that = this;
    var newText = data.value;
    var id = data.key;
    var addData = {
      funcNo:'1018',
      statementid:id,
      content:newText
    }
    network.postRequest(addData).then(r=>{
      if(r.error_no == '0'){
        var arr = that.data.leftList;
        for (var i = 0; i < arr.length; i++) {
          var one = arr[i];
          if (one.id == that.data.pid ){
            var innerlist =  one.list;
            var willUpdate = null;
            for(var j = 0 ; j< innerlist.length ; j++ ){
              var two = innerlist[j];
              if(two.id == id){
                willUpdate= two;
                break;
              }
            }
            if(willUpdate!=null){
              willUpdate["text"] = newText;
            }
          }
        }
        that.setData({
          leftList:arr
        })
      }
    })
  },
  editFocus(e){
    var apple = app.globalData.AppleX
    if (apple) {
      this.setData({
        lengthTop: 650,
      })
    } else {
      this.setData({
        lengthTop: 600,
      })
    } 
    this.setData({
      classShow:false,
      funHidden:true,
    })
  },
  editDown(){
    var apple = app.globalData.AppleX
    if (apple) {
      this.setData({
        lengthTop: 50,
      })
    } else {
      this.setData({
        lengthTop: 0,
      })
    } 
    this.setData({
      editTop: '120%',
      inputAuto: false,
      funHidden:false,
      classShow:true
    })
  },
  goBack(){
    this.editDown()
    this.resetList()
  },
  //重置list
  resetList(){
    this.data.leftList.forEach((item) => {
			if(item.list){
					item.list.forEach((ite) => {
						ite.txtStyle = ''
					})
			}
    })
    this.setData({
      leftList: this.data.leftList
    })
  },
  inputEnd(e) {
    this.data.textareavalue = e.detail.value
  },
})
