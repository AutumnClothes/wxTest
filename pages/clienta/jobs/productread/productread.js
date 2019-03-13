// pages/clienta/jobs/productread/productread.js
var util = require('../../../../utils/util.js')
var network = require('../../../../utils/network.js')
var config = require('../../../../config.js');
var poster = require('../../../../utils/product-poster.js')
var app = getApp()
var fromListData = null;
var that = null;
var posterQRCodeid= null;
var hasCard = null;
var key = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    exist:null ,
    productName:'产品阅读',
    operateShow:false,
    textareavalue: null,
    textareaTrue: true,
    textareaFocus: false,
    mengShow: false,
    comment:null,
    shareShow:false,
    imguploadsuccessnum:0,
    operateShowItem:[
      {
        title:'编辑',
        icon:'../../../../image/img/operateEdit.png',
        iconStyle:'width:29rpx;height:31rpx;',
        fun:'operateEdit'
      },{
        title: '删除',
        icon: '../../../../image/img/operateDel.png',
        iconStyle: 'width:34rpx;height:34rpx;',
        fun: 'operateDel'
      }, {
        title: '置顶',
        icon: '../../../../image/img/operateUp.png',
        iconStyle: 'width:30rpx;height:28rpx;',
        fun: 'operateUp'
      }, {
        title: '设为私密',
        icon: '../../../../image/img/operatePrivate.png',
        iconStyle: 'width:28rpx;height:34rpx;',
        fun: 'operatePrivate'
      }
    ],
    //海报
    mLeft: 133,
    mleft: '',
    RemarkHeight:0,
    tagsarrLeft:'',
    showSaveButton:true,
    pShowAdd:'true'
  },
  //编辑
  operateEdit(e){
    util.getFormId(e);
		wx.setStorageSync("toproductaddpage",{coverdata:fromListData,contentdata:this.data.list});
		wx.navigateTo({
			url:'../productadd/productadd'
		})
    this.unOperateBind();
  },
  //删除
  operateDel(e){
    util.getFormId(e);
		var id = this.data.product.id;
		var articleid = this.data.product.articleid;
    wx.showModal({
      content: '确定要删除这个产品吗？',
      cancelColor: '#333301',
      confirmText: '删除',
      confirmColor: '#ffa019',
      success(res){
        if(res.confirm){
          var dd = {
            funcNo: '1042',
            id: id,
            articleid: articleid
          }
          network.postRequest(dd).then(function (r) {
            util.setBackexecute(1,null,null);
            wx.navigateBack({
              delta: 1
            })
          })
        }
      }
    })
  },
  //置顶
  operateUp(e){
    util.getFormId(e);
		var up = fromListData.up == '1'?"0":"1";
		var md = {
			funcNo:'1043',
			up:up,
			id:fromListData.id
		}
		network.postRequest(md).then(function(r){
      util.setBackexecute(1,null,null);
			fromListData.up  = up;
			if(fromListData.up == '1'){
        that.data.operateShowItem[2].title = '取消置顶'
			}else{
				that.data.operateShowItem[2].title = '置顶'
			}
			that.setData({
				operateShowItem:that.data.operateShowItem
			})
		})
  },
  //设为私密
  operatePrivate(e){
    util.getFormId(e);
		var pri = fromListData["private"] == '1'?"0":"1";
		var md = {
			funcNo:'1043',
			pri:pri,
			id:fromListData.id
		}
		network.postRequest(md).then(function(r){
      util.setBackexecute(1,null,null);
			fromListData["private"]  = pri;
			if(fromListData["private"] == '1'){
					that.data.operateShowItem[3] ={
						title: '设为公开',
						icon: '../../../../image/img/operateOvert.png',
						iconStyle: 'width:34rpx;height:34rpx;',
						fun: 'operatePrivate'
					}
			}else{
				that.data.operateShowItem[3] = {
					title: '设为私密',
					icon: '../../../../image/img/operatePrivate.png',
					iconStyle: 'width:28rpx;height:34rpx;',
					fun: 'operatePrivate'
				}
			}
			that.setData({
				operateShowItem:that.data.operateShowItem
			})
		});
  },
  //点评按钮
  consult(e) {
    util.getFormId(e)
    this.unOperateBind()
    var that = this
    if (this.data.textareaTrue) {
      this.setData({
        textareaTrue: false,
        textareaFocus: true,
        mengShow: true,
      })
      wx.createSelectorQuery().select('#bgspan').fields({
        size:true
      },function(r){
        let h = r.height/util.rHeight()
        if(h<40){h = 40};
        that.setData({
          textareaH:h
        })
      }).exec()
      this.setData({
        scrollId:'scrollid',
        textareavalue:this.data.comment
      })
    }
  },
  closemeng() {
    this.setData({
      textareaTrue: true,
      textareaFocus: false,
      mengShow: false,
      textareavalue:""
    })
  },tocreate(){
    wx.reLaunch({
      url:"/pages/clienta/mine/card/card"
    });
  },
  //shareShow
  shareShowBind() {

    if(key){
      if(!app.globalData.managerData){
        this.setData({
          guidance:true
        });
        return ;
      }

      var rd = {
        funcNo:'1062',
        type:"product",
        entityid:fromListData.id,
        toid:app.globalData.managerData.id
      }
      network.postRequest(rd).then(function(r){
        if(r.error_no == '0'){
          wx.showToast({
            title:"产品已保存",
            duration:3000,
            mask:true
          });
        }
      });
    }else{
      this.unOperateBind()
      this.setData({
        shareShow: true,
        textareaTrue: false,
        textareaFocus: false,
        scrollId:'scrollid',
        textareavalue:this.data.comment
      })
  
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
    }
  },
  //关闭shareShow
  unshareShowBind() {
    this.setData({
      shareShow: false,
      textareaTrue: true,
      textareaFocus: false,
      textareavalue:""
    })
  },
  textareainput(e) {
    this.data.textareavalue = e.detail.value;
  },cancelComment(e){
    util.getFormId(e)
    that.setData({
      textareaTrue:true,
      textareavalue:""
    })
  },updateComment(e){
    util.getFormId(e)
    var tav = this.data.textareavalue;
		if(tav ==null ){ // 没有输入
			that.closemeng();
			that.setData({
				completeShow:false
			});
			return ;
    }
		var aid = this.data.product.articleid;
		var d = {
			funcNo:'1039',
			id:aid,
			comment:tav
		}
		network.postRequest(d).then(function(r){
			util.setBackexecute(1,null,null);
			that.setData({
        comment: tav,
        textareaTrue:true
      })
      that.data.textareavalue = null;
		});
	},tocontact(){
    var tav =  this.data.textareavalue;
    if(tav == null){
      tav = this.data.comment;
    }
    if(tav == null) tav = "";
    fromListData["sharecomment"]= tav;
    wx.setStorageSync("tosendpagedatafp",fromListData);
    fromListData["sharecomment"] = null;
		
		wx.navigateTo({
			url:"../../send/send"
		})
    this.unshareShowBind()
	},tomoment(){
    var tav =  this.data.textareavalue;
    if(tav == null){
      tav = this.data.comment;
    }
    if(tav == null) tav = "";
    fromListData["sharecomment"]=tav;
    wx.setStorageSync("topublishmomentpagedatafp",fromListData);
    fromListData["sharecomment"] = null;
		wx.navigateTo({
			url:"../columnadd/columnadd"
		})
    this.unshareShowBind()
	},guidance_close(){
    this.setData({
      guidance:false
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    hasCard = null;
    key =null;
    posterQRCodeid = null;
    wx.hideShareMenu();
		that = this;
		fromListData = null;
    let ch = util.systemTop()+88
    let sh = util.systemHeight()-ch-100
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
    if(options["key"]){
      key = options["key"];
      if(key == 'column'){
        this.setData({
          showSaveButton:false
        })
      }
      this.setData({
        circle:true
      });
    }
    var toproductreadpage = wx.getStorageSync("toproductreadpage");
    console.log(toproductreadpage)
		var managerData = null;
    var headImgUrl = null;
    if(key){
      if(key == 'quncard'){
        this.setData({
          showSaveButton:false,
        });
      }
      managerData = {
        company : toproductreadpage.data.company,
        position : toproductreadpage.data.position,
        user_name :toproductreadpage.data.user_name
      };
      headImgUrl= toproductreadpage.data.portrait_path
    }else{
      managerData = app.globalData.managerData;
      headImgUrl = managerData.portrait_path;
    }
		if(headImgUrl !=null && headImgUrl.indexOf("wills")!=-1)
      headImgUrl = headImgUrl.substr(0,headImgUrl.length - 4)+"s.jpg";
    if(!managerData.company)managerData.company ='';
    if(!managerData.position)managerData.position ='';
    if(!managerData.company && !managerData.position){
      managerData.company = '您身边的专业顾问'
      managerData.position = ''
    }
    var cplen = 0;
    if(managerData.company){
      cplen +=managerData.company.length;
    }
    if(managerData.position){
      cplen +=managerData.position.length;
    }
    if (cplen >= 13){
      this.setData({
        cpshow:true
      })
    }else{
      this.setData({
        cpshow: false
      })
    }
		this.setData({
			headimg:headImgUrl,
			managerData:managerData
		})
		
		fromListData  = toproductreadpage.data;
		if(fromListData.tags !="" && fromListData.tags!=null){
			var tags = fromListData.tags;
			var tagsarr = tags.split(",");
			fromListData.tagsarr = tagsarr;
    }
    var comment = fromListData.comment;
    var commentid = fromListData.commentid;
    this.data.thisId = fromListData.articleid
		var sd = {
			product:fromListData
		}
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
		this.setData(sd);
		var src = "https://www.willsfintech.cn:9001/article?articleid="+fromListData.articleid
		network.get(src).then(function(r){
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
				list:r
			});
		})
		if(fromListData.up == '1'){
				this.data.operateShowItem[2].title = '取消置顶'
		}
		if(fromListData["private"] == '1'){
				this.data.operateShowItem[3] ={
        title: '设为公开',
        icon: '../../../../image/img/operateOvert.png',
        iconStyle: 'width:34rpx;height:34rpx;',
        fun: 'operatePrivate'
      }
    }
    this.getProduct();
    var Tj = wx.getStorageSync('Tj')
    if(key != 'quncard'){
      if(Tj == '0'){ this.data.pShowAdd = false }else{
        this.data.pShowAdd = true
      }
    }else{
      this.data.pShowAdd = false
    }
		this.setData({
      operateShowItem:this.data.operateShowItem,
      pShowAdd:this.data.pShowAdd
		})
  },
  //操作
  operateBind(e){
    util.getFormId(e)
    if (this.data.operateShow){
      this.setData({
        operateShow:false
      })
    }else{
      this.setData({
        operateShow: true
      })
    }
  },
  unOperateBind(){
    this.setData({
      operateShow: false
    })
  },
  //点评
  commentBind(e){
    util.getFormId(e)
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
    that = this
		util.backexecute(function(r){
			util.setBackexecute(1,null,null);
			var p = r.coverdata;
			var l = r.contentdata;
			var sd = {};
      sd["product"] = p;
      fromListData = p;
			if(l){
				sd["list"] = l;
			}
			that.setData(sd);
    });
    util.backexecute(function(r){
      var l = r["articleContent"];
      if(l){
        l = JSON.parse(l);
        r["articleContent"] = l;
      }else{
				l = [];
      }
      wx.showModal({
        content:"是否保存之前编辑内容",
        cancelColor: '#333301',
        confirmColor: '#ffa019',
        confirmText: '保存',
        cancelText:"放弃",
        success:function(sm){
          if(sm.confirm){
            that.uploadImg(l,function(){
              that.postProductData(r);
            });
          }
        }
      })
    },
    "exceptionclose");
    util.backexecute(function(){that.getProduct();},'product')
  },postProductData(p){
    if(p["articleContent"]){
      p["articleContent"] =JSON.stringify(p["articleContent"]);
    }else{
      p["articleContent"] = "[]";
    }
	  network.postRequest(p).then(function(r){
      util.setBackexecute(1,null,null);
      var l = JSON.parse(p["articleContent"]);
      delete p["articleContent"];
      that.setData({
        list:l,
        product:p
			});
		});
	  // 保存文章，
	  // 文章id， 保存产品。
  }
  ,uploadImg(list,callback){
	  var l = list;
	  if(l.length ==0){ // 没有图片需要保存。
		  callback();
		  return ;
	  }
	  for(var i= 0 ; i<l.length ; i++)
		{
		  var one = l[i];
		  if(one.keys == 'blank' || one.keys == 'txt'){
			that.imguploadfinish(l.length,callback);  
			continue;
		  }
		  if(one.src.indexOf("wills")!=-1){
			that.imguploadfinish(l.length,callback);
			continue;
		  }
		  that.uploadOneImg(one,callback,l.length);
	  }
  },uploadOneImg(one,callback,len){
		var that = this;
		wx.uploadFile({
			url:config.uploadImg,
			filePath:one.src,
			name:"productContent",
			success:function(res){
				if(res.statusCode == 200 ){
					var d = JSON.parse(res.data);
					if(d.error_no == '0'){
						var path = d.path;
						one.src = path;
						that.imguploadfinish(len,callback);
					}else{
					}
				}
				wx.hideLoading();
			}
		})
	},
	imguploadfinish(len,callback){
		this.data.imguploadsuccessnum++;
		if(this.data.imguploadsuccessnum == len){
			this.data.imguploadsuccessnum =0;
			callback();
		}
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
    util.setBackexecute(1,null,null)
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
		var commentid = new Date().getTime()+""+fromListData.articleid;
		var title = fromListData.title;
		var shareobj = {
      title: title
    }
    if(hasCard){
      shareobj["imageUrl"] = hasCard;
    }
		var path= "pages/clientb/product/productread/productread?productid="+fromListData.id
		+"&sharefrom="+app.globalData.managerData.id;
		
    var tav =  this.data.textareavalue;
    if(tav == null){
      tav = this.data.comment;
    }
    if(tav == null) tav = "";
    path += "&commentid="+commentid;
    var cd = {
      funcNo:'1040',
      articleid:fromListData.articleid,
      comment:tav,
      id:commentid
    };
    network.postRequest(cd);
		shareobj["path"]  = path;
		return shareobj;
  },
  posterPre(e){
    var commentid = new Date().getTime()+""+app.globalData.managerData.id;
    var id= commentid;
    posterQRCodeid = id;
    var param= "/pages/clientb/product/productread/productread?productid="+fromListData.id
    +"&sharefrom="+app.globalData.managerData.id;
    
    var tav =  this.data.textareavalue;
    if(tav == null){
      tav = this.data.comment;
    }
    if(tav == null) tav = "";
    param += "&commentid="+commentid;
    var cd = {
      funcNo:'1040',
      articleid:fromListData.id,
      comment:tav,
      id:commentid
    };
    network.postRequest(cd);
    
    var referenceData = {
      funcNo:'1049',
      id:id,
      param:param
    }
    network.postRequest(referenceData).then(function(r){
      if(r.error_no == '0'){
        // TODO   画图      必须要等请求回复。因为图片可能还没有画好。
        var managerData = app.globalData.managerData
        managerData.name = app.globalData.managerData.user_name
        managerData.portraitpath =app.globalData.managerData.portrait_path
        var posterData = {
          id:id,
          managerData:managerData,
          comment:that.data.comment,
          fromListData:fromListData,
          list:that.data.list,
          posterQRCodeid:posterQRCodeid,
        }
        poster.posterBind(posterData);
      }
    });
  },
  toproductlist(e) {
    util.getFormId(e)
    util.setBackexecute(0,'product');
    var tj = '0'
    wx.setStorageSync('Tj',tj)
    wx.navigateTo({
      url: "../product/product"
    });
  },
  toproduct(e) {
    wx.setStorageSync("toproductreadpage", {
      data: this.data.productTj
    });
    wx.redirectTo({
      url: "../productread/productread"
    })
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
          productTj: p,
        });
      }
    });
  }
})
