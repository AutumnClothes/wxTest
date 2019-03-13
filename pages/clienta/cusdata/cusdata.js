// pages/clienta/cusdata/cusdata.js
var util = require('../../../utils/util.js')
var network = require('../../../utils/network.js')
var app = getApp();
var cusid = null;
var toOtherPage = false;
var record = null;
var that = null;
var cusBehaviorList = [];
var pageSize = 20;
var pageIndex =1;
var nomoredata = false;
var tempE = null;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    depositSwitch:false,
		cusData:{},
		curr:0,
    current:0,
    tagSelect:false,
    topButton:[
      {
        title: '发消息',
        icon: '../../../image/img/news.png',
      }, {
        title: '打电话',
        icon: '../../../image/img/telephone.png'
      }, {
        title: '详细资料',
        icon: '../../../image/img/details.png'
      },
    ],
    dynamicList:[
    ],
    //标签
    tagcolor: ['#fba537', '#f8669c', '#72c976', '#71a8f4', '#b577f8'],
		taglist:[],
		//引导相关
		guidance1:false,//开通会员
		vipView:false,//开通会员
		freeText:"免费试用"
  },iknow(){
		var guidanceonceData =  wx.getStorageSync("guidanceonceData");
		if(guidanceonceData && guidanceonceData["cusd"]){
			guidanceonceData["cusd"] = false;
			wx.setStorage({
				key:"guidanceonceData",
				data:guidanceonceData
			})
			this.setData({
				guidance:false
			});
		}
	},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		wx.hideShareMenu();
		that = this;
		tempE = null;
		cusBehaviorList = [];
		nomoredata = false;
		pageIndex = 1;
		
    let h = util.systemTop() + 100
    let st = h + 416
    let sh = util.systemHeight() - st + 2
    let dh = h+20
    var apple = app.globalData.AppleX;
    if (apple) {
      this.setData({
        bm: 50
      });
    } else {
      this.setData({
        bm: 0
      });
    }
    this.setData({
      cH: h,
      sT:st,
      sH:sh,
      dH:dh
    })
		var pageData = wx.getStorageSync("tocusdatapage");
		cusid = pageData.id;
		
		record = wx.getStorageSync("newCusRecord");
		if(record!=""){ // 进入客户资料，消除 客户列表的潜在客户单一红点。
			var s = record.singleDotList;
			var i = 0;
			var removeFlag = false;
			for( ; i<s.length; i++ ){
				var one = s[i];
				if(one == cusid){
					removeFlag = true;
					break;
				}
			}
			if(removeFlag){
				s.splice(i,1);
				wx.setStorageSync("newCusRecord",record);
				var pagesStack =  getCurrentPages();
				util.setBackexecute(pagesStack.length-1,"updateUserList");
			}
		}
		var queryData = {
			funcNo:'1026',
			cusid:cusid,
			managerid:app.globalData.managerData.id
		};
		network.postRequest(queryData).then(function(res){
			if(res.error_no == '0'){
				that.setData({
					cusData:res.cusInfo[0]
				});
			}
			//--------------标签展示
			var  cusTagList = res.cusTagList;
			var tagList = res.tagList;
			var mapTag = {};
			for(var i = 0 ; i<tagList.length ; i++){
				var one = tagList[i];
				if(!one.tagid){
					mapTag[one.id] ={
						groupid:one.id,
						groupname:one.groupname,
						list:[]
					}
				}
			}
			for(var i = 0 ; i<tagList.length ; i++){
				var one = tagList[i];
				if(!one.tagid){
				}else{
					var selectFalg = false;
					for(var j = 0  ; j<cusTagList.length ; j++){
						var oneTagId = cusTagList[j];
						if(oneTagId == one.tagid){
							selectFalg = true;
							break;
						}
					}
					mapTag[one.id].list.push({
						tagid:one.tagid,
						tagname:one.tagname,
						select:selectFalg
					});
				}
			}
			var showList = [];
			for(var i in mapTag){
				showList.push(mapTag[i]);
			}
      that.tagColor(showList);
		});
		
		// 动态 
		var behaviorList = wx.getStorageSync("behaviorList");
		
		for(var i = 0 ; i < behaviorList.length ; i++){
				var oppo = behaviorList[i];
				if(cusid != oppo.cusid)continue;
				oppo["timestr"] = util.formatTimeLine(oppo["timeline"]);
				oppo["contenttype"] = util.contenttype(oppo.contenttype);
				cusBehaviorList.push(oppo);
		}
		var end = 0;
		if(pageIndex * pageSize < cusBehaviorList.length ){
			end = cusBehaviorList.length - pageIndex * pageSize ;
			nomoredata = false;
		}
		that.dynamicListShow(end);


		wx.getStorage({
			key:"course",
			success:function(r){
				var ad = r.data;
				if(!ad){
					return ;
				}
				if(!ad[2]){
					that.course2Text2(true);
				}else{
					var guidanceonceData =  wx.getStorageSync("guidanceonceData");
					if(guidanceonceData && guidanceonceData["cusd"]){
						that.setData({
							guidance:true
						});
						setTimeout(function(){
							that.iknow();
						},10000);
					}
				}
			}
		})
  },course2Text2(flag){
		if(flag){
			this.setData({
				guidance1:true
			});
		}
	},dynamicListShow(end){
			var showList = [];
			for(var i = cusBehaviorList.length -1 ; i >= end ; i--){ // 反向遍历
				var oppo = cusBehaviorList[i];
				showList.push(oppo);
			}
			that.setData({
				dynamicList:showList
			});
		},scrolltobottom(){
			if(nomoredata)return ;
			pageIndex++;
			console.log("scrolltobottom"+pageIndex);
			if(pageIndex * pageSize < (cusBehaviorList.length + pageSize)){
				wx.showLoading({
          title:"loading",
          mask:true
        });
        var end = cusBehaviorList.length - pageIndex * pageSize ;
        if(end<0)end=0;
        that.dynamicListShow(end);
        wx.hideLoading();
			}else{
				var firstBehavior = cusBehaviorList[0]; //目前展示的， 时间上的最早的一个，列表上的最后一个。
				var paramTimeLine=  firstBehavior["timeline"];
				var moreRD = {
					funcNo:'1013',
					toid:app.globalData.managerData.id,
					timeline:paramTimeLine,
					fromid:cusid
				};
				network.postRequest(moreRD).then(function(r){
					if(r.error_no == '0'){
						var d =r.data;
						if(d.length == 0){
							nomoredata = true;
							var end = 0;
							that.dynamicListShow(end);
						}else{
							var messageListFS = [];
							for(var j = 0 ; j< d.length; j++){ // 跟某一个人的聊天记录
								var oneMessage = d[j];
								var oppo = {
									cusid:oneMessage["fromid"],
									content:oneMessage['content'],
									contenttype:oneMessage['contenttype'],
									timeline:oneMessage["timeline"]
								};
								oppo["timestr"] = util.formatTimeLine(oppo["timeline"]);
								oppo["contenttype"] = util.contenttype(oppo.contenttype);
								messageListFS.push(oppo);
							}
							cusBehaviorList = messageListFS.concat(cusBehaviorList);
							var end = 0;
							that.dynamicListShow(end);
						}
					}
				});
			}
		},
  //打电话
  cusBindCall(e){
    util.getFormId(e)
    let num = e.currentTarget.dataset.phone
		if(num){
			wx.makePhoneCall({
				phoneNumber:num
			})
		}else{
			wx.showToast({
				title:"请添加联系电话",
				icon:"none"
			});
		}
  },
  //发消息和详细资料的跳转
  cusBindto(e){
    util.getFormId(e)
		wx.setStorageSync("toCusDetailPgae",this.data.cusData);
    wx.navigateTo({
      url: '../detailed/detailed',
    })
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
			that.cusBindtoChat(tempE);
		});
	},
	// freeTextfreeTextfreeText
	cusBindtoChat(e){
		var md = app.globalData.managerData;
		var now = new Date().getTime();
		if((!md.expire || now > md.expire) // 过期，或者没有会员
			&& md.state!='2' // 教程没完成
		){
			this.setData({
				vipView:true
			});
			if(md.state && md.state>'0'){
				this.setData({
					freeText:"已试用"
				});
			}
			tempE = e;
			return;
		}

		 // 按钮
		util.getFormId(e);
		var toData = e.currentTarget.dataset
		wx.setStorageSync("torealchatpage",toData);
		wx.navigateTo({
			url: '../realchat/realchat',
		})
	},
  //加入存量用户
  depositBind(e){
    util.getFormId(e)
    let swit= this.data.cusData.newcus
    if (swit == 1){
			this.data.cusData.newcus = 0;
      this.setData({
					cusData:this.data.cusData
      })
    }else{
			this.data.cusData.newcus = 1;
      this.setData({
        cusData:this.data.cusData
      })
    }
		// 发起修改请求
		var md = {
			funcNo:'1027',
			newcus:this.data.cusData.newcus,
			cusid:cusid,
			managerid:app.globalData.managerData.id
		}
		network.postRequest(md).then(function(res){
			if(res.error_no == '0'){
				var pagesStack =  getCurrentPages();
				util.setBackexecute(pagesStack.length-1,"updateUserList");
				wx.removeStorage({
					key:"cusdataMapForInfomation"
				})
				
				if(record!=""){
					var s = record.topDotList;
					var i = 0;
					for( ; i<s.length; i++ ){
						var one = s[i];
						if(one == cusid){
							break;
						}
					}
					s.splice(i,1);
					wx.setStorageSync("newCusRecord",record);
				}
			}
		});
  },
  //tabs标签点击事件
  tabBind(e) {
    util.getFormId(e)
    let id = e.target.dataset.id
    this.setData({
      current: id
    })
  }, 
  //左右滑动
  swiperChange(e) {
    let cId = e.detail.current
    this.setData({
      curr: cId
		})
  },
  //tag点击
  tagBind(e){
    util.getFormId(e)
    let lis = this.data.taglist
    let index = e.currentTarget.dataset.groupindex
    let ind = e.currentTarget.dataset.tagindex;
		var tagid = e.currentTarget.dataset.tagid;
		
    lis[index].list[ind].select = !lis[index].list[ind].select;
		
		
		var rd = null;
		if(lis[index].list[ind].select){ // 增加
			rd = {
				funcNo:"1032",
				tagid:tagid,
				creator:app.globalData.managerData.id,
				cusid:cusid
			}
		}else{// 删除
			rd = {
				funcNo:"1033",
				tagid:tagid,
				cusid:cusid
			}
		}
		network.postRequest(rd).then(function(res){
			if(res.error_no == '0'){
					that.setData({
						taglist:lis
					});
			}
		});
  },
  //从服务器获取到用户tag数据后调用
  tagColor(data){
    let color = this.data.tagcolor
    let list = data
    for (color.length; color.length < list.length;) {
      color = [...color, ...color]
    }
    list.forEach((item, index) => {
      list[index].color = color[index]
    })
    this.setData({
      taglist:list
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
		if(toOtherPage){
			var backToCusdataPgae = wx.getStorageSync("backToCusdataPgae");
			if(backToCusdataPgae){
				this.setData({
					cusData:backToCusdataPgae
				});
			}
			toOtherPage = false;
		}
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
		toOtherPage = true;
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
		wx.removeStorageSync('toCusDetailPgae');
		wx.removeStorageSync('backToCusdataPgae');
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
