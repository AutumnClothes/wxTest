// pages/clienta/jobs/compile/compile.js
var util = require('../../../../utils/util.js')
var config = require('../../../../config.js')
var network = require('../../../../utils/network.js')
var app = getApp();
var textarea = "";
var that = "";
var editid = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    exceptionclose:false,  // 默认不需要返回保存，当有输入时， 需要，  当主动save时，不需要。
    title:'请输入标题',
    show:true,
    addShow:false,
    mengShow:false,
		editFlag:false,
    toindex:'',
    inputValue:'',
    //测试数据
    list:[{keys:'title',value:'',addShow:true}],
		imguploadsuccessnum:0,
    imgIndex:'',
    modalTextarea:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
wx.hideShareMenu();
    editid = null;
		that  = this;
    let h = util.systemTop() + 78
    let sh = util.systemHeight()-h-100
    let mt = (util.systemHeight()*0.382)- h -140
    this.setData({
      cH: h,
      sH:sh,
      mT:mt
    })
		var tocompilepagedata = wx.getStorageSync("tocompilepagedata");
		if(tocompilepagedata){
			editid = tocompilepagedata.id;
			var l = this.data.list.concat(tocompilepagedata.content);
			this.setData({
				inputValue:tocompilepagedata.title,
				list:l,
				show:false
			});
			wx.removeStorage({
				key:"tocompilepagedata"
			})
		}
		
		
  },
  save(){
		if(!that.data.inputValue){
			wx.showToast({
				title:"请完善标题",
				icon:"none"
			})
			return ;
		}
		if(that.data.list.length == 1){
			wx.showToast({
				title:"请完善内容",
				icon:"none"
			})
			return ;
		}
		// productContent
		that.uploadImg(function(){
			that.postProductData();
		});
	},uploadImg(callback){
	  var that = this;
	  var l = this.data.list;
	  for(var i= 1 ; i<l.length ; i++)
		{
		  var one = l[i];
		  if(one.keys == 'title' || one.keys == 'txt'){
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
		var that = this;
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
  postProductData(){
    var title = this.data.inputValue;
    var l = that.data.list;
    l.splice(0,1);
    var type = '2';
    for(var i = 0 ; i<l.length ;i++){
      var one = l[i];
      if(one.keys == 'img' && type =='2'){
        if(one.originalWidth>=77 && one.originalHeight >=77) {
          type = one.src;
        }
      }
    }
    l = JSON.stringify(l);
		var rd = {
			funcNo:"1036",
			title:title,
			articleContent:l,
      creator:app.globalData.managerData.id,
      type:type
		}
		if(editid !=null){
			rd["id"] = editid;
		}
		network.postRequest(rd).then(function(r){
			if(r.error_no == '0'){
        that.data.exceptionclose = false;
				util.setBackexecute(1,"reload",rd);
				wx.navigateBack({
					delta:1
				})
			}
		});
	},
  //点击＋弹出编辑选择框
  addshow(e){
    var index = e.currentTarget.dataset.ind
    var show = this.data.list[index].addShow
    if (show) {
      this.data.list[index].addShow = false,
      this.data.mengShow = true
    } else {
      this.data.list[index].addShow = true,
      this.data.mengShow = false
    }
    this.setData({ list: this.data.list, mengShow: this.data.mengShow})
  },
  //添加元素到list
  additem(e) {
    this.addSelectFalse()
    var keys = e.currentTarget.dataset.keys
    var ind = e.currentTarget.dataset.ind + 1
    if(keys == 'img'){
      this.addimg(keys,ind)
    }else if(keys == 'txt'){
      this.addtxt("",ind)
    }
  },
  addimg(keys, ind){
    var that = this
    //添加img
    wx.chooseImage({
      count:1,
      sizeType:'compressed',
      success(res) {
        const tempFilePaths = res.tempFilePaths.join('')
        //处理图片展示
        wx.getImageInfo({
          src: tempFilePaths,
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
              keys: keys,
              src: tempFilePaths,
              addShow: true,
              imgWidth: imgWidth,
              imgHeight: imgHeight,
              originalWidth:res.width,
              originalHeight:res.height
            }
            that.data.list.splice(ind, 0, obj)
            that.sortShow(that.data.list)
            that.setData({ list: that.data.list,show:false})
            that.data.exceptionclose = true;
          }
        })
      }
    })
  },
  toedit(e){
		var index = e.currentTarget.dataset.ind;
		var one = this.data.list[index];
		var content =one.content;
		this.data.editFlag =true;
		this.addtxt(content,index);
	},
  addtxt(keys, ind){
    var that = this
    //添加txt
    this.data.toindex = ind
    wx.setStorageSync("tominputpage", {
      key: 'compiletxt',
      funcNo: "100",
      value: keys,
      target: "文字"
    });
    wx.navigateTo({
      url: '../../../minput/minput',
    })
  },
  //排序按钮出现时机
  sortShow(list){
    var that = this
    list.forEach((item,index)=>{
      if(item.keys != 'title' && index != that.data.list.length-1){
        item.sort = true
      }else{
        item.sort = false
      }
    })
  },
  //隐藏所有的add-select-box
  addSelectFalse(){
    this.data.list.forEach(item=>{
      item.addShow = true
    })
    this.setData({ list: this.data.list, mengShow: false })
  },
  //点击图片可预览，可更换
  imgModify(e){
    var img = e.currentTarget.dataset.img
    this.data.imgIndex = e.currentTarget.dataset.ind
    wx.navigateTo({
      url: '../../mine/uploadhi/uploadhi?img='+img,
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
    that = this
    util.backexecute(function(res){
      wx.showModal({
        content: '是否保存已编辑内容',
        cancelColor: '#b0b3ba',
        confirmText: '保存',
        confirmColor: '#ff8a01',
        success: function (r) {
          if (r.confirm) {
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
            that.sortShow(that.data.list)
            that.setData({ list: that.data.list,show:false})
            that.data.toindex = ''
            that.data.exceptionclose = true;
          }
        }
      })
    },"value");
    util.backexecute(function (res) {
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
      that.sortShow(that.data.list)
      that.setData({ list: that.data.list,show:false})
      that.data.toindex = ''
      that.data.exceptionclose = true;
    }, "productcontentedit");
    util.backexecute(r=>{
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
          that.data.list[that.data.imgIndex] = obj
          that.sortShow(that.data.list)
          that.setData({list:that.data.list,show:false})
        }
      })
    },'img')
  },
  //删除
  closeitem(e){
    var ind = e.currentTarget.dataset.ind;
    this.data.list.splice(ind,1);
    this.setData({ list: this.data.list });
    if (this.data.list.length == 1)this.setData({show:true});
    that.data.exceptionclose = true;
  },
  //排序
  bindsort(e){
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
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if(that.data.exceptionclose){ // 异常退出。
      var ecd = {title:this.data.inputValue,list:this.data.list};
      util.setBackexecute(1,"exceptionclose",ecd);
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

  },
  modalCancel(e) {
		textarea= "";
    util.getFormId(e)
    this.setData({
      modalTextarea: false,
      mengBoxShow: false,
    })
  },
  textareaOver(e) {
    util.getFormId(e)
    this.setData({
      modalTextarea: false,
      mengBoxShow: false,
      inputValue: textarea
    });
    textarea ="";
    this.data.exceptionclose = true;
  },
  textareaOn(e) {
		textarea = "";
    this.setData({
      modalTextarea: true,
      mengBoxShow: true,
			value:this.data.inputValue
    })
  },
  inputEnd(event){
    textarea= event.detail.value;
  }
})
