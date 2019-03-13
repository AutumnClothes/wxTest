// pages/clienta/mine/213/321.js
var util = require('../../../../utils/util.js')
var api = require('../../../../utils/api.js')
var config = require('../../../../config.js')
var network = require('../../../../utils/network.js')
var managerData = null;
var app = getApp();
var compose;
var that = null;
var fromcardboxTocard = null;
var timeoutno = null;
var inCourse7 = null;
Page({
  /*
   * 组件的初始数据
   */
  data: {
    backone: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAAAiCAYAAAAAl7SxAAAA40lEQVRoge3VwW3CQBAF0AdKC45EC5BGuNAEaYtjOgp0kBBBC0jJYY0sO8uVlTzzJV+8l9HTfM3i92Onki0OWNUeZ5Qz9osHCN/mD3DPeVn52YkDAC81hPXTx2ibUyI8QHh7+hht85mbkHVABaHDa4tJGuWKyxQh3BZAIviPEO4ykJtQ3YRNg0Fa5sgYoeu/KLn23wghZBVIBIwRQl4GchMwRgh5GRgQwl4GBoSwVWBACFsFEgFZB+QmoCCEvgwUhNBVoCCErgKJgKwDchNQEG4NBmmVH5PLQEF47x/nni/saw9/DNUu6wGRz0sAAAAASUVORK5CYII=',
    backtwo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAAAiCAYAAAAAl7SxAAAA40lEQVRoge3VwW3CQBAF0AdKC0aiBUgjXOggJ9JWugp0kBBBC0jhsI4sO8uVlTzzJV+8l9HTfM3i922vkh0+sK49zihnHBYPEL7NH+Av52XlZycOALzUEDZPH6NtTonwAOH16WO0zWduQtYBFYQOqxaTNMoVlylCuC2ARPAfIdxlIDehugnbBoO0zJExQtd/UXLtvxFCyCqQCBgjhLwM5CZgjBDyMjAghL0MDAhhq8CAELYKJAKyDshNQEEIfRkoCKGrQEEIXQUSAVkH5CagINwaDNIqPyaXgYLw3j/OPV841B7u1pEuWwQe4TEAAAAASUVORK5CYII=',
    mengShow: false,
    shareShow: false,
    scrollOpacity: '0.5',
    subjectHeight: '420',
    subjectWidth: '620',
    intoView: '',
    scollUpTop: true,
    endTop: '',
    scrollEndTop: '',
    startY: '',
    spot: '',
    strs: '',
    stre: '',
    mLeft: 105,
    mleft: '',
    mTop: 713,
    canvasData: [],
    //名片主体框（第一个容器）数据

    //名片联系（第二个容器）数据
    thecontact: [{
        text: '咨询顾问获得电话',
        icon: '/image/img/phone.png',
        fc: '拨打',
        iconStyle: 'width:19rpx;height:24rpx'
      },
      {
        text: '',
        icon: '/image/img/tele.png',
        fc: '拨打',
        iconStyle: 'width:26rpx;height:23rpx'
      },
      {
        text: '',
        icon: '/image/img/weixin.png',
        fc: '复制',
        iconStyle: 'width:31rpx;height:25rpx'
      },
      {
        text: '',
        icon: '/image/img/email.png',
        fc: '复制',
        iconStyle: 'width:24rpx;height:20rpx'
      },
      {
        text: '您身边的专业顾问',
        icon: '/image/img/company.png',
        fc: '复制',
        iconStyle: 'width:25rpx;height:23rpx'
      },
      {
        text: '咨询顾问获取详细地址',
        icon: '/image/img/address.png',
        fc: '复制',
        iconStyle: 'width:20rpx;height:28rpx'
      },
    ],
    //个人简介（第三个容器）数据
    manager: {},
    //我的标签
    tagList: ['专业', '独立', '以客户为中心'],
    //分享数据
    shareList: [{
          id: 1,
          text: '微信分享',
          icon: '/image/img/wx.png'
        },
        {
          id: 2,
          text: '名片海报',
          icon: '/image/img/mphb.png'
        },
        {
          id: 3,
          text: '存通讯录',
          icon: '/image/img/ctxl.png'
        },
      ]
      //推荐产品测试数据
      ,
    product: null,
    backmethod: null,
    confirmText: true,
    guidance4:false,//生成名片海报
    full:'全文',
    fullshow:'',
    fullStyle:'',
    titleStyle:'',
    //最新动态测试数据
    dynamic:null
  },
  getProduct() {
    var rd = {
      funcNo: "1044",
      creator: app.globalData.managerData.id
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
          product: p
        });
      }
    });
  },getMoment(){
    var rd = {
      funcNo: "1047",
      creator: app.globalData.managerData.id
    }
    network.postRequest(rd).then(function(r) {
      if (r.error_no == '0') {
        var l = r.data;
        if(l.length !=0 ){
          var one =l[0]; // 默认是 时间倒序
          // console.log(o);
          
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
  },toMomentlist(e){
    util.setBackexecute(0,'dynamic');
    util.getFormId(e)
    wx.navigateTo({
      url: "../../jobs/column/column"
    });
  },imageview(e){
		var ind = e.currentTarget.dataset.ind;
		var one = that.data.dynamic;
		var imagesarr = one.imagesarr;
		wx.previewImage({
			urls:imagesarr,
			current:imagesarr[ind]
		})
  },
  onLoad: function(options) {
    wx.hideShareMenu();
    that = this;
    let h = util.systemTop() + 100
    let sh = util.systemHeight() - h - 100
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
      cH: h,
      sH: sh
    })
    // 数据初始化

    fromcardboxTocard = wx.getStorageSync("fromcardboxTocard");

    if (fromcardboxTocard) {
      // console.log("guidance");
      wx.removeStorage({
        key: "fromcardboxTocard"
      });
      managerData = {};
      managerData["user_name"] = fromcardboxTocard["nickname"];
      managerData["portrait_path"] = fromcardboxTocard["portrait"];
      that.setData({
        guidance: true,
        confirmText: false
      });
      setTimeout(function() {
        that.setData({
          guidance: false
        });
      }, 10000);
    } else {
      managerData = (app.globalData.managerData);
      this.getProduct();
      this.getMoment();
    }
    var md = api.deepcopy(managerData);
    this.allunde(md)
    if (md.city)
      md.city = md.city.replace(",", "").replace(",", "").replace(",", "");
    this.data.canvasData = md
    var list = md.key_word
    if (typeof(list) == 'string' && list.length != 0) {
      md.key_word = md.key_word.split(',')
    }
    if (md.portrait_path != null && md.portrait_path.indexOf("qlogo") != -1) {
      md.portrait_path = md.portrait_path.substr(0, md.portrait_path.length - 3) + "0";
    }
    if (md.company == '' || md.company == null) md.company = "";
    if (md.position == '' || md.position == null) md.position = '';
    if ((md.company == '' || md.company == null) && (md.position == '' || md.position == null)) md.position = '您身边的专业顾问'
    this.setData({
      manager: md
    });
    var contact = this.data.thecontact;
    var fields = ["mobile_phone", "telephone", "wechat", "email", 'company', 'address'];
    var newArray = [];
    for (var i = 0; i < fields.length; i++) {
      var one = fields[i];
      var two = contact[i];
      if (md[one]) {
        two["text"] = md[one];
        two["key"] = one;
        if (one == 'address') {
          two["text"] = md.city + md[one];
          two["key"] = one;
        }
      } else {
        if (two.text != '') {
          two["key"] = one;
        }
      }
      newArray.push(two);
    }
    this.setData({
      contact: newArray
    })
    //控制公司及职位展示
    this.composeLength(md)
    //控制全文功能
    
    inCourse7 = null;
    wx.getStorage({
      key:"course",
      success:function(r){
        var ad = r.data;
        if(!ad){
          return ;
        }
        if(!ad[7]){
          inCourse7 = true;
          that.setData({
            guidance4:true
          })
          //TODO 展示 黑色提示框。 生产名片海报。
        }
      }
    })
  },
  closeguidance1() {
    this.setData({
      guidance1: false,
      guidance3: true,
      backmethod: "back"
    })
  },
  /**
   * 方法列表
   */
  composeLength(md) {
    let composeLength = 0;
    if (md.company) {
      composeLength += md.company.length;
    }
    if (md.position) {
      composeLength += md.position.length;
    }
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
  onShareAppMessage: function() {
    if (fromcardboxTocard) {
      // 关闭
      that.setData({
        guidance1: false
      });

      setTimeout(function() {
        that.setData({
          guidance2: true
        });
      }, 1000);

      if (timeoutno != null)
        clearTimeout(timeoutno);
    }
    var md = app.globalData.managerData;
    var path = '/pages/clientb/clientb?sharefrom=' + md.id;
    if (fromcardboxTocard) {
      path += "&guidance=1"
    } else {
      var cusdataMapForInfomation = wx.getStorageSync("cusdataMapForInfomation");
      if (JSON.stringify(cusdataMapForInfomation) == "{}") {
        path += "&guidance=1"
      }
    }
    var title = "您好，这是我的名片，请惠存：";
    if (md.company) {
      title += md.company;
    }
    if (md.position) {
      title += md.position;
    }
    if (md.user_name) {
      title += md.user_name;
    }
    var shareobj = {
      title: title,
    }
    var shareobj = {
      title: title,
    }
    shareobj["path"] = path;
    shareobj["imageUrl"] = "https://www.willsfintech.cn:9004/shareCard/" +
      app.globalData.managerData.id + ".jpg" + "?time=" + new Date().getTime();
    return shareobj;
    // 除了文章。名片，产品。部分地方可以转发。其他地方不可以转发。
  },
  toclienta() {
    wx.redirectTo({
      url: "../../clienta"
    });
  },
  onShow() {
    if(inCourse7){
      wx.getStorage({
        key:"course",
        success:function(r){
          var ad = r.data;
          if(!ad){
            return ;
          }
          if(ad[7]){
            inCourse7 = false;
            //TODO  隐藏 黑色提示框。 “生产名片海报。”
          }
        }
      })
    }
    this.sharefalse();
    util.backexecute(function() {
      managerData = app.globalData.managerData;
      var md = api.deepcopy(managerData);
      that.allunde(md)
      if (md.city)
        md.city = md.city.replace(",", "").replace(",", "").replace(",", "");
      if (md.portrait_path != null && md.portrait_path.indexOf("qlogo") != -1) {
        md.portrait_path = md.portrait_path.substr(0, md.portrait_path.length - 3) + "0";
      }
      that.data.canvasData = md
      if (md.company == '' || md.company == null) md.company = '';
      if (md.position == '' || md.position == null) md.position = '';
      if ((md.company == '' || md.company == null) && (md.position == '' || md.position == null)) md.position = '您身边的专业顾问'
      that.setData({
        manager: md,
      });
      that.composeLength(md)
      var contact = that.data.thecontact;
      var fields = ["mobile_phone", "telephone", "wechat", "email", 'company', 'address'];
      var newArray = [];
      for (var i = 0; i < fields.length; i++) {
        var one = fields[i];
        var two = contact[i];
        if (md[one]) {
          two["text"] = md[one];
          two["key"] = one;
        } else {
          if (two.text != '') {
            two["key"] = one;
          }
        }
        newArray.push(two);
      }
      that.setData({
        contact: newArray
      })
      that.getMoment();
    });
    util.backexecute(function(){that.getProduct();},'product')
    util.backexecute(function(){that.getMoment();},'dynamic')
    util.backexecute(function() {
      // 创建成功之后的。
      that.setData({
        guidance1: true
      });
      timeoutno = setTimeout(function() {
        that.setData({
          guidance1: false,
          guidance3: true,
          backmethod: "back"
        });
      }, 5 * 60000);
    }, "guidance");
  },
  //分享
  shareBind() {
    if (fromcardboxTocard && !app.globalData.managerData) {
      wx.showToast({
        title: '创建名片后再分享哦',
        icon: "none"
      });
      return;
    }
    this.setData({
      guidance4:false
    });
    if (this.data.shareShow) {
      this.sharefalse()
    } else {
      this.data.shareShow = true;
      this.setData({
        shareShow: true,
        mengShow: true,
      })
    }
  },
  contacttap(e) {
    if (fromcardboxTocard) return;
    util.getFormId(e)
    var text = e.currentTarget.dataset.text;
    var key = e.currentTarget.dataset.key;
    console.log(key)
    if (key == 'telephone' || key == 'mobile_phone') {
      // 拨打
      wx.makePhoneCall({
        phoneNumber: text
      });
    } else {
      wx.setClipboardData({
        data: text
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
  //公司职位都为空时的缺省
  allunde(md) {
    var company = md.company
    var position = md.position
    if ((company == null || company == '') && (position == null || position == '')) {
      this.setData({
        mdcompany: false
      })
    } else {
      this.setData({
        mdcompany: true
      })
    }
  },
  //跳个人名片编辑
  editBind() {
    util.setBackexecute(0);
    this.setData({
      guidance: false
    })
    this.sharefalse();
    if (fromcardboxTocard && !app.globalData.managerData) {

      wx.setStorageSync("fromcardboxTocard", fromcardboxTocard);

      wx.showLoading({
        mask: true
      });
      fromcardboxTocard["funcNo"] = '1020';
      network.postRequest(fromcardboxTocard).then(function(addData) {
        if (addData.error_no == '0') {
          app.globalData.managerData = {
            id: addData.managerid,
            portrait_path: fromcardboxTocard.portrait,
            user_name: fromcardboxTocard.nickname
          };
          if (addData.portrait) {
            app.globalData.managerData["portrait_path"] = addData.portrait;
          }
          wx.hideLoading();
          util.setBackexecute(0, "guidance", null);
          wx.setStorageSync("fromcreateToclienta", {
            once: true
          });
          wx.setStorage({
            key: "guidanceonceData",
            data: {
              mine: true,
              job: true,
              cusd: true,
              bcard:true,
              cardbox:true
            }
          });
          wx.setStorage({ //教程    0是start。
            key:"course",
            data:[false,
                  false,false,false,false,
                  false,false,false,false,]
          });
          that.setData({
            confirmText: true
          })
          wx.navigateTo({
            url: '../editcard/editcard',
          })
        }else{
          wx.showToast({
            title:"创建失败",
            icon:"none",
            duration:3000
          });
        }
      });
    } else {
      wx.navigateTo({
        url: '../editcard/editcard',
      })
    }
  },
  // 授权弹框 ，可复用。样式，js同
  //accreditShow弹框显示控制,accreditList弹框内容
  bindShow() {
    this.setData({
      accreditShow: true
    })
  },
  //左上关闭
  closeBind() {
    this.setData({
      accreditShow: false
    })
  },
  //前往授权
  accreditTo() {
    this.setData({
      accreditShow: false
    })
  },
  //存通讯录
  storageBind(e) {
    if (fromcardboxTocard) return;
    util.getFormId(e)
    let phone = e.currentTarget.dataset.phoneNum
    let name = e.currentTarget.dataset.name
    if ((phone == '' || phone == null) || (name == '' || name == null)) {
      wx.showToast({
        title: '请正确输入联系电话',
        icon: 'none'
      })
    } else {
      if (phone.length > 3) {
        wx.addPhoneContact({
          firstName: name, //姓名
          mobilePhoneNumber: phone, //手机
        })
      } else {
        wx.showToast({
          title: '请正确输入联系电话',
          icon: 'none'
        })
      }
    }
  },
  //名片海报
  posterBind(e) {
    util.getFormId(e)
    var data = this.data.canvasData
    var name = data.user_name //名字
    if (name.length > 6) {
      name = name.substring(0, 5) + '...'
    }
    if (data.company == '' || data.company == null) {
      data.company = "";
      if (data.position == '' || data.position == null) {
        data.position = '您身边的专业顾问'
      }
    }
    if (data.mobile_phone == '' || data.mobile_phone == null) {
      data.mobile_phone = '咨询顾问获得电话'
    }
    if (data.city == '' || data.city == null) {
      data.city = '时刻在客户身边'
    }
    if (data.city.length > 18) {
      data.city = data.city.substring(0, 14) + '...'
    }
    if (data.profile == '' || data.profile == null) {
      data.profile = '您身边共享资讯的学习导师、随时助您理解的产品专家、了解客户全面需求的贴心管家'
    }
    var position = data.position //职位
    var company = data.company //公司名
    var phone = data.mobile_phone //手机
    var city = data.city //省市区
    var profile = data.profile //亮点
    var localpath = app.globalData.managerData.portrait_path;
    var id = app.globalData.managerData.id;
    var localIdPath = 'https://www.willsfintech.cn:9004/qrcode/' + id + '.jpg' //二维码
    wx.showLoading({
      title: '正在生成中...',
    })
    this.spotLength(profile);
    //名字后职位定位
    this.nameLeft(name, company, position)
    var that = this;
    this.getImageInfo([localpath, localIdPath], function(arr) {
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
    ctx.drawImage("../../../../image/img/phone.png", 105, 811, 16, 20);
    ctx.drawImage("../../../../image/img/address.png", 307, 811, 16, 20);
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
    ctx.setFillStyle('#fff')
    ctx.fillRect(105, 605, 540, 40)
    ctx.restore()
    ctx.save()
    this.drawRoundRect(ctx, 525, 658, 120, 120, 0);
    ctx.clip()
    ctx.drawImage(localIdPath, 525, 658, 120, 120, );
    ctx.restore()
    ctx.draw(false, function() {
      setTimeout(() => {
        wx.canvasToTempFilePath({
          canvasId: 'shareCanvas',
          success: function(res) {
            wx.hideLoading()
            wx.navigateTo({
              url: '../../../poster/poster?img=' + res.tempFilePath + '&key=' + 'a',
            })
            // wx.previewImage({
            //   urls: [res.tempFilePath],
            // })
          }
        }, this)
      }, 300);
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
  },
  toproductlist(e) {
    util.setBackexecute(0,'product');
    util.getFormId(e)
    wx.navigateTo({
      url: "../../jobs/product/product"
    });
  },
  toproduct() {
    wx.setStorageSync("toproductreadpage", {
      data: this.data.product
    });
    wx.navigateTo({
      url: "../../jobs/productread/productread"
    })
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
    wx.setStorageSync("toproductreadpage",{data:td});
    wx.navigateTo({
      url:"../../jobs/productread/productread"
    });
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
      url:"../../view/view"
    });
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
    wx.createSelectorQuery().select(".dynamic-item-title").fields({
      size:true
    },function(r){
      if(!r)return;
      console.log('全文：',r)
      let h = r.height / util.rHeight()
      console.log('全文：',h)
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
})