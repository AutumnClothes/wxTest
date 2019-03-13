// pages/circle/circlecard/circlecard.js
var util = require('../../../../utils/util.js')
var network = require('../../../../utils/network.js')
var api = require('../../../../utils/api.js')
var app = getApp()
var that = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    backone: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAAAiCAYAAAAAl7SxAAAA40lEQVRoge3VwW3CQBAF0AdKC45EC5BGuNAEaYtjOgp0kBBBC0jJYY0sO8uVlTzzJV+8l9HTfM3i92Onki0OWNUeZ5Qz9osHCN/mD3DPeVn52YkDAC81hPXTx2ibUyI8QHh7+hht85mbkHVABaHDa4tJGuWKyxQh3BZAIviPEO4ykJtQ3YRNg0Fa5sgYoeu/KLn23wghZBVIBIwRQl4GchMwRgh5GRgQwl4GBoSwVWBACFsFEgFZB+QmoCCEvgwUhNBVoCCErgKJgKwDchNQEG4NBmmVH5PLQEF47x/nni/saw9/DNUu6wGRz0sAAAAASUVORK5CYII=',
    backtwo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAAAiCAYAAAAAl7SxAAAA40lEQVRoge3VwW3CQBAF0AdKC0aiBUgjXOggJ9JWugp0kBBBC0jhsI4sO8uVlTzzJV+8l9HTfM3i922vkh0+sK49zihnHBYPEL7NH+Av52XlZycOALzUEDZPH6NtTonwAOH16WO0zWduQtYBFYQOqxaTNMoVlylCuC2ARPAfIdxlIDehugnbBoO0zJExQtd/UXLtvxFCyCqQCBgjhLwM5CZgjBDyMjAghL0MDAhhq8CAELYKJAKyDshNQEEIfRkoCKGrQEEIXQUSAVkH5CagINwaDNIqPyaXgYLw3j/OPV841B7u1pEuWwQe4TEAAAAASUVORK5CYII=',
    title:'顾问名片',
    contact:[
      { text: '咨询顾问获得电话', icon: '/image/img/phone.png', fc: '拨打', iconStyle: 'width:19rpx;height:24rpx' },
      { text: '', icon: '/image/img/tele.png', fc: '拨打', iconStyle: 'width:26rpx;height:23rpx' },
      { text: '', icon: '/image/img/weixin.png', fc: '复制', iconStyle: 'width:31rpx;height:25rpx' },
      { text: '', icon: '/image/img/email.png', fc: '复制', iconStyle: 'width:24rpx;height:20rpx' },
      { text: '您身边的专业顾问', icon: '/image/img/company.png', fc: '复制', iconStyle: 'width:25rpx;height:23rpx' },
      { text: '咨询顾问获取详细地址', icon: '/image/img/address.png', fc: '复制', iconStyle: 'width:20rpx;height:28rpx' },
    ],
  //个人简介（第三个容器）数据
  manager: {},
  //我的标签
  tagList: ['专业', '独立', '以客户为中心'],
  //分享数据
  product:null,
  full:'全文',
  fullshow:'',
  fullStyle:'',
  titleStyle:'',
  dynamic:null
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    let h = util.systemTop() + 100
    let sch = util.systemHeight() - h
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
      scH: sch
    })

    var managerId =options["managerId"];
    this.getProduct(managerId);
    this.getMoment(managerId);
    var mdata = {
      funcNo:"1022",
      id:managerId
    }
    network.postRequest(mdata).then(function(res){
      if(res.error_no == '0'){
        var md = res.data[0];
        for(var i in md){
          if(md[i] == null){
            md[i] = '';
          }
        }
        if(md.city)
          md.city =md.city.replace(",","").replace(",","").replace(",","");
        that.data.canvasData = md
        var list = md.key_word
        if (typeof (list) == 'string' && list.length != 0) {
          console.log('list', list)
          md.key_word = md.key_word.split(',')
          console.log('md.key_word', md.key_word)
        }
        if(md.portrait_path!=null &&  md.portrait_path.indexOf("qlogo")!=-1){
          md.portrait_path = md.portrait_path.substr(0,md.portrait_path.length-3)+"0";
        }
        if (md.company == '' || md.company == null) md.company = "";
        if (md.position == '' || md.position == null) md.position = '';
        if ((md.company == '' || md.company == null) && (md.position == '' || md.position == null))md.position = '您身边的专业顾问' 
        that.setData({
          manager:md
        });
        
        var contact = that.data.contact;
        var fields = ["mobile_phone","telephone","wechat","email",'company','address'];
        var newArray = [];
        for(var i = 0 ; i< fields.length ; i++){
          var one = fields[i];
          var two = contact[i];
          if(md[one]){
            two["text"] = md[one];
            two["key"] = one;
            if(one == 'address'){
              two["text"] =md.city+ md[one];
              two["key"] = one;
            }
          }else{
            if(two.text != ''){
              two["key"] = one;
            }
          }
          newArray.push(two);
        }
        that.setData({
          contact:newArray
        })
        // var torealchatpage = {id:md.id,name:md.user_name,portraitpath:md.portrait_path,phone:md.mobile_phone,position:md.position,company:md.company};
        // wx.setStorageSync("tochatpagewmanager",torealchatpage);
        // 聊天界面 需要用到的数据。
        that.composeLength(md)
        //控制全文功能
        that.querychange()
        that.allunde(md);
        wx.setStorageSync("quncardManagerData",md);
      }
    });

  },getProduct(mid){
    var rd = {
      funcNo:"1044",
      creator:mid
    }
    network.postRequest(rd).then(function(r){
      if(r.error_no == '0'){
        var l = r.data  ;
        var p = null;
        
        for(var i = 0 ; i< l.length; i++){
          var one = l[i];
          if(one["private"] == '1'){
            continue;
          }
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
          p = one;
          break;
        }
        // p.imgurl = util.clientbImage(p.imgurl)
        that.setData({
          product:p
        });
      }
    });
  },getMoment(mid){
    var rd = {
      funcNo: "1047",
      creator: mid
    }
    network.postRequest(rd).then(function(r) {
      if (r.error_no == '0') {
        var l = r.data;
        if(l.length !=0 ){
          var one =l[0]; // 默认是 时间倒序
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
  },toproductlist(e){
    if(app.globalData.managerData){
      util.getFormId(e)
    }else{
      util.getFormIdB(e)
    }
    wx.navigateTo({
      url:'/pages/clienta/jobs/product/product?key=quncard&id='+this.data.manager.id
    })
  },toMomentList(e){
    // util.getFormIdB(e)
    if(app.globalData.managerData){
      util.getFormId(e)
    }else{
      util.getFormIdB(e)
    }
    wx.navigateTo({
      url:'/pages/clienta/jobs/column/column?key=quncard&id='+this.data.manager.id
    })
  },imageview(e){
    var ind = e.currentTarget.dataset.ind;
    var one = that.data.dynamic;
    var imagesarr = one.imagesarr;
    wx.previewImage({
      urls:imagesarr,
      current:imagesarr[ind]
    })
  },toarticleview(){
    var one = this.data.dynamic;
    one = api.deepcopy(one);
    one.id = one["articleid"];
    one.commentid = one["images"];
    var td = {
      id:one.articleid,
      title:one.title,
      commentid:one.commentid,
      comment:one.comment,
      type:one.type,
      scratchtime:one.scratchtime,
      pathid:one.pathid
    }
    td["position"]=this.data.manager.position;
    td["company"]= this.data.manager.company;
    td["portrait_path"] = this.data.manager.portrait_path;
    td["user_name"] = this.data.manager.user_name;
    td['profile'] = this.data.manager.profile;
    td['city'] = this.data.manager.city;
    td['mobile_phone'] = this.data.manager.mobile_phone?this.data.manager.mobile_phone:this.data.manager.telephone;
    wx.setStorageSync("toviewpagedata",td);
    wx.navigateTo({
      url:"/pages/clienta/view/view?key=quncard"
    });
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

    td["position"]=this.data.manager.position;
    td["company"]= this.data.manager.company;
    td["portrait_path"] = this.data.manager.portrait_path;
    td["user_name"] = this.data.manager.user_name;
    wx.setStorageSync("toproductreadpage", { data: td });
    wx.navigateTo({
      url:'/pages/clienta/jobs/productread/productread?key=quncard'
    })
  },
  toproduct(){
    var p = this.data.product;
    p["position"]=this.data.manager.position;
    p["company"]= this.data.manager.company;
    p["portrait_path"] = this.data.manager.portrait_path;
    p["user_name"] = this.data.manager.user_name;
    wx.setStorageSync("toproductreadpage", { data: p });
    wx.navigateTo({
      url:'/pages/clienta/jobs/productread/productread?key=quncard'
    })
  },composeLength(md) {
    let composeLength = md.company.length + md.position.length
    if (composeLength <= 16) {
      this.setData({
        compose: true
      })
    } else {
      this.setData({
        compose: false
      })
    }
  },contacttap(e){
    var text = e.currentTarget.dataset.text;
    var key = e.currentTarget.dataset.key;
    if(key == 'telephone' || key == 'mobile_phone'){
      // 拨打
      wx.makePhoneCall({
        phoneNumber:text
      });
    }else{
      wx.setClipboardData({
        data:text
      })
    }
  },allunde(md) {
    var company = md.company
    var position = md.position
    if (company == null || company == '') {
      if (position == null || position == '') {
        this.setData({
          mdcompany: false
        })
      }
    } else {
      this.setData({
        mdcompany: true
      })
    }
  },
  //存通讯录
  storageBind(e) {
    util.getFormIdB(e)
    let phone = e.currentTarget.dataset.phoneNum
    let name = e.currentTarget.dataset.name
    if((phone == '' || phone== null) || (name == '' || name== null)){
      wx.showToast({
        title: '资讯顾问获得电话',
        icon:'none'
      })
    }else{
      if (phone.length > 3) {
        message.sendBehavior(app.globalData.customerData.id,managerData.id,"",'sc');
        wx.addPhoneContact({
          firstName: name,//姓名
          mobilePhoneNumber: phone,//手机
        })
      } else{
        wx.showToast({
          title: '请正确输入联系电话',
          icon:'none'
        })
      }
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