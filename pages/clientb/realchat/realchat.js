var util = require('../../../utils/util.js')
var message = require('../../../utils/cusmessage.js');
var config = require("../../../config.js");
var network = require('../../../utils/network.js')
var app = getApp();
var pageData =null;
var chatData = null;
var pageSize = 20;
var pageIndex =1;
var nomoredata = false;
var scrollHeigth = 0;
var topLeft = 0;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    tareaShow:false,
    mengShow:false,
		pageid:"chat",
		inputText:"",
		chatData:[],
    target:'',
    chrildId: '',
    extendHid: false,  
    inputdo: true,
    selfPortrait:'',
    sh:'',
    focusTrue:false,
    operateShow:false,
    phone:'',
    //目标头像
    targetPortrait: '',
    //底部加号数据
    inputExtend: [
      {
        text: '图片',
				key:"img",
        img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAACtElEQVRoge3ZzWtVRxiA8Z8nAYtoSEG6rG7Eggu7cBFaUGmLG1cKhdqFoqsUCxZd2JJVFILdqAQLin9AS6FCaZtCSJWu6kY3SmrbINTQTcWPmniF1hgXc1OjJvfOzLnJuYE8cBbDeWfmfe6dc+bjrBj4/CRswAm8hy7tzQOM4FP80YmNuIzuKrNKoAu78Q56CgxYOsnPphsDhTBslio7Cu0/5huxuqg6g7IsC1RNjsBN9GIdVuL1enmshXlFkyowhM04h1v4F+P18pv4rqXZRZAicAPvY3Ke+w/xAX4tm1QKKQLHUWsSU8Ox/HTSSRGIHR7f5ySSS6zARP2KYVJYcJVhGndiAmMF1uCVyNiV9fhcfsQbWIst+KtRcMoQil0zvYsVCe3OZhA78Xu9fAUHGlVIEehDR5OYjnpcDt/gE2H4zGa4UaUUgR6cMb9EgdN4K6HNGUax38vJNyV1IuvFRWz3TKQD23AJH6cmgH+EDUrsS+I5OjPqbBWSreFvvIZVOZ0Lv/g+/JZZP0tghlVYX6I+YXL8tkwDVa5Gh9BftpGqBMbwIZ6UbagKgRp2CQ9vaRZbYFp4XV5vVYOtEPhKeH3+HBF7El+3oM//KSvwJfbgC2EJcapB7AiOluzvJcoIjOPgrPIUDuMjPH4h9k/hoZ0q0d+c5ArMjOV7c9w7KyzIZmbWmjDT3s7sqyG5AoP4qcH9Ybwt7JsP4mpmP03JmYlH8VlE3DVsMv8euiWk/gP/YS8eRcYvaPKkC/QLm4y2IUXgF+EjSFsRKzApDJ2WvwbLEitwREVHh82IEfgB5xc6kVxiBA7J2KsuFjECc822bUOMwCm8utCJ5BIjsBd3hWFU1VVKoK1ZFqiaQvmj8CqZLISt3lJluBBOk+9XnUkG99FXCB/venBB5gHrIjMh5NqDG08BGv6Vyx2k0TAAAAAASUVORK5CYII='
      }
    ]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
    nomoredata = false;
		pageIndex = 1;
		wx.setStorageSync("bunread",0);
		var that = this;
		app.globalData.renderPage = this;
	 	this.data.selfPortrait =app.globalData.customerData.portraitpath;
    this.appleX()
		app.globalData.thispage = this;
		pageData =  wx.getStorageSync("tochatpagewmanager");
		console.log(pageData);
		this.data.targetPortrait = pageData.portraitpath;
    this.data.phone = pageData.phone
		this.setData({
			target:pageData["name"]
		});
		this.rerender();
		this.clearunread(); // 清楚 unread 计数
    let ch = util.systemTop() + 100
    that.data.sh = util.systemHeight()-ch-100
    that.setData({
      cH: ch,
      scrollBottom: that.data.sh,
    }) 
  },
  appleX(){
    var apple = app.globalData.AppleX
    if (apple) {
      this.setData({
        inputBottom: '50r',
      })
    } else {
      this.setData({
        inputBottom: 0,
      })
    } 
  },toarticleview(e){
    var index = e.currentTarget.dataset.index;
    var article = this.data.chatData[index].content;
    wx.setStorageSync("toviewpagedata",article);
    wx.setStorageSync('tuijian', 'realchat')
    wx.navigateTo({
      url:"../view/view"
    });
  },toproductview(e){
    var index = e.currentTarget.dataset.index;
    var product = this.data.chatData[index].content;
    wx.setStorageSync("toproductreadpage",{data:product});
    wx.setStorageSync('tuijian', 'realchat')
    wx.navigateTo({
      url:"../product/productread/productread"
    });
  },
  rerender(){
		chatData = wx.getStorageSync("messagelist"+pageData["id"]);
		if(chatData != ''){
			var i = 0;
			var tmpArray = [];
			if(pageIndex * pageSize < chatData.length ){
        i = chatData.length - pageIndex * pageSize ;
        nomoredata = false;
			}
			for(; i <chatData.length ; i++){
				tmpArray.push(chatData[i]);
			}
			chatData = tmpArray;
			this.setData({
				chatData:this.concat(chatData),
			});
			this.setData({
				chrildId: 'liubaiBottom'
			})
		}
	},scrolltoupper(e){
    if(nomoredata)return ;
		pageIndex++;
		console.log("scrolltoupper"+pageIndex);
		var that = this;
		chatData = wx.getStorageSync("messagelist"+pageData["id"]);  //更新展示
		if(chatData != ''){
      wx.showLoading({
        title:"loading",
        mask:true
      });
			var i = 0;
      var tmpArray = [];
      var lastMessage =  this.data.chatData[0];
			if(pageIndex * pageSize < (chatData.length + pageSize) ){
        i = chatData.length - pageIndex * pageSize ;
        if(i<0)i=0;
        for(; i <chatData.length ; i++){
          tmpArray.push(chatData[i]);
        }
        chatData = tmpArray;
        that.setData({
          chatData:that.concat(chatData)
        });
        that.setData({
          chrildId:"t"+lastMessage.timeline
        });
        wx.hideLoading();
		  }else{
      this.getLastOnePageRecord(lastMessage.timeline,function(res){
        if(res.error_no == '0'){
          var d = res.data;
          if(d.length == 0){
            var i = 0;
            var tmpArray = [];
            for(; i <chatData.length ; i++){
              tmpArray.push(chatData[i]);
            }
            chatData = tmpArray;
            that.setData({
              chatData:that.concat(chatData)
            });
            that.setData({
              chrildId:"t"+lastMessage.timeline
            });
            nomoredata = true;
          }else{
            var messageListFS = [];
            for(var j = 0 ; j< d.length; j++){ // 跟某一个人的聊天记录
              var oneMessage = d[j];
              var direction = "";
              if(oneMessage["fromid"] != pageData["id"]){
                direction = 'send';
              }else {
                direction =  'receive';
              }
              messageListFS.push({
                direction:direction,
                content:oneMessage['content'],
                contenttype:oneMessage['contenttype'],
                timeline:oneMessage["timeline"]
              });
            }
            chatData = messageListFS.concat(chatData);
            wx.setStorageSync("messagelist"+pageData["id"],chatData);
            var i = 0;
            var tmpArray = [];
            if(pageIndex * pageSize < chatData.length ){
              i = chatData.length - pageIndex * pageSize ;
            }
            for(; i <chatData.length ; i++){
              tmpArray.push(chatData[i]);
            }
            chatData = tmpArray;
            that.setData({
              chatData:that.concat(chatData)
            });
            that.setData({
              chrildId:"t"+lastMessage.timeline
            });
          }
        }
      });

    }
  }
	},getLastOnePageRecord(timeline,callback){
    var rd = {
      funcNo:"1002",
      mineid:app.globalData.customerData.id,
      opponentid:pageData["id"],
      timeline:timeline,
      direction:"before"
    };
    network.postRequest(rd).then(function(res){
      callback(res);
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
		this.setData({
      chrildId: 'liubaiBottom'
		})
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
		/* var that = this;
		var pull = {
			funcNo:"1002",
			mineid:app.globalData.managerData.id,
			opponentid:pageData.id
		}
		if(chatData.length != 0){
			pull["timeline"] =  chatData[0].timeline;
			pull["direction"] = 'before';
		}
		network.postRequest(pull).then(function(r){
			if(r.error_no == '0'){
				 var theList =r.data;
				 var nowList = wx.getStorageSync("messageList"+pageData["id"]);
				 for(var i = 0 ; i<theList.length ; i++){
				 	var one =  theList[i];
				 	nowList.unshift(one);
				 }
				 wx.setStorageSync("messageList"+pageData["id"],nowList);
				 theList =  that.concat(theList);
				 for(var i = 0 ; i<theList.length ; i++){
					 var one =  theList[i];
					 chatData.unshift(one);
				 }
				 that.setData({
					 chatData:chatData
				 });
				 
			}
			wx.stopPullDownRefresh();
		}) */
		
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
  //左上角返回
  backTo() {
    wx.navigateBack({
      delta: 1
    })
  },
  //input焦点获取
  inputOn(event) {
    if (!event.detail.height) event.detail.height = 0;
    var that = this
    this.setData({ operateShow:false,mengShow:false})
    that.data.inputdo = true
    if (event.detail.value.length > 0) {
      this.setData({ inputTrue: true })
    }
    that.extendOut()
    wx.getSystemInfo({
      success: function (res) {
        console.log('event.detail.height', event.detail.height)
        let scrollRpx = (that.data.sh-(event.detail.height)/(res.windowWidth/750));
        console.log('scrollRpx', scrollRpx)
        that.setData({
          inputBottom: event.detail.height,
          scrollBottom: scrollRpx
        })
      }
    })
    that.setData({
      // chrildId: that.data.chrildId
      chrildId: 'liubaiBottom'
    })
  },
  //input焦点失去
  inputOut(e) {
    var that = this
    if (that.data.inputdo) {
			that.data.inputdo = false;
      var apple = app.globalData.AppleX
      if (apple) {
        that.setData({
          inputBottom: '50r',
        })
      } else {
        that.setData({
          inputBottom: 0,
        })
      } 
      that.setData({
        scrollBottom: that.data.sh,
        extendHid: false
      })
    }
		that.setData({
      chrildId: 'liubaiBottom'
		})
  },
  //textarea输入
  inputBind(e) {
		console.log(e);
		if(!this.data.inputdo)return ;
   this.data.inputText= e.detail.value;
    if (this.data.inputText.length) {
      this.setData({
        inputTrue: true
      })
    } else {
      this.setData({
        inputTrue: false
      })
    }
  },
  //extend点击
  extendBind() {
    var that = this
    that.data.inputdo = false
    if (!that.data.extendHid) {
      let scbHeight = util.systemHeight() - util.systemTop() - 100 - 330
      that.setData({
        inputBottom: '280r',
        scrollBottom: scbHeight,
        extendHid: true,
        mengShow:true
      })
    } else {
      that.extendOut()
    }
    this.setData({
      chrildId: 'liubaiBottom',
      operateShow:false
    })
  },
  //回缩extend
  extendOut() {
    var that = this
    if (that.data.extendHid) {
      var apple = app.globalData.AppleX
      if (apple) {
        that.setData({
          inputBottom: '50r',
        })
      } else {
        that.setData({
          inputBottom: 0,
        })
      } 
      if (that.data.extendHid){
        that.setData({ extendHid: false,})
      }
      that.setData({
        scrollBottom: that.data.sh,
        mengShow:false
      })
    }
  },
  inputconfirm(e) {
    util.getFormIdB(e)
    if(!this.data.inputText) return;
    this.send(this.data.inputText, "text");
  },
	menuClick(e){
		var that = this;
		var key = e.target.id;
		if(key == 'img'){
			wx.chooseImage({
				success (res) {
					const tempFilePaths = res.tempFilePaths
					wx.uploadFile({
						url: config.uploadImg, //仅为示例，非真实的接口地址
						filePath: tempFilePaths[0],
						name: 'chat',
						success (res){
							const data = JSON.parse(res.data);
							var path = data.path;
							that.send(path,"img");
						}
					})
				},
				count:1,
				sizeType:["compressed"]
			})
		}
	},resend(e){
		var dataset = e.currentTarget.dataset;
		var timeline = dataset.timeline;
		var content = dataset.content;
		var contenttype = dataset.contenttype;
		var datalist = this.data.chatData;
		var i = 0 ;
		for(; i< datalist.length; i++){
			var one = datalist[i] ;
			if(one.timeline  == timeline ){
				break;
			}
		}
		datalist.splice(i,1);
		datalist = wx.getStorageSync("messagelist"+pageData.id);
		i = 0;
		for(; i< datalist.length; i++){
			var one = datalist[i] ;
			if(one.timeline  == timeline ){
				break;
			}
		}
		datalist.splice(i,1);
		wx.setStorageSync("messagelist"+pageData.id,datalist);
		this.send(content,contenttype);
	},
	send(content,contenttype){
		var that = this;
		var fromid = app.globalData.customerData.id;
		var toid  = pageData.id+"";
		var portrait = app.globalData.customerData.portraitpath;
		var nickname = app.globalData.customerData.nickname;
		message.sendMessage(fromid,toid,content,contenttype,function(socketIsOpen,timeline){
			var onemessge =  {
				direction:"send",
				content:content,
				contenttype:contenttype,
				timeline:timeline,
				senderr:!socketIsOpen
			}
			that.data.chatData.push(onemessge);  //更新展示
			
			that.setData({
				chatData:that.concat(that.data.chatData),
				inputText:""
			});
			that.setData({
				// chrildId:"id"+timeline
        chrildId: 'liubaiBottom',
        inputTrue: false
			})
		}); // 发送消息
	},
	concat(chatData){
		// var newChatData = [];
		for(var i = 0 ; i < chatData.length ; i ++){
      var one = chatData[i];
      if(one.contenttype == 'img'){
        one["imgContent"] = one["content"];
      }else if(one.contenttype == 'article'){
				if (typeof  one["content"] ==  "string")
					one["content"] = JSON.parse(one["content"]);
				var scratchTime = util.getShowTimeStr(one["content"].scratchtime);
				var pathDate = util.getPathDateStr(one["content"].scratchtime);
				var pathid = one["content"].pathid;
				var titleimg= util.getArticleTitleImg(one.content);
				one["content"].titleimg = titleimg;
				one["content"].showtime = scratchTime;
			}else if(one.contenttype == 'product'){
				if (typeof  one["content"] ==  "string")
					one["content"] = JSON.parse(one["content"]);
			}
			one.selfProtrait = this.data.selfPortrait;
			var headImgUrl =  this.data.targetPortrait;
			if(headImgUrl !=null && headImgUrl.indexOf("wills")!=-1)
				headImgUrl = headImgUrl.substr(0,headImgUrl.length - 4)+"s.jpg";
			one.targetPortrait = headImgUrl;
			// newChatData.push(one);
		}
		return chatData;
	},
	clearunread(){
		app.globalData.clearredpoint = true;
		// var message = wx.getStorageSync("MESSAGE");
		// if(!message)return ;
		// var cusData =  message[id];
		// if(!cusData)  return ;
		// cusData.unread = 0;
		// wx.setStorageSync("MESSAGE",message);
	},
  //图片放大展示
  previewImagebind(e){
    let img = e.currentTarget.dataset.imgPath
    wx.previewImage({
      urls: [img],
    })
  },
  //长按复制
  longTap(e){
    let content = e.currentTarget.dataset.content
    wx.setClipboardData({
      data: content
    })
  },
  //心=>操作
  bindOperate(){
    if (this.data.operateShow){
      this.setData({
        operateShow:false,
        mengShow:false,
      })
    }else{
      var apple = app.globalData.AppleX
      if (apple) {
        this.setData({
          mBottom: '150',
        })
      } else {
        this.setData({
          mBottom: '100',
        })
      }
      this.setData({
        operateShow:true,
        mengShow:true
      })
    }
  },
  //蒙层点击归位
  mengBind(){
    this.extendOut()
    this.setData({
      operateShow:false,
      extendHid:false,
    })
  },
  //打电话
  bindCall(e){
    util.getFormIdB(e)
    var that = this
    var phoneNum = this.data.phone
    wx.makePhoneCall({
      phoneNumber: phoneNum,
      success(res){
        that.setData({
          mengShow:false,
          operateShow:false
        })
      }
    })
  },
  //拒收通知
  rejection(e){
    var that = this
    util.getFormIdB(e)
    wx.showModal({
      content: '是否拒收此顾问的消息',
      cancelColor: '#b0b3ba',
      confirmText: '确认',
      confirmColor: '#ff8a01',
      success:function(res){
        that.setData({
          mengShow: false,
          operateShow: false
        })
        //TODO
      }
    })
  },
  //关注公众号
  followGzh(){
    this.setData({
      mengShow: false,
      operateShow: false
    })
  },
  textareaShow(){
    this.setData({
      tareaShow:true,
    })
  }
})
