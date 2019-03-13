// pages/clienta/jobs/newmsg/newmsg.js
var util = require('../../../../utils/util.js');
var network = require('../../../../utils/network.js');
var config = require('../../../../config.js');
var app = getApp();
var that = null;
var distance = 0;
var startmove = null;
var inCourse3 = null;
var nextCourseObject = null;
var tokey = null;
var gid = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
		pageData:null,
    //滑动
    startx:'',
    starty:'',
    endx:'',
    endy:'',
    iteLeft: '',
    scrolly:true,
    editButton:false,
    //测试数据
    list:[],
    addBoxShow:false,
    clipboardData:'',
    clipboardShow:false,
    imguploadsuccessnum:0,
    often: false,
    templist:[],
    //引导
    course3:false,//点击新增资讯   教程三
    course4:false,
    guidance1:false,//关闭小程序，复制公众号文章
    // guidance2:false,//推荐资讯
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
wx.hideShareMenu();
    that = this;
    gid = null;
    let ch = util.systemTop() + 100
    let sh = util.systemHeight()-ch-88
    this.setData({
      cH: ch,
      sH:sh
    })
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
    if(options.key){
      tokey = options.key;
    }else{
      tokey = null;
    }
    if(options.gid){
      gid = options.gid;
    }
    // this.realchatto(options);
    inCourse3 = null;
    wx.getStorage({
      key:"course",
      success:function(r){
        var ad = r.data;
        if(!ad){
          return ;
        }
        if(!ad[3]){ 
          inCourse3 = true;
          that.course3Text1(true);
        }else if(!ad[4]){
          that.course4Text1(true);
        }
      }
    })
  },totags(e){
    util.getFormId(e);
    wx.navigateTo({
      url:"../../protag/usertag"
    });
  },course3Text1(flag){
    if(flag){
      this.setData({course3:true,guidance1:true});
    }else{
      this.setData({course3:false});
    }

  },course4Text1(flag){
    if(flag){
      this.setData({course4:true});
    }else{
      this.setData({course4:false});
    }
    // 推荐资讯     "点击刚新增的资讯"            转发文章那么多。
  },
  refreshpage(){
		var that = this;
		var rd = {
			funcNo:"1037",
			creator:app.globalData.managerData.id
		}
		network.postRequest(rd).then(function(r){
			if(r.error_no == '0'){
        var d = r.data;
				that.data.pageData = d;
				var list = [];
				for(var i = 0 ; i<d.length ;i++){
					var one = d[i];
					var scratchTime = util.getShowTimeStr(one.scratchtime);
					var pathDate = util.getPathDateStr(one.scratchtime);
					var pathid = one.pathid;
					one.pathDate = pathDate;
					var aa = {
						id:one.id,
						img: util.getArticleTitleImg(one),
						text: one.title,
						time: scratchTime,
            iteLeft: '',
            statisticsPps:one.pps
					};
					list.push(aa)
        }
        that.data.templist = list;
				that.setData({
          list:list,
				});
			}
		});
	}
	,toviewpage(e){
    if(!tokey){
      var id = e.currentTarget.dataset.id;
      var d = this.data.pageData;
      var o = null;
      for (var i = 0; i < d.length; i++) {
        var one = d[i];
        if (one.id == id) {
          o = one;
          break;
        }
      }
      wx.setStorageSync("toviewpagedata", o);
      wx.navigateTo({
        url: "../../view/view"
      })
    }else if (tokey == 'often') {
      wx.showModal({
        content: '确认要发送这条资讯吗？',
        cancelColor: '#333301',
        confirmText: '发送',
        confirmColor: '#ffa019',
        success(res) {
          if (res.confirm) {
            var ind = e.currentTarget.dataset.ind
            var obj = that.data.pageData[ind]
            that.realchatback(obj)
          }
        }
      })
    }else if(tokey=='qun'){
      //共享
      var id = e.currentTarget.dataset.id;
      var d = this.data.pageData;
      var o = null;
      for (var i = 0; i < d.length; i++) {
        var one = d[i];
        if (one.id == id) {
          o = one;
          break;
        }
      }
      wx.setStorageSync("topublishmomentpagedata",o);
      wx.navigateTo({
        url:"../columnadd/columnadd?key=qun&gid="+gid
      });
    }else if(tokey == 'column'){
      wx.showModal({
        content: '确认要发表这条资讯吗？',
        cancelColor: '#333301',
        confirmText: '发表',
        confirmColor: '#ffa019',
        success(res) {
          if (res.confirm) {
            var ind = e.currentTarget.dataset.ind
            var obj = that.data.pageData[ind]
            wx.setStorageSync("topublishmomentpagedata",obj);
            wx.navigateTo({
              url:'../columnadd/columnadd'
            })
          }
        }
      })
    }
	},
  realchatback(obj) {
    util.setBackexecute(1, 'newmsg', obj)
    wx.navigateBack({
      delta: 1
    })
  },
  realchatTo(e){
  },
  touchS(e) {
    if (!tokey) {
      this.data.startx = e.changedTouches[0].clientX
      this.data.starty = e.changedTouches[0].clientY
      this.data.list.forEach(item => {
        item.iteLeft = 0;
      })
      this.setData({ list: this.data.list })
      startmove =null;
      distance =0;
    }
  },
  touchM(e) {
    if (!tokey) {
      if(distance == 0){
        distance = this.data.startx;
      }
      let movex = e.changedTouches[0].clientX - this.data.startx
      let movey = e.changedTouches[0].clientY - this.data.starty
      if(startmove ==null){
        if(Math.abs(movex) > 20 || Math.abs(movey)>20){
          if(Math.abs(movex)>Math.abs(movey) ){
            startmove = true;
          }else{
            startmove = false;
          }
        }
      }
      if (startmove){
        this.setData({
          scrolly: false
        })
        this.data.iteLeft = movex;
        if(movex>0)return ;
        if( Math.abs(e.changedTouches[0].clientX - distance)<50){
          return ;
        }else{
          distance = e.changedTouches[0].clientX;
        }
        if (this.data.iteLeft < -266) this.data.iteLeft = 266;
        let ind = e.currentTarget.dataset.ind;
        this.data.list[ind].iteLeft = this.data.iteLeft;
        this.setData({
          list: this.data.list
        })
      }else{
        this.setData({
          scrolly: true,
        })
        this.data.iteLeft = 0
      };
    }
  },
  touchE(e) {
    if (!tokey) {
      let endx = this.data.startx - e.changedTouches[0].clientX
      let ind = e.currentTarget.dataset.ind
      if(endx <= 130){
        this.data.list[ind].iteLeft = 0
      }else{
        this.data.list[ind].iteLeft = -266
      }
      this.setData({
        list: this.data.list,
        scrolly: true
      })
    }
  },
  //newmsgNone
  newmsgNone(){
    wx.previewImage({
      urls:['https://www.willsfintech.cn:9004/staticFile/scratchArticleGuidance.jpg']
    })
  },
  //添加文章
  bindAdd(e){
    util.getFormId(e)
    if(!tokey){
      this.setData({
        addBoxShow: true,
        guidance1:false
      })
      this.clipboard()
    }
  },
  //调系统剪贴板
  clipboard(){
    wx.getClipboardData({
      success:function(res){
        if (res.data != ""){
          that.setData({
            clipboardShow:true,
            clipboardData:res.data
          })
        }else{
          that.setData({
            clipboardShow: false,
          })
        }
      }
    })
  },
  //关闭弹窗
  clipboardClose(e){
    util.getFormId(e)
    this.setData({
      editButton: false,
      addBoxShow:false,
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
    util.backexecute(function(r){
      var title = null;
      var list = null;
      var nulllist = {keys: "txt", content: "请完善内容", addShow: true};
      var nulltitle = "请完善标题";
      if(r.title){
        title = r.title;
      }else{
        title = nulltitle;
      }
      if(r.list.length !=1){
        r.list.splice(0,1);
        list = r.list;
      }else{
        list = [];
        list.push(nulllist);
      }
      wx.showModal({
        content:"是否保存之前编辑内容",
        confirmText:"保存",
        cancelText:"放弃",
        success:function(r){
          if(r.confirm){
            that.uploadImg(list,function(){
              that.postProductData(title,list);
            });
          }
        }
      })
    },"exceptionclose");
		this.refreshpage();
  },uploadImg(list,callback){
    var l = list;
    if(l.length ==0){ // 没有图片需要保存。
		  callback();
		  return ;
	  }
	  for(var i= 0 ; i<l.length ; i++)
		{
		  var one = l[i];
		  if(one.keys == 'title' || one.keys == 'txt'){
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
						//TODO 错误提示
					}
				}
			}
		})
	},
	imguploadfinish(len,callback){
		this.data.imguploadsuccessnum++;
		if(this.data.imguploadsuccessnum == len){
			this.data.imguploadsuccessnum =0;
			callback();
		}
  },postProductData(title,l){
    var type = '2';
    for(var i = 0 ; i<l.length ;i++){
      var one = l[i];
      if(one.keys == 'img'){
        if(one.originalWidth>=77 && one.originalHeight >=77) {
          type = one.src;
        }
      }
    }
		var rd = {
			funcNo:"1036",
			title:title,
			articleContent:l,
      creator:app.globalData.managerData.id,
      type:type
		}
		/* if(editid !=null){
			rd["id"] = editid;
		} */
		network.postRequest(rd).then(function(r){
			if(r.error_no == '0'){
        that.refreshpage();
			}
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

  },
	bindSave(e){
    util.getFormId(e)
		var url =  this.data.clipboardData;
		if(url.indexOf("mp.weixin.qq.com")==-1){
			wx.showToast({
				title:"错误的链接",
				icon:'none'
			})
			return ;
		}
		var rd = {
			funcNo:'1036',
			creator:app.globalData.managerData.id,
			url:url
		}
		wx.showLoading({
			mask:true
		});
		network.postRequest(rd).then(function(r){
			wx.hideLoading();
			if(r.error_no == '0'){
        wx.showToast({
          title: '资讯已保存',
          icon: 'none'
        })
				that.setData({
					addBoxShow: false,
          editButton:false,
				})
        that.refreshpage();
        // nextCourseObject
        if(inCourse3){
          that.course3Done(true);
        }
			}else{
				wx.showToast({
					title:r.error_info,
					icon:'none'
				})
			}
		});
	},course3Done(flag){
    if(flag){//TODO show 
      wx.getStorage({
        key:"course",
        success:function(r){
          var ad = r.data;
          if(!ad){
            return ;
          }
          if(!ad[3]){
            ad[3] =true;
            wx.setStorageSync("course",ad);
            nextCourseObject = util.nextCourseText(ad);
            that.setData({
              course3Done:true,
              donetitle: nextCourseObject.title,
              donedesc:nextCourseObject.desc,
              donebutton: nextCourseObject.button,
              donerate : nextCourseObject.rate,
              course3:false
            });
          }
        }
      })
      inCourse3 = false; 
    }else{
      //TODO HIDE  
    }
  },closeDone(){
    this.setData({course3Done:false});
  },toNextButton(e){
    util.getFormId(e)
    util.toNextCourse(nextCourseObject);
  },
	deleteArticle(e){
    wx.showModal({
      content:"确认删除资讯",
      cancelColor: '#333301',
      confirmText: '删除',
      confirmColor: '#ffa019',
      success:function(res){
        if(res.confirm){
          var id = e.currentTarget.dataset.id;
          var rd = {
            funcNo:'1038',
            id:id
          }
          network.postRequest(rd).then(function(r){
            if(r.error_no == '0'){
              that.refreshpage();
            }
          });
        }
      }
    });
	},
  editBind(){
    if (this.data.editButton){
      this.setData({
        editButton: false
      })
    }else{
      if(inCourse3){
        //TODO SHOW 关闭小程序-复制你想要转发的微信公众号文章链接-回到这里-点击保存
        // 包含在editButton里。
      }
      this.setData({
        editButton: true
      })
    }
    this.setData({
      addBoxShow: false
    })
  },
  //创作
  editCreate(e){
    util.getFormId(e)
    this.setData({
      addBoxShow:false
    })
    wx.navigateTo({
      url: '../compile/compile',
    })
  },
  searchinput(e){
    var v = e.detail.value;
    var l = this.data.templist;

    if(v){
      var searchl = [];
      for(var i = 0 ; i<l.length; i++){
        var one = l[i];
        if(one.text.indexOf(v)!=-1){
          searchl.push(one);
        }
      }
      this.setData({
        list:searchl
      });
    }else{
      this.setData({
        list:this.data.templist
      });
    }
  },
  clipboardS(){
    wx.showToast({
      title: '点击保存添加文章',
      icon:'none'
    })
  },
  statisticsTo(e){
    util.getFormId(e);
    var id = e.currentTarget.dataset.id;
    var d = this.data.pageData;
    var o = null;
    for (var i = 0; i < d.length; i++) {
      var one = d[i];
      if (one.id == id) {
        o = one;
        break;
      }
    }
    wx.setStorageSync("tostatisticspage", { data: o});
    wx.navigateTo({
      url:'../statistics/statistics'
    })
  }
  //点评
  // editComment(e){
  //   util.getFormId(e)
  //   wx.navigateTo({
  //     url: '../view-back/view',
  //   })
  // }
})
