// pages/clienta/group.js
var util = require('../../../utils/util.js')
var api = require('../../../utils/api.js')
var config = require("../../../config.js");
var network = require('../../../utils/network.js')
var message = require('../../../utils/message.js')
var pagedata = null;
var theMemberList = null;
var app = getApp();
var pageSize = 13;
var pageIndex =1;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    tareaShow:false,
    mengShow:false,
		inputvalue:"",
    groupname:'',
		delta:1,
    inputHeigth:'0',
    scrollHeigth:'',
    chrildId:'',
    extendHid:false,
    inputdo: true,
    extenddo: true,
    sh:'',
    //小头像组假数据
    groupList:[],
		message:[],
    inputTrue:false,
    inputExtend:[
      {
				id:"img",
        text:'图片',
        img:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAACtElEQVRoge3ZzWtVRxiA8Z8nAYtoSEG6rG7Eggu7cBFaUGmLG1cKhdqFoqsUCxZd2JJVFILdqAQLin9AS6FCaZtCSJWu6kY3SmrbINTQTcWPmniF1hgXc1OjJvfOzLnJuYE8cBbDeWfmfe6dc+bjrBj4/CRswAm8hy7tzQOM4FP80YmNuIzuKrNKoAu78Q56CgxYOsnPphsDhTBslio7Cu0/5huxuqg6g7IsC1RNjsBN9GIdVuL1enmshXlFkyowhM04h1v4F+P18pv4rqXZRZAicAPvY3Ke+w/xAX4tm1QKKQLHUWsSU8Ox/HTSSRGIHR7f5ySSS6zARP2KYVJYcJVhGndiAmMF1uCVyNiV9fhcfsQbWIst+KtRcMoQil0zvYsVCe3OZhA78Xu9fAUHGlVIEehDR5OYjnpcDt/gE2H4zGa4UaUUgR6cMb9EgdN4K6HNGUax38vJNyV1IuvFRWz3TKQD23AJH6cmgH+EDUrsS+I5OjPqbBWSreFvvIZVOZ0Lv/g+/JZZP0tghlVYX6I+YXL8tkwDVa5Gh9BftpGqBMbwIZ6UbagKgRp2CQ9vaRZbYFp4XV5vVYOtEPhKeH3+HBF7El+3oM//KSvwJfbgC2EJcapB7AiOluzvJcoIjOPgrPIUDuMjPH4h9k/hoZ0q0d+c5ArMjOV7c9w7KyzIZmbWmjDT3s7sqyG5AoP4qcH9Ybwt7JsP4mpmP03JmYlH8VlE3DVsMv8euiWk/gP/YS8eRcYvaPKkC/QLm4y2IUXgF+EjSFsRKzApDJ2WvwbLEitwREVHh82IEfgB5xc6kVxiBA7J2KsuFjECc822bUOMwCm8utCJ5BIjsBd3hWFU1VVKoK1ZFqiaQvmj8CqZLISt3lJluBBOk+9XnUkG99FXCB/venBB5gHrIjMh5NqDG08BGv6Vyx2k0TAAAAAASUVORK5CYII='
      }, {
        text: '常用语',
        id: "often",
        img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAABXUlEQVRoge3asUrDUBSH8Z/BUcTBQXQWV8fOog7ipI/gSwjuRRefQF/BxUFQH8CxY8UHcKkgrbsObUVKm1iT2yT2fnCH8oec88HNyRm60Ly4hE2cYxfL6kEXjzjFyyK28ISVMrv6A8s4wg4aCZrqJ/GTFTQT/etUd/YT9Xkn0lhKyu6gKKJI1YgiVSNL5A7rg3OXki8EPpPq/1rkBK+Dc5KSh2ZS/W+muVqf+XrJTWr9LJErrGED1yl5aCbV/2Yx4wEH0q9OVj4z5mZq1YYoUjWiSNWIK8pIHpq4ogyJK8qsmZupVRuiSNWIIlUjrigjeWjiijIkriizZm6mVm2IIlXjX4l0y26iAD4S/b9B1J37BGd4L7uTHLzjLEEbDdygV2pL09HT77mB9vDL/ozjggqs4gHbE/IW9tApqB7CTK2OfqOtMVkQCcKN33EywSTIXhrzMJS5Hfw+xFuoYl8SElPLk24S4QAAAABJRU5ErkJggg=='
      }, {
        text: '资讯',
        id: "newmsg",
        img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAABZUlEQVRoge3XMWsUQRgG4OeWYCXhSKWXOuQvXB2OFJb2VulTipD+SFIEtI6VfdqA+AP8CYI/IJVRor0Wd8gVuXP2dvbmO5kHttqZ5XuZW97bwfTiSqIDnGOC3dRNPXrAJ7zB153ETYf4jGFfU61hFy9xhHGTuGkqVohFQ0xTg0z6nCSD49QgEd6JVZ6mBgmvBommBpm7xQiDf1yj+dp19q56RrYgJ7hLWHc3X7vO3lXP+KtrkLaDdPV72Y2S78g1nrVYv4/3y26m/tfqwwt5TgmzE3mCt/hmdnSL19bYwSVOSw/SVYNXpYfIocFe6SFyqM2eQahm7yJUsz9vsbZN+S3TW7OntvNjrRyq2bu0c/Zm/y/UINHUINFs6ps9xxXimz2HXpt904o3ew5hmz2rbftpLVWDRFODRFODRFODRFODRFODBPOrwX3pKTL42OBD6Sk6+oGzBq/xDt/LztPaT9xgjC9/AE2AOmrkqXL0AAAAAElFTkSuQmCC'
      }, {
        text: '产品',
        id: "product",
        img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAABfElEQVRoge3YsU7cQBRG4Q9riZaGjoIm0oYuXZqIMj3wABR5jZiIHkGTguUJoogSKRJpUOgoqJDS7WOsAj0Uk8DiGGnZHcdjNKcbe+z7H89cW/LC3sEXNWzgtO5EAmziR/VgUTOxj8PG48zOUMj4iDqRT3jTeJzZGaCsHqyKDPD5v8SZjx0h6z1VkUM1y5Yg/2z/SZENoZG6wqaQGQ8ifaGJusZ94/8VKVX2XEcYCP2imBx0lBKDQnca/Cn6GPaw1XaSGNR9EDvJixHp4TbSvRZmvC5K/RezIlkkNbJIamSR1MgiqZFFUiOLpEYWSY0sMiVLOMJ3rDRZqNfgvd/hG97+Gf/CR5w3UayJFSmEP/qXHiRgFWfYx2ITRWPyWnjiB3j1RL0SF1iLWTimyLawfT5MMfc9roStFoWYPXL8zPnL+BqreH79pkYWSY0skhpZJDWySGoU+N12iAjcFPjZdooInBXYxbjtJHMwxm6BEdZxgutWIz2PayHzOkZ3ojoqsugPrI4AAAAASUVORK5CYII='
      },
    ]
  },
	
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
wx.hideShareMenu();
		pageIndex = 1;
		theMemberList = null;
		// 从创建来的群聊 ，返回两层。
		var pagestack =  getCurrentPages();
		if(pagestack.length > 2 ){
			this.setData({
				delta:2
			})
		}
    var apple = app.globalData.AppleX
    if (apple) {
      this.setData({
        inputBottom: '50r',
        bm:'50',
      })
    } else {
      this.setData({
        inputBottom: 0,
        bm:0
      })
    }
    var that = this;
    let ch = util.systemTop()+100
    let mh = ch+88
    this.data.sh = util.systemHeight()-ch-188
    that.setData({
      cH:ch,
      mH:mh,
      scrollBottom: this.data.sh
    })
		pagedata = wx.getStorageSync("togroupchatpage");
		var groupid = pagedata.groupid ;
		var messageList =  wx.getStorageSync("groupMessageList"+groupid);
		for(var i = 0 ; i < messageList.length ; i ++){
      var one = messageList[i];
      if(typeof one.content == 'string' &&(one.contenttype == 'article' || one.contenttype == 'product')){
        one.content = JSON.parse(one.content);
      }
      if(one.contenttype == 'img'){
        one["imgContent"] = one["content"];
      }else if(one.contenttype == 'article'){
        one.imgurl = util.getArticleTitleImg(one.content);
        one.content.timestr = util.getShowTimeStr(one.content.scratchtime);
      }
		}
		var i = 0;
		var tmpArray = [];
		if(pageIndex * pageSize < messageList.length ){
			i = messageList.length - pageIndex * pageSize ;
		}
		for(; i <messageList.length ; i++){
			tmpArray.push(messageList[i]);
		}
		messageList = tmpArray;
		
		that.setData({
			groupname:pagedata.groupname,
			message:messageList
		});
		
		this.setData({
      chrildId:'liubaiBottom'
		});
		
		var groupmemberListData = {
			funcNo:"1005",
			groupchatid:groupid,
			creator:app.globalData.managerData.id
		}
		network.postRequest(groupmemberListData).then(function(res){
			if(res.error_no == '0'){
				var members = res.data;
				if(members!=null){
          theMemberList = members;
					that.setData({
						groupList:members
					});
				}
			}
		});
		// groupchatid
  },scrolltoupper(){
		pageIndex++;
		console.log(pageIndex)
		var that = this;
		var groupid = pagedata.groupid ;
		var messageList =  wx.getStorageSync("groupMessageList"+groupid);
		var i = 0;
		var tmpArray = [];
		if(pageIndex * pageSize < messageList.length ){
			i = messageList.length - pageIndex * pageSize ;
		}
		for(; i <messageList.length ; i++){
			tmpArray.push(messageList[i]);
		}
		messageList = tmpArray;
    
		for(var i = 0 ; i < messageList.length ; i ++){
      var one = messageList[i];
      if (typeof one.content == 'string' && (one.contenttype == 'article' || one.contenttype == 'product')) {
        one.content = JSON.parse(one.content);
      }
      if(one.contenttype == 'img'){
        one["imgContent"] = one["content"];
      }else if(one.contenttype == 'article'){
        one["imgurl"] =util.getArticleTitleImg( one.content);
        one["timestr"] = util.getArticleTitleImg
      }
      
      
		}
		that.setData({
			message:messageList
		});
		
	},toset(){
		var togroupsetpage = {
			groupname:pagedata.groupname,
			groupid:pagedata.groupid,
			theMemberList:theMemberList
		}
		wx.setStorageSync("togroupsetpage",togroupsetpage);
		wx.navigateTo({
			url:"./groupset/groupset"
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
		var that = this;
		util.backexecute(function(param){
			if(param["groupname"]){
					that.setData({
						groupname:param["groupname"]
					});
			}
			if(param["grouplist"]){
				theMemberList = param["grouplist"];
				that.setData({
					groupList:theMemberList
				});
			}
		},"update");
    util.backexecute(res => {
      if (!res) return;
      // this.send(res, "text");
      this.setData({
        inputText:res,
        inputTrue:true,
      })
    }, "common")
    util.backexecute(res => {
      if (!res) return;
      this.send(res, "article"); // product
    }, "newmsg")
    util.backexecute(res => {
      console.log('product:', res)
      if (!res) return;
      this.send(res, "product"); // product
    }, "product")
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

  // /**
  //  * 页面相关事件处理函数--监听用户下拉动作
  //  */
  // onPullDownRefresh: function () {

  // },

  // /**
  //  * 页面上拉触底事件的处理函数
  //  */
  // onReachBottom: function () {

  // },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
		
  },
  //input焦点获取
  inputOn(event){
    if (!event.detail.height) event.detail.height = 0;
    var that = this
    if (event.detail.value.length > 0){
      this.setData({ inputTrue: true})
    }
    that.data.inputdo = true
    that.data.extenddo = true
    that.extendOut()
    wx.getSystemInfo({
      success: function (res) {
        let windowHeight = that.data.sh - (event.detail.height * (750 / res.windowWidth)); 
        
        that.setData({
          inputBottom: event.detail.height,
          scrollBottom: windowHeight
        })
      }
    })
    that.setData({
      // chrildId: that.data.chrildId
      chrildId: 'liubaiBottom'
    })
  },
  //input焦点失去
  inputOut(e){
    var that = this
    if (that.data.inputdo){
      let scaHeight = util.systemHeight()
      let scbHeight = scaHeight - 317;
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
        scrollBottom: scbHeight,
        extendHid: false
      })
      that.setData({
        // chrildId: that.data.chrildId,
        chrildId: 'liubaiBottom'
      })
    }
  },
  //textarea输入
  inputBind(e) {
    this.data.inputText=e.detail.value;
    if (this.data.inputText.length){
      this.setData({
        inputTrue: true
      })
    }else{
      this.setData({
        inputTrue: false
      })
    }
      
  },
  //extend点击
  extendBind(){
    var that = this
    that.data.inputdo = false
    if (that.data.extenddo){
      let scbHeight = util.systemHeight() - util.systemTop() - 100 - 468
      var apple = app.globalData.AppleX
      if (apple) {
        this.setData({
          inputBottom: '330r',
        })
      } else {
        this.setData({
          inputBottom: '280r',
        })
      }
      that.setData({
        scrollBottom: scbHeight,
        extendHid: true,
        mengShow: true,
      })
      that.setData({
        chrildId: 'liubaiBottom'
      })
      that.data.extenddo = false
    }else{
      that.extendOut()
      that.data.extenddo = true
    }
  },
  //回缩extend
  extendOut(){
    var that = this
    if (that.data.extendHid){
      let scbHeight = util.systemHeight()-util.systemTop()-288
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
        scrollBottom: scbHeight,
        extendHid: false,
        mengShow: false,
      })
    }
  },
	menuclick(e){
		var that = this;
		var key = e.currentTarget.dataset.id;
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
    } else if (key == 'often') {
      wx.navigateTo({
        url: '../jobs/common/common?key=often',
      })
    } else if (key == 'newmsg') {
      wx.navigateTo({
        url: '../jobs/newmsg/newmsg?key=often',
      })
    } else if (key == 'product') {
      wx.navigateTo({
        url: '../jobs/product/product?key=often',
      })
    }
	},
	inputconfirm(e){
		if(!this.data.inputText)return;
		this.send(this.data.inputText,"text");
	},send(text,contenttype){
		var that = this;
    that.setData({
      inputTrue:false
    })
		// 1. 发消息 通过 message  2.当前页面数据更新。   
		//fromid,togroupid,name,content,contenttype,members
		message.sendGroupMessage(app.globalData.managerData.id,pagedata.groupid
		,text,contenttype,theMemberList,function(socketIsOpen,timeline){
      var one  ={content:text,contenttype:contenttype,timeline:timeline,senderr:!socketIsOpen};
			
      
      if(typeof one.content == 'string' &&(one.contenttype == 'article' || one.contenttype == 'product')){
        one.content = JSON.parse(one.content);
      }
      if(one.contenttype == 'img'){
        one["imgContent"] = one["content"];
      }else if(one.contenttype == 'article'){
        one.imgurl = util.getArticleTitleImg(one.content);
        one.content.timestr = util.getShowTimeStr(one.content.scratchtime);
      }

      that.data.message.push(one);
			that.setData({
				message:that.data.message
			});
			that.setData({
        chrildId: 'liubaiBottom',
				inputText:""
			})
		});
	},resend(e){
		var dataset = e.currentTarget.dataset;
		var content = dataset.content;
		var timeline = dataset.timeline;
		var list = this.data.message;
		var i = 0 ;
		for(; i< list.length; i++){
			var one = list[i] ;
			if(one.timeline  == timeline ){
				break;
			}
		}
		list.splice(i,1);
		list = wx.getStorageSync("groupMessageList"+ pagedata.groupid);
		i = 0;
		for(; i< list.length; i++){
			var one = list[i] ;
			if(one.timeline  == timeline ){
				break;
			}
		}
		list.splice(i,1);
		wx.setStorageSync("groupMessageList"+ pagedata.groupid,list);
		this.send(content,"text");
	},
  //图片放大展示
  previewImagebind(e) {
    let img = e.currentTarget.dataset.imgPath
    wx.previewImage({
      urls: [img],
    })
  },
  //长按复制
  longTap(e) {
    let content = e.currentTarget.dataset.content
    wx.setClipboardData({
      data: content
    })
  },
  //收录提示
  IncludedBind(){
    wx.showToast({
      title: '群发暂不支持哦',
      icon:'none'
    })
  },
  textareaShow(){
    this.setData({
      tareaShow:true,
    })
  }
})
