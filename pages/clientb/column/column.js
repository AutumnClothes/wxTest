// pages/clientb/column/column.js
var util = require('../../../utils/util.js');
var api = require('../../../utils/api.js');
var network = require('../../../utils/network.js');
var app = getApp()
var that = null;
var pageIndex = 0;
var pageSize = 10;
var dataList = [];
Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    tab4: {
      type: Boolean,
      value: ''
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    onload:false,
    list: [],
    backone: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAAAiCAYAAAAAl7SxAAAA40lEQVRoge3VwW3CQBAF0AdKC45EC5BGuNAEaYtjOgp0kBBBC0jJYY0sO8uVlTzzJV+8l9HTfM3i92Onki0OWNUeZ5Qz9osHCN/mD3DPeVn52YkDAC81hPXTx2ibUyI8QHh7+hht85mbkHVABaHDa4tJGuWKyxQh3BZAIviPEO4ykJtQ3YRNg0Fa5sgYoeu/KLn23wghZBVIBIwRQl4GchMwRgh5GRgQwl4GBoSwVWBACFsFEgFZB+QmoCCEvgwUhNBVoCCErgKJgKwDchNQEG4NBmmVH5PLQEF47x/nni/saw9/DNUu6wGRz0sAAAAASUVORK5CYII=',
    backtwo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAAAiCAYAAAAAl7SxAAAA40lEQVRoge3VwW3CQBAF0AdKC0aiBUgjXOggJ9JWugp0kBBBC0jhsI4sO8uVlTzzJV+8l9HTfM3i922vkh0+sK49zihnHBYPEL7NH+Av52XlZycOALzUEDZPH6NtTonwAOH16WO0zWduQtYBFYQOqxaTNMoVlylCuC2ARPAfIdxlIDehugnbBoO0zJExQtd/UXLtvxFCyCqQCBgjhLwM5CZgjBDyMjAghL0MDAhhq8CAELYKJAKyDshNQEEIfRkoCKGrQEEIXQUSAVkH5CagINwaDNIqPyaXgYLw3j/OPV841B7u1pEuWwQe4TEAAAAASUVORK5CYII=',
  },
  attached() {
    var ch = util.systemTop() + 88;
    var sh = util.systemHeight() - ch - 100;
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
    });
  },
  /**
   * 组件的方法列表
   */
  methods: {
    imageview(e){
      var index = e.currentTarget.dataset.index;
      var ind = e.currentTarget.dataset.ind;
      var one = that.data.list[index];
      var imagesarr = one.imagesarr;
      wx.previewImage({
        urls:imagesarr,
        current:imagesarr[ind]
      })
    }
    ,
    toarticleview(e){
      var index = e.currentTarget.dataset.index;
      var one = this.data.list[index];
      one = api.deepcopy(one);
      one.id = one["articleid"];
      one.commentid = one["images"];
      wx.setStorageSync("toviewpagedata",one);
      wx.navigateTo({
        url:"view/view"
      });
    },toproductview(e){
      var index = e.currentTarget.dataset.index;
      var one = this.data.list[index];
      one = api.deepcopy(one);
      one.id = one.productid;
      one.commentid = one["images"];
      wx.setStorageSync("toproductreadpage",{data:one});
      wx.navigateTo({
        url:"product/productread/productread"
      });
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
      that.setData({
        list:newList
      })
    },
    tapchange() {
      var bb = this.data.tab4
      if (bb) {
        this.initList();
      }
    },initList(){
      that = this;
      var managerData = wx.getStorageSync("tochatpagewmanager");
      var mid = managerData.id;
      pageIndex = 0;
      var rd = {
        funcNo:"1047",
        creator:mid
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
            one.imgurl = util.clientbImage(one.imgurl)
            newList.push(one);
          }
          that.imgStyle(newList)
          that.setData({
            list:newList
          })
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
      })
    },
    //图片样式控制
    imgStyle(list) {
      list.forEach((item, index) => {
        if (item.articleid == null && item.productid == null) {
          if (item.images == null) return;
          if (item.imagesarr == undefined || item.imagesarr == '' || item.imagesarr == null) {
            item.imagesarr = item.images.split(',')
          }
          var len = item.imagesarr.length;
          if (len == '1') {
            item.style = 'width:258rpx;height:258rpx;'
          }
        }
      })
    },
  }
})
