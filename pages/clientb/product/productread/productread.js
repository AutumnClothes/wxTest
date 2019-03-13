// pages/clienta/jobs/productread/productread.js
var util = require('../../../../utils/util.js')
var network = require('../../../../utils/network.js')
var message = require('../../../../utils/cusmessage.js')
var poster = require('../../../../utils/product-poster.js')
var app = getApp()
var fromListData = null;
var that = null;
var managerData=null;
var commentid = null;
var shareoptions = null;
var openidFromCode = null;
var hasCard = null;
var posterQRCodeid= null;
var hasCard = null;
var key = null;
var productTj = null;
var shareKey = false

Page({

  /**
   * 页面的初始数据
   */
  data: {
    productName: '产品阅读',
    operateShow: false,
    textareavalue: "",
    textareaTrue: true,
    textareaFocus: false,
    shareShow: false,
    needBack:true,
    exist:null,
    shareShow:false,
    comment:'',
    //海报
    showSaveButton:true,
    showCreateButton:true,
  },
  //点评按钮
  consult(e) {
    util.getFormIdB(e)
    wx.navigateTo({
      url: '/pages/clientb/realchat/realchat'
    })
  },
  closemeng() {
    this.setData({
      textareaTrue: true,
      textareaFocus: false,
    })
  },tomainpage(){
		if(shareoptions){
			wx.redirectTo({
				url:'../../clientb'
			});
		}
	},
  pageto(){
    wx.navigateTo({
      url: '../../../cardbox/cardbox?key=pageto',
    })
  },
  //shareShow
  shareShowBind() {
    this.setData({
      shareShow: true,
      textareaTrue: false,
      textareaFocus: true,
    })
  },
  //关闭shareShow
  unshareShowBind() {
    this.textareaEnd()
    this.setData({
      shareShow: false,
      textareaTrue: true,
      textareaFocus: false,
    })
  },
  textareainput(e) {
    this.data.textareavalue = e.detail.value;
  },
  textareaEnd() {
    this.setData({
      comment: this.data.textareavalue,
      textareaTrue: true
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu();
    shareoptions = null;
    that = this;
    fromListData = null;
    hasCard = null;
    productTj = null;
    let ch = util.systemTop() + 88
    let sh = util.systemHeight() - ch
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
      cH: ch,
      sH: sh
    })
    if(app.globalData.managerData){
      this.setData({
        showCreateButton:false
      })
    }
    shareKey = false
    if(options.keys == 'share')this.data.shareKey = true
    if(options['sharefrom']){  // 1.确认身份，注册，建立关系，拉取manager的信息
      shareoptions = options;
      this.setData({
        needBack:false
      });
			var  managerId = options['sharefrom'];
			managerData = {id:managerId};
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
											// message.sendBehavior(app.globalData.customerData.id,managerData.id,"",'rc',app.globalData.customerData.portraitpath,app.globalData.customerData.nickname);
										}
									}
								);
							});
						}else{ // 没有，去创建。
								that.data.getUserCallBack = 'addUser';
								that.getSetting(that.addUser);
            }
            
            if(app.globalData.managerData){
              that.setData({
                showCreateButton:false
              })
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
                
                var cplen = 0;
                if(md.company){
                  cplen +=md.company.length;
                }
                if(md.position){
                  cplen +=md.position.length;
                }
                if (cplen >= 13){
                  that.setData({
                    cpshow:true
                  })
                }else{
                  that.setData({
                    cpshow: false
                  })
                }
      
                var torealchatpage = {id:md.id,name:md.user_name,portraitpath:md.portrait_path,phone:md.mobile_phone,position:md.position,company:md.company};
                if(!torealchatpage.company)torealchatpage.company ='';
                if(!torealchatpage.position)torealchatpage.position ='';
                if(!torealchatpage.company && !torealchatpage.position){
                  torealchatpage.company = '您身边的专业顾问'
                  torealchatpage.position = ''
                }
                that.getProduct(torealchatpage)
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
              funcNo:'1044',
              id:shareoptions["productid"],
              creator:"id"
            }
            network.postRequest(articleData).then(function(r){
              if(r.error_no == '0'){
                if(r.data.length == 0){
                  that.setData({
                    exist:false
                  });
                  return ;
                }else{
                  that.setData({
                    exist:true
                  });
                }
                fromListData = r.data[0];
                that.hasCard();
                if (fromListData.tags != "" && fromListData.tags != null) {
                  var tags = fromListData.tags;
                  var tagsarr = tags.split(",");
                  fromListData.tagsarr = tagsarr;
                }
                fromListData.imgurl = util.clientbImage(fromListData.imgurl)
                that.setData({
                  product: fromListData,
                  title:fromListData.title
                });

                
                var fw = null;
						  	var eid = fromListData.id;
                if(shareoptions)fw =shareoptions["fromwho"];
                if(app.globalData.customerData){
                  if(message.getStatus()){
                    message.sendBehavior(app.globalData.customerData.id,managerData.id,fromListData.title,'rp',fw,eid);
                  }else{
                    var trytimes = 10;
                    var iid = setInterval(() => {
                      console.log("try");
                      if(message.getStatus()){
                        message.sendBehavior(app.globalData.customerData.id,managerData.id,fromListData.title,'rp',fw,eid);
                        clearInterval(iid);
                      }else if(trytimes == 0){
                        clearInterval(iid);
                      }
                      trytimes--;
                    }, 5000);
                  }
                }
                var src = "https://www.willsfintech.cn:9001/article?articleid=" + fromListData.articleid
                network.get(src).then(function(r) {
                  that.setData({
                    list: r
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
    if (headImgUrl != null && headImgUrl.indexOf("wills") != -1)
      headImgUrl = headImgUrl.substr(0, headImgUrl.length - 4) + "s.jpg";
    var cplen = 0;
    if(managerData.company){
      cplen +=managerData.company.length;
    }
    if(managerData.position){
      cplen +=managerData.position.length;
    }
    if (cplen >= 13) {
      this.setData({
        cpshow: true
      })
    } else {
      this.setData({
        cpshow: false
      })
    }
    this.setData({
      headimg: headImgUrl,
      managerData: managerData
    })
    var toproductreadpage = wx.getStorageSync("toproductreadpage");
    fromListData = toproductreadpage.data;
    that.hasCard();
    var eid = fromListData.id;
    message.sendBehavior(app.globalData.customerData.id,managerData.id,fromListData.title,'rp',null,eid);
    if (fromListData.tags != "" && fromListData.tags != null) {
      var tags = fromListData.tags;
      var tagsarr = tags.split(",");
      fromListData.tagsarr = tagsarr;
    }
    this.setData({
      product: fromListData
    });
    var comment = fromListData.comment;
    commentid = fromListData.commentid;
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
            that.data.comment = c
            that.setData({
              comment:c
            });
          }
        }
      });
    }else if(comment){
      that.data.comment = comment
      that.setData({
        comment:comment
      });
    }
    var src = "https://www.willsfintech.cn:9001/article?articleid=" + fromListData.articleid
    network.get(src).then(function(r) {
      if (r == "delete"){
        that.setData({
          exist:false
        });
        return;
      }else{
        that.setData({
          exist:true
        });
      }
      if(r==null || r=='')return;
      r.forEach(item=>{
        if(item.keys == 'img'){
          if(item.imgWidth > 648){
            let h = (648 / item.imgWidth) * item.imgHeight
            let w = 648
            item.style = 'width:'+ w + 'rpx;height:'+ h +'rpx';
          }
        }
      })
      that.setData({
        list: r
      });
    })
  },onLaunchCF(){
		if(this.data.managerData == null || fromListData == null)return;
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
      var theCardurl = "https://www.willsfintech.cn:9004/shareProductCard/" +
        fromListData.id+ ".jpg" + "?time=" + new Date().getTime();
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
  }, shareBind(e){
    util.getFormIdB(e)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    util.backexecute(function(r) {
      util.setBackexecute(1, null, null);
      var p = r.coverdata;
      var l = r.contentdata;
      var sd = {};
      sd["product"] = p;
      if (l) {
        sd["list"] = l;
      }
      that.setData(sd);
    });
  },messageInit:function(){
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
  freecard(){
    this.data.getUserCallBack = 'addManegerF';
    this.getSetting(this.addManegerF)
  },
  onGotUserInfo:function(res){
    var userInfo = res.detail["userInfo"];
    // {detail:{userInfo:{}}}
		if(userInfo){ // 如果有客户资料
			if(this.data.getUserCallBack == 'updateUserInfo'){
				this.updateUserInfo(res.detail);
			}else if(this.data.getUserCallBack == 'addUser'){
				this.addUser(res.detail);
			}else if(this.data.getUserCallBack == 'addManegerF'){
        this.addManagerF(res.detail)
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
				}else if(this.data.getUserCallBack == 'addManegerF'){
          this.addManagerF(res.detail)
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
              var eid = fromListData.id;
              if(shareoptions)fw =shareoptions["fromwho"];
              message.sendBehavior(app.globalData.customerData.id,managerData.id,fromListData.title,'rp',fw,eid);
            }//创立成功。  新建客户肯定创立成功。
					});
			});
			var msd = {data:
			'{"fromid":"'+managerData.id+'","contenttype":"text","content":"你好啊。。这是一条初始化消息","direction":"receive"}'
			}
			message.receiveMessage(msd);
		})
  },
  addManegerF(res){
    var ui = res.userInfo
    var openidFromCode = wx.getStorageSync('openidFromCode')
    var addData = {
      openid : openidFromCode,
      portrait:ui.avatarUrl,
      nickname:ui.nickName,
      iv:res.iv,
      encryptedData:res.encryptedData
    }
    if(app.globalData['customerData'] && app.globalData['customerData'].unionid){
      addData['unionid'] = app.globalData['customerData'].unionid
    }
    wx.setStorageSync('fromcardboxTocard',addData);
    wx.redirectTo({url:'../../../clienta/mine/card/card'})
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
			entrancetype:'2'
    }
    createRelation["entranceid"] = shareoptions["productid"];
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
        url:"../../clientb"
      });
    }else{
      wx.navigateBack({
        delta:1
      });
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    var title = fromListData.title;
    message.sendBehavior(app.globalData.customerData.id,managerData.id,title,'tp',null,fromListData.id);
		var shareobj = {
      title: title
    }
    if(hasCard){
      shareobj["imageUrl"] =hasCard;
    }
		var path= "pages/clientb/product/productread/productread?productid="+fromListData.id
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
  settingFormid(e){//授权事件发送formid
    if(app.globalData.managerData){
      util.getFormId(e)
    }else{
      util.getFormIdB(e)
    }
  },
  unshareShowBind(e){
    if(app.globalData.managerData){
      util.getFormId(e)
    }else{
      util.getFormIdB(e)
    }
    this.setData({
      shareShow:false
    })
  },
  toproductList(){
    var tj = wx.getStorageSync("tuijian");
    console.log(shareoptions)
    if(tj == 'realchat'){//判断是否是从聊天进入
      util.setBackexecute(2,'tuijiantorealchat')
      wx.navigateBack({delta:2})
    }else if(tj == 'card'){
      util.setBackexecute(1,'tuijiantocard')
      wx.navigateBack({delta:1})
    }else if(this.data.shareKey || shareoptions){//从分享进入
      wx.setStorageSync('shareTuijian','share')
      wx.redirectTo({
				url:'../../clientb'
			});
    }else{//列表进入
      wx.navigateBack({delta:1})
    }
  },
  toproduct(e) {
    var thisId = this.data.product.id
    var thatId = this.data.productTj.id
    if(thisId == thatId){return;}
    wx.setStorageSync("toproductreadpage",{data:this.data.productTj});
    if(this.data.shareKey || shareoptions){
      wx.redirectTo({
        url: "../productread/productread?keys=share"
      })
      return;
    }
    wx.redirectTo({
      url: "../productread/productread"
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
  //海报
  posterPre(e){
    util.getFormIdB(e)
    var commentid = new Date().getTime()+""+app.globalData.customerData.id;
    var id= commentid;
    var posterQRCodeid = id;
    var param= "/pages/clientb/product/productread/productread?productid="+fromListData.id
    +"&sharefrom="+managerData.id+"&fromwho="+app.globalData.customerData.id;
    var referenceData = {
      funcNo:'1049',
      id:id,
      param:param
    }
    network.postRequest(referenceData).then(function(r){
      if(r.error_no == '0'){
        // TODO   画图      必须要等请求回复。因为图片可能还没有画好。
        var posterData = {
          id:id,
          managerData:managerData,
          comment:that.data.comment,
          fromListData:fromListData,
          list:that.data.list,
          posterQRCodeid:posterQRCodeid,
          keys:'jobsb'
        }
        poster.posterBind(posterData);
        var title = fromListData.title;
        message.sendBehavior(app.globalData.customerData.id,managerData.id,title,'tp',null,fromListData.id);
      }
    });
  },
  /*******************分享海报************************/
  
})
