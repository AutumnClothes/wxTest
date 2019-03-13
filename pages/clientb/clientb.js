var network = require('../../utils/network.js');
var message = require('../../utils/cusmessage.js');
var util = require('../../utils/util.js')
var app = new getApp();
var managerData = {};
var openidFromCode = null;
var shareoptions = null;
var that = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
		accreditType:null,
    count:0,
    current: 'card',
    taboneKey: true,
    tabtwoKey: true,
    tabthrKey: true,
    tabfourKey: true,
		getUserInfo:"none",
		toSetting:"none",
		getUserCallBack:"",
    strs: '',
    stre: '',
    mLeft: 105,
    mleft:'',
    mTop: 713,
		canvasData: [],
		tryTime:0
  },

  /**
   * 生命周期函数--监听页面加载
	 * 
   */
  onLoad: function (options) {
		wx.hideShareMenu();
		managerData = {};
		wx.hideShareMenu({});
		that = this;
		var managerId = "";
    var apple = app.globalData.AppleX
    if (apple) {
      this.setData({
        bm: 50
      })
    } else {
      this.setData({
        bm: 0
      })
    }
		
		if(options.scene){
			options.sharefrom = options.scene;
		}
		// 三种情况。
		// options['sharefrom'] = '28';
		var fromcardbox = wx.getStorageSync("fromcardbox");
		var frommanager = wx.getStorageSync("frommanager");
		wx.removeStorage({
			key:"fromcardbox"
		})
		wx.removeStorage({
			key:"frommanager"
		})
		if(options['sharefrom']){  // 1.确认身份，注册，建立关系，拉取manager的信息
			shareoptions = options;
			managerId = options['sharefrom'];
			managerData = {id:managerId};
			wx.setStorageSync("watchManagerId",managerData)
			wx.login({
				success: res => {
					var code = res["code"];
					var rdata = {
						funcNo:"1012",
						code:code
					}
					// 请求，确认身份
					network.postRequest(rdata).then(function(r){
						wx.setStorageSync("openidFromCode", r.openid);
						if(r.error_no == '0'){ // 请求成功
							var fgList =r.forceGuidance.split(",");
							for(var i =0 ;i <fgList.length;i++){
								if(fgList[i] == managerId) {
									options["guidance"] = 1;
									break;
								}
							}
							openidFromCode = r.openid;
							if(r["manager"].length >= 1){
									app.globalData["managerData"] = r["manager"][0];
									if(r["customer"].length >= 1 ){
										app.globalData["customerData"] = r["customer"][0];
									}else{
										app.globalData["customerData"] = null;
									}
							}else  if(r["customer"].length >= 1 ){
								app.globalData["managerData"] = null;
								app.globalData["customerData"] = r["customer"][0];
							}else{
								app.globalData["managerData"] = null;
								app.globalData["customerData"] =null;
							}
						}
						if(!app.globalData.managerData && app.globalData["customerData"] != null){
							if(options["guidance"]){
								var d1054 = {
									funcNo:'1054',
									openid:openidFromCode,
									recommendby:managerId
								}
								network.postRequest(d1054);
								
								var bgf =  wx.getStorageSync("BGuidanceFlow");
								if(!bgf){
									bgf = {"card":true,"cardBox":true};
									wx.setStorageSync("BGuidanceFlow",bgf);
								}
								that.selectComponent("#tabone").showGuidance();
							}
						}
						if(app.globalData.customerData){ // 只要有 投资者信息，建立 连接  更新 
							message.openConection(app.globalData.customerData.id,managerData.id,function(){
								app.globalData.appOnShow = that.appOnshow ; // 后台五秒之后的情况。
								
								that.data.getUserCallBack = 'updateUserInfo';
								that.getSetting(that.updateUserInfo);
								
								that.addRelation(managerData.id,app.globalData.customerData.id,
									function(res){// 不管有没有关系，去创建一次。
										if(res.error_no == '0'){ //
											message.sendBehavior(app.globalData.customerData.id,managerData.id,"",'fc');
										}else{
											that.messageInit();
											message.sendBehavior(app.globalData.customerData.id,managerData.id
											,"",'rc');
										}
									}
								);
							});
						}else{ // 没有，去创建。
								that.data.getUserCallBack = 'addUser';
								that.getSetting(that.addUser);
						}
						that.selectComponent("#tabone").tapchange();
					});
				}
			})
			return ;
		}else if(frommanager){ // 从名片夹点击进来。 或者自己切换身份进来。
			openidFromCode = app.globalData.managerData.openid;
			managerData = frommanager;
			wx.setStorageSync("watchManagerId",managerData)
			if(!app.globalData["customerData"]){
				that.data.getUserCallBack = 'addUser';
				that.getSetting(that.addUser);
			}else{
				message.openConection(app.globalData.customerData.id,managerData.id,function(){
					that.data.getUserCallBack = 'updateUserInfo';
					that.getSetting(that.updateUserInfo);
					that.addRelation(managerData.id,app.globalData.customerData.id,function(res){
						if(res.error_no == '0'){ //
							message.sendBehavior(app.globalData.customerData.id,managerData.id,"",'fc');
						}else{
							that.messageInit();
							message.sendBehavior(app.globalData.customerData.id,managerData.id
							,"",'rc');
						}
					});
				});
			}
		}else if(fromcardbox){
			managerData = fromcardbox;
			wx.setStorageSync("watchManagerId",managerData)
			managerId =  managerData.id;
			message.openConection(app.globalData.customerData.id,managerData.id,function(){
				app.globalData.appOnShow = that.appOnshow
				message.sendBehavior(app.globalData.customerData.id,managerData.id
				,"",'rc');
				that.data.getUserCallBack = 'updateUserInfo';
				that.getSetting(that.updateUserInfo);
			});
			this.messageInit();
		}else{ // 从咨询，产品分享过来
			this.selectComponent("#tabone").redDotControl();
		}
		// init
		this.selectComponent("#tabone").tapchange();
		// 或者从他人分享进入。
		// this.rerender();
		var tj = wx.getStorageSync('shareTuijian')
		if(tj && tj == 'share'){
			that.toproductlist()
			wx.removeStorage({key:'shareTuijian'})
		}
  },
	messageInit:function(){
		var mineId = app.globalData.customerData.id;
		var opponentid = managerData.id;
		var message = wx.getStorageSync("messagelist"+opponentid);
		if(message!="" && message.length != 0 ){// 如果有，拉取新消息
			var lastTime = message[message.length-1].timeline;
			var rdata = {
				funcNo:"1002",
				mineid:mineId,
				opponentid:opponentid,
				timeline:lastTime
			}
			network.postRequest(rdata).then(function(res){
				if(res.error_no != '0') return;
				var newdata =res.data;
				for(var i = 0 ; i< newdata.length ; i++){
					var one = newdata[i];
					
					var direction = one.toid == opponentid? "send":'receive';
					var obj = {
						managerid:opponentid,
						contenttype:one.contenttype,content:one.content,direction:direction,
						timeline:one.timeline
					}
					message.push(obj);
				}
				var unread = wx.getStorageSync("bunread");
				if(unread){
					unread = unread +newdata.length;
				}else{
					unread = newdata.length;
				}
				wx.setStorageSync("bunread",unread);
				that.rerender();
				wx.setStorageSync("messagelist"+opponentid,message);
			})
		}else{// 没有消息，拉取跟这个人的最近的几条消息。 不超过十条的非新消息。新消息没有数量限制。
			message = [];
			var rdata = {
				funcNo:"1002",
				mineid:mineId,
				opponentid:opponentid
			}
			network.postRequest(rdata).then(function(res){
				if(res.error_no != '0') return;
				var newdata =res.data;
				var unread = 0;
				for(var i = 0 ; i< newdata.length ; i++){
					
					var one = newdata[i] ;
					
					unread =unread + one.unread * 1;
					
					
					var direction = one.toid == opponentid? "send":'receive';
					var obj = {
						managerid:opponentid,
						contenttype:one.contenttype,content:one.content,direction:direction,
						timeline:one.timeline
					}
					message.push(obj);
				}
				wx.setStorageSync("bunread",unread);
				that.rerender();
				wx.setStorageSync("messagelist"+opponentid,message);
			})
		}
	}
	,
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
	onGotUserInfo:function(res){
		var userInfo = res.detail["userInfo"];
		if(userInfo){ // 如果有客户资料
			if(this.data.getUserCallBack == 'updateUserInfo'){
				this.updateUserInfo(res.detail);
			}else if(this.data.getUserCallBack == 'addUser'){
				this.addUser(res.detail);
			} if(that.data.getUserCallBack == 'addManagerF'){ // 还是创建新的客户身份
				that.addManagerF(res.detail);
			}
		}else{ // 没有
			if(this.data.getUserCallBack == 'addUser'){
				this.addUser(null);
			}else if(that.data.getUserCallBack == 'addManagerF'){ // 还是创建新的客户身份
				wx.showToast({
					title: "需要授权去创建名片",
					icon:"none",
          duration: 3000
        });
			}
		}
	},opensetting:function(res){ // 去设置页之后的回调。
		if(res.detail.authSetting["scope.userInfo"] == true){ // 如果有了权限
			wx.getUserInfo({success:function(res){ // 获取资料。
				if(that.data.getUserCallBack == 'updateUserInfo'){  // 判断是需要更新
					that.updateUserInfo(res);
				}else if(that.data.getUserCallBack == 'addUser'){ // 还是创建新的客户身份
					that.addUser(res);
				}else if(that.data.getUserCallBack == 'addManagerF'){ // 还是创建新的客户身份
					that.addManagerF(res);
				}
			}})
		}else{ // 如果没有权限。 不需要更新，  判断是否创建新的客户身份 用匿名
			if(that.data.getUserCallBack == 'addUser'){
				that.addUser(null);
			}else if(that.data.getUserCallBack == 'addManagerF'){ // 还是创建新的客户身份
				wx.showToast({
					title: "需要授权去创建名片",
					icon:"none",
          duration: 3000
        });
			}
		}
	},addManager(){
		this.data.getUserCallBack = 'addManagerF';
    this.getSetting(this.addManagerF);
	},addManagerF(res) {
    var ui = res.userInfo;
    var openidFromCode = wx.getStorageSync("openidFromCode");
    var addData = {
      openid: openidFromCode,
      portrait: ui.avatarUrl,
      nickname: ui.nickName,
      iv: res.iv,
      encryptedData: res.encryptedData
    }
    if(app.globalData["customerData"] && app.globalData["customerData"].unionid){
      addData["unionid"] = app.globalData["customerData"].unionid;
    }
    wx.setStorageSync("fromcardboxTocard", addData);
    wx.redirectTo({
      url: "../clienta/mine/card/card"
    });
  },
	rerender(){
		var unread = wx.getStorageSync("bunread");
		if(unread!=="" && unread!=null){
				that.setData({
					count:unread
				});
		}
	},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
		app.globalData.renderPage = this;
		this.rerender();
		util.backexecute(function(){
			that.toproductlist()
			wx.removeStorage({key:'tuijian'})
		},'tuijiantorealchat')
		util.backexecute(function(){
			that.toproductlist()
		},'tuijiantocard')
	},
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
		var flag =  message.gettryopenING();
		if(flag){
			setTimeout(() => {
				this.onUnload();
			}, 100);
		}else{
			message.closeConnection(function(){
				console.log("close success by clientb",new Date());
			});
		}
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
		message.sendBehavior(app.globalData.customerData.id
		,managerData.id,"",'tc');
		var path = '/pages/clientb/clientb?sharefrom='+managerData.id;
		var md = wx.getStorageSync("tochatpagewmanager");
		var title = "向你推荐顾问：";
		if(md.company){
			title+= md.company;
		}
		if(md.position){
			title+=md.position;
		}
		if(md.name){
			title+=md.name;
		}
		/**
		 * var torealchatpage = {id:md.id,name:md.user_name,portraitpath:md.portrait_path,phone:md.mobile_phone,position:md.position,company:md.company};
					wx.setStorageSync("tochatpagewmanager",torealchatpage);
		 */
		var shareobj = {
      title: title
    }
		if(app.globalData.customerData.id){
			path += "&fromwho="+app.globalData.customerData.id;
		}
		shareobj["path"] = path;
		shareobj["imageUrl"] = "https://www.willsfintech.cn:9004/shareCard/"
			+managerData.id+".jpg"+"?time="+new Date().getTime();
		return shareobj;
		// 除了文章。名片，产品。部分地方可以转发。其他地方不可以转发。
  },updateUserInfo(res){
		var ui = res.userInfo;
		var willUpdate = {};
		var o =  app.globalData.customerData;
		o.portraitpath = o.portraitpath == null ? "" : o.portraitpath;
		if(o.nickname != ui.nickName || o.portraitpath != ui.avatarUrl || !o.unionid){
			var upData = {
				funcNo:"1021",
				cusid:app.globalData["customerData"].id,
				portrait:ui.avatarUrl,
				nickname:ui.nickName,
				openid:app.globalData.customerData.openid
			}
			if(!o.unionid){ // 传iv和 未解密数据
				upData["iv"]  = res.iv;
				upData["encryptedData"] = res.encryptedData;
			}else{
				upData["unionid"] = o.unionid;
			}
			network.postRequest(upData).then(function(r){
				if(o.nickname != ui.nickName){
					var msd = {};
					var fromid = app.globalData.customerData.id;
					var toid = managerData.id;
					message.sendMessage(fromid,toid,"我是"+o.nickname+",我更新了我的昵称",
					"update");
				}
			})
		}
	},addUser(res){
		var ui = res.userInfo;
		if(res){
      ui = res.userInfo;
    }
		var addData = {
			funcNo:"1021",
			openid:openidFromCode
		}
		if(res){
			addData["portrait"]=ui.avatarUrl;
			addData['nickname'] =ui.nickName;
			addData["iv"]  = res.iv;
			addData["encryptedData"] = res.encryptedData;
		}else{
		}
		network.postRequest(addData,5,3000,true).then(function(addData){
			app.globalData.customerData = {};
			app.globalData.customerData.id = addData.cusid;
			app.globalData.customerData.unionid = addData.unionid;
			if(res){
				app.globalData.customerData.nickname = ui.nickName;
				app.globalData.customerData.portraitpath = ui.avatarUrl;
			}else	{
				app.globalData.customerData.nickname = "匿名客户"+addData.cusid;
			}
			message.openConection(app.globalData.customerData.id,managerData.id,function(){
					app.globalData.appOnShow = that.appOnshow;
					that.addRelation(managerData.id,app.globalData.customerData.id
					,function(res){
						if(res.error_no == '0'){
							message.sendBehavior(app.globalData.customerData.id,managerData.id,"",'fc');
						}//创立成功。  新建客户肯定创立成功。
					});
			});

			if(shareoptions["guidance"]){
				//TODO1054
				var d1054 = {
					funcNo:'1054',
					openid:openidFromCode,
					recommendby:managerData.id
				}
				network.postRequest(d1054);
			}

		})
	},initMessage(){
		var md =wx.getStorageSync("tochatpagewmanager");

		if(md){
			var company = "";
			var position = "";
			var name = "";
			if(md.company){
				company = md.company;
			}
			if(md.position){
				position = md.position;
			}
			if(md.name){
				name = md.name;
			}
			var content = "您好，我是"+company+position+"-"+name+"，很高兴为您服务。请问有什么可以帮您？";
			var msd = {data:
				'{"fromid":"'+managerData.id+'","contenttype":"text","content":"'+content+'","direction":"receive"}'
			}
			message.receiveMessage(msd);
		}else{
			console.log(that.data.tryTime);
			that.data.tryTime++;
			if(that.data.tryTime >=5){
				that.data.tryTime = 0;
				return ;
			}
			setTimeout(function(){
				that.initMessage();
			},1000);
		}
	},
	addRelation(managerId,cusid,callback){
		//  创建关联关系
		var createRelation = {
			funcNo:'1024',
			cusid:cusid,
			managerid:managerId,
			entrancetype:'0'
		}
		if(shareoptions!=null && shareoptions["fromwho"]){
			createRelation["fromwho"] = shareoptions["fromwho"];
		}
		network.postRequest(createRelation).then(function(res){
			if(res.error_no == '0'){
				that.initMessage();
				wx.setStorageSync("bCardRedDot",true);
			}
			that.selectComponent("#tabone").redDotControl();
			callback(res);
		})
	},
	getSetting(success){
		 wx.getSetting({
		      success: res => {
		        if (res.authSetting['scope.userInfo']) {
		          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
		          wx.getUserInfo({
		            success: res => {
									success(res);
		            }
		          })
		        }else if(res.authSetting['scope.userInfo'] == undefined){ // 没有授权
							that.setData({
								accreditType:"toget"
							});
						}else{ // 拒绝授权
							that.setData({
								accreditType:"toset"
							});
						}
		      }
		    })
	},
  handleChange({ detail }) {
    /* this.setData({
      current: detail.key
    }); */
    if (detail.key == 'card') {
      this.setData({
        taboneKey: false
      })
    } else if (detail.key == 'consult') {
//       this.selectComponent("#tabtwo").tapchange();
//       this.setData({
//         tabtwoKey: false
//       })
			wx.navigateTo({
				url:'/pages/clientb/realchat/realchat'
			})
			return ;
    } else if (detail.key == 'product') {
      this.selectComponent("#tabthr").tapchange();
      this.setData({
        tabthrKey: false
      })
    } else if (detail.key == 'column') {
      this.selectComponent("#tabfour").tapchange();
      this.setData({
        tabfourKey: false
      })
    }
		this.setData({
			current: detail.key
		});
  },closeaccredit(){
		this.setData({
			accreditType:null
		})
	},
  //名片海报
  posterBind(data) {
		var name = data.detail.user_name //名字
		if (name.length > 6){name = name.substring(0,5)+'...'}
    if (data.detail.company == '' || data.detail.company == null) {
      data.detail.company = "";
      if (data.detail.position == '' || data.detail.position == null) { data.detail.position = '您身边的专业顾问' }
    }
    if (data.detail.mobile_phone == '' || data.detail.mobile_phone == null) { data.detail.mobile_phone = '咨询顾问获得电话' }
		if (data.detail.city == '' || data.detail.city == null) { data.detail.city = '时刻在客户身边' }
		if (data.detail.city.length > 18){data.detail.city = data.detail.city.substring(0,14)+'...'}
    if (data.detail.profile == '' || data.detail.profile == null) { data.detail.profile = '您身边共享资讯的学习导师、随时助您理解的产品专家、了解客户全面需求的贴心管家' }
    var position = data.detail.position //职位
    var company = data.detail.company //公司名
    var localpath = data.detail.portrait_path //用户头像
    var id = managerData.id;
    var localIdPath = 'https://www.willsfintech.cn:9004/qrcode/' + id + '.jpg'  //二维码
    var phone = data.detail.mobile_phone //手机
    var city = data.detail.city //省市区
    var profile = data.detail.profile //亮点
    wx.showLoading({
      title: '正在生成中...',
    })
    this.spotLength(profile)
    //名字后职位定位
    this.nameLeft(name, company, position)
    this.getImageInfo([localpath, localIdPath], function (arr) {
      if (arr[0] != undefined && arr[1] != undefined) {
        that.draw(arr[0], arr[1], name, position, company, phone, city)
      };
    });
  },
  //canvas需要调用的方法
  draw(localpath, localIdPath, name, position, company, phone, city) {
    const ctx = wx.createCanvasContext('shareCanvas')
    //画出外框
    ctx.setFillStyle('#f2f2f2');
    ctx.fillRect(0, 0, 750, 1080)
    // ctx.clip()
    ctx.save()
    ctx.setFillStyle('#fff');
    ctx.setShadow(0, 0, 60, 'rgba(179, 179, 179,0.5)')
    this.drawRoundRect(ctx, 65, 65, 620, 940, 16);
    // ctx.clip()
    ctx.restore()
    //画内框
    ctx.setFillStyle('#323232')
    ctx.setFontSize(40)
    ctx.save()
    ctx.font = 'normal bold 40px PingFangSC';
    ctx.fillText(name, 106, 712);
    ctx.restore()
    ctx.setFontSize(24)
    ctx.font = 'normal normal 24px PingFangSC';
    ctx.fillText(position, this.data.mleft, this.data.mTop);
    ctx.fillText(company, 105, 760);
    ctx.drawImage("../../image/img/phone.png", 105, 811, 16, 20);
    ctx.drawImage("../../image/img/address.png", 307, 811, 16, 20);
    ctx.setFontSize(22)
    ctx.setFillStyle('#676767')
    ctx.font = 'normal normal 22px PingFangSC';
    ctx.fillText(this.data.strs, 105, 900);
    ctx.fillText(this.data.stre, 105, 935);
    ctx.setFontSize(20)
    ctx.setFillStyle('#999999')
    ctx.font = 'normal normal 20px PingFangSC';
    ctx.fillText(phone, 131, 828);
    ctx.fillText(city, 333, 828);
    ctx.save()
    this.drawRoundRect(ctx, 105, 105, 540, 540, 16);
    ctx.clip()
    ctx.drawImage(localpath, 105, 105, 540, 540);
    ctx.setFillStyle('#fff');
    ctx.fillRect(105, 605, 540, 40)
    ctx.restore()
    ctx.save()
    this.drawRoundRect(ctx, 525, 658, 120, 120, 0);
    ctx.clip()
    ctx.drawImage(localIdPath, 525, 658, 120, 120, );
    ctx.restore()
    ctx.draw(false, function () {
      wx.canvasToTempFilePath({
        canvasId: 'shareCanvas',
        success: function (res) {
          wx.hideLoading()
          wx.navigateTo({
            url: '../poster/poster?img=' + res.tempFilePath + '&key=' + 'b&name=' + name,
          })
          // wx.previewImage({
          //   urls: [res.tempFilePath],
          // })
        }
      }, this)
    })
  },
  drawRoundRect(ctx, x, y, width, height, radius) {
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.setFillStyle('#ffffff');
    ctx.beginPath();
    ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
    ctx.lineTo(width - radius + x, y);
    ctx.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
    ctx.lineTo(width + x, height + y - radius);
    ctx.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2);
    ctx.lineTo(radius + x, height + y);
    ctx.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI);
    ctx.closePath();
    ctx.fill();
  },
  getImageInfo(url, callback) {    //  图片缓存本地的方法
    var arr = []
    url.forEach((item, index) => {
      wx.getImageInfo({   //  小程序获取图片信息API
        src: item,
        success: function (res) {
          arr[index] = res.path
          callback(arr);
        },
        fail(err) {
        }
      })
    })
  },
  //职位定位
  nameLeft(name, company, position) {
    var nameStrL = name.length
    var cStrL = company.length
    var pStrL = position.length + cStrL
    if (pStrL <= 16) {
      this.data.mleft = this.data.mLeft + 1 + (24 * cStrL)
      this.data.mTop = 760
    } else {
      this.data.mleft = this.data.mLeft + 10 + (42 * nameStrL)
    }
  },
  //亮点换行
  spotLength(data) {
    var str = data.replace('，', ',');
    var arr = []
    var p = /^[0-9a-z]*$/i;
    var len = 24;
    for (var i = 0; i < str.length; i++) {
      var a = str.charAt(i)
      arr.push(a)
    }
    arr.forEach((item, index) => {
      var b = p.test(item)
      if (b && index < len) {
        len = len + 0.4
      }
    })
    var str1 = str.replace(/[.]/g, '。');
    str1 = str1.replace(/[,]/g, '，');
    this.data.strs = str1.slice(0, len)
    this.data.stre = str1.slice(len, 45)
  },toproductlist(e){
		this.handleChange({detail:{key:"product"}});
	},toMomentList(){
		this.handleChange({detail:{key:"column"}});
	},
	accreditTo(e){
		util.getFormIdB(e)
	}
})
