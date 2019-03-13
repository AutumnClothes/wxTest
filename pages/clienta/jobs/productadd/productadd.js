// pages/clienta/jobs/productadd/productadd.js
var util = require('../../../../utils/util.js')
var network = require('../../../../utils/network.js')
var config= require('../../../../config.js')
var app = getApp()
var editProduct = false;
var editid = null;
var that = null;
var inCourse6 = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: true,
    addShow: false,
    mengShow: false,
    toindex: '',
		editFlag:false,
    //测试数据
    list: [{keys:'blank',addShow:true}],
    product:null,
    imguploadsuccessnum:0,
    exceptionclose:false,
    imgIndex:'',
    //引导
    guidance:false,//编辑封面
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
wx.hideShareMenu();
    that = this;
    var ch = util.systemTop() + 88;
    var sh = util.systemHeight() - ch - 100;
    let mt = (util.systemHeight() * 0.382) - ch - 140
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
      cH: ch,
      sH: sh,
      mT:mt
    });
	
	editProduct = false;
	editid = null;
	var toproductaddpage =  wx.getStorageSync("toproductaddpage");
	if(toproductaddpage){
		editProduct = true;
		editid = toproductaddpage.coverdata.id;
		var list = this.data.list;
		if(toproductaddpage.contentdata)
			list = this.data.list.concat(toproductaddpage.contentdata);
		this.setData({
			product:toproductaddpage.coverdata,
			list:list
		});
		if(list.length >1){
			this.data.show
			this.setData({
				show:false
			});
		}
		
		wx.removeStorage({
			key:"toproductaddpage"
		})
		return ;
	}
		// add
	this.setData({
		product:{
			title:"点此输入产品标题",
      key1:"请输入关键词",
      keyp1:"关键词说明",
			profile:"点此输入产品亮点",
			tagsarr:["产品标签","产品标签","产品标签"],
			tags:"产品标签,产品标签,产品标签",
			style:1,
			defaultFlag:true
		}
  });// 默认缺省文案
  

    wx.getStorage({
      key:"course",
      success:function(r){
        var ad = r.data;
        if(!ad){
          return ;
        }
        if(!ad[6]){ 
          inCourse6 = true;
          that.setData({guidance:true});
        }
      }
    })
  },
  //保存
  productSave(e){
    util.getFormId(e);
	var p= this.data.product;
	if(this.data.list.length == 1){
		wx.showModal({
			content:"未编辑产品内容，是否保存产品",
      cancelColor: '#333301',
      confirmText: '保存',
      confirmColor: '#ffa019',
			success:function(csm){
        if(csm.confirm){
          if(p.defaultFlag){
            wx.showModal({
              content:"未编辑产品封面，是否保存产品",
              cancelColor: '#333301',
              confirmText: '保存',
              confirmColor: '#ffa019',
              success:function(sm){
                if(sm.confirm){
                  wx.showLoading({title:"正在保存"});
                  that.uploadImg(function(){
                    that.postProductData();
                  });
                }
              }
            })
          }else{
            wx.showLoading({title:"正在保存"});
            that.uploadImg(function(){
              that.postProductData();
            });
          }
        }
			}
		})
	}else{
		wx.showLoading({title:"正在保存"});
		that.uploadImg(function(){
			that.postProductData();
		});
	}
  },postProductData(){
	  // console.log(this.data.list);
	  var p= this.data.product;
	  p["funcNo"] = '1041';
	  if(editProduct){
      p["funcNo"] = '1043';  
      p["id"] =editid;
	  }
		for(var i in p){
			if(p[i] == null || p[i] == undefined){
				delete p[i];
			}
		}
	  this.data.list.splice(0,1);
    var l = this.data.list;
    l.forEach(item=>{
      if(item.keys == 'img'){
        let w = item.imgWidth
        let h = item.imgHeight
        if(item.imgWidth >= '648'){
          w = 648
          h = h * (648/item.imgWidth)
        }
        item.style = 'width:'+ w + 'rpx;' + 'height:' + h + 'rpx;'
      }
    })
    console.log('l',l)
	  if(l.length != 0){
		  p["articleContent"] =JSON.stringify(l);
	  }
	  p["creator"] = app.globalData.managerData.id;
	  network.postRequest(p).then(function(r){
      that.data.exceptionclose = false;
			if(editProduct){
				util.setBackexecute(1,null,{coverdata:p,contentdata:l});
			}else{
        if(inCourse6){
          var cd = wx.getStorageSync("course");
          cd[6] = true;
          wx.setStorageSync("course",cd);
        }
				util.setBackexecute(1,null,null);
			}
			wx.navigateBack({
				delta:1
			})
			});
	  // 保存文章，
	  // 文章id， 保存产品。
  }
  ,uploadImg(callback){
	  var l = this.data.list;
	  if(l.length ==1){ // 没有图片需要保存。
		  callback();
		  return ;
	  }
	  for(var i= 1 ; i<l.length ; i++)
		{
		  var one = l[i];
		  if(one.keys == 'blank' || one.keys == 'txt'){
			that.imguploadfinish(l.length-1,callback);  
			continue;
		  }
		  if(one.src.indexOf("wills")!=-1){
			that.imguploadfinish(l.length-1,callback);
			continue;
		  }
		  that.uploadOneImg(one,callback);
	  }
  },uploadOneImg(one,callback){
		var l = this.data.list;
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
						that.imguploadfinish(l.length-1,callback);
					}else{
						//TODO 错误提示
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
  //封面编辑
  coverAdd(){
	var p = this.data.product;
	if(p.defaultFlag){
		p = null;
	}
	wx.setStorageSync("tocoveraddpage",p);
    wx.navigateTo({
      url: '../coveradd/coveradd',
    })
  },
  //点击＋弹出编辑选择框
  addshow(e) {
    var index = e.currentTarget.dataset.ind
    var show = this.data.list[index].addShow
    if (show) {
      this.data.list[index].addShow = false,
        this.data.mengShow = true
    } else {
      this.data.list[index].addShow = true,
        this.data.mengShow = false
    }
    this.setData({ list: this.data.list, mengShow: this.data.mengShow })
  },
  //排序按钮出现时机
  sortShow(list){
    var that = this
    list.forEach((item,index)=>{
      if(item.keys != 'blank' && index != that.data.list.length-1){
        item.sort = true
      }else{
        item.sort = false
      }
    })
    console.log('list',list)
  },
  //添加元素到list
  additem(e) {
    this.addSelectFalse()
    var keys = e.currentTarget.dataset.keys
    var ind = e.currentTarget.dataset.ind + 1
    if (keys == 'img') {
      this.addimg(keys, ind)
    } else if (keys == 'txt') {
      this.addtxt("", ind)
    }
  },
  addimg(keys, ind) {
    var that = this
    //添加img
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      success(res) {
        const tempFilePaths = res.tempFilePaths.join('')
        //处理图片展示
        wx.getImageInfo({
          src: tempFilePaths,
          success: function (res) {
            let w = res.width / util.rHeight()
            let h = res.height / util.rHeight()
            let ratio = h / w
            let imgWidth
            let imgHeight
            if (w > 710){
              imgWidth = 710
              imgHeight= imgWidth * ratio
            }else{
              imgWidth = w
              imgHeight = h
            }
            var obj = {
              keys: keys,
              src: tempFilePaths,
              addShow: true,
              imgWidth: imgWidth,
              imgHeight: imgHeight,
            }
            that.data.list.splice(ind, 0, obj)
            that.sortShow(that.data.list)
            that.setData({list:that.data.list,show:false })
            that.data.exceptionclose = true;
          }
        })
      }
    })
  },edittext(e){
	  var ind = e.currentTarget.dataset.ind;
	  var content = this.data.list[ind].content;
	  this.data.editFlag =true;
	  this.addtxt(content,ind);
  },
  addtxt(value, ind) {
    var that = this
    //添加txt
    this.data.toindex = ind
    wx.setStorageSync("tominputpage", {
      key: 'compiletxt',
      funcNo: "100",
      value: value,
      target: "文字"
    });
    wx.navigateTo({
      url: '../../../minput/minput',
    })
  },
  //隐藏所有的add-select-box
  addSelectFalse() {
    this.data.list.forEach(item => {
      item.addShow = true
    })
    this.setData({ list: this.data.list, mengShow: false })
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
	var that = this;
	util.backexecute(function(res){
		var value = res.value ;
		var ind = that.data.toindex
		var obj = {
		keys: 'txt',
		content: value,
		addShow: true
		}
		if( that.data.editFlag ){
			that.data.editFlag = false;
			that.data.list.splice(ind, 1, obj)
		}else{
			that.data.list.splice(ind, 0, obj)
		}
    that.data.exceptionclose = true;
    that.sortShow(that.data.list)
		that.setData({ list: that.data.list,show:false })
		that.data.toindex = ''
	},"productcontentedit");
  util.backexecute(res=>{
    wx.showModal({
      content: '是否保存已编辑内容',
      cancelColor: '#b0b3ba',
      confirmText: '保存',
      confirmColor: '#ff8a01',
      success:function(r){
        if(r.confirm){
          var value = res.value;
          var ind = that.data.toindex
          var obj = {
            keys: 'txt',
            content: value,
            addShow: true
          }
          if (that.data.editFlag) {
            that.data.editFlag = false;
            that.data.list.splice(ind, 1, obj)
          } else {
            that.data.list.splice(ind, 0, obj)
          }
          that.data.exceptionclose = true;
          that.sortShow(that.data.list)
          that.setData({ list: that.data.list,show:false })
          that.data.toindex = ''
        }
      }
    })
  },'value')
	util.backexecute(function(res){
    var p = res.product;
    if(p.tags){
      p.tagsarr = p.tags.split(",");
    }
		that.setData({
			product:res.product
    });
    that.data.exceptionclose = true;
    that.course6Text2();
	},"addcover");
	util.backexecute(function(res){
		wx.showModal({
			content:"是否保存之前编辑内容",
      cancelColor: '#333301',
      confirmColor: '#ffa019',
			confirmText:"保存",
      cancelText:"放弃",
			success:function(r){
				if(r.confirm){
					that.setData({
						product:res.product
          });
          that.course6Text2();
          that.data.exceptionclose = true;
				}
			}
		})
	},"exceptionclose");
  util.backexecute(r => {
    wx.getImageInfo({
      src: r,
      success:function(res){
        let w = res.width / util.rHeight()
        let h = res.height / util.rHeight()
        let ratio = h / w
        let imgWidth
        let imgHeight
        if (w > 710){
          imgWidth = 710
          imgHeight= imgWidth * ratio
        }else{
          imgWidth = w
          imgHeight = h
        }
        var obj = {
          keys: 'img',
          src: r,
          addShow: true,
          imgWidth: imgWidth,
          imgHeight: imgHeight,
          originalWidth:res.width,
          originalHeight:res.height
        }
        that.data.list[that.data.imgIndex]= obj
        that.sortShow(that.data.list)
        that.setData({list:that.data.list,show:false})
      }
    })
  }, 'img')
},course6Text2(){
  that.setData({guidance:false,guidance1:true});
  //TODO 隐藏“点击编辑封面”  展示 黑色"完成"按钮
},
  //删除
  closeitem(e) {
    var ind = e.currentTarget.dataset.ind;
    this.data.list.splice(ind, 1);
    that.data.exceptionclose = true;
    this.sortShow(this.data.list)
    this.setData({ list: this.data.list });
    console.log(this.data.list.length)
    if (this.data.list.length == 1) this.setData({ show: true });
  },
  //排序
  bindsort(e) {
    let ind = e.currentTarget.dataset.ind
    let tmp = this.data.list[ind]
    let len = this.data.list.length
    if ((ind + 1) < len) {
      this.data.list[ind] = this.data.list[ind + 1]
      this.data.list[ind + 1] = tmp
    } 
    this.sortShow(this.data.list)
    this.setData({
      list: this.data.list
    })
    that.data.exceptionclose = true;
  },
  //点击图片可预览，可更换
  imgModify(e) {
    console.log('e:', e.currentTarget.dataset.img)
    var img = e.currentTarget.dataset.img
    this.data.imgIndex = e.currentTarget.dataset.ind
    wx.navigateTo({
      url: '../../mine/uploadhi/uploadhi?img=' + img,
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
    if(this.data.exceptionclose){
      var p= this.data.product;
      p["funcNo"] = '1041';
      if(editProduct){
      p["funcNo"] = '1043';  
      p["id"] =editid;
      }
      for(var i in p){
        if(!p[i]){
          delete p[i];
        }
      }
      this.data.list.splice(0,1);
      var l = this.data.list;
      if(l.length != 0){
        p["articleContent"] =JSON.stringify(l);
      }
      p["creator"] = app.globalData.managerData.id;

      util.setBackexecute(1,"exceptionclose",p);
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
