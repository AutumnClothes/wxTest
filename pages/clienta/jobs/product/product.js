// pages/clienta/jobs/product/product.js
var util = require('../../../../utils/util.js');
var network = require('../../../../utils/network.js');
var config = require('../../../../config.js');
var app =getApp()
var that = null;
var inCourse6 = null;
var nextCourseObject = null;
var tokey = null;
var gid = null;
var fromCardId = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    onload:false,
    list:[],
    privatelist:[],
    imguploadsuccessnum:0,
    //引导
    guidance:false,//新增
    guidance1:false,//知道了
    private_show:true
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
    that = this;
    gid = null;
    fromCardId = null;
    var ch = util.systemTop()+88;
    var sh = util.systemHeight()-ch-100;
    var apple = app.globalData.AppleX
    if (apple){
      this.setData({
        bm:50
      })
    }else{
      this.setData({
        bm:0
      })
    }
    this.setData({
      cH : ch,
      sH : sh,
    });
    
    if(options.gid){
      gid = options.gid;
    }
    if(options.key){
      tokey = options.key;
      if(tokey == 'quncard'){
        fromCardId = options.id;
        this.setData({
          private_show:false
        });
      }
      this.setData({
        often:true
      });
    }else{
      tokey = null;
    }
    inCourse6 = null;
    this.datalist();
    wx.getStorage({
      key:"course",
      success:function(r){
        var ad = r.data;
        if(!ad){
          return ;
        }
        if(!ad[6]){ 
          inCourse6 = true;
          that.setData({
            guidance:true
          })
        }
      }
    })
  },datalist(){
    if(inCourse6){
      wx.getStorage({
        key:"course",
        success:function(r){
          var ad = r.data;
          if(!ad){
            return ;
          }
          if(ad[6]){ 
            inCourse6 = false;
          }
        }
      })
    }
		var rd = {
			funcNo:"1044",
			creator:app.globalData.managerData.id
    }
    if(fromCardId){
      rd.creator = fromCardId;
    }
		network.postRequest(rd).then(function(r){
			if(r.error_no == '0'){
				var l = r.data  ;
				var pul = [];
				var prl = [];
				for(var i = 0 ; i< l.length; i++){
					var one = l[i];
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
					if(one["private"] == '1'){
						prl.push(one);
					}else{
						pul.push(one);
					}
        }
        if(tokey == 'quncard'){
          prl = [];
        }
				that.setData({
					list:pul,
					privatelist:prl
				});
      }
      that.setData({
        onload:true
      });
		},function(r){
      wx.showToast({
        title:r,
        duration:3000
      });
      that.setData({
        onload:true
      });
    });
	},
  //新增产品
  productAdd(){
    wx.navigateTo({
      url: '../productadd/productadd',
    })
  },toRead(e){
    var that = this
    if(tokey == 'often'){
      wx.showModal({
        content: '确认发送这个产品吗？',
        cancelColor: '#333301',
        confirmText: '发送',
        confirmColor: '#ffa019',
        success(res){
          if(res.confirm){
            var ind = e.currentTarget.dataset.i;
            var p = e.currentTarget.dataset.p;
            if (p == 'public') {
              var obj = that.data.list[ind]
            } else {
              var obj = that.data.privatelist[ind]
            }
            that.realchatback(obj)
          }
        }
      })
    }else if(tokey == 'qun'){
      //共享
      var i = e.currentTarget.dataset.i;
      var p = e.currentTarget.dataset.p;
      var one = null;
      if (p == "public") {
        one = this.data.list[i];
      } else {
        one = this.data.privatelist[i];
      }
      wx.setStorageSync("topublishmomentpagedatafp",one);
      wx.navigateTo({
        url:"../columnadd/columnadd?key=qun&gid="+gid
      });
    }else if(tokey == 'quncard'){
      var i = e.currentTarget.dataset.i;
      var p = e.currentTarget.dataset.p;
      var one = null;
      if (p == "public") {
        one = this.data.list[i];
      } else {
        one = this.data.privatelist[i];
      }
      var quncardManagerData = wx.getStorageSync("quncardManagerData");
      one["position"]=quncardManagerData.position;
      one["company"]= quncardManagerData.company;
      one["portrait_path"] = quncardManagerData.portrait_path;
      one["user_name"] = quncardManagerData.user_name;
      wx.setStorageSync("toproductreadpage", { data: one });
      wx.navigateTo({
        url: "../productread/productread?key=quncard"
      })
    }else if(tokey == 'column'){
      wx.showModal({
        content: '确认要发表这篇产品吗？',
        cancelColor: '#333301',
        confirmText: '发表',
        confirmColor: '#ffa019',
        success(res) {
          if (res.confirm) {
            var i = e.currentTarget.dataset.i;
            var p = e.currentTarget.dataset.p;
            var one = null;
            if (p == "public") {
              one = that.data.list[i];
            } else {
              one = that.data.privatelist[i];
            }
            console.log(one)
            wx.setStorageSync("topublishmomentpagedatafp",one);
            wx.navigateTo({
              url:'../columnadd/columnadd'
            })
          }
        }
      })
    }else{
      var i = e.currentTarget.dataset.i;
      var p = e.currentTarget.dataset.p;
      var one = null;
      if (p == "public") {
        one = this.data.list[i];
      } else {
        one = this.data.privatelist[i];
      }
      wx.setStorageSync("toproductreadpage", { data: one });
      wx.navigateTo({
        url: "../productread/productread"
      })
    }
	},
  realchatback(obj) {
    util.setBackexecute(1, 'product', obj)
    wx.navigateBack({
      delta: 1
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  course6Done(){

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    that = this;
		util.backexecute(function(){
      if(inCourse6){
        inCourse6 = false;
        that.setData({
          guidance1:true,
          guidance:false
        });
        var cd = wx.getStorageSync("course");
        cd[6] = true;
        wx.setStorageSync("course",cd);
        nextCourseObject = util.nextCourseText(cd);
      }
      that.datalist();
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
        confirmText:"保存",
        cancelText:"放弃",
        success:function(sm){
          if(sm.confirm){
            that.uploadImg(l,function(){
              that.postProductData(r);
            });
          }
        }
      })
    },"exceptionclose");
  },postProductData(p){
    // console.log(this.data.list);
    // if(p["articleContent"]){
    //   p["articleContent"] =JSON.stringify(p["articleContent"]);
    // }
	  network.postRequest(p).then(function(r){
      that.datalist();
      if(inCourse6){
        inCourse6 = false;
        var cd = wx.getStorageSync("course");
        cd[6] = true;
        wx.setStorageSync("course",cd);
        nextCourseObject = util.nextCourseText(cd);
        that.setData({
          guidance1:true,
          guidance:false
        });
      }
		});
	  // 保存文章，
	  // 文章id， 保存产品。
  },iknow(e){
    util.getFormId(e)
    that.setData({
      course6Done:true,
      donetitle: nextCourseObject.title,
      donedesc:nextCourseObject.desc,
      donebutton: nextCourseObject.button,
      donerate : nextCourseObject.rate,
      guidance1:false
    });
    inCourse6 = false; 
  },closeDone(){
    this.setData({course6Done:false});
  },toNextButton(e){
    util.getFormId(e)
    util.toNextCourse(nextCourseObject);
  },uploadImg(list,callback){
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
  statisticsTo(e){
    util.getFormId(e);
    var i = e.currentTarget.dataset.i;
    var p = e.currentTarget.dataset.p;
    var one = null;
    if (p == "public") {
      one = this.data.list[i];
    } else {
      one = this.data.privatelist[i];
    }
    wx.setStorageSync("tostatisticspage", { data: one });
    wx.navigateTo({
      url:'../statistics/statistics'
    })
  },
  catchtap(){},
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.removeStorage({key:'Tj'})
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
