// pages/clienta/mine/213/321.js
var util = require('../../../utils/util.js')
var network = require('../../../utils/network.js')
var api= require('../../../utils/api.js')
var message = require('../../../utils/cusmessage.js')
var managerData = null;
var app = getApp();
var compose;
var that = null;
Component({
  /**
   * 组件的属性列表
   */
  options: {
    addGlobalClass: true,
  },
  properties: {
    tab1: {
      type: Boolean,
      value: ''
    },
    scrollHight: {
      type: Number,
      value: ''
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    backone: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAAAiCAYAAAAAl7SxAAAA40lEQVRoge3VwW3CQBAF0AdKC45EC5BGuNAEaYtjOgp0kBBBC0jJYY0sO8uVlTzzJV+8l9HTfM3i92Onki0OWNUeZ5Qz9osHCN/mD3DPeVn52YkDAC81hPXTx2ibUyI8QHh7+hht85mbkHVABaHDa4tJGuWKyxQh3BZAIviPEO4ykJtQ3YRNg0Fa5sgYoeu/KLn23wghZBVIBIwRQl4GchMwRgh5GRgQwl4GBoSwVWBACFsFEgFZB+QmoCCEvgwUhNBVoCCErgKJgKwDchNQEG4NBmmVH5PLQEF47x/nni/saw9/DNUu6wGRz0sAAAAASUVORK5CYII=',
    backtwo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAAAiCAYAAAAAl7SxAAAA40lEQVRoge3VwW3CQBAF0AdKC0aiBUgjXOggJ9JWugp0kBBBC0jhsI4sO8uVlTzzJV+8l9HTfM3i922vkh0+sK49zihnHBYPEL7NH+Av52XlZycOALzUEDZPH6NtTonwAOH16WO0zWduQtYBFYQOqxaTNMoVlylCuC2ARPAfIdxlIDehugnbBoO0zJExQtd/UXLtvxFCyCqQCBgjhLwM5CZgjBDyMjAghL0MDAhhq8CAELYKJAKyDshNQEEIfRkoCKGrQEEIXQUSAVkH5CagINwaDNIqPyaXgYLw3j/OPV841B7u1pEuWwQe4TEAAAAASUVORK5CYII=',
    mengShow:false,
    shareShow:false,
    scrollOpacity:'0.5',
    subjectHeight:'420',
    subjectWidth:'620',
    intoView:'',
    scollUpTop:true,
    endTop:'',
    scrollEndTop:'',
    spot:'',
    ytop:'',
    mdcompany:'',
    //动画数据
    syswidth:'',
    starty: '',
    scrolly:'',
    cssTrue:'',
    pwidth:1000,
    ptop: 1000,
    watch : true,
    cytrue:true,
    full:'全文',
    fullshow:'',
    fullStyle:'',
    titleStyle:'',
    //名片联系（第二个容器）数据
    contact:[
      { text: '咨询顾问获得电话', icon: '/image/img/phone.png', fc: '拨打', iconStyle: 'width:19rpx;height:24rpx' },
      { text: '', icon: '/image/img/tele.png', fc: '拨打', iconStyle: 'width:26rpx;height:23rpx' },
      { text: '', icon: '/image/img/weixin.png', fc: '复制', iconStyle: 'width:31rpx;height:25rpx' },
      { text: '', icon: '/image/img/email.png', fc: '复制', iconStyle: 'width:24rpx;height:20rpx' },
      { text: '您身边的专业顾问', icon: '/image/img/company.png', fc: '复制', iconStyle: 'width:25rpx;height:23rpx' },
      { text: '咨询顾问获取详细地址', icon: '/image/img/address.png', fc: '复制', iconStyle: 'width:20rpx;height:28rpx' },
    ],
    //个人简介（第三个容器）数据
		manager:{},
    //我的标签
    tagList: ['专业', '独立', '以客户为中心'],
    //分享数据
    shareList:[
      {id:1, text:'微信分享',icon:'/image/img/wx.png'},
      {id:2, text: '名片海报', icon: '/image/img/mphb.png' },
      {id:3, text: '存通讯录', icon: '/image/img/ctxl.png' },
    ],
    //推荐产品测试数据
    product:null,
    //引导数据
    guidance1:false, //红点
    guidanceTxt:'点此创建你的专属名片',//弹出框文字
    //最新动态测试数据
    dynamic:null,
    showCreateButton:true
  },
  attached(){
		// wx.hideShareMenu({});
    
  },
  pageLifetimes:{
    show:function() { 
      this.sharefalse()
      
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    showGuidance(){
      wx.getStorage({  // 引导。
        key:"BGuidanceFlow",
        success:function(r){
          if(!r || !r.data){
            return;
          }
          var bgf =  r.data;
          if(bgf["card"]){
            setTimeout(function(){
              that.setData({
                guidance:true
              });
              bgf["card"] = false;
              wx.setStorageSync("BGuidanceFlow",bgf);
            },5000);
            setTimeout(function(){
              that.setData({
                guidance:false
              });
            },300000);
          }
        }
      });
    },onLaunchCF(){
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
    },
    getProduct(mid){
      var rd = {
        funcNo:"1044",
        creator:mid
      }
      network.postRequest(rd).then(function(r){
        if(r.error_no == '0'){
          var l = r.data  ;
          var p = null;
          
          for(var i = 0 ; i< l.length; i++){
            var one = l[i];
            if(one["private"] == '1'){
              continue;
            }
            if(one.tags){
              one.tagsarr = one.tags.split(",");
            }
            if(one.keyp1 == null){
              one.keyp1 = "";
            }
            if(one.keyp2 == null){
              one.keyp2 = "";
            }
            if(one.keyp3 == null){
              one.keyp3 = "";
            }
            p = one;
            break;
          }
          // p.imgurl = util.clientbImage(p.imgurl)
          that.setData({
            product:p
          });
        }
      });
    },getMoment(mid){
      var rd = {
        funcNo: "1047",
        creator: mid
      }
      network.postRequest(rd).then(function(r) {
        if (r.error_no == '0') {
          var l = r.data;
          if(l.length !=0 ){
            var one =l[0]; // 默认是 时间倒序
            if(one.articleid!=null || one.productid !=null){
              one.background = "2";
            }else{
              one.background = "1";
            }
            if(one.productid !=null){
              var product = JSON.parse(one.productid);
              product.tagsarr = "";
              if(product.tags){
                product.tagsarr= product.tags.split(",");
              }
              product.productid = product.id;
              delete product.id;
              delete product.time;
              Object.assign(one,product);
            }else if(one.articleid !=null){
              var article = JSON.parse(one.articleid);
              article.imgurl = util.getArticleTitleImg(article);
              article.articletimestr = util.getShowTimeStr(article.scratchtime);
              article.articleid = article.id;
              delete article.id;
              Object.assign(one,article);
            }
            if(one.images){
              one.imagesarr = one.images.split(",");
            }
            one.timestr = util.getShowTimeStr(one.time);
            if(one.imagesarr){
              if(one.background == '1' && one.imagesarr.length == 1){
                one.style = 'width:258rpx;height:258rpx'
              }
            }
            that.setData({
              dynamic:one
            });
            that.querychange();
          }else{
            that.setData({
              dynamic:null
            });
          }
        }
      });
    },
    tipsControl(flag){// 关注过的顾问都将在此     
      if(flag){
        this.setData({
          guidance:true,
          guidanceTxt:"点此返回顾问身份"
        });
      }else{
        this.setData({
          guidance:false
        });
      }
    },redDotControl(){
      wx.getStorage({
        key:"bCardRedDot",
        success:function(r){
          if(!r || !r.data){
            return;
          }
          var bCardRedDot =  r.data;
          if(bCardRedDot){
            that.setData({
              guidance1:true
            });
            setTimeout(() => {
              if(!that.data.guidance){
                that.setData({
                  guidance:true,
                  guidanceTxt:"关注过的顾问都将在此"
                });
              }
            }, 5000);
            setTimeout(() => {
              that.setData({
                guidance:false
              });
            }, 10000);
          }
        }
      });
    },
		tapchange(){
      
      that = this; 
			wx.getSystemInfo({
				success: function(res) {
					that.data.syswidth = res.windowWidth/750
				},
      })
      if(app.globalData.managerData){
        this.setData({
          showCreateButton:false
        });
      }
			let lt = util.systemTop()
			let h = util.systemTop() + 100
			let sh = util.systemHeight()-h -100
      let gh = 32*util.gHeight()
      let gt = (lt + gh)+14
			this.setData({
				cH: h,
				sH:sh,
				lT: lt,
        gH:gh,
        gT:gt
      })
      wx.getStorage({
        key:"guidanceonceData",
        success:function(r){
          if(!r || !r.data){
            return;
          }
          var gd =  r.data;
          if(gd.bcard){
            setTimeout(() => {
              that.tipsControl(true);  
            }, 4000);
            setTimeout(() => {
              that.tipsControl(false);  
            }, 10000);
            gd.bcard = false;
            wx.setStorageSync("guidanceonceData",gd);
          }
        }
      });
			// 数据初始化
			managerData = wx.getStorageSync("watchManagerId"); //进入之前应该有，
			wx.removeStorage({
				key:"watchManagerId"
			})
      var managerId =  managerData.id;
      this.getProduct(managerId);
      this.getMoment(managerId);
			var mdata = {
				funcNo:"1022",
				id:managerId
			}
			network.postRequest(mdata).then(function(res){
				if(res.error_no == '0'){
					var md = res.data[0];
					for(var i in md){
						if(md[i] == null){
							md[i] = '';
						}
          }
          if(md.city)
					  md.city =md.city.replace(",","").replace(",","").replace(",","");
          that.data.canvasData = md
          var list = md.key_word
          if (typeof (list) == 'string' && list.length != 0) {
            md.key_word = md.key_word.split(',')
          }
					if(md.portrait_path!=null &&  md.portrait_path.indexOf("qlogo")!=-1){
						md.portrait_path = md.portrait_path.substr(0,md.portrait_path.length-3)+"0";
          }
          if (md.company == '' || md.company == null) md.company = "";
          if (md.position == '' || md.position == null) md.position = '';
          if ((md.company == '' || md.company == null) && (md.position == '' || md.position == null))md.position = '您身边的专业顾问' 
					that.setData({
						manager:md
					});
					var contact = that.data.contact;
					var fields = ["mobile_phone","telephone","wechat","email",'company','address'];
					var newArray = [];
					for(var i = 0 ; i< fields.length ; i++){
						var one = fields[i];
						var two = contact[i];
						if(md[one]){
							two["text"] = md[one];
							two["key"] = one;
							if(one == 'address'){
								two["text"] =md.city+ md[one];
								two["key"] = one;
							}
						}else{
              if(two.text != ''){
                two["key"] = one;
              }
            }
            newArray.push(two);
					}
					that.setData({
						contact:newArray
					})
					var torealchatpage = {
            id:md.id,
            name:md.user_name,
            portraitpath:md.portrait_path,
            phone:md.mobile_phone,
            position:md.position,
            company:md.company,
            profile:md.profile,
            city:md.city
          };
					wx.setStorageSync("tochatpagewmanager",torealchatpage);
					// 聊天界面 需要用到的数据。
          that.composeLength(md)
          that.allunde(md)

          that.onLaunchCF();
				}
			});
		},
    composeLength(md) {
      let composeLength = md.company.length + md.position.length
      if (composeLength <= 16) {
        this.setData({
          compose: true
        })
      } else {
        this.setData({
          compose: false
        })
      }
    },
    sharefalse() {
      this.data.shareShow = false;
      this.setData({
        mengShow: false,
        shareShow: false,
      })
    },
    //存通讯录
    storageBind(e) {
      util.getFormIdB(e)
      let phone = e.currentTarget.dataset.phoneNum
      let name = e.currentTarget.dataset.name
      if((phone == '' || phone== null) || (name == '' || name== null)){
        wx.showToast({
          title: '资讯顾问获得电话',
          icon:'none'
        })
      }else{
        if (phone.length > 3) {
          message.sendBehavior(app.globalData.customerData.id,managerData.id,"",'sc');
          wx.addPhoneContact({
            firstName: name,//姓名
            mobilePhoneNumber: phone,//手机
          })
        } else{
          wx.showToast({
            title: '请正确输入联系电话',
            icon:'none'
          })
        }
      }
    },
    //分享
    shareBind(){
      if (this.data.shareShow){
        this.sharefalse()
      }else{
        this.data.shareShow = true;
        this.setData({
          shareShow:true,
          mengShow:true,
        })
      }
    },contacttap(e){
			var text = e.currentTarget.dataset.text;
			var key = e.currentTarget.dataset.key;
			if(key == 'telephone' || key == 'mobile_phone'){
				// 拨打
				wx.makePhoneCall({
					phoneNumber:text
				});
			}else{
				wx.setClipboardData({
					data:text
				})
			}
		},
		leftup(){
			message.closeConnection(function(){
				wx.redirectTo({
					url:"../../pages/cardbox/cardbox"
				});
			});
			
		},
    posterBind(e){
      util.getFormIdB(e)
      var data = this.data.canvasData
      if (data.company == '' || data.company == null){
        if (data.position == '' || data.position == null){data.company = '您身边的专业顾问'}
      }
      if (data.mobile_phone == '' || data.mobile_phone == null) { data.mobile_phone = '咨询顾问获得电话'}
      if (data.city == '' || data.city == null) { data.city = '时刻在客户身边'}
      if (data.profile == '' || data.profile == null) { data.profile = '您身边共享资讯的学习导师、随时助您理解的产品专家、了解客户全面需求的贴心管家'}
      this.triggerEvent('posterBind', data);
    },
    //公司职位都为空时的缺省
    allunde(md) {
      var company = md.company
      var position = md.position
      if (company == null || company == '') {
        if (position == null || position == '') {
          this.setData({
            mdcompany: false
          })
        }
      } else {
        this.setData({
          mdcompany: true
        })
      }
    },toproductlist(e){
      util.getFormIdB(e)
      this.triggerEvent('toproductlist', null,null);
    },toMomentList(e){
      util.getFormIdB(e)
      this.triggerEvent('toMomentList', null,null);
    },imageview(e){
      var ind = e.currentTarget.dataset.ind;
      var one = that.data.dynamic;
      var imagesarr = one.imagesarr;
      wx.previewImage({
        urls:imagesarr,
        current:imagesarr[ind]
      })
    },toarticleview(){
      var one = this.data.dynamic;
      one = api.deepcopy(one);
      one.id = one["articleid"];
      one.commentid = one["images"];
      var td = {
        id:one.articleid,
        title:one.title,
        nickname:one.nickname,
        commentid:one.commentid,
        comment:one.comment,
        type:one.type,
        scratchtime:one.scratchtime,
        pathid:one.pathid
      }
      wx.setStorageSync("toviewpagedata",td);
      wx.navigateTo({
        url:"/pages/clientb/view/view"
      });
    },toproductview(){
      var one = this.data.dynamic;
      one = api.deepcopy(one);
      one.id = one.productid;
      one.commentid = one["images"];
      var td = {
        id:one.productid,
        articleid:one.articleid,
        title:one.title,
        tags:one.tags,
        comment:one.comment,
        commentid:one.commentid,
        up:one.up,
        private:one.private,
        style:one.style,
        imgurl:one.imgurl,
        profile:one.profile,
        key1:one.key1,
        keyp1:one.keyp1,
        key2:one.key2,
        keyp2:one.keyp2,
        key3:one.key3,
        keyp3:one.keyp3,
      }
      wx.setStorageSync("toproductreadpage", { data: td });
      wx.navigateTo({
        url:'/pages/clientb/product/productread/productread'
      })
    },
    toproduct(){
      wx.setStorageSync("toproductreadpage", { data: this.data.product });
      wx.setStorageSync('tuijian','card')
      wx.navigateTo({
				url:'/pages/clientb/product/productread/productread'
			})
    },
    //全文<>收起
    fullBind(){
      if(this.data.fullshow){
        if(this.data.full=='全文'){
            this.data.full = '收起',
            this.data.fullStyle = 'position:static',
            this.data.titleStyle = 'max-height:9999rpx'
        }else{
          this.data.full = '全文',
          this.data.fullStyle = '',
          this.data.titleStyle = ''
        }
        this.setData({
          full:this.data.full,
          fullStyle:this.data.fullStyle,
          titleStyle:this.data.titleStyle
        })
      }
    },
    querychange(){
      var that = this
      const query = wx.createSelectorQuery().in(this)
      query.select(".dynamic-item-title").fields({
        size:true
      },function(r){
        if(!r)return;
        let h = r.height / util.rHeight()
        if(h>310){
          that.data.fullshow = true
        }else{
          that.data.fullshow = false
        }
        that.setData({
          fullshow:that.data.fullshow,
        })
      }).exec();
    },
    //免费创建理财顾问专业名片
    freecard(e){
      util.getFormIdB(e);
      this.triggerEvent("addManager",null,null);
    }
  }
})
