// pages/clienta/realchat/realchat.js
var util = require('../../../utils/util.js')
var message = require('../../../utils/message.js');
var config = require("../../../config.js");
var network = require('../../../utils/network.js')
var app = getApp();
var pageData =null;
var chatData = null;
var pageSize = 20;
var pageIndex =1;
var nomoredata = false;
var nextCourseObject = null;
var inCourse = null;
var that = null;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    tareaShow:false,
    mengShow: false,
		inputText:"",
		chatData:[],
    target:'',
    inputHeigth: '0',
    scrollHeigth: '',
    chrildId: '',
    extendHid: false,
    inputdo: true,
    extenddo: true,
    collectShow:false,
    selfPortrait:'',
    sh:'',
		delta:1,
    lb:'',
    collectImg:'https://www.willsfintech.cn:9004/staticFile/image/checkout.png',
    //目标头像
    targetPortrait: '',
    //底部加号数据
    inputExtend: [
      {
        text: '图片',
				key:"img",
        img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAACtElEQVRoge3ZzWtVRxiA8Z8nAYtoSEG6rG7Eggu7cBFaUGmLG1cKhdqFoqsUCxZd2JJVFILdqAQLin9AS6FCaZtCSJWu6kY3SmrbINTQTcWPmniF1hgXc1OjJvfOzLnJuYE8cBbDeWfmfe6dc+bjrBj4/CRswAm8hy7tzQOM4FP80YmNuIzuKrNKoAu78Q56CgxYOsnPphsDhTBslio7Cu0/5huxuqg6g7IsC1RNjsBN9GIdVuL1enmshXlFkyowhM04h1v4F+P18pv4rqXZRZAicAPvY3Ke+w/xAX4tm1QKKQLHUWsSU8Ox/HTSSRGIHR7f5ySSS6zARP2KYVJYcJVhGndiAmMF1uCVyNiV9fhcfsQbWIst+KtRcMoQil0zvYsVCe3OZhA78Xu9fAUHGlVIEehDR5OYjnpcDt/gE2H4zGa4UaUUgR6cMb9EgdN4K6HNGUax38vJNyV1IuvFRWz3TKQD23AJH6cmgH+EDUrsS+I5OjPqbBWSreFvvIZVOZ0Lv/g+/JZZP0tghlVYX6I+YXL8tkwDVa5Gh9BftpGqBMbwIZ6UbagKgRp2CQ9vaRZbYFp4XV5vVYOtEPhKeH3+HBF7El+3oM//KSvwJfbgC2EJcapB7AiOluzvJcoIjOPgrPIUDuMjPH4h9k/hoZ0q0d+c5ArMjOV7c9w7KyzIZmbWmjDT3s7sqyG5AoP4qcH9Ybwt7JsP4mpmP03JmYlH8VlE3DVsMv8euiWk/gP/YS8eRcYvaPKkC/QLm4y2IUXgF+EjSFsRKzApDJ2WvwbLEitwREVHh82IEfgB5xc6kVxiBA7J2KsuFjECc822bUOMwCm8utCJ5BIjsBd3hWFU1VVKoK1ZFqiaQvmj8CqZLISt3lJluBBOk+9XnUkG99FXCB/venBB5gHrIjMh5NqDG08BGv6Vyx2k0TAAAAAASUVORK5CYII='
      }, {
        text: '常用语',
				key:"often",
        img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAABXUlEQVRoge3asUrDUBSH8Z/BUcTBQXQWV8fOog7ipI/gSwjuRRefQF/BxUFQH8CxY8UHcKkgrbsObUVKm1iT2yT2fnCH8oec88HNyRm60Ly4hE2cYxfL6kEXjzjFyyK28ISVMrv6A8s4wg4aCZrqJ/GTFTQT/etUd/YT9Xkn0lhKyu6gKKJI1YgiVSNL5A7rg3OXki8EPpPq/1rkBK+Dc5KSh2ZS/W+muVqf+XrJTWr9LJErrGED1yl5aCbV/2Yx4wEH0q9OVj4z5mZq1YYoUjWiSNWIK8pIHpq4ogyJK8qsmZupVRuiSNWIIlUjrigjeWjiijIkriizZm6mVm2IIlXjX4l0y26iAD4S/b9B1J37BGd4L7uTHLzjLEEbDdygV2pL09HT77mB9vDL/ozjggqs4gHbE/IW9tApqB7CTK2OfqOtMVkQCcKN33EywSTIXhrzMJS5Hfw+xFuoYl8SElPLk24S4QAAAABJRU5ErkJggg=='
      }, {
        text: '资讯',
        key:"newmsg",
        img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAABZUlEQVRoge3XMWsUQRgG4OeWYCXhSKWXOuQvXB2OFJb2VulTipD+SFIEtI6VfdqA+AP8CYI/IJVRor0Wd8gVuXP2dvbmO5kHttqZ5XuZW97bwfTiSqIDnGOC3dRNPXrAJ7zB153ETYf4jGFfU61hFy9xhHGTuGkqVohFQ0xTg0z6nCSD49QgEd6JVZ6mBgmvBommBpm7xQiDf1yj+dp19q56RrYgJ7hLWHc3X7vO3lXP+KtrkLaDdPV72Y2S78g1nrVYv4/3y26m/tfqwwt5TgmzE3mCt/hmdnSL19bYwSVOSw/SVYNXpYfIocFe6SFyqM2eQahm7yJUsz9vsbZN+S3TW7OntvNjrRyq2bu0c/Zm/y/UINHUINFs6ps9xxXimz2HXpt904o3ew5hmz2rbftpLVWDRFODRFODRFODRFODRFODBPOrwX3pKTL42OBD6Sk6+oGzBq/xDt/LztPaT9xgjC9/AE2AOmrkqXL0AAAAAElFTkSuQmCC'
      }, {
        text: '产品',
				key:"product",
        img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAABfElEQVRoge3YsU7cQBRG4Q9riZaGjoIm0oYuXZqIMj3wABR5jZiIHkGTguUJoogSKRJpUOgoqJDS7WOsAj0Uk8DiGGnZHcdjNKcbe+z7H89cW/LC3sEXNWzgtO5EAmziR/VgUTOxj8PG48zOUMj4iDqRT3jTeJzZGaCsHqyKDPD5v8SZjx0h6z1VkUM1y5Yg/2z/SZENoZG6wqaQGQ8ifaGJusZ94/8VKVX2XEcYCP2imBx0lBKDQnca/Cn6GPaw1XaSGNR9EDvJixHp4TbSvRZmvC5K/RezIlkkNbJIamSR1MgiqZFFUiOLpEYWSY0sMiVLOMJ3rDRZqNfgvd/hG97+Gf/CR5w3UayJFSmEP/qXHiRgFWfYx2ITRWPyWnjiB3j1RL0SF1iLWTimyLawfT5MMfc9roStFoWYPXL8zPnL+BqreH79pkYWSY0skhpZJDWySGoU+N12iAjcFPjZdooInBXYxbjtJHMwxm6BEdZxgutWIz2PayHzOkZ3ojoqsugPrI4AAAAASUVORK5CYII='
      },
      
    ],
    //引导数据
    guidance1:false,//如何给潜在客户发消息
    guidance2:false,//3天会员
    guidanceTxt:'',//会员弹框文案
    donetitle:"",
    donedesc:"",
    donebutton:"",
    donerate:"",
    vipView:false,//开通会员
    freeText:"免费试用",
    showIm:false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    that = this;
    wx.hideShareMenu();
    pageIndex = 1;
    nomoredata = false;
		//返回。
		var pagestack = getCurrentPages();
		var delta = pagestack.length-1;
		this.setData({
			delta:delta
		});
		var managerHead = app.globalData.managerData.portrait_path;
		if(managerHead !=null && managerHead.indexOf("wills")!=-1)
      this.data.selfPortrait = managerHead.substr(0,managerHead.length - 4)+"s.jpg";
    else{
      this.data.selfPortrait = managerHead;
    }
		// app.globalData.thispage = this;
		pageData =  wx.getStorageSync("torealchatpage");
		// console.log(pageData);
    
		this.setData({
      target:pageData["name"],
      targetPortrait:pageData.portraitpath
		});
		var userId = pageData["id"];
		
		this.clearunread(userId); // 清楚 unread 计数
		that.rerender();
		app.globalData.renderPage = this;
    let ch = util.systemTop() + 100
    that.data.sh = util.systemHeight()-ch-100
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
      cH: ch,
      scrollBottom: that.data.sh,
    })
    inCourse = null;
    wx.getStorage({
			key:"course",
			success:function(r){
				var ad = r.data;
				if(!ad){
					return ;
				}
				if(!ad[2]){ 
          inCourse = true;
					that.course2Text3(true);
				}
			}
    })
    
    var rd = {
      funcNo:"9996",
      creator:userId
    }
    network.postRequest(rd).then(function(r){
      if(r.error_no == 0){
        var countText  ="可推送"+r.count+"次至客户微信";
        that.setData({
          countText:countText
        });
      }
    });
  },course2Text3(flag){
    if(flag){
      //TODO show 点击发送消息，如何给潜在客户发消息。
      this.setData({
        guidance1:true
      });
    }else{// hide
      this.setData({
        guidance1:false
      });
    }
  },
	rerender(){
		var that = this;
		chatData = wx.getStorageSync("messageList"+pageData["id"]);  //更新展示
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
			that.setData({
				chatData:that.concat(chatData)
			});
			that.setData({
				// chrildId:"id"+lastTimeline
        chrildId: 'liubaiBottom'
			});
		}
	},toarticleview(e){
    var index = e.currentTarget.dataset.index;
    var article = this.data.chatData[index].content;
    wx.setStorageSync("toviewpagedata",article);
    wx.navigateTo({
      url:"../view/view"
    });
  },toproductview(e){
    var index = e.currentTarget.dataset.index;
    var product = this.data.chatData[index].content;
    wx.setStorageSync("toproductreadpage",{data:product});
    wx.navigateTo({
      url:"../jobs/productread/productread"
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
		var that = this;
    util.backexecute(function(param){
      var newTarget = param.target;
      that.setData({
        target:newTarget
      });
    },"updateTarget");
    util.backexecute(res=>{
      if (!res) return;
      // this.send(res, "text");
      this.setData({
        inputText:res,
        inputTrue:true,
      })
    },"common")
    util.backexecute(res => {
      console.log('newmsg:', res)
      if (!res) return;
      // res = JSON.stringify(res);
      this.send(res, "article"); // product
    }, "newmsg")
    util.backexecute(res => {
      console.log('product:', res)
      if (!res) return;
      if (res.imgurl == "../../../../image/img/column-img-add.png"){
        res.imgurl = '../../../image/img/column-img-add.png';
      }
      this.send(res, "product"); // product
    }, "product")
  },
	tocusdatapage(){
		var tocusdatapage = {
			id:pageData["id"]
		}
		wx.setStorageSync("tocusdatapage",tocusdatapage);
		wx.navigateTo({
			url:"../cusdata/cusdata"
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
		wx.removeStorageSync("torealchatpage");
  },
	
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  },scrolltoupper(){
    if(nomoredata)return ;
		if(this.data.collectShow)return ;
		pageIndex++;
		console.log("scrolltoupper"+pageIndex);
		var that = this;
		chatData = wx.getStorageSync("messageList"+pageData["id"]);  //更新展示
		if(chatData != ''){
			var i = 0;
      var tmpArray = [];
      
      var lastMessage =  this.data.chatData[0];
			if(pageIndex * pageSize < (chatData.length + pageSize)){
        wx.showLoading({
          title:"loading",
          mask:true
        });
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
              wx.setStorageSync("messageList"+pageData["id"],chatData);
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
      mineid:app.globalData.managerData.id,
      opponentid:pageData["id"],
      timeline:timeline,
      direction:"before"
    };
    network.postRequest(rd).then(function(res){
      callback(res);
    });
  }
	,
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
    that.data.inputdo = true
    that.data.extenddo = true
    if (event.detail.value.length > 0) {
      this.setData({ inputTrue: true })
    }
    that.extendOut()
    wx.getSystemInfo({
      success: function (res) {
        let scrollRpx = (that.data.sh - (event.detail.height / (res.windowWidth / 750)));
        that.setData({
          inputBottom: event.detail.height,
          scrollBottom: scrollRpx,
        })
      }
    })
    this.setData({ chrildId: 'liubaiBottom'})
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
        extendHid: false,
      })
    }
  },
  //textarea输入
  inputBind(e){
		console.log(e);
		// var nl = String.fromCharCode(10);
		var thevalue = e.detail.value;
		if(e.detail.keycode == 10){
			thevalue = thevalue.substr(0,thevalue.length-1);
			thevalue +='\n';
		}
		if(!this.data.inputdo )return ;
		this.data.inputText = e.detail.value;
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
	inputconfirm(e){
    if(inCourse){
      this.course2Text3(false);
      this.course2Done(true);  
    }
		util.getFormId(e)
    if(!this.data.inputText) return;
    this.send(this.data.inputText,"text");
	},course2Done(flag){
    if(flag){
      wx.getStorage({ // 更新状态
        key:"course",
        success:function(r){
          var ad = r.data;
          ad[2] = true;
          wx.setStorageSync("course",ad);
          nextCourseObject = util.nextCourseText(ad);
          that.setData({
            guidance2:true,
            donetitle: nextCourseObject.title,
            donedesc:nextCourseObject.desc,
            donebutton: nextCourseObject.button,
            donerate : nextCourseObject.rate
          });
        }
      })
    }else{ // hide
      that.setData({guidance2:false});
    }
  },closeDone(){
    inCourse = false;
    that.setData({guidance2:false});
  },toNextButton(e){
    inCourse = false;
    util.getFormId(e)
    util.toNextCourse(nextCourseObject);
  },
  //extend点击
  extendBind() {
    var that = this
    that.data.inputdo = false
    if (that.data.extenddo) {
      let scbHeight = util.systemHeight() - util.systemTop() - 100 -330
      that.setData({
        inputBottom: '280r',
        scrollBottom: scbHeight,
        extendHid: true,
        mengShow:true,
      })
      that.data.extenddo = false
    } else {
      that.extendOut()
      that.data.extenddo = true
    }
    this.setData({
      tareaShow:true,
      chrildId: 'liubaiBottom'
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
      that.setData({
        scrollBottom: that.data.sh,
        extendHid: false,
        mengShow: false,
      })
    }
  },
  //收录
  collectBind(){
    
    var md = app.globalData.managerData;
		var now = new Date().getTime();
		if(!md.expire || now > md.expire){// 过期，或者没有会员
			this.setData({
        guidanceTxt:'即刻收录经典咨询对话，服务案例更可信，重复问题不再烦。',
        vipView:true
			});
			if(md.state && md.state>'0'){
				this.setData({
					freeText:"已试用"
				});
			}
			return;
		}
    
		for(var i = 0 ; i<this.data.chatData.length; i++){
			var one = this.data.chatData[i];
			one.collectionFlag = true;
// 			if(one.contenttype == 'text')
// 				one.collectionFlag = this.data.collectionFlag;
		}
		
    this.setData({
      collectShow: true,
			chatData:this.data.chatData
    })
  },
  //收录项选择
  collectBack(e){
		this.clearCheck();
    this.setData({
      collectShow:false,
			chatData:this.data.chatData
    })
  },
  clearCheck(){
		for(var i = 0 ; i<this.data.chatData.length; i++){
			var one = this.data.chatData[i];
			delete one.check;
			one.collectionFlag = false;
		}
	},
  collectSave(e){
		var selectList = [];
		for(var i = 0 ; i<this.data.chatData.length; i++){
			var one = this.data.chatData[i];
			if(one.check){
				selectList.push(one);
			}
		}
		console.log(selectList);
		if(selectList.length != 0){ // 不为空，发请求。
			var title = selectList[0].content;
			if(title.length >30){
				title = title.substr(0,30);
			}
			var richJson = this.getNodeInfo(selectList);
			richJson = JSON.stringify(richJson);
			var rd = {
				funcNo:"1036",
				title:title,
				articleContent:richJson,
				creator:app.globalData.managerData.id,
				collection:"collection"
			}
			network.postRequest(rd).then(function(r){
				if(r.error_no == '0'){
					wx.showToast({
						title:"已存入资讯",
						icon:"none"
					});
				}
			});
		}
		this.clearCheck();
    this.setData({
      collectShow: false,
			chatData:this.data.chatData
    })
  }, getNodeInfo(list) {
			var cl =[
        {
          name:'div',
          attrs: {
            style: 'background-color:#f0f1f6;width:94%;margin:3%;border-radius:8px;box-sizing:border-box;padding:10px 0'
          },
          children:[]
        }
      ];
			list.forEach(item => {
				var obj = null;
      //判断文本
				if (item.contenttype == 'text') {
        //判断是客户消息还是顾问消息
        if (item.direction == 'send') {
          //组json
          obj = {
            name: 'div',
            attrs: {
              class: 'send-box'
            },
            children: [
              {
                type: 'node',
                name: 'img',
                attrs: {
                  class: 'send-img-box',
                  src: item.selfProtrait
                }
              }, 
              {
                type: 'node',
                name: 'div',
                attrs: {
                  class: 'send-content-box',
                  style:'background-color:#7daafc;color:#fff'
                },
                children: [{
                  type: 'text',
                  text: item.content
                }]
              }
            ]
          }
        } else if (item.direction == 'receive') {
          //组json
          obj = {
            name: 'div',
            attrs: {
              class: 'receive-box'
            },
            children: [
              {
                type: 'node',
                name: 'div',
                attrs: {
                  class: 'send-content-box',
                  style:'margin-right:20px;'
                },
                children: [{
                  type: 'text',
                  text: item.content
                }]
              }
            ]
          }
        }
				if(obj!=null)
          cl[0].children.push(obj)
      }
    })
    console.log(cl)
		return cl;
  },
	menuClick(e){
		var that = this;
    var key = e.target.id;
    var md = app.globalData.managerData;
    var now = new Date().getTime();
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
    } else if (key == 'often'){
      
      
      if(!md.expire || now > md.expire){// 过期，或者没有会员
        this.setData({
          vipView:true
        });
        if(md.state && md.state>'0'){
          this.setData({
            freeText:"已试用"
          });
        }
        return;
      }

      wx.navigateTo({
        url: '../jobs/common/common?key=often',
      })
    } else if (key == 'newmsg') {
      if(!md.expire || now > md.expire){// 过期，或者没有会员
        this.setData({
          guidanceTxt:'常用话术一键即达，营销服务标准化',
          vipView:true,
        })
      }else{
        wx.navigateTo({
          url: '../jobs/newmsg/newmsg?key=often',
        })
      }
    } else if (key == 'product') {
      wx.navigateTo({
        url: '../jobs/product/product?key=often',
      })
    }
	},resend(e){
		// console.log(e);
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
		datalist = wx.getStorageSync("messageList"+pageData.id);
		i = 0;
		for(; i< datalist.length; i++){
			var one = datalist[i] ;
			if(one.timeline  == timeline ){
				break;
			}
		}
		datalist.splice(i,1);
		wx.setStorageSync("messageList"+pageData.id,datalist);
			
		this.send(content,contenttype);
	},
	send(content,contenttype){
		var that = this;
		var fromid = app.globalData.managerData.id;
		var toid  = pageData.id+"";
		message.sendMessage(fromid,toid,content,contenttype,function(socketIsOpen,timeline){ // 发送完成之后
			// var timeline = new Date().getTime();
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
        inputTrue:false
			})
		}); // 发送消息
	},
	concat(chatData){
		// var newChatData = [];
		for(var i = 0 ; i < chatData.length ; i ++){
			var one = chatData[i];
			one["imgContent"] = one["content"];
			one.selfProtrait = this.data.selfPortrait;
			one.targetPortrait = this.data.targetPortrait;
			
			if(one.contenttype == 'article'){
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
		}
		return chatData;
	},
	clearunread(id){
		var message = wx.getStorageSync("MESSAGE");
		if(!message)return ;
		var cusData =  message[id];
		if(!cusData)  return ;
		cusData.unread = 0;
		wx.setStorageSync("MESSAGE",message);
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
  },getPathDateStr(time){
		var theDate =  new Date(time);
		var fullyear = theDate.getFullYear();
		var month = theDate.getMonth()+1;
		month = month > 9 ? month : ("0"+month)   ;
		var day =  theDate.getDate();
		day = day >9 ? day :('0'+day);
		
		var str = fullyear+""+month+""+day;
		return str;
	}
	,getShowTimeStr(time){
		var theDate =  new Date(time);
		var fullyear = theDate.getFullYear();
		var month = theDate.getMonth()+1;
		month = month > 9 ? month : ("0"+month)   ;
		var day =  theDate.getDate();
		day = day >9 ? day :('0'+day);
		
		var hour = theDate.getHours();
		hour = hour>9 ? hour: ('0'+hour);
		
		var minute = theDate.getMinutes();
		minute =  minute> 9  ? minute: "0"+minute;
		
		var finalStr = fullyear+"/"+month+"/"+day+" "+hour+":"+minute;
		return finalStr;
	},
	check(e){
    console.log(this.data.chatData);
    var that =this
		var index = e.currentTarget.dataset.index;
    var one = that.data.chatData[index];
    console.log(one)
		one.check =!one.check;
    that.setData({
      chatData: that.data.chatData
		});
	},toVipPage(e){
    util.getFormId(e)
		wx.navigateTo({
			url:"/pages/member/member"
		});
	},closeVipView(){
		that.setData({vipView:false});
	},freeMonth(e){
    util.getFormId(e)
		var freeText =  e.currentTarget.dataset.freetext;
		if(freeText == '已试用') return;
		var md = app.globalData.managerData;
		util.freeMonth(md.id,function(expire){
			that.setData({vipView:false});
			md.expire = expire;
			md.state = "1";
			// that.groupTo();
		});
	},textareaShow(){
    this.setData({
      tareaShow:true,
      tareaFocus:true
    })
  },
  pushBind(e){
    util.getFormId(e);
    var userId = pageData["id"];
    var ml = wx.getStorageSync("messageList"+userId);
    if(!!ml){
      var one = ml[ml.length-1];
      if(one.direction == 'receive')return;
      var now = new Date().getTime();
      if(now >(one.timeline + 10 * 60 *1000)){
        return;
      }
      
    }else{
      return;
    }
    wx.showModal({
      cancelColor: '#333301',
      confirmText: '推送',
      confirmColor: '#ffa019',
      content: '确认推送至客户微信？',
      success: (result) => {
        if(result.confirm){
          message.immediately(app.globalData.managerData.id,userId);
        }
      },
    });
  }
})
