// pages/clienta/jobs/column/column.js
var util = require('../../../../utils/util.js')
var api = require('../../../../utils/api.js')
var network = require('../../../../utils/network.js')
var app = getApp()
var that = null;
var pageIndex = 0;
var pageSize = 10;
var dataList = [];
var full = '';
var fullStyle = '';
var inCourse5 = null;
var nextCourseObject = null;
var fromCardId = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    onload:false,
    list:[
    ],
    backone: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAAAiCAYAAAAAl7SxAAAA40lEQVRoge3VwW3CQBAF0AdKC45EC5BGuNAEaYtjOgp0kBBBC0jJYY0sO8uVlTzzJV+8l9HTfM3i92Onki0OWNUeZ5Qz9osHCN/mD3DPeVn52YkDAC81hPXTx2ibUyI8QHh7+hht85mbkHVABaHDa4tJGuWKyxQh3BZAIviPEO4ykJtQ3YRNg0Fa5sgYoeu/KLn23wghZBVIBIwRQl4GchMwRgh5GRgQwl4GBoSwVWBACFsFEgFZB+QmoCCEvgwUhNBVoCCErgKJgKwDchNQEG4NBmmVH5PLQEF47x/nni/saw9/DNUu6wGRz0sAAAAASUVORK5CYII=',
    backtwo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAAAiCAYAAAAAl7SxAAAA40lEQVRoge3VwW3CQBAF0AdKC0aiBUgjXOggJ9JWugp0kBBBC0jhsI4sO8uVlTzzJV+8l9HTfM3i922vkh0+sK49zihnHBYPEL7NH+Av52XlZycOALzUEDZPH6NtTonwAOH16WO0zWduQtYBFYQOqxaTNMoVlylCuC2ARPAfIdxlIDehugnbBoO0zJExQtd/UXLtvxFCyCqQCBgjhLwM5CZgjBDyMjAghL0MDAhhq8CAELYKJAKyDshNQEEIfRkoCKGrQEEIXQUSAVkH5CagINwaDNIqPyaXgYLw3j/OPV841B7u1pEuWwQe4TEAAAAASUVORK5CYII=',
    course5:false,
    private_show:false,
    editColShow:false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    nextCourseObject = null;
    wx.hideShareMenu();
    that = this;
    fromCardId = null;
    var ch = util.systemTop()+88
    var sh = util.systemHeight()-ch-100
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
      sH:sh
    })

    if(options.key){
      let tokey = options.key;
      if(tokey == 'quncard'){
        fromCardId = options.id;
        this.setData({
          private_show:true
        });
      }
    }

    that.getList();
    inCourse5 = null;
    wx.getStorage({
      key:"course",
      success:function(r){
        var ad = r.data;
        if(!ad){
          return ;
        }
        if(!ad[5]){
          inCourse5 = true;
          that.setData({
            course5:true
          });
        }
      }
    })
  },toarticleview(e){
    var index = e.currentTarget.dataset.index;
    var one = this.data.list[index];
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
    if(fromCardId){
      var quncardManagerData = wx.getStorageSync("quncardManagerData");
      td["position"]=quncardManagerData.position;
      td["company"]= quncardManagerData.company;
      td["portrait_path"] = quncardManagerData.portrait_path;
      td["user_name"] = quncardManagerData.user_name;
      wx.setStorageSync("toviewpagedata",td);
      wx.navigateTo({
        url:"../../view/view?key=quncard"
      });
    }else{
      td["position"]=app.globalData.managerData.position;
      td["company"]= app.globalData.managerData.company;
      td["portrait_path"] = app.globalData.managerData.portrait_path;
      td["user_name"] = app.globalData.managerData.user_name;
      delete td['commentid']
      wx.setStorageSync("toviewpagedata",td);
      wx.navigateTo({
        url:"../../view/view?key=column"
      });
    }
  },toproductview(e){
    var index = e.currentTarget.dataset.index;
    var one = this.data.list[index];
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
    if(fromCardId){
      var quncardManagerData = wx.getStorageSync("quncardManagerData");
      td["position"]=quncardManagerData.position;
      td["company"]= quncardManagerData.company;
      td["portrait_path"] = quncardManagerData.portrait_path;
      td["user_name"] = quncardManagerData.user_name;
      wx.setStorageSync("toproductreadpage",{data:td});
      wx.navigateTo({
        url:"../productread/productread?key=quncard"
      });
    }else{
      td["position"]=app.globalData.managerData.position;
      td["company"]= app.globalData.managerData.company;
      td["portrait_path"] = app.globalData.managerData.portrait_path;
      td["user_name"] = app.globalData.managerData.user_name;
      delete td['commentid']
      wx.setStorageSync("toproductreadpage",{data:td});
      wx.navigateTo({
        url:"../productread/productread?key=column"
      });
    }
  },getList(){
    var that = this
		pageIndex = 0;
		var rd = {
			funcNo:"1047",
			creator:app.globalData.managerData.id
    }
    if(fromCardId){
      rd.creator = fromCardId;
    }
		network.postRequest(rd).then(function(r){
			if(r.error_no == '0'){
				var l = r.data;
				for(var i = 0 ; i<l.length; i++){
					var one = l[i];
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
				}
				dataList = l;
				var len = 0;
				if((pageIndex+1)*pageSize > l.length ){
					len = l.length;
				}else{
					len = (pageIndex+1)*pageSize;
				}
        var newList = [];
				for(var i = 0; i < len ;i++){
          var one = dataList[i];
          one.full = '全文';
          one.fullStyle = '';
          one.titleStyle = '';
          one.domId = 'dom'+i
					newList.push(one);
        }
        that.imgStyle(newList)
				that.setData({
					list:newList
        })
        if(inCourse5){// 在教程里。
          if(newList.length>0){// 教程完成   
            wx.getStorage({
              key:"course",
              success:function(r){
                var ad = r.data;
                if(!ad){
                  return ;
                }
                if(!ad[5]){
                  ad[5]=true;
                  wx.setStorageSync("course",ad);
                  that.course5Done(true,ad);
                }
              }
            })
          }
        }
      }
      that.setData({
        onload:true
      });
      that.querychange()
		},function(r){
      wx.showToast({
        title:r,
        duration:3000
      });
      that.setData({
        onload:true
      });
    })
  },course5Done(flag,ad){
    if(flag){//TODO show 
      nextCourseObject = util.nextCourseText(ad);
      inCourse5 = false; 
    }else{
      //TODO HIDE  
    }
  },
  lowerEvent(){
		pageIndex ++;
		var len = 0;
		if((pageIndex+1)*pageSize > dataList.length ){
			len = dataList.length;
		}else{
			len = (pageIndex+1)*pageSize;
		}
		var newList = [];
		for(var i = 0; i < len ;i++){
			var one = dataList[i];
			newList.push(one);
		}
    that.imgStyle(newList)
		that.setData({
			list:newList
		})
	},
  //图片样式控制
  imgStyle(list){
    list.forEach((item,index)=>{
      if (item.articleid == null && item.productid == null){
        if (item.images == null)return;
        if (item.imagesarr == undefined || item.imagesarr == '' || item.imagesarr == null){
          item.imagesarr = item.images.split(',')
        }
        var len = item.imagesarr.length;
        if (len == '1') {
          item.style = 'width:258rpx;height:258rpx;'
        }
      }
    })
  },
  //删除
  dynamicDelete(e){
    util.getFormId(e)
    var ind = e.currentTarget.dataset.ind;
		var id = e.currentTarget.dataset.id;
    wx.showModal({
      cancelColor: '#333301',
      confirmText: '删除',
      confirmColor: '#ffa019',
      content: '确定要删除此条动态吗？',
      success:function(res){
        if(res.confirm){
					var dd = {
						funcNo:"1046",
						id:id
					}
					network.postRequest(dd).then(function(r){
						if(r.error_no == '0'){
							that.data.list.splice(ind, 1)
							that.setData({
								list: that.data.list
							})
						}
					})
        }
      }
    })
  },
  //增加
  productAdd(e){
    util.getFormId(e)
    this.setData({
      editColShow:true
    })
    // util.setBackexecute(0);
    // wx.navigateTo({
    //   url: '../columnadd/columnadd',
    // })
  },
  editImg(e){
    util.getFormId(e)
    util.setBackexecute(0);
    wx.navigateTo({
      url: '../columnadd/columnadd',
    })
  },
  editMsg(e){
    util.getFormId(e)
    util.setBackexecute(0,"reloadMoment");
    wx.navigateTo({
      url: '../newmsg/newmsg?key=column',
    })
  },
  editProduct(e){
    util.getFormId(e)
    util.setBackexecute(0,"reloadMoment");
    wx.navigateTo({
      url: '../product/product?key=column',
    })
  },
	imageview(e){
		var index = e.currentTarget.dataset.index;
		var ind = e.currentTarget.dataset.ind;
		var one = that.data.list[index];
		var imagesarr = one.imagesarr;
		wx.previewImage({
			urls:imagesarr,
			current:imagesarr[ind]
		})
  },
  //全文
  fullBind(e){
    var ind = e.currentTarget.dataset.ind
    var ful = e.currentTarget.dataset.ful
    var id = e.currentTarget.dataset.id
    if(ful == '全文'){
      this.data.list[ind].full = '收起';
      this.data.list[ind].fullStyle = 'position:static';
      this.data.list[ind].titleStyle = 'max-height:9999rpx'
    }else if(ful == '收起'){
      this.data.list[ind].full = '全文';
      this.data.list[ind].fullStyle = '';
      this.data.list[ind].titleStyle = ''
    }
    this.setData({
      list:this.data.list,
    })
    if(ful == '收起'){
      this.setData({
        itemdomid:id
      })
    }
  },
  querychange(){
    var that = this
    wx.createSelectorQuery().selectAll(".dynamic-item-title").fields({
      size:true
    },function(r){
      r.forEach((item,index)=>{
        let h = item.height / util.rHeight()
        if(h >310){
          that.data.list[index].fullshow = true
        }else{
          that.data.list[index].fullshow = false
        }
      })
      that.setData({
        list:that.data.list
      })
    }).exec();
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
//     util.backexecute(r=>{
//       if (r != 'nullparam'){
//         this.data.list.unshift(r.value)
//         this.setData({
//           list: this.data.list
//         })
//       }
//     })
    if(this.data.editColShow){
      this.setData({editColShow:false})
    }
		util.backexecute(function(r){
      that.getList();
      if(inCourse5){
        inCourse5 = false;
        wx.getStorage({
          key:"course",
          success:function(r){
            var ad = r.data;
            if(!ad){
              return ;
            }
            if(!ad[5]){
              ad[5]=true;
              wx.setStorageSync("course",ad);
              nextCourseObject = util.nextCourseText(ad);
              that.setData({
                course5Done:true,
                donetitle: nextCourseObject.title,
                donedesc:nextCourseObject.desc,
                donebutton: nextCourseObject.button,
                donerate : nextCourseObject.rate,
                course5:false
              });
            }
          }
        })
      }
		},"reloadMoment");
  },closeDone(){
    this.setData({course5Done:false});
  },toNextButton(e){
    util.getFormId(e)
    util.toNextCourse(nextCourseObject);
  },closeEditCol(e){
    util.getFormId(e)
    this.setData({editColShow:false})
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

  }
})
