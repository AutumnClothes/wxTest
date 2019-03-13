// pages/clienta/jobs/columnadd/columnadd.js
var util = require('../../../../utils/util.js')
var config = require('../../../../config.js')
var network = require('../../../../utils/network.js')
var app = getApp()
var that = null;
var counter = 0;
var topublishmoment = null;
var topublishmomentfp = null;
var key =null;
var gid = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    newImg: '',
    imgList: [],
    type: "textandimages", // 默认发布类型。图文
    imgAddShow: true,
    len: 8,
    article: null,
    //引导
    guidance:false,//发布
    pageTitle:"个人专栏",
    maxlength:1000
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
wx.hideShareMenu();
    that = this;
    key =null;
    gid = null;
    var ch = util.systemTop() + 88
    var apple = app.globalData.AppleX
    if (apple) {
      this.setData({
        bm: 50
      })
    } else {
      this.setData({
        bm: 0
      })
    };
    this.setData({
      cH: ch,
    });
    if(options["key"]){
      key = options["key"];
      this.setData({
        maxlength:140
      });
    }
    if(options.gid){
      gid = options.gid;
    }
    topublishmoment = wx.getStorageSync("topublishmomentpagedata");
    topublishmomentfp = wx.getStorageSync("topublishmomentpagedatafp");
    if (topublishmoment) {
      if(key){
        this.setData({
          pageTitle:"共享资讯"
        })
      }
      var scratchTime = util.getShowTimeStr(topublishmoment.scratchtime);
      var img = util.getArticleTitleImg(topublishmoment);
      topublishmoment["img"] = img;
      topublishmoment["timestr"] = scratchTime;
      this.setData({
        type: "article",
        article: topublishmoment
      });
      wx.removeStorage({
        key: "topublishmomentpagedata"
      })
      return;
    }
    if (topublishmomentfp) {
      if(key){
        this.setData({
          pageTitle:"共享产品"
        })
      }
      this.setData({
        type: "product",
        product: topublishmomentfp
      });
      wx.removeStorage({
        key: "topublishmomentpagedatafp"
      })
      return;
    }
    wx.getStorage({
      key:"course",
      success:function(r){
        var ad = r.data;
        if(!ad){
          return ;
        }
        if(!ad[5]){
          that.setData({
            guidance:true
          });
          //TODO show 除了图文动态，还可以将资讯通过底部【分享文章】按钮发至专栏 
          //点此发布第一篇动态
        }
      }
    })
  },
  //增加图片
  imgAdd(e) {
    util.getFormId(e)
    wx.chooseImage({
      count: that.data.len,
      sizeType: ['compressed'],
      success: function(res) {
        that.data.newImg = res.tempFilePaths
        that.data.imgList.push(...that.data.newImg)
        that.data.len = that.data.imgList.length; //最多上传八张图
        if (that.data.len < 8) {
          that.data.len = 8 - that.data.len;
          that.setData({
            imgAddShow: true,
          })
        } else {
          that.setData({
            imgAddShow: false,
          })
        }
        that.setData({
          imgList: that.data.imgList
        })
      },
    });
  },
  //删除图片
  imgDel(e) {
    util.getFormId(e)
    var ind = e.currentTarget.dataset.ind
    wx.showModal({
      cancelColor: '#333301',
      confirmText: '删除',
      confirmColor: '#ffa019',
      content: '确认要删除这张图片嘛？',
      success: function(res) {
        if (res.confirm) {
          that.data.imgList.splice(ind, 1)
          that.setData({
            imgList: that.data.imgList
          })
        }
      }
    })
  },
  //标题
  inputOn(e) {
    this.data.title = e.detail.value
  },
  //发布
  dynamicAdd(e) {
    util.getFormId(e);
    if(key == 'qun'){
      var remark = this.data.title;
      if(!remark){
        remark=app.globalData.managerData.user_name+"共享了"+(this.data.type == 'product'?"一款产品":"一篇资讯")
        +"，快来看看吧。";
      }
      var id = null;
      if(topublishmoment){
        id = topublishmoment.id;
      }else{
        id = topublishmomentfp.id;
      }
      var rd = {
        funcNo:'1059',
        mid:app.globalData.managerData.id,
        gid:gid,
        type:this.data.type,
        remark:remark,
        id:id
      }
      network.postRequest(rd).then(function(r){
        if(r.error_no == '0'){
          util.setBackexecute(2,"reloadfiles",null);
          wx.navigateBack({
            delta:2
          });
        }
      });
      return;
    }
    if (that.data.title != '') {
      wx.showModal({
        cancelColor: '#333301',
        confirmText: '确认',
        confirmColor: '#ffa019',
        content: '是否发布最新动态？',
        success: function(res) {
          if (res.confirm) {
            // 没有title
            var type = that.data.type
            if (type == 'textandimages') { // 图文
              counter = 0;
              if (that.data.imgList.length != 0) {
                for (var i = 0; i < that.data.imgList.length; i++) {
                  var one = that.data.imgList[i];
                  var index = i;
                  that.uploadOneImg(one, index);
                }
              } else {
                that.postData();
              }
            } else if (type == 'article') {
              var commentid = null;
              commentid = new Date().getTime() + "" + topublishmoment.id;
              var cd = {
                articleid: topublishmoment.id,
                comment: topublishmoment.sharecomment,
                id: commentid
              };
              delete topublishmoment.sharecomment;
              cd["funcNo"] = '1040';
              network.postRequest(cd);
              var text = that.data.title;
              var articleid = that.data.article.id;
              var rd = {
                funcNo: "1045",
                creator: app.globalData.managerData.id,
                text: text,
                articleid: JSON.stringify(topublishmoment)
              }
              if (commentid != null) {
                rd["images"] = commentid; // 用 images 保存 分享时创建的点评
              }
              network.postRequest(rd).then(function(r) {
                var ss =  getCurrentPages();
                if(ss.length >3 && ss[ss.length-3].route == 'pages/clienta/jobs/column/column'){
                  util.setBackexecute(2,"reloadMoment",null);
                }
                wx.navigateBack({
                  delta: 1
                })
              });
            } else if (type = "product") {
              var commentid = null;
              commentid = new Date().getTime() + "" + topublishmomentfp.articleid;
              var cd = {
                articleid: topublishmoment.articleid,
                comment: topublishmomentfp.sharecomment,
                id: commentid
              };
              delete topublishmomentfp.sharecomment;
              cd["funcNo"] = '1040';
              network.postRequest(cd);
              var text = that.data.title;
              // var productid = topublishmomentfp.id;
              var rd = {
                funcNo: "1045",
                creator: app.globalData.managerData.id,
                text: text,
                productid: JSON.stringify(topublishmomentfp)
              }
              if (commentid != null) {
                rd["images"] = commentid; // 用 images 保存 分享时创建的点评
              }
              network.postRequest(rd).then(function(r) {
                var ss =  getCurrentPages();
                if(ss.length >3 && ss[ss.length-3].route == 'pages/clienta/jobs/column/column'){
                  util.setBackexecute(2,"reloadMoment",null);
                }
                wx.navigateBack({
                  delta: 1
                })
              });
            }
          }
        }
      })
    }else {
      wx.showToast({
        icon: 'none',
        title: '请完善点评内容。'
      })
    }
  },
  uploadOneImg(one, index) {
    wx.uploadFile({
      url: config.uploadImg,
      filePath: one,
      name: "momentContent",
      success: function(res) {
        if (res.statusCode == 200) {
          var d = JSON.parse(res.data);
          if (d.error_no == '0') {
            var path = d.path;
            that.data.imgList[index] = path;
            that.uploadimg(that.data.imgList.length, function() {
              that.postData();
            });
          } else {

          }
        }
      }
    })
  },
  uploadimg(len, callback) {
    counter++;
    if (len == counter) {
      callback();
    }
  },
  postData() {
    // console.log(that.data.imgList);
    var images = "";
    for (var i = 0; i < that.data.imgList.length; i++) {
      var one = that.data.imgList[i];
      if (i == 0) {
        images += one;
      } else {
        images += "," + one;
      }
    }
    var text = this.data.title;

    var rd = {
      funcNo: "1045",
      creator: app.globalData.managerData.id,
      text: text,
    }
    if (images != "") {
      rd["images"] = images;
    }
    network.postRequest(rd).then(function(r) {
      util.setBackexecute(1, "reloadMoment", null);
      wx.navigateBack({
        delta: 1
      })
    });

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

  }
})
