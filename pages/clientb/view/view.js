// pages/clientb/view/view.js
var util= require('../../../utils/util.js');
var network= require('../../../utils/network.js')
var message = require('../../../utils/cusmessage.js')
var app =getApp()
var toviewpagedata = null;
var that = null;
var managerData =null;
var commentid = null;
var shareoptions = null;
var openidFromCode = null;
var hasCard = null;
var posterQRCodeid= null;
var articlekey = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
      comment:null,
      contentJson:[],
      managerData:null,
			headimg:"",
			needBack:true,
			exist:true,
			tryTime:0,title:null,
			//海报
			mLeft: 133,
			mleft: '',
			RemarkHeight:0,
      articleImg:'',
      posData:null,
      showCreateButton:true
  },
  /**
   * 生命周期函数--监听页面加载
   */ 
  onLoad: function (options) {
    wx.hideShareMenu();
    shareoptions = null;
    commentid = null;
		that = this;
		hasCard= null;
		toviewpagedata = null;
    var ch = util.systemTop() + 88
		var sh = util.systemHeight()-ch
		var apple = app.globalData.AppleX
    if (apple) {
      this.setData({
        bm: 50,
      })
    } else {
      this.setData({
        bm: 0,
      })
    } 
    this.setData({
      cH:ch,
      sH:sh
    })
    if(app.globalData.managerData){//判断是否展示创建顾问身份按钮
      this.setData({showCreateButton:false})
    }
		if(options['sharefrom']){  // 1.确认身份，注册，建立关系，拉取manager的信息
			this.setData({
				needBack:false
			});
			shareoptions = options;
			var  managerId = options['sharefrom'];                                 
      managerData = {id:managerId};
      this.getProduct(managerData)
      wx.setStorageSync("watchManagerId",managerData);
      var managerId =  managerData.id;
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
							openidFromCode = r.openid;
							if(r["manager"].length >= 1){
									app.globalData["managerData"] = r["manager"][0];
									if(r["customer"].length >= 1 ){
										app.globalData["customerData"] = r["customer"][0];
									}
							}else  if(r["customer"].length >= 1 ){
								app.globalData["managerData"] = null;
								app.globalData["customerData"] = r["customer"][0];
							}
            }
            if(!app.globalData.managerData){
							if(options["guidance"]){
								var bgf =  wx.getStorageSync("BGuidanceFlow");
								if(!bgf){
									bgf = {"card":true,"cardBox":true};
									wx.setStorageSync("BGuidanceFlow",bgf);
								}
							}
						}
						if(app.globalData.customerData){ // 只要有 投资者信息，建立 连接  更新 
							message.openConection(app.globalData.customerData.id,managerData.id,function(){
								
								that.data.getUserCallBack = 'updateUserInfo';
								that.getSetting(that.updateUserInfo);
								
								that.addRelation(managerData.id,app.globalData.customerData.id,
									function(res){// 不管有没有关系，去创建一次。
                    if(res.error_no == '0'){ //
                      message.sendBehavior(app.globalData.customerData.id,managerData.id,"",'fc');
                    }else{ // 创建失败。
                      that.messageInit(); // 初始化消息
										}
									}
								);
							});
						}else{ // 没有，去创建。
								that.data.getUserCallBack = 'addUser';
								that.getSetting(that.addUser);
						}
            if(app.globalData.managerData){//获取完用户信息后判断是否展示创建顾问身份按钮
              that.setData({showCreateButton:false})
            }
						var mdata = {
							funcNo:"1022",
							id:managerId
						}
						network.postRequest(mdata).then(function(res){// 头。
							if(res.error_no == '0'){
								var md = res.data[0];
								var headImgUrl = md.portrait_path;
								var headimgbig = headImgUrl;
								if(headImgUrl !=null && headImgUrl.indexOf("wills")!=-1)
									headImgUrl = headImgUrl.substr(0,headImgUrl.length - 4)+"s.jpg";
								
								var torealchatpage = {id:md.id,name:md.user_name,portraitpath:md.portrait_path,phone:md.mobile_phone,position:md.position,company:md.company,profile:md.profile};
			
								if(!torealchatpage.company)torealchatpage.company ='';  
								if(!torealchatpage.position)torealchatpage.position =''; 
								if(!torealchatpage.company && !torealchatpage.position){
									torealchatpage.company = '您身边的专业顾问'
									torealchatpage.position = ''
								}
                that.getcompanyPosition(torealchatpage);
                that.composeLength(torealchatpage)
                that.data.posData = torealchatpage
								that.setData({
									headimg:headImgUrl,
									managerData:torealchatpage,
									headimgbig:headimgbig
								})
								wx.setStorageSync("tochatpagewmanager",torealchatpage);
								that.onLaunchCF();
							}
						});


						commentid = shareoptions["commentid"];
						if(commentid){
							var rd = {
								funcNo:"1048",
								id:commentid
							}
							network.postRequest(rd).then(function(r){
								if(r.error_no == '0'){
									if(r.data!=null && r.data.length !=0){
										var c =r.data[0].content;
										if(c == "")c =null;
										that.setData({
											comment:c
										});
									}
								}
							});
						}
						var articleData = {
							funcNo:'1037',
							id:shareoptions["articleid"],
							creator:"id"
						}
						network.postRequest(articleData).then(function(r){
							if(r.error_no == '0'){
								if(r.data.length == 0){
									that.setData({
										exist:false
									});
									return;
								}
								toviewpagedata = r.data[0];
								var fw = null;
								var eid = shareoptions["articleid"];
								if(shareoptions)fw =shareoptions["fromwho"];
								if(app.globalData.customerData){
									if( message.getStatus()){
										message.sendBehavior(app.globalData.customerData.id,managerData.id,toviewpagedata.title,'rt',fw,eid);
									}else{
										var trytimes = 10;
										var iid = setInterval(() => {
											if(message.getStatus()){
												
												message.sendBehavior(app.globalData.customerData.id,managerData.id,toviewpagedata.title,'rt',fw,eid);
												clearInterval(iid);
											}else if(trytimes == 0){
												clearInterval(iid);
											}
											trytimes--;
										}, 5000);
									}
								}
								that.hasCard();
								var src = "https://www.willsfintech.cn:9001/article?articleid="+shareoptions["articleid"]
								network.get(src).then(function(r){
									var c = [
										{
											name: 'div',
											attrs: {
												style: 'width:92%;height:auto;margin:20px auto;font-size:17px;line-height:1.6'
											},
											children: []
										}
									];
                  c[0].children.push(r);// 文章扒取 不是数组 所以需要一个数组去加载。
                  toviewpagedata['background'] = 0;
									// 补丁
									if(toviewpagedata.type == 1){ // 本身就是数组
                    c = r;
                    toviewpagedata['background'] = 1;
									}
									if(toviewpagedata.type == 2 || toviewpagedata.type.indexOf("wills")!=-1){ // 本身是数组，解析完了也是。
										toviewpagedata["content"] = r;
                    c = that.getNodeInfo(r);
                    toviewpagedata['background'] = 2;
                  }
                  if(toviewpagedata.type == '0' ||toviewpagedata.type == '2'){
                    that.setData({
                      articleTitle:toviewpagedata.title,
                      fromName:toviewpagedata.nickname
                    })
                  }
									that.setData({
										contentJson:c,
										title:toviewpagedata.title
									});
								})
								that.onLaunchCF();
							}
						});
					});
				}
      })
      return ;
		}

    managerData = wx.getStorageSync("tochatpagewmanager");
    this.getProduct(managerData)
		if(!managerData.company)managerData.company ='';
    if(!managerData.position)managerData.position ='';
    if(!managerData.company && !managerData.position){
      managerData.company = '您身边的专业顾问'
      managerData.position = ''
    }
    var headImgUrl = managerData.portraitpath;
		if(headImgUrl !=null && headImgUrl.indexOf("wills")!=-1)
			headImgUrl = headImgUrl.substr(0,headImgUrl.length - 4)+"s.jpg";
		this.getcompanyPosition(managerData)
    this.composeLength(managerData)
    this.data.posData = managerData
		this.setData({
			headimg:headImgUrl,
			managerData:managerData
    })
    toviewpagedata = wx.getStorageSync("toviewpagedata");
    message.sendBehavior(app.globalData.customerData.id,managerData.id,toviewpagedata.title,'rt',null,toviewpagedata["id"]);
    var comment = toviewpagedata.comment;
    commentid = toviewpagedata.commentid 
    if(toviewpagedata){
      if(commentid){
        var rd = {
          funcNo:"1048",
          id:commentid
        }
        network.postRequest(rd).then(function(r){
          if(r.error_no == '0'){
            if(r.data!=null && r.data.length !=0){
              var c =r.data[0].content;
              if(c == "")c =null;
              that.setData({
                comment:c
              });
            }
          }
        });
      }else if(comment){
        that.setData({
					comment:comment
				});
      }
			var src = "https://www.willsfintech.cn:9001/article?articleid="+toviewpagedata.id
			network.get(src).then(function(r){
				if(r == "delete"){
					that.setData({
            exist:false
          });
          return;
        }
        var c = [
          {
            name: 'div',
            attrs: {
              style: 'width:94%;height:auto;margin:20px auto;'
            },
            children: []
          }
        ];
        c[0].children.push(r); // 文章扒取 不是数组 所以需要一个数组去加载。
        toviewpagedata['background'] = 0;
        // 补丁
				if(toviewpagedata.type == 1){ // 本身就是数组
          c = r;
          toviewpagedata['background'] = 1;
				}
				if(toviewpagedata.type == 2 || toviewpagedata.type.indexOf("wills")!=-1){ // 本身是数组，解析完了也是。
					toviewpagedata["content"] = r;
          c = that.getNodeInfo(r);
          toviewpagedata['background'] = 2;
        }
        if(toviewpagedata.type == '0'){
          that.setData({
            articleTitle:toviewpagedata.title,
            fromName:toviewpagedata.nickname
          })
        }
				that.setData({
					contentJson:c
				});
			})
			that.hasCard();
		}
  },onLaunchCF(){
		if(this.data.managerData == null || toviewpagedata == null)return;
		var onLaunch =  wx.getStorageSync("onLaunch");
		if(onLaunch){
			wx.removeStorageSync("onLaunch");
			wx.getSetting({
				success: res => {
					if (res.authSetting['scope.userInfo']) {
						var rd={
							funcNo:"9996",
							creator:app.globalData.customerData.id
						}
						network.postRequest(rd).then(function(r){
							if(r.error_no =='0'){
								if(r.count == 0){
									that.setData({
										showOnlaunch:true
									});
								}
							}
						});
					}
				}
			}) 
		}
	},closeOnlaunch(e){
		util.getFormIdB(e);
		this.setData({
			showOnlaunch:false
		});
	},hasCard(){
		if(hasCard == null){
      var theCardurl = "https://www.willsfintech.cn:9004/shareArticleCard/" +
            toviewpagedata.pathid + ".jpg" + "?time=" + new Date().getTime();
      wx.getImageInfo({
        src:theCardurl,
        success:function(r){
          hasCard = r.path;
        },
        fail:function(){
          hasCard = "https://www.willsfintech.cn:9004/staticFile/image/articleproduct.png";
        }
      });
    }
	},getNodeInfo(list){
		var richText = [];
    list.forEach(item=>{
			var obj = null;
      if(item.keys == 'img'){
        let w = item.imgWidth / 2 + 'px', h = item.imgHeight / 2 + 'px'
        if (item.imgWidth >= '648') {
          w = '100%'
          h = 'auto'
        }
        obj = {
          name: 'div',
          attrs: {
            style: 'width:86%;height:auto;border-radius: 6px;margin:29px auto 22px auto;text-align: center;'
          },
          children: [{
            type: 'node',
            name: 'img',
            attrs: {
              src: item.src,
              style: 'width:' + w + ';height:' + h + ';'
            }
          }]
        }
      } else if (item.keys == 'txt'){
				if(item == "") item="　";
        obj = {
          name: 'div',
          attrs: {
            style: 'width:86%;height:auto;border-radius: 6px;margin:15px auto 22px auto;font-size:16px;line-height:29px;color:#333;white-space:normal;word-break:break-all;text-align:justify;letter-spacing:1px;'
          },
          children: [{
            type: 'text',
            text: item.content,
          }]
        }
      }
			if(obj !=null)
				richText.push(obj);
    })
		return richText;
  },tomainpage(){
		if(shareoptions){
			wx.redirectTo({
				url:'../clientb'
			});
		}
	},
  //公司职位定位
  getcompanyPosition(data) {
		if(!data)return ;
		var len =0;
		if(data.company){
			len += data.company.length;
		}
		if(data.position){
			len += data.position.length
		}
    if (len > 13) {
      this.setData({
        companyPosition: true
      })
    } else {
      this.setData({
        companyPosition: false
      })
    }
  },
  pageto() {
    wx.navigateTo({
      url: '../../cardbox/cardbox',
    })
  },
  //点评按钮
  consult(e){
    util.getFormIdB(e)
    wx.navigateTo({
      url: '/pages/clientb/realchat/realchat'
    })
  },
  messageInit:function(){
		var that = this;
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
				wx.setStorageSync("messagelist"+opponentid,message);
			})
		}
  },
  addFreecard(){//创建顾问
    this.data.getUserCallBack = 'addManagerF';
    this.getSetting(this.addManagerF)
  },
  onGotUserInfo:function(res){
    var userInfo = res.detail["userInfo"];
    // {detail:{userInfo:{}}}
		if(userInfo){ // 如果有客户资料
			if(this.data.getUserCallBack == 'updateUserInfo'){
				this.updateUserInfo(res.detail);
			}else if(this.data.getUserCallBack == 'addUser'){
				this.addUser(res.detail);
			}else if(this.data.getUserCallBack == 'addManagerF'){//去创建顾问身份
        this.addManegerF(res.detail)
      }
		}else{ // 没有
			if(this.data.getUserCallBack == 'addUser'){
				this.addUser(null);
			}
		}
	},opensetting:function(res){ // 去设置页之后的回调。
		var that = this;
		if(res.detail.authSetting["scope.userInfo"] == true){ // 如果有了权限
      wx.getUserInfo({success:function(res){ // 获取资料。
        // {userinfo:{}}
				if(that.data.getUserCallBack == 'updateUserInfo'){  // 判断是需要更新
					that.updateUserInfo(res);
				}else if(that.data.getUserCallBack == 'addUser'){ // 还是创建新的客户身份
					that.addUser(res);
				}else if(that.data.getUserCallBack == 'addManagerF'){//去创建顾问身份
          that.addManegerF(res.detail)
        }
			}})
		}else{ // 如果没有权限。 不需要更新，  判断是否创建新的客户身份 用匿名
			if(that.data.getUserCallBack == 'addUser'){
				that.addUser(null);
			}
		}
	},updateUserInfo(res){
		var ui = res.userInfo;
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
    var ui = null;
    if(res){
      ui = res.userInfo;
    }
		var that = this;
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
			addData["portrait"]=null;
			addData['nickname'] =null;
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
						if(res.error_no == '0'){ //
							message.sendBehavior(app.globalData.customerData.id,managerData.id,"",'fc');
							
							var fw = null;
							var eid = toviewpagedata.id;
							if(shareoptions)fw =shareoptions["fromwho"];
              message.sendBehavior(app.globalData.customerData.id,managerData.id,toviewpagedata.title,'rt',fw,eid);
            }//创立成功。  新建客户肯定创立成功。
					});
			});
		});
  },
  addManagerF(e){//创建顾问身份
    var ui = e.userInfo
    var openidFromCode = wx.getStorageSync('openidFromCode');
    var addData = {
      openid:openidFromCode,
      portrait:ui.avatarUrl,
      nickname:ui.nickName,
      iv:e.iv,
      encryptedData:e.encryptedData
    }
    if(app.globalData['customerData'] && app.globalData['customerData'].unionid){
      addData['unionid'] = app.globalData['customerData'].unionid
    }
    wx.setStorageSync('fromcardboxTocard',addData)
    wx.redirectTo({url:'../../clienta/mine/card/card'})
  },
  initMessage(){
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
			entrancetype:'1'
    }
    createRelation["entranceid"] = shareoptions["articleid"];
		if(shareoptions!=null && shareoptions["fromwho"]){
			createRelation["fromwho"] = shareoptions["fromwho"];
		}
		network.postRequest(createRelation).then(function(res){
			if(res.error_no == '0'){
				that.initMessage();
				wx.setStorageSync("bCardRedDot",true);
			}
			callback(res);
		})
	},
	getSetting(success){
		var that =this;
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
	},closeaccredit(){
		this.setData({
			accreditType:null
    })
  },bindback(){
    if(shareoptions){
      wx.redirectTo({
        url:"../clientb"
      });
    }else{
      wx.navigateBack({
        delta:1
      });
    }
  },
  shareBind(e){
    util.getFormIdB(e)
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
    var title = toviewpagedata.title;
    message.sendBehavior(app.globalData.customerData.id,managerData.id,title,'tt',null,toviewpagedata.id);
		var shareobj = {
			title: title,
		}
		if(hasCard){
      shareobj["imageUrl"] =hasCard;
    }
		var path= "pages/clientb/view/view?articleid="+toviewpagedata.id
    +"&sharefrom="+managerData.id+"&fromwho="+app.globalData.customerData.id;
    if(commentid){
      path += "&commentid="+commentid;
    }
		shareobj["path"]  = path;
		return shareobj;
	},
	accreditTo(e){
		if(app.globalData.managerData){
			util.getFormId(e)
		}else{
			util.getFormIdB(e)
		}
		this.setData({ 
      shareShow:true
    })
	},
	//控制公司名称与职位的位置
  composeLength(data) {
    if(data.company == null)data.company = '';
    if(data.position == null)data.position = '';
    if((data.company == null || data.company == '') && (data.position == null || data.position == ''))data.company = '您身边的专属顾问';
    if ((data.company != null || data.company != '') && (data.position != null || data.position != '')) {
      let composeLength = data.company.length + data.position.length
      if (composeLength <= 16) {
        data.compose = true
      } else {
        data.compose = false
      }
    } else {
      data.compose = true
    }
  },
  toproductList(){
    var tj = wx.getStorageSync("tuijian");
    if(tj == 'realchat'){//判断是否是从聊天进入
      util.setBackexecute(2,'toproductreadpage')
      wx.navigateBack({delta:2})
    }else if(tj == 'card'){
      util.setBackexecute(1,'tuijiantocard')
      wx.navigateBack({delta:1})
    }else if(this.data.shareKey || shareoptions){//从分享进入
      wx.setStorageSync('shareTuijian','share')
      wx.redirectTo({
				url:'../clientb'
			});
    }else{//列表进入
      wx.navigateBack({delta:1})
    }
  },
  toproduct(e) {
    // var thisId = this.data.product.id
    // var thatId = this.data.productTj.id
    // if(thisId == thatId){return;}
    wx.setStorageSync("toproductreadpage",{data:this.data.productTj});
    if(this.data.shareKey || shareoptions){
      wx.redirectTo({
        url: "../productread/productread?keys=share"
      })
      return;
    }
    wx.redirectTo({
      url: "../product/productread/productread"
    })
  },
  getProduct(data) {
    var rd = {
      funcNo: "1044",
      creator: data.id
    }
    network.postRequest(rd).then(function(r) {
      if (r.error_no == '0') {
        var l = r.data;
        var p = null;
        for (var i = 0; i < l.length; i++) {
          var one = l[i];
          if (one["private"] == '1') {
            continue;
          }
          if (one.tags) {
            one.tagsarr = one.tags.split(",");
          }
          if (one.keyp1 == null) {
            one.keyp1 = "";
          }
          if (one.keyp2 == null) {
            one.keyp2 = "";
          }
          if (one.keyp3 == null) {
            one.keyp3 = "";
          }
          p = one;
          break;
        }
        that.setData({
          productTj: p,
        });
      }
    });
  },
	posterPre(e){
    util.getFormIdB(e)
    var commentid = new Date().getTime()+""+app.globalData.customerData.id;
    var id= commentid;
    var posterQRCodeid = id;
    var param = "/pages/clientb/view/view?articleid="+toviewpagedata.id
    +"&sharefrom="+managerData.id+"&fromwho="+app.globalData.customerData.id;
    var referenceData = {
      funcNo:'1049',
      id:id,
      param:param
    }
    network.postRequest(referenceData).then(function(r){
      if(r.error_no == '0'){
        // TODO   画图      必须要等请求回复。因为图片可能还没有画好。
        that.posterBind(id);
      }
		});
	},
	unshareShowBind(){
		this.setData({shareShow:false})
	},
	/*******************分享海报************************/
  posterBind(id) {
    var that = this;
    var data = this.data.posData;
    if(!data.name)data.name = '——';
    var name = data.name;
    var company = data.company,position = data.position;
    if (!data.company) company = '';
    if (!data.position) position = '';
    if ((company == '') && (position == '')) company = '您身边的专业顾问' 
    var text = '长按识别小程序码阅读全文';
    var localpath = data.portraitpath;
    // var localIdPath = 'https://www.willsfintech.cn:9004/qrcode/' + 26 + '.jpg' //二维码
    var localIdPath = 'https://www.willsfintech.cn:9004/commonqrcode/' + id+ '.jpg' //二维码
    //文字内容信息
    
    wx.showLoading({
      title: '正在生成中...',
      mask:true
    })
    //公司职位定位
    // this.nameLeft(name, company, position)
    //点评内容逻辑(可能没有点评)
    //点评框高度计算
    var  remarktext = toviewpagedata.comment;
    if(!remarktext){
      this.data.RemarkHeight = 0;
			remarktext = '';
			var remarktextarr = '';
    }else{
      // wx.createSelectorQuery().select('.input-value').fields({
      //   size:true
      // },function(r){
      //   that.data.RemarkHeight = r.height/util.rHeight
      // }).exec()
      //处理点评内容，以最后一行的高度值加60为点评框高度（PS：dom获取高度可能因为性能延迟导致获取不及时，且算法待研究。）
      remarktext = '  '+remarktext;
      var remarktextarr = util.longTextEnter(remarktext,590,67,32,1,50,false,75)
      this.data.RemarkHeight = remarktextarr[remarktextarr.length-1].y + 35
    }
    
    //资讯分类0扒取，1收录，2自编
    const content = toviewpagedata.content;
    var contentarr = {};
    var that = this;
    if(toviewpagedata.background == 0){
      //扒取的文章获取头图缓存本地(应该有)，标题（应该有），说明（可能没有）
      //图片最低高度为1000，不满1000自动分配间距，超过1000按最小间距
      var articleimg = util.getArticleTitleImg(toviewpagedata)
      articleimg = articleimg.replace('/title','/htitle')
      wx.getImageInfo({
        src:articleimg,
        success(res){
          var texty = 0;
          contentarr['img'] = res.path
          //如宽超出，高度最大限制为422。如高超出，宽度最大为750.保持比例，居中截取
          //采用选取框画图，选取框大小为750*422
          //图片等比例缩放，选取框居中
          contentarr['iw'] = 750
          contentarr['ih'] = (750/res.width)*res.height
          if(contentarr['ih'] < 422){
            contentarr['iw'] = (422/contentarr['ih'])*contentarr['iw']
            contentarr['ih'] = 422
          }
          if(contentarr['ih']>422){var h = 422}else{ var h = contentarr['ih']}
          contentarr['titlearr'] = util.longTextEnter(toviewpagedata.title,650,h+104,54,1,70,true)
          texty = contentarr['titlearr'][contentarr['titlearr'].length-1].y;
          if(toviewpagedata.remark){
            contentarr['remarkarr'] = util.longTextEnter(toviewpagedata.remark,660,texty+84,34,1,52,true)
            contentarr['canvasHeight'] = contentarr['remarkarr'][contentarr['remarkarr'].length-1].y + 330 + that.data.RemarkHeight
          }else{
            contentarr['canvasHeight'] =texty + 320 + that.data.RemarkHeight
          }
          if(contentarr['canvasHeight']<1125){
            var j = 2
            if(contentarr['remarkarr'] || remarktextarr){j=3}
            if(contentarr['remarkarr'] && remarktextarr){j=4}
            contentarr['repairHeight'] = (1125 - contentarr['canvasHeight'] )/j
            contentarr['canvasHeight'] = 1125
          }else{
            contentarr['repairHeight'] = 0
          }
          that.setData({
            canvasHeight:contentarr['canvasHeight']
          })
          that.getImageInfo([localpath, localIdPath,articleimg], function(arr) {
            if (arr[0] != undefined && arr[1] != undefined && arr[2]!=undefined) {
              // contentarr["img"] = arr[2];
              that.draw(arr[0], arr[1], name, position, company,text,remarktextarr,contentarr)
            };
          });
        }
      })
    }
    if(toviewpagedata.background == 1){
      // 内容只有文本，没有图片，没有卡片。
      // 区分顾问or客户，所有高度自动，获取内容，根据内容设置高度
      contentarr['title'] = toviewpagedata.title
      var contentData = content[0].children
      if(remarktext){
        contentarr['remarkarr'] = util.longTextEnter(remarktext,660,84,34,1,52,true)
      }else{
      }
      var arr = []
      var y = 0
      contentData.forEach((item,index)=>{
        var obj = {}
        obj.keys = item.attrs.class
        if(y<1334){
          if(item.attrs.class == 'send-box'){
            var img = item.children[0].attrs.src;
            wx.getImageInfo({
              src:img,
              success(res){
                obj.img = res.path
              },
              fail(err) {}
            })
            obj.text = item.children[1].children[0].text
            obj.text = util.longTextEnter(obj.text,420,y+10,32,1,42,false,35)
            y =obj.text[obj.text.length-1].y + 90
          }else{
            obj.text = item.children[0].children[0].text
            obj.text = util.longTextEnter(obj.text,420,y+10,32,1,42,false,35)
            y =obj.text[obj.text.length-1].y + 90
          }
          arr[index] = obj
        }
      })
      //得到内容后，计算出高度
      contentarr['content'] = arr
      contentarr['contentHeight'] = y 
      this.setData({
        canvasHeight:1334
      })
      that.getImageInfo([localpath, localIdPath], function(arr) {
        if (arr[0] != undefined && arr[1] != undefined) {
          // contentarr["img"] = arr[2];
          that.draw(arr[0], arr[1], name, position, company,text,remarktextarr,contentarr)
        };
      });
      // wx.showToast({
      //   title:'敬请期待',
      //   icon:'none'
      // })
    }
    if(toviewpagedata.background == 2){
      contentarr['title'] = toviewpagedata.title
      contentarr['content'] = content
      this.getContentArr(contentarr['content'] ,0,0);// 异步   回调的时候，才会 吧contentarr 里的数据，更新。
      this.setData({
        canvasHeight:1334
      })
      this.getImageInfo([localpath, localIdPath], function(arr) { // 异步的回调。
        if (arr[0] != undefined && arr[1] != undefined) {
          that.draw(arr[0], arr[1], name, position, company,text,remarktextarr,contentarr) ; // 要用到 contentarr的更新后的数据，不然就会报错。
        };
      });
    }
  },
  //canvas需要调用的方法
  draw(localpath, localIdPath, name, position, company,text,remarktextarr,contentarr) {
    const ctx = wx.createCanvasContext('viewCanvas')
    //画出外框
    //文章内容
    if(toviewpagedata.background == 0){
      //顶部头图，标题自动Y，说明有则画
      var texty = 0;
      ctx.setFillStyle('#fff');
      ctx.fillRect(0, 0, 750, contentarr['canvasHeight'])
      var h = null;
      if(contentarr['ih']>422){ h = 422}else{h = contentarr['ih']}
      // ctx.drawImage( contentarr['img'] ,(contentarr['iw']-750)/2 , (contentarr['ih']-h)/2,750,h, (750-contentarr['iw'])/2 , (h-contentarr['ih'])/2 , contentarr['iw'], contentarr['ih']);
      ctx.save()
      ctx.rect(0, 0, 750, h)
      ctx.clip()
      ctx.drawImage(contentarr['img'],(750-contentarr['iw'])/2 , (h-contentarr['ih'])/2 , contentarr['iw'], contentarr['ih'])
      ctx.restore();
      ctx.setFillStyle('#333')
      ctx.font = 'normal normal 54px PingFangSC';
      contentarr['titlearr'].forEach((item,index)=>{
        ctx.fillText(item.text, item.x, item.y+contentarr['repairHeight']);
        if(index == contentarr['titlearr'].length-1 ){texty = item.y + contentarr['repairHeight']}
      })
      ctx.setFillStyle('#aaa')
      ctx.font = 'normal normal 34px PingFangSC';
      if(contentarr['remarkarr']){
        contentarr['remarkarr'].forEach((item,index)=>{
          ctx.fillText(item.text, item.x, item.y+contentarr['repairHeight']*2);
          if(index == contentarr['remarkarr'].length-1 ){texty = item.y + contentarr['repairHeight']}
        })
      }
      if(remarktextarr){
        ctx.setFillStyle('#f6f6f6')
        this.drawRoundRect(ctx,35,texty+50+contentarr['repairHeight'],680,this.data.RemarkHeight,14)
        ctx.drawImage('../../../image/img/mark.png', 78, texty+89+contentarr['repairHeight'], 34, 28);
        ctx.setFillStyle('#333')
        ctx.font = 'normal normal 32px PingFangSC';
        remarktextarr.forEach(item=>{
          ctx.fillText(item.text,item.x,item.y + texty + 51 + contentarr['repairHeight']);
        })
      }
      //底部信息
      var y = contentarr['canvasHeight']
      ctx.save()
      ctx.setFillStyle('#fff');
      ctx.fillRect(0, y-270, 750, 290)
      ctx.setFillStyle('#666')
      ctx.fillRect(35, y-230, 140, 1)
      ctx.fillRect(575, y-230, 140, 1)
      ctx.setFillStyle('#000')
      ctx.font = 'normal normal 28px PingFangSC';
      ctx.fillText( text , 207 , y-215 );
      ctx.save()
      this.drawRoundRect(ctx, 40,y-155, 80, 80, 40);
      ctx.clip()
      ctx.drawImage(localpath, 40,y-155, 80, 80);
      ctx.restore()
      ctx.setFillStyle('#000')
      ctx.font = 'normal normal 34px PingFangSC';
      ctx.fillText(name, 133, y-118);
      ctx.setFillStyle('#aaa')
      ctx.font = 'normal normal 26px PingFangSC';
      ctx.fillText(company, 133, y-78);
      that.nameLeft(name, company, position,y-118,y-78)
      ctx.fillText(position, this.data.mleft, this.data.mTop);
      this.drawRoundRect(ctx, 595, y-174, 120, 120, 60,'#ffffff','#ffffff');
      ctx.clip()
    // ctx.drawImage(localIdPath, 595, 1160, 120, 120);
      ctx.drawImage(localIdPath, 595, y-174, 120, 120);
      // ctx.restore()
    }
    if(toviewpagedata.background == 1){
      var texty = 0;
      ctx.setFillStyle('#fff');
      ctx.fillRect(0, 0, 750, 1334);
      var remarkHeight = 0;
      if(contentarr['remarkarr']){
        ctx.setFillStyle('#f6f6f6')
        this.drawRoundRect(ctx,35,25,680,this.data.RemarkHeight,14)
        ctx.drawImage('../../../image/img/mark.png', 78, texty+60, 34, 28);
        ctx.setFillStyle('#333')
        ctx.font = 'normal normal 32px PingFangSC';
        remarktextarr.forEach(item=>{
          ctx.fillText(item.text,item.x,item.y + 20);
        })
        remarkHeight = this.data.RemarkHeight+20
      }
      ctx.setFillStyle('#f0f1f6');
      this.drawRoundRect(ctx,25,25+remarkHeight,700,contentarr['contentHeight']+contentarr.content.length*10,14)
      contentarr.content.forEach(item=>{
        var itemWidth = 0;
        if(item.text[0].y == item.text[item.text.length-1].y){itemWidth = item.text[item.text.length-1].x + 50}
        else{itemWidth = 500}
        if(item.keys == "send-box"){
          ctx.save()
          this.drawRoundRect(ctx, 40, item.text[0].y+40+remarkHeight, 74, 74, 37);
          ctx.clip()
          ctx.drawImage(item.img, 40, item.text[0].y+40+remarkHeight, 74, 74);
          ctx.restore()
          this.drawRoundRectColor(ctx, 130,item.text[0].y+41+remarkHeight, itemWidth, item.text[item.text.length-1].y-item.text[0].y+80, 12,'#5da9ff','#5da9ff',false);
          ctx.setFillStyle('#fff')
          ctx.font = 'normal normal 32px PingFangSC';
          item.text.forEach(ite=>{
            ctx.fillText(ite.text, ite.x +125, ite.y+90+remarkHeight);
          })
        }else{
          this.drawRoundRectColor(ctx, 200,item.text[0].y+41+remarkHeight, itemWidth, item.text[item.text.length-1].y-item.text[0].y+80, 12,'#ffffff','#ffffff',false);
          ctx.setFillStyle('#333')
          ctx.font = 'normal normal 32px PingFangSC';
          item.text.forEach(ite=>{
            ctx.fillText(ite.text, ite.x +200, ite.y+90+remarkHeight);
          })
        }
      })
      //底部信息
      ctx.save()
      ctx.setFillStyle('#fff');
      ctx.setShadow(0, -30, 60, 'rgba(255,255,255,0.95)')
      ctx.fillRect(0, 1050, 750, 290)
      ctx.setFillStyle('#666')
      ctx.fillRect(35, 1103, 140, 1)
      ctx.fillRect(575, 1103, 140, 1)
      ctx.setFillStyle('#000')
      ctx.font = 'normal normal 28px PingFangSC';
      ctx.fillText(text, 207,1115);
      ctx.save()
      this.drawRoundRect(ctx, 40, 1180, 80, 80, 40);
      ctx.clip()
      ctx.drawImage(localpath, 40, 1180, 80, 80);
      ctx.restore()
      ctx.setFillStyle('#000')
      ctx.font = 'normal normal 34px PingFangSC';
      ctx.fillText(name, 133, 1215);
      ctx.setFillStyle('#aaa')
      ctx.font = 'normal normal 26px PingFangSC';
      that.nameLeft(name, company, position,1215,1255)
      ctx.fillText(position, this.data.mleft, this.data.mTop);
      ctx.fillText(company, 133, 1255);
      this.drawRoundRect(ctx, 595,1160, 120, 120, 0,'#ffffff','#ffffff');
      ctx.clip()
      ctx.drawImage(localIdPath, 595, 1160, 120, 120);
      ctx.restore()
    }
    if(toviewpagedata.background == 2){
      var texty = 0;
      ctx.setFillStyle('#fff');
      ctx.fillRect(0, 0, 750, 1334)
      if(remarktextarr){
        ctx.setFillStyle('#f6f6f6')
        this.drawRoundRect(ctx,35,30,680,this.data.RemarkHeight,14)
        ctx.drawImage('../../../image/img/mark.png', 78, 68, 34, 28);
        ctx.setFillStyle('#333')
        ctx.font = 'normal normal 32px PingFangSC';
        remarktextarr.forEach(item=>{
          ctx.fillText(item.text,item.x,item.y+30);
        })
      }
      ctx.setFillStyle('#333')
      ctx.font = 'normal normal 42px PingFangSC';
      var titlearr = util.longTextEnter(contentarr['title'],650,this.data.RemarkHeight+124,42,1,60,true)
      titlearr.forEach((item,index)=>{
        ctx.fillText(item.text,item.x,item.y);
        if(index == titlearr.length-1){texty = item.y + 18}
      })
      var two = contentarr['content']
      for(var i=0; i<two.length;i++){
        if(texty > 1050) break;
        var one = two[i]
        if(one.keys == 'img'){
          var imgWidth;
          if(one.imgWidth>680){
            imgWidth = 680;
            one.imgHeight = one.imgHeight*(imgWidth/one.imgWidth)
          }else{
            imgWidth = one.imgWidth;
          }
          var x = (750 - imgWidth)/2
          ctx.drawImage( one.src , x , texty+50 , imgWidth, one.imgHeight);
          texty = texty + one.imgHeight+50
        }
        if(one.keys == 'txt'){
          var txtarr = util.longTextEnter(one.content,660,texty+102,32,1,58,false,35)
          ctx.setFillStyle('#333')
          ctx.font = 'normal normal 32px PingFangSC';
          txtarr.forEach((item,index)=>{
            ctx.fillText(item.text, item.x , item.y);
            if(index == txtarr.length-1){texty = item.y}
          })
        }
      }
      //底部信息
      ctx.save()
      ctx.setFillStyle('#fff');
      ctx.setShadow(0, -30, 60, 'rgba(255,255,255,0.95)')
      ctx.fillRect(0, 1050, 750, 290)
      ctx.setFillStyle('#666')
      ctx.fillRect(35, 1103, 140, 1)
      ctx.fillRect(575, 1103, 140, 1)
      ctx.setFillStyle('#000')
      ctx.font = 'normal normal 28px PingFangSC';
      ctx.fillText(text, 207,1115);
      ctx.save()
      this.drawRoundRect(ctx, 40, 1180, 80, 80, 40);
      ctx.clip()
      ctx.drawImage(localpath, 40, 1180, 80, 80);
      ctx.restore()
      ctx.setFillStyle('#000')
      ctx.font = 'normal normal 34px PingFangSC';
      ctx.fillText(name, 133, 1215);
      ctx.setFillStyle('#aaa')
      ctx.font = 'normal normal 26px PingFangSC';
      that.nameLeft(name, company, position,1215,1255)
      ctx.fillText(position, this.data.mleft, this.data.mTop);
      ctx.fillText(company, 133, 1255);
      this.drawRoundRect(ctx, 595,1160, 120, 120, 60,'#ffffff','#ffffff');
      ctx.clip()
      ctx.drawImage(localIdPath, 595, 1160, 120, 120);
      ctx.restore()
    }
    ctx.draw(false, function() {
      setTimeout(() => {
        wx.canvasToTempFilePath({
          canvasId: 'viewCanvas',
          success: function(res) {
            wx.hideLoading()
            var remarktext = toviewpagedata.comment;
            var title = toviewpagedata.title
            var posterData = {
              remarktext:remarktext,
              title:title
            }
            wx.setStorageSync('jobs',posterData)
            var title = toviewpagedata.title;
            message.sendBehavior(app.globalData.customerData.id,managerData.id,title,'tt',null,toviewpagedata.id);
            wx.navigateTo({
              url: '../../poster/poster?img=' + res.tempFilePath + '&key=' + 'jobs&keys='+'jobsb'
            })
          }
        }, this)
      }, 300);
    })
  },
  drawRoundRect(ctx, x, y, width, height, radius) {
    ctx.strokeStyle = "#f6f6f6";
    ctx.stroke();
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
  drawRoundRectColor(ctx, x, y, width, height, radius,strokeStyle,fillStyle,strokeFlag) {
    if(!strokeFlag){
      ctx.fillStyle = fillStyle ;
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
      if(strokeStyle != fillStyle){
        this.drawRoundRect(ctx, x, y, width, height, radius,strokeStyle,fillStyle,true)
      }
    }else{
      ctx.strokeStyle = strokeStyle;
      ctx.beginPath();
      ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
      ctx.lineTo(width - radius + x, y);
      ctx.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
      ctx.lineTo(width + x, height + y - radius);
      ctx.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2);
      ctx.lineTo(radius + x, height + y);
      ctx.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI);
      ctx.closePath();
      ctx.stroke();
    }
  },
  getImageInfo(url, callback) { //  图片缓存本地的方法
    var arr = []
    url.forEach((item, index) => {
      wx.getImageInfo({ //  小程序获取图片信息API
        src: item,
        success: function(res) {
          arr[index] = res.path
          callback(arr);
        },
        fail(err) {}
      })
    })
  },
  //职位定位
  nameLeft(name, company, position,nametop,companytop,y) {
    var nameStrL = name.length
    var cStrL = company.length
    var pStrL = position.length + cStrL
    if (pStrL <= 16) {
      this.data.mleft = this.data.mLeft + 1 + (26 * cStrL)
      this.data.mTop = companytop
    } else {
      this.data.mleft = this.data.mLeft + 10 + (34 * nameStrL)
      this.data.mTop = nametop
    }
  },
  //解决图片异步问题
  getContentArr(contentarr,index,y){
    var that = this
    var item = contentarr[index];
    if(item.keys == 'img'){
      this.getImageInfo([item.src],function(arr){
        if(arr[0] != undefined){
          item.src = arr [0] ;
          contentarr[index] = item;
          if(index<contentarr.length)index++;
          y = y + item.imgHeight;
          if(y<1334 && index < contentarr.length){
            that.getContentArr(contentarr,index,y);
          }
        }
      })
    }
    if(item.keys == 'txt'){
      var one = util.longTextEnter(item.content,510,y,32,1,42,false,35)
      contentarr[index] = item;
      if(index<contentarr.length)index++;
      y = y + one[one.length-1].y;
      if(y<1334 && index < contentarr.length){
        that.getContentArr(contentarr,index,y);
      }
    }
  },
})
