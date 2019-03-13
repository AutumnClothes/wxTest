// pages/clienta/circle/member/member.js
var util = require('../../../utils/util.js')
var api = require('../../../utils/api.js')
var network = require('../../../utils/network.js')
var app = getApp()
var distance = 0;
var startmove = null;
var that = null;
var gid = null;
var shareoptions = null;
var pageIndex = 0;
var noData = false;
var addManager = null;
var theEvent = null;
var tocreate = null;
var fromtemplate = null;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //滑动
    startx:'',
    starty:'',
    endx:'',
    endy:'',
    iteLeft: '',
    scrolly:true,
    editButton:false,
    //tab分页
    curr:0,
    current: '0',
    //名片列表数据
    cardArr:[],
    //动态列表测试数据,数据同专栏
    columnArr:[],
    createMyCard:false,
    createText:"创建名片后，即可将共享资讯保存到你的名片哦"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    tocreate = null;
    theEvent = null;
    addManager = null;
    pageIndex = 0;
    noData = false;
    shareoptions = null;
    that =this;
    gid = null;
    fromtemplate = null;
    // wx.hideShareMenu();
    wx.showShareMenu({
      withShareTicket:true
    })
    let h = util.systemTop() + 88
    let sch = util.systemHeight() - h - 80
    var apple = app.globalData.AppleX;
    if (apple) {
      this.setData({
        bm: 50
      });
    } else {
      this.setData({
        bm: 0
      });
    }
    this.setData({
      cH: h,
      scH:sch
    })

    if(options["gid"]){
      if(options["fromShareTo"]){
        fromtemplate = true;
      }
      gid = options["gid"];
    }else{
      shareoptions = true;
    }
    //--- data init
    if(app.globalData.customerData !=null){
      that.initData();
    }else{
      // 授权，add cus role
      this.data.getUserCallBack = 'addUser';
      that.getSetting(that.addUser);
    }
  },initData(){
    var rd = {
      funcNo:"1056"
    };
    if(gid){
      rd["gid"] = gid;
      network.postRequest(rd).then(function(res){
        if(res.error_no == '0'){
          that.renderData(res.data);
        }
      });
      that.loadFiles();
    }else{
      var shareTicket =  wx.getStorageSync("shareTicket");
      wx.getShareInfo({
        shareTicket:shareTicket,
        success:function(r){
          console.log(r);
          var encryptedData = r["encryptedData"];
          var iv = r["iv"];
          var openid = wx.getStorageSync("openidFromCode");
          rd["openid"] = openid;
          rd["iv"] = iv;
          rd["encryptedData"] = encryptedData;

          if(app.globalData.managerData){
            rd["mid"] = app.globalData.managerData.id;
          }else if(app.globalData.customerData){
            rd["mid"] = app.globalData.customerData.id;
          }
          network.postRequest(rd).then(function(res){
            if(res.error_no == '0'){
              gid = res.gid;
              that.renderData(res.data);
              that.loadFiles();
            }
          });
        }
      })
    }
  },loadFiles(){
    var rd = {
      funcNo:"1060",
      gid:gid,
      pageIndex:pageIndex
    }
    network.postRequest(rd).then(function(r){
      if(r.error_no == '0'){
        if(r.data.length ==0){
          noData = true;
          return ;
        }
        for(var i = 0 ; i<r.data.length;i++){
          var one =  r.data[i];
          if(!!app.globalData.managerData && one.creator == app.globalData.managerData.id){
            one["deleteButton"] =true;
          }
          if(one.type == 'article'){
            one.imgurl = that.getArticleTitleImg(one);
            one.articletimestr = util.getShowTimeStr(one.scratchtime);
          }else{
            one.tagsarr = "";
            if(one.tags){
              one.tagsarr = one.tags.split(",");
            }
          }
          one.timestr = util.getShowTimeStr(one.time*1);
        }
        var newArr = that.data.columnArr.concat(r.data);
        that.setData({
          columnArr:newArr
        }); 
      }
    });
  },getArticleTitleImg(one){
		if(one.atype=='2' ){// 自编
			var img = 'https://www.willsfintech.cn:9004/staticFile/image/articletitle1.png'
			return img;
		}else if(one.atype == '1'){ // 收录
			var img = 'https://www.willsfintech.cn:9004/staticFile/image/articletitle2.png'
			return img;
		}else if(one.atype =='0'){
			var pathDate = util.getPathDateStr(one.scratchtime);
			var pathid = one.pathid;
			var img = 'https://www.willsfintech.cn:9004/articleHtml/'+pathDate+"/"+pathid+"/title.jpg";
			return img;
		}else if(one.atype){
			return one.atype;
		}
	},renderData(list){
    var mid = null;
    var mo = null;
    if(app.globalData.managerData){
      mid = app.globalData.managerData.id;
    }
    var templist = [];
    for(var i = 0 ; i< list.length ;i++){
      var one = list[i];
      var pp = one["portrait_path"];
      if(!pp){
        continue;
      }
      pp = pp.substring(0,pp.lastIndexOf("."))+"s"+pp.substring(pp.lastIndexOf("."));
      var city = one.city;
      if(city){
        city = city.replace(",","");
        city = city.replace(",","");
      }
      var o = {
        headImgUrl:pp,
        user_name:one.user_name,
        position:one.position,
        company:one.company,
        mobile_phone:one.mobile_phone,//电话
        city:city,//地址
        profile:one.profile,//亮点
        mid:one.id
      };
      if(mid == one.id){
        mo = o;
        continue;
      }
      templist.push(o);
    }
    if(mo!=null){ // 查询到了自己的名片
      templist.unshift(mo);
    }else if(mid!=null){ // 刚创建的查询不到。
      var one = app.globalData.managerData;
      var pp = one["portrait_path"];
      pp = pp.substring(0,pp.lastIndexOf(".")) +"s"+pp.substring(pp.lastIndexOf("."));
      var city = one.city;
      if(city){
        city = city.replace(",","");
        city = city.replace(",","");
      }
      mo = {
        headImgUrl:pp,
        user_name:one.user_name,
        position:one.position,
        company:one.company,
        mobile_phone:one.mobile_phone,//电话
        city:city,//地址
        profile:one.profile,//亮点
      };
      templist.unshift(mo);
    }else{ //  还没有自己的名片
      that.setData({
        createMyCard:true
      });
    }
    that.composeLength(templist);
    that.setData({
      cardArr:templist
    });
  },bottomEvent(e){
    if(!noData){
      pageIndex++;
      this.loadFiles();
    }
  },getSetting(success){
		var that =this;
		 wx.getSetting({
		      success: res => {
		        if (res.authSetting['scope.userInfo']) {
		          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
		          wx.getUserInfo({
		            success: res => {
									success(res);
		            }
		          })
		        }else if(res.authSetting['scope.userInfo'] == undefined){ // 没有授权
							that.setData({
								accreditType:"toget"
							});
						}else{ // 拒绝授权
							that.setData({
								accreditType:"toset"
							});
						}
		      }
		    })
	},closeaccredit(){
		this.setData({
			accreditType:null
    })
  },addUser(res){
    var ui = null;
    if(res){
      ui = res.userInfo;
    }
		var addData = {
      funcNo:"1021",
			openid:openidFromCode
		}
		if(res){
      addData["portrait"]=ui.avatarUrl;
			addData['nickname'] =ui.nickName;
			addData["iv"]  = res.iv;
			addData["encryptedData"] = res.encryptedData;
		}else{
		}
		network.postRequest(addData,5,3000,true).then(function(addData){
      app.globalData.customerData = {};
      app.globalData.customerData.id = addData.cusid;
      app.globalData.customerData.unionid = addData.unionid;
			if(res){
				app.globalData.customerData.nickname = ui.nickName;
				app.globalData.customerData.portraitpath = ui.avatarUrl;
			}else	{
				app.globalData.customerData.nickname = "匿名客户"+addData.cusid;
      }
      that.initData();
		})
	},addManager(res) {
    addManager = true;
    var ui = res.userInfo;
    var openidFromCode = wx.getStorageSync("openidFromCode");
    var addData = {
      openid: openidFromCode,
      portrait: ui.avatarUrl,
      nickname: ui.nickName,
      iv: res.iv,
      encryptedData: res.encryptedData
    }
    if(app.globalData["customerData"] && app.globalData["customerData"].unionid){
      addData["unionid"] = app.globalData["customerData"].unionid;
    }
    wx.setStorageSync("fromcardboxTocard", addData);

    if(tocreate){
      wx.reLaunch({
        url:"/pages/clienta/mine/card/card"
      });
    }else{
      that.toproductview(theEvent);
    }
  },onGotUserInfo:function(res){
    var userInfo = res.detail["userInfo"];
    // {detail:{userInfo:{}}}
		if(userInfo){ // 如果有客户资料
      if (this.data.getUserCallBack == 'addManager') {
        this.addManager(res.detail);
      } else if (this.data.getUserCallBack == 'addUser') {
        this.addUser(res.detail);
      }
		}else{ // 没有
      if (this.data.getUserCallBack == 'addUser') {
        this.addUser(null);
      }else {
        wx.hideLoading();
        wx.showToast({
          title: "需要授权",
          duration: 3000
        });
      }
		}
	},opensetting:function(res){ // 去设置页之后的回调。
		var that = this;
		if(res.detail.authSetting["scope.userInfo"] == true){ // 如果有了权限
      wx.getUserInfo({success:function(res){ // 获取资料。
        // that.addUser(res);
        if (that.data.getUserCallBack == 'addManager') { // 判断是需要更新
          that.addManager(res);
        } else if (that.data.getUserCallBack == 'addUser') { // 还是创建新的客户身份
          that.addUser(res);
        }
			}})
		}else{ // 如果没有权限。 不需要更新，  判断是否创建新的客户身份 用匿名
      if (that.data.getUserCallBack == 'addUser') {
        that.addUser(null);
      } else {
        wx.hideLoading();
        wx.showToast({
          title: "需要授权",
          duration: 3000
        });
      }
		}
	},bindback(){
    if(shareoptions||fromtemplate){
      if(app.globalData.managerData){
        wx.redirectTo({
          url:"/pages/clienta/clienta"
        });
      }else{
        wx.redirectTo({
          url:"/pages/cardbox/cardbox"
        });
      }
    }else{
      wx.navigateBack({
        delta:1
      });
    }
  },
  touchS(e) {
    if (!this.data.often) {
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
    if (!this.data.often) {
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
        if (this.data.iteLeft < -136) this.data.iteLeft = 136;
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
    if (!this.data.often) {
      let endx = this.data.startx - e.changedTouches[0].clientX
      let ind = e.currentTarget.dataset.ind
      if(endx <= 60){
        this.data.list[ind].iteLeft = 0
      }else{
        this.data.list[ind].iteLeft = -136
      }
      this.setData({
        list: this.data.list,
        scrolly: true
      })
    }
  },
  //tabs标签点击事件
  tabBind(e) {
    let id = e.target.dataset.id
    this.setData({
      current: id
    })
  },
  //左右滑动
  swiperChange(e) {
    let cId = e.detail.current
    this.data.current = cId;
    this.setData({
      curr: cId
    })
  },
  //公司职位位置
  composeLength(md) {
    md.forEach((item, index) => {
      if(item.company == null)item.company = '';
      if(item.position == null)item.position = '';
      if((item.company == null || item.company == '') && (item.position == null || item.position == ''))item.company = '您身边的专属顾问';
      if ((item.company != null || item.company != '') && (item.position != null || item.position != '')) {
        let composeLength = item.company.length + item.position.length
        if (composeLength <= 16) {
          md[index].compose = true
        } else {
          md[index].compose = false
        }
      } else {
        md[index].compose = true
      }
    })
  },
  //长按删除成员
  longDelete(e){
    if(!app.globalData.managerData)return;
    var ind = e.currentTarget.dataset.ind;
    var mid = e.currentTarget.dataset.mid;
    wx.showModal({
      cancelColor: '#333301',
      confirmText: '删除',
      confirmColor: '#ffa019',
      content: '确认删除顾问',
      success:function(res){
        if(res.confirm){
          var rd = {
            funcNo:"1058",
            gid:gid,
            mid:mid
          }
          network.postRequest(rd).then(function(r){
            if(r.error_no == '0'){
              if(app.globalData.managerData.id == mid){
                that.bindback();
              }else{
                var list = that.data.cardArr;
                var di =null;
                for(var i = 0 ; i< list.length; i++){
                  var one =list[i];
                  if(mid == one.mid){
                    di = i;
                    break;
                  }
                }
                list.splice(di,1);
                that.setData({
                  cardArr:list
                });
              }
            }
          });
        }
      }
    })
  },
  //删除
  dynamicDelete(e){
    util.getFormId(e);
    var ind = e.currentTarget.dataset.ind;
    wx.showModal({
      cancelColor: '#333301',
      confirmText: '删除',
      confirmColor: '#ffa019',
      content: '确定要删除此条共享',
      success:function(res){
        if(res.confirm){
          var l = that.data.columnArr;
          var one = l[ind];
          var rd = {
            funcNo:"1061",
            entityid:one.id
          }
          if(one["articleid"]){
            rd["aaid"] = one["articleid"];
          }
          network.postRequest(rd).then(function(r){
            if(r.error_no == '0'){
              let l = that.data.columnArr;
              l.splice(ind,1);
              that.setData({
                columnArr:l
              });
            }
          });
        }
      }
    })
  },
  //点击跳转名片页
  cardTo(e){
    if(!app.globalData.managerData){
      this.setData({
        guidance:true,
        createText:"创建名片后，即可查看群成员名片" //更多
      });
      
      return ;
    }
    var mid = e.currentTarget.dataset.mid;
    wx.navigateTo({
      url: '../circlecard/circlecard?managerId='+mid
    })
  },close_guidance(){
    this.setData({
      guidance :false
    });
  },tocreate(){
    tocreate = true;
    this.setData({
      guidance :false
    });
    this.data.getUserCallBack = 'addManager';
    that.getSetting(that.addManager);
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
    util.backexecute(function(){
      pageIndex =0;
      noData =false;
      that.loadFiles();
      that.data.columnArr = [];
    },"reloadfiles")
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
    var shareobj = {
      title: "快来与群成员交换名片，共享资讯吧。"
    }
    shareobj["path"] = "/pages/index/index?fromShareTo=qun";
    shareobj["imageUrl"] = "https://www.willsfintech.cn:9004/staticFile/qunsharecard.png";
    return shareobj;
  },shareMsg(e){
    if(app.globalData.managerData){
      util.getFormId(e);
    }else{
      util.getFormIdB(e);
      //弹框去创建。
      this.setData({
        guidance:true,
        createText:"创建名片后，即可共享资讯、产品至顾问群"
      });
      return ;
    }
    wx.navigateTo({
      url:"../../clienta/jobs/newmsg/newmsg?key=qun&gid="+gid
    });
  },shareProduct(e){
    if(app.globalData.managerData){
      util.getFormId(e);
    }else{
      util.getFormIdB(e);
      //弹框去创建。
      this.setData({
        guidance:true,
        createText:"创建名片后，即可共享资讯、产品至顾问群"
      });
      return ;
    }
    wx.navigateTo({
      url:"../../clienta/jobs/product/product?key=qun&gid="+gid
    });
  },toproductview(e){

    if(!addManager && !app.globalData.managerData){
      theEvent = e;
      tocreate = false;
      this.data.getUserCallBack = 'addManager';
      that.getSetting(that.addManager);
      return ;
    }

    var index= e.currentTarget.dataset.index;
    var one = this.data.columnArr[index];
    if(one.type == 'article'){
      var td = {
        id:one.id,
        title:one.title,
        commentid:null,
        comment:null,
        type:one.atype,
        scratchtime:one.scratchtime,
        pathid:one.pathid,
        position:one.position,
        company:one.company,
        portrait_path:one.pp,
        user_name:one.user_name
      }
      wx.setStorageSync("toviewpagedata",td);
      wx.navigateTo({
        url:"../../../pages/clienta/view/view?key=qun"
      });
    }else {
      var td = {
        id:one.id,
        articleid:one.articleid,
        title:one.title,
        tags:one.tags,
        comment:null,
        commentid:null,
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
        position:one.position,
        company:one.company,
        portrait_path:one.pp,
        user_name:one.user_name
      }
      wx.setStorageSync("toproductreadpage",{data:td});
      wx.navigateTo({
        url:"../../../pages/clienta/jobs/productread/productread?key=qun"
      });
    }
  },
  accreditTo(e){
    if(app.globalData.managerData){
      util.getFormId(e);
    }else{
      util.getFormIdB(e);
    }
  }
})