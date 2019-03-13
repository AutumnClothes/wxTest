// pages/poster/poster.js
var util = require('../../utils/util.js')
var app = getApp()
var inCourse4 =null;
var inCourse7 = null;
var that = null;
var nextCourseObject = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgPath:'',
    imgPathData:'',
    txt:'',
    jobs:false,
    mLeft: 133,
    mleft: '',
    mTop:'',
    posterTxt:'自定义海报',
    //引导
    guidance:false,//自定义海报
    guidance1:false,//开始获客吧
    guidance2: false,
    guidanceText1: "",
    guidanceText2: "",
    guidanceForm:true,
    vipView:false,//开通会员
    freeText:"免费试用",
    commonqrcodeid:null,
    jobsb:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    nextCourseObject = null;
    inCourse4 = null;
    inCourse7 = null;
    that = this;
    wx.hideShareMenu();
    this.data.imgPathData = options.img
    var setData = {
      imgPath: options.img
    };
    if(  options.id){
      setData["commonqrcodeid"] = options.id;
    }
    this.setData(setData);
    if (options.key == 'a'){
      this.setData({
        txt: '长按图片扫码我的小程序名片，实时获取优质产品及服务，还有最新专栏文章。',
        buttontxt:'保存图片,发送到朋友圈'
      });
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
              guidance1:true,
              guidanceForm:false,
              guidance2:true
            });
          }
        }
      })
    }
    if (options.key == 'b'){
      this.setData({
        txt: '这是我的专属顾问' + options.name +',长按图片扫码小程序名片即可向他咨询',
        buttontxt: '保存图片,推荐给朋友'
      });
    }
    if (options.key == 'jobs'){//点评可能没有，文章标题肯定有
      var stor =  wx.getStorageSync('jobs')
      if(stor.remarktext){
        this.setData({
          txt:'“' + stor.remarktext + '” 推荐文章：【' + stor.title + '】',
          jobs:true,
        })
      }else{
        this.setData({
          txt:'推荐文章：【' + stor.title + '】',
          jobs:true,
        })
      }
      wx.removeStorage({
        key:'jobs'
      });
      wx.getStorage({
        key:"course",
        success:function(r){
          var ad = r.data;
          if(!ad){
            return ;
          }
          if(!ad[3]){ 
          }else if(!ad[4]){
            inCourse4 = true;
            that.course4Text3(true);
          }
        }
      })
    }
    if(options.keys == 'jobsb'){
      this.setData({
        jobs:false,
        jobsb:true,
        buttontxt: '保存图片,发送到朋友圈'
      })
    }
    if(options.keys == 'advert'){//主页送会员按钮
      this.setData({
        advert:true,
        buttontxt: '保存图片,发送到朋友圈',
        posterStyle:'height:970rpx;top:20rpx',
        txt:'长按图片发送给同事，推荐三人免费获得一年会员。推荐更多同事，每位赠送会员30天。'
      })
    }
    let ch = util.systemTop()+88;
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
    this.setData({
      cH:ch,
    })
  },course4Text3(flag){
    if(flag){

      this.setData({
        guidance:true
        ,guidance1:true
      });
      // 在朋友圈发了那么多海报，如何知道谁感兴趣？给海报加上二维码，客户扫码立即跟进  
      // 知道了 点击关闭
      // TODO  show 点击推荐资讯
    }
  },iknow(e){
    util.getFormId(e)
    this.setData({
      guidance:false,
      guidance2:false
    });
  },
  //复制
  titleCopy(e){
    util.getFormId(e)
    wx.setClipboardData({
      data: this.data.txt,
      success:function(){
        wx.showToast({
          title: '内容已复制',
          icon: 'none'
        })
      }
    })
  },
  preview(e){
    var img = e.currentTarget.dataset.url
    wx.previewImage({
      urls:[img]
    })
  },
  diyBind(e){
    if(inCourse4){
      this.setData({
        guidance:false
      });
    }
    var md = app.globalData.managerData;
		var now = new Date().getTime();
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
    
    if(e)
      util.getFormId(e);
    //用户上传图片（750*750最小），获取到图片后，调canvas API
    if(this.data.posterTxt == '自定义海报'){
      wx.chooseImage({
        count:1,
        sizeType:['compressed'],
        success(res){
          //判断图片是否符合要求
          var img = res.tempFilePaths[0]
          wx.getImageInfo({
            src: img,
            success: (result)=>{
              console.log(result)
              if(result.width < 350 || result.height < 350){//不能太小
                wx.showToast({
                  title:'图片不符合要求',
                  icon:'none'
                })
              }else{
                if( result.width < result.height ){//不能太扁
                  var h = (750/result.width)*result.height
                  var imgObj = {
                    img:img,
                    h:h
                  }
                  that.posterBind(imgObj)
                }else{
                  wx.showToast({
                    title:'图片不符合要求',
                    icon:'none'
                  })
                }
              }
            },
          });
          // that.posterBind(res.tempFilePaths)
        }
      })
    }else if(this.data.posterTxt == '恢复默认'){
      console.log(this.data.imgPathData )
      this.setData({
        imgPath:this.data.imgPathData,
        posterTxt:'自定义海报'
      })
    }
    
  },
  shareBind(e){
    if(inCourse4 || inCourse7){
      that.course4or7Done(true);
    }
    var img = e.currentTarget.dataset.img
    wx.showLoading({title:'保存中...'})
    wx.saveImageToPhotosAlbum({
      filePath: img,
      success(res) { 
        wx.setClipboardData({
          data: that.data.txt,
          success: function () {
            wx.hideLoading()
            wx.showToast({
              title: '图片已保存，文案已复制',
              icon: 'none'
            })
          }
        })
      },
    })
  },course4or7Done(flag){
    if(flag){//TODO show
      
      var cd = wx.getStorageSync("course");
      if(inCourse4){
        cd[4] = true;
      }else if(inCourse7){
        cd[7] = true;
      }
      inCourse4 = false; 
      inCourse7 = false; 
      wx.setStorageSync("course",cd);
      nextCourseObject = util.nextCourseText(cd);

      that.setData({
        courseDone:true,
        donetitle: nextCourseObject.title,
        donedesc:nextCourseObject.desc,
        donebutton: nextCourseObject.button,
        donerate : nextCourseObject.rate,
        guidance1:false
      });

      /* wx.getStorage({
        key:"course",
        success:function(r){
          var cd = r.data;
          if(inCourse4){
            cd[4] = true;
          }else if(inCourse7){
            cd[7] = true;
          }
          wx.setStorageSync("course",cd);
        }
      }); */
    }else{
      //TODO HIDE  
    }
  },closeDone(){
    this.setData({courseDone:false});
  },toNextButton(e){
    util.getFormId(e)
    util.toNextCourse(nextCourseObject);
  },
  posterBind(imgObj){
    var that = this;
    var data = app.globalData.managerData;
    console.log('用户上传：',imgObj,'顾问信息',data)
    if(!data.user_name)data.user_name = '——';
    var name = data.cn_name ? data.cn_name : data.user_name;
    var company = data.company,position = data.position;
    if (!data.company) company = '';
    if (!data.position) position = '';
    if ((data.company == '') && (data.position == '')) company = '您身边的专业顾问' 
    var text = '长按识别小程序码阅读全文';
    var localpath = data.portrait_path;
    var id = data.id;
    var localIdPath = 'https://www.willsfintech.cn:9004/commonqrcode/' + this.data.commonqrcodeid + '.jpg' //二维码
    //文字内容信息
    wx.showLoading({
      title: '正在生成中...',
    })
    this.setData({
      canvasHeight:imgObj.h + 320
    })
    this.getImageInfo([localpath, localIdPath], function(arr) {
      if (arr[0] != undefined && arr[1] != undefined) {
        that.draw(arr[0], arr[1], name, position, company,text,imgObj)
      };
    });
  },
  draw(localpath, localIdPath, name, position, company,text,imgObj){
    const ctx = wx.createCanvasContext('viewCanvas')
    var that = this
    var y = imgObj.h
    ctx.setFillStyle('#fff');
    ctx.fillRect(0, 0, 750, 1334)
    ctx.drawImage(imgObj.img, 0, 0, 750, y);
    //底部
    ctx.save()
    ctx.setFillStyle('#fff')
    ctx.setShadow(0,-30,60,'rgba(255,255,255,0.95)');
    ctx.fillRect(0,y,750,320);
    ctx.setFillStyle('#666')
    ctx.fillRect(35,y+40,140,2)
    ctx.fillRect(575,y+40,140,2)
    ctx.setFillStyle('#000')
    ctx.font = 'normal normal 28px PingFangSC';
    ctx.fillText(text, 207,y+50);
    ctx.save()
    this.drawRoundRect(ctx, 40, y+135, 80, 80, 40,'#ffffff','#ffffff');
    ctx.clip()
    ctx.drawImage(localpath, 40, y+135, 80, 80);
    ctx.restore()
    ctx.setFillStyle('#000')
    ctx.font = 'normal bold 34px PingFangSC';
    ctx.fillText(name, 133, y+170);
    ctx.setFillStyle('#aaa')
    ctx.font = 'normal normal 26px PingFangSC';
    this.nameLeft(name, company, position,y+170,y+210)
    ctx.fillText(position, this.data.mleft, this.data.mTop);
    ctx.fillText(company, 133, y+210);
    
    this.drawRoundRect(ctx, 595,y+115, 120, 120, 60,'#ffffff','#ffffff');
    ctx.clip()
    ctx.drawImage(localIdPath, 595, y+115, 120, 120);
    ctx.restore()
    ctx.draw(false, function() {
      setTimeout(() => {
        wx.canvasToTempFilePath({
          canvasId: 'viewCanvas',
          fileType:'jpg',
          success: function(res) {
            wx.hideLoading()
            that.setData({
              imgPath:res.tempFilePath,
              posterTxt:'恢复默认'
            })
          }
        }, this)
      }, 400);
    })
  },
  drawRoundRect(ctx, x, y, width, height, radius,strokeStyle,fillStyle,strokeFlag) {
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
  nameLeft(name, company, position,nametop,companytop) {
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
		});
	}
})
