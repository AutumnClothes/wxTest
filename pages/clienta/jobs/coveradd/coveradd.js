// pages/clienta/jobs/coveradd/coveradd.js
var util = require('../../../../utils/util.js')
var api = require('../../../../utils/api.js')
var network = require('../../../../utils/network.js')
var app = getApp()
var that = null;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    cssnum: '样式一',
    num: 1,
    //用户输入value
    bright:'',
    inputValue:'',
    inputId:'',
    inputClass: false,
    modalInput: false,
    maxLength: '',
    imgPath:'',
    tagaddShow:true,
    taglen:12,
    brightNL:5,
    brightTL:9,
    keyValue: '',
    keypValue:'',
    modalTextarea:false,
    //推荐产品测试数据1
    product:{title:"产品标题",
    key1:"关键词",
    keyp1:"关键词说明",
    key2:"关键词",
    keyp2:"关键词说明",
    key3:"关键词",
    keyp3:"关键词说明",
		profile:"产品亮点",
		tagsarr:['标签'],
		tags:'标签',
		imgurl:"/image/img/column-img-add.png"
		},
		productcope:{title:"产品标题",
    key1: "关键词",
    keyp1: "关键词说明",
    key2: "关键词",
    keyp2: "关键词说明",
    key3: "关键词",
    keyp3: "关键词说明",
    profile:"产品亮点",
    tagsarr:['标签'],
    tags:'标签',
		imgurl:"/image/img/column-img-add.png"
		} ,// 用于提交时对比
    editProduct:{},
    exceptionclose:false,
    guidance:false,//封面
    guidance1:false,//完成
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
wx.hideShareMenu();
    that = this;
    let ch = util.systemTop()+88;
    let sh = util.systemHeight()-ch-600;
    var apple = app.globalData.AppleX;
    if(apple){
      this.setData({
        bm:50
      });
    }else{
      this.setData({
        bm:0
      });
    }
    this.setData({
      cH:ch,
      sH:sh
    });
		var tocoveraddpage =wx.getStorageSync("tocoveraddpage");
		wx.removeStorage({
			key:"tocoveraddpage"
		})
		if(tocoveraddpage!=null){
      var style = tocoveraddpage.style;
      delete tocoveraddpage["style"];
      this.data.keyValue = tocoveraddpage.key1;
      this.data.keypValue =tocoveraddpage.keyp1;
      var p = tocoveraddpage;
      var ep = api.deepcopy(tocoveraddpage)
      if(!p.tags){
        p.tagsarr=[];
        p.tagsarr.push(that.data.productcope.tagsarr[0]);
      }
      if(!p.key1)p.key1 =this.data.productcope.key1;
      if(!p.key2)p.key2 =this.data.productcope.key2;
      if(!p.key3)p.key3 =this.data.productcope.key3;
      if(!p.keyp1)p.keyp1 =this.data.productcope.keyp1;
      if(!p.keyp2)p.keyp2 =this.data.productcope.keyp2;
      if(!p.keyp3)p.keyp3 =this.data.productcope.keyp3;
			this.setData({
				product:p,
				num:style,
				editProduct:ep
			});
		}
		
    this.tagLength()
    this.tagItemLen()
    // this.setBright()

    wx.getStorage({
      key:"course",
      success:function(r){
        var ad = r.data;
        if(!ad){
          return ;
        }
        if(!ad[6]){ 
          that.setData({
            guidance:true,
            guidance1:true
          });
          //TODO 专为金融产品及服务打造的四种封面样式，左右滑动即可切换
          // 黑色的完成按钮。
        }
      }
    })
  },iknow(e){
    util.getFormId(e)
    this.setData({guidance:false});
  },
  //渲染关键词到input value
  setBright(){
    this.setData({
      bright: this.data.theobj.bright
    })
  },
  //切换滑块
  tapChange(e) {
    var num = e.detail.current;
    var nowStyle = null;
    if(this.data.editProduct){
      nowStyle = this.data.num;
    }
    
    if((num+1) != nowStyle)
      that.data.exceptionclose = true;

    switch (num) {
        case 0:
          this.setData({
            cssnum: '样式一',
            num: 1
          });
          break;
        case 1:
          this.setData({
            cssnum: '样式二',
            num: 2
          });
          break;
        case 2:
          this.setData({
            cssnum: '样式三',
            num: 3
          });
          break;
        case 3:
          this.setData({
            cssnum: '样式四',
            num: 4
          });
          break;
    }
    var str = "";
    if (this.data.keyValue != undefined && this.data.keyValue != ''){
      if(num == ''){
        str = this.data.keyValue
      }else{
        str = this.data.keyValue.substr(0, 4)
      }
      this.data.product.key1 = str
      this.data.editProduct.key1 = str
      this.setData({
        product: this.data.product,
        editProduct: this.data.editProduct
      });
    }
    if (this.data.keypValue != undefined && this.data.keypValue != '') {
      if (num == '0') {
        str = this.data.keypValue
      } else {
        str = this.data.keypValue.substr(0, 8)
      }
      this.data.product.keyp1 = str
      this.data.editProduct.keyp1 = str
      this.setData({
        product: this.data.product,
        editProduct: this.data.editProduct
      });
    }
    
  },
  //标题input
  inputTitle(e){
    that.data.exceptionclose = true;
    var title = e.detail.value;
    if (e.detail.keycode == 10) {
      title = title.substr(0, title.length - 1);
      title += '\n';
    }
		this.data.product.title = title;
    this.setData({
			product:this.data.product
    });
  },
  //弹出多行框
  textareaOn(e) {
    var dataset = e.currentTarget.dataset;
    this.data.editField = dataset.field;
    if (!dataset.value) {
      dataset.value = ""
    }
    this.data.title = e.currentTarget.dataset.title;
    this.data.inputValue = dataset.value
    this.setData({
      modalTextarea: true,
      modalMeng: true,
      maxLength: dataset.maxlength,
      title: e.currentTarget.dataset.title,
      value: dataset.value,
      cursor:(dataset.value.length)
    })
  },
  textareaOver(e) {
    util.getFormId(e)
    this.setData({
      modalTextarea: false,
      modalMeng: false,
    });
    var value = this.data.inputValue;
    if (e.detail.keycode == 10) {
      value = value.substr(0, title.length - 1);
      value += '\n';
    }
    if (this.data.title == '请输入产品标题'){
      this.data.product.title = value?value:this.data.productcope.title,
      this.data.editProduct.title = value;
    };
    if (this.data.title == '请输入产品亮点'){
      this.data.product.profile = value?value:this.data.productcope.profile;
      this.data.editProduct.profile = value;
    };
    that.data.exceptionclose = true;
    this.setData({
      product: this.data.product,
      editProduct:this.data.editProduct
    });
  },
  //关键词input
  inputBright(e){
    that.data.exceptionclose = true;
    this.brightNLength(e)
    var ind = e.currentTarget.dataset.ind
    var keys = e.currentTarget.dataset.keys
    
    if (ind == '1' && keys == 'key') this.data.keyValue = e.detail.value;
    if (ind == '1' && keys == 'keyp') this.data.keypValue = e.detail.value;
    if(e.detail.value){
      this.data.product[keys + ind] = e.detail.value;
    }else{
      this.data.product[keys + ind] = this.data.productcope[keys + ind]
    }
    this.data.editProduct[keys + ind] =e.detail.value;
		this.setData({
			product:this.data.product
		});
  },
  //亮点input
  inputDetails(e){
    that.data.exceptionclose = true;
		var profile = e.detail.value;
		this.data.product.profile = profile;
		this.setData({
			product:this.data.product
		});
  },
  //标签
  inputOn(e) {
    let id = e.currentTarget.dataset.id
    let length = e.currentTarget.dataset.maxl;
    let tit = e.currentTarget.dataset.title
    if (!length) { length = 100; }
    this.data.inputId = id
    this.setData({
      modalInput: true,
      modalMeng: true,
      inputMaxL: length,
      title:tit
    })
  },getTagString(tagsarr){
		var s ="";
		for(var i = 0 ; i<tagsarr.length; i++){
			var one = tagsarr[i];
			s+=one+",";
		}
		var tags = s.substr(0,s.length-1);
		return tags;
	},
  //完成
  inputOver(e) {
    util.getFormId(e);
		var tag = this.data.inputValue;
		var p = this.data.product;
		if(this.data.editProduct.tagsarr == null || this.data.editProduct.tagsarr.length == 0){
			p.tagsarr = [];
			p.tagsarr.push(tag);
      p.tags = this.getTagString(p.tagsarr);
      this.data.editProduct.tagsarr = p.tagsarr;
		}else{
			p.tagsarr.push(tag);
      p.tags = this.getTagString(p.tagsarr);
      this.data.editProduct.tagsarr = p.tagsarr;
    }
    that.data.exceptionclose = true;
    this.setData({
      modalInput: false,
      modalTextarea: false,
      modalMeng: false,
      inputClass: true,
      product:p,
      editProduct:this.data.editProduct
    });
		this.tagLength()
		this.tagItemLen()
  },
  //取消
  modalCancel(e) {
    util.getFormId(e)
    this.setData({
      modalInput: false,
      modalTextarea: false,
      modalMeng: false
    })
  },
  inputEnd(e) {
    this.data.inputValue = e.detail.value
  },
  //控制关键词字数
  brightNLength(e){
    console.log(e)
  },
  //控制关键词说明字数
  brightTLength(){

  },
  //控制标签数量
  tagLength(){

    var len = 0;
    try{
      len = this.data.product.tagsarr.length;
    }catch(e){}
    if (len >= 3){
      this.setData({
        tagaddShow: false
      })
    }else{
      this.setData({
        tagaddShow: true
      })
    }
  },
  //控制标签字数
  tagItemLen(){
    var len = 0;
    if(this.data.product.tags!=null){
			var ts = this.data.product.tags;
			ts = ts.replace(",","");
			ts = ts.replace(",","");
			len = ts.length;
		}
		var lent = 12 - len;
    if(lent == 0){
      this.setData({
        tagaddShow: false
      })
    }
    this.setData({
      taglen: lent
    })
  },
  //删除标签
  tagDel(e){
    var that = this
    var ind = e.currentTarget.dataset.ind
    wx.showModal({
      content: '确定将该标签移除？',
      cancelColor: '#333301',
      confirmText: '删除',
      confirmColor: '#ffa019',
      success: function (res) {
        if (res.confirm) { 
					that.data.exceptionclose = true;
					var p = that.data.product;
          p.tagsarr.splice(ind,1);
          that.data.editProduct.tagsarr = p.tagsarr;
          if(p.tagsarr.length == 0){
            p.tagsarr.push(that.data.productcope.tagsarr[0]);
            that.data.editProduct.tagsarr = new Array();
          }
          p.tags = that.getTagString(p.tagsarr);
          that.setData({
            product:p,
            editProduct:that.data.editProduct
          })
					that.tagItemLen()
					that.tagLength()
        }
      }
    })
  },
  //上传图片
  imgobjImg(){
    var that = this
    wx.navigateTo({
    	url:"../../../picture/picture"
    })
  },
  //提交
  bindAdd(e){
  util.getFormId(e)
	var p = this.data.product;
  var pc = this.data.productcope;
  var ep = this.data.editProduct;
	var num = this.data.num;
	if(!ep.title){
		wx.showToast({
			title:"标题不能为空",
      icon:'none'
		})
		return ;
	}
    if (!ep.profile) {
    wx.showToast({
      title: "产品亮点不能为空",
      icon: 'none'
    })
    return;
  }
	if(num == 1 && !ep.key1){
		wx.showToast({
      title: "关键词不能为空",
      icon: 'none'
		})
		return ;
	}else if(num ==2 && (!ep.key1 || !ep.key2 )){
		wx.showToast({
      title: "关键词不能为空",
      icon: 'none'
		})
		return ;
	}else if (num == 3 && (!ep.key1 || !ep.key2  || !ep.key3 )){
		wx.showToast({
      title: "关键词不能为空",
      icon: 'none'
		})
		return ;
  }else if(num == 4 && (!ep.imgurl)){
    wx.showToast({
      title: "封面图不能为空",
      icon: 'none'
		})
		return ;
  }
  ep["style"] =num;
  if(ep.tagsarr){
    ep.tags = this.getTagString(ep.tagsarr);
  }else{
    ep.tags = "";
  }
	
  
  util.setBackexecute(1,"addcover",{product:ep});
  this.data.exceptionclose = false;
	this.data.product = null;
    wx.navigateBack({
      delta:'1'
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
	  var that =this;
		util.backexecute(function(r){
			var path = r.path;
      var p = that.data.product;
      var ep = that.data.editProduct;
      p.imgurl = path;
      ep.imgurl = path;
      that.data.exceptionclose = true;
			that.setData({
        product:p,
        editProduct:ep
			});
		});
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
    if(this.data.exceptionclose){
      var p = this.data.product;
      var pc = this.data.productcope;
      var ep = this.data.editProduct;
      var num = this.data.num;
      ep["style"] =num;
      if(ep.tagsarr){
        ep.tags = this.getTagString(ep.tagsarr);
      }else{
        ep.tags = "";
      } 

      if(!ep.title){
        ep["title"] = '请输入产品标题';
      }
      if (!ep.profile) {
        ep["profile"] = "请输入产品亮点"
      }
      if(num == 1 && (!ep.key1)){
        ep.key1 = '填关键词';
      }else if(num ==2){
        if(!ep.key1 ){
          ep.key1 = '填关键词';
        }
        if(!ep.key2 ){
          ep.key2 = '填关键词';
        }
      }else if (num == 3){
        if(!ep.key1 ){
          ep.key1 = '填关键词';
        }
        if(!ep.key2 ){
          ep.key2 = '填关键词';
        }
        if(!ep.key3 ){
          ep.key3 = '填关键词';
        }
      }else if(num == 4){
        if(!ep.imgurl) {
          ep.imgurl = "https://www.willsfintech.cn:9004/staticFile/image/productcover.png";
        }
      }
      util.setBackexecute(1,"exceptionclose",{product:ep});
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

  }
})
