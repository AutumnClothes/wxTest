// pages/wx-cropper/index.js
// 手机的宽度
var app = getApp();
var util = require('../../utils/util.js')
var config = require('../../config.js');
var network = require('../../utils/network.js');
var windowWRPX = 750;
var imgHRPX = 1060;
// 拖动时候的 pageX
var pageX = 0
// 拖动时候的 pageY
var pageY = 0
var pixelRatio = wx.getSystemInfoSync().pixelRatio
// 调整大小时候的 pageX
var sizeConfPageX = 0
// 调整大小时候的 pageY
var sizeConfPageY = 0
var initDragCutW = 0
var initDragCutL = 0
var initDragCutH = 0 
var initDragCutT = 0
// 移动时 手势位移与 实际元素位移的比
var dragScaleP = 2;
var type = null;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imageNum: '', //上传的图片id
    endImg: '', //头像上传
    imageSrc: '',
    // imageSrc: '', //要裁剪的图片
    returnImage: '',
    isShowImg: false,
    // 初始化的宽高
    cropperInitW: windowWRPX,
    cropperInitH: imgHRPX,
    // 动态的宽高
    cropperW: windowWRPX,
    cropperH: imgHRPX,
    // 动态的left top值
    cropperL: 0,
    cropperT: 0,
    // 图片缩放值
    scaleP: 0,
    imageW: 0,
    imageH: 0,
    // 裁剪框 宽高
    cutW: 400,
    cutH: 400,
    cutL: 0,
    cutT: 0,
		boxheight:imgHRPX
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onLoad: function () {
		wx.hideShareMenu();
		type = null;
		var pages = getCurrentPages();
		var lastpage = pages[pages.length -2];
		var route = lastpage.route;
		if(route == 'pages/clienta/mine/uploadhi/uploadhi'){
			type = "managerHead";
		}else if(route == 'pages/clienta/jobs/coveradd/coveradd'){
			type = "productCover"
		}
		
    var _this = this
    let h = util.systemTop() + 100
    _this.setData({
      cH: h
    })
		// var systemHeight =  util.systemHeight();
		// systemHeight = systemHeight - h;
		// systemHeight = systemHeight - 144;
		// console.log(systemHeight);
		
		var screenRate = 0;
		wx.getSystemInfo({
			success:function(res){
				console.log(res);
				screenRate = res.windowWidth/750
				imgHRPX = res.windowHeight / screenRate  - h -144;
				_this.setData({
					cropperInitH:imgHRPX,
					cropperH:imgHRPX,
					boxheight:imgHRPX
				})
			}
		});
		var rate = windowWRPX / imgHRPX;
		
		wx.chooseImage({
			count:1,
			sizeType:["compressed"],
			success:function(res){
				console.log(res.tempFilePaths);
				// _this.data.imageSrc = res.tempFilePaths[0];
				_this.setData({
					imageSrc:res.tempFilePaths[0]
				});
				wx.getImageInfo({
					src: _this.data.imageSrc,
					success: function success(res) {
						var innerAspectRadio = res.width / res.height;
						console.log(innerAspectRadio)
						// 根据图片的宽高显示不同的效果   保证图片可以正常显示
						if (innerAspectRadio >= rate) {
							_this.setData({
								cropperW: windowWRPX,
								cropperH: windowWRPX / innerAspectRadio,
								// 初始化left right
								// cropperL: Math.ceil((windowWRPX - windowWRPX) / 2),
								cropperT: Math.ceil((imgHRPX - windowWRPX / innerAspectRadio ) / 2),
								// 裁剪框  宽高 
								// cutW: windowWRPX - 200,
								// cutH: windowWRPX / innerAspectRadio - 200,
								cutL: Math.ceil((windowWRPX - windowWRPX + 340) / 2),
								cutT: Math.ceil((windowWRPX / innerAspectRadio - (windowWRPX / innerAspectRadio - 20)) / 2),
								// 图片缩放值
								scaleP: res.width * pixelRatio / windowWRPX,
								// 图片原始宽度 rpx
								imageW: res.width * pixelRatio,
								imageH: res.height * pixelRatio
							})
						} else {
							_this.setData({
								cropperW: imgHRPX * innerAspectRadio,
								cropperH: imgHRPX,
								// 初始化left right
								cropperL: Math.ceil((windowWRPX - imgHRPX * innerAspectRadio) / 2),
								// cropperT: Math.ceil((windowWRPX - windowWRPX) / 2),
								// 裁剪框的宽高
								// cutW: windowWRPX * innerAspectRadio - 66,
								// cutH: 400,
								cutL: Math.ceil((windowWRPX - imgHRPX * innerAspectRadio) / 2),
								// cutL: Math.ceil((windowWRPX * innerAspectRadio - (windowWRPX * innerAspectRadio - 20)) / 2),
								// cutT: Math.ceil((windowWRPX - 340) / 2),
								// 图片缩放值
								scaleP: res.width * pixelRatio / windowWRPX,
								// 图片原始宽度 rpx
								imageW: res.width * pixelRatio,
								imageH: res.height * pixelRatio
							})
						}
						var theLength = 0;
						if(_this.data.cropperW > _this.data.cropperH ) theLength = _this.data.cropperH;
						else theLength = _this.data.cropperW;
						_this.setData({
							cutW: theLength,
							cutH: theLength,
							cutL: 0,
							cutT: 0
						});
						_this.setData({
							isShowImg: true
						})
						wx.hideLoading()
					}
				})
			}
		});
    
  },

  // 拖动时候触发的touchStart事件
  contentStartMove(e) {
    pageX = e.touches[0].pageX
    pageY = e.touches[0].pageY
  },

  // 拖动时候触发的touchMove事件
  contentMoveing(e) {
    var _this = this
    // _this.data.cutL + (e.touches[0].pageX - pageX)
    // console.log(e.touches[0].pageX)
    // console.log(e.touches[0].pageX - pageX)
    var dragLengthX = (pageX - e.touches[0].pageX) * dragScaleP
    var dragLengthY = (pageY - e.touches[0].pageY) * dragScaleP
    var minX = Math.max(_this.data.cutL - (dragLengthX), 0)
    var minY = Math.max(_this.data.cutT - (dragLengthY), 0)
    var maxX = _this.data.cropperW - _this.data.cutW
    var maxY = _this.data.cropperH - _this.data.cutH
    this.setData({
      cutL: Math.min(maxX, minX),
      cutT: Math.min(maxY, minY),
    })
    pageX = e.touches[0].pageX
    pageY = e.touches[0].pageY
  },
  // 获取图片
  getImageInfo() {
    var _this = this
    console.log('shengcheng:' + _this.data.imageSrc)
    wx.showLoading({
      title: '图片生成中...',
    })
    // wx.downloadFile({
    //   url:_this.data.imageSrc, //仅为示例，并非真实的资源     
    //   success: function (res) {
    // 将图片写入画布             
    const ctx = wx.createCanvasContext('myCanvas')
    // ctx.drawImage(res.tempFilePath)
    ctx.drawImage(_this.data.imageSrc)

    ctx.draw(true, () => {
      // 获取画布要裁剪的位置和宽度   均为百分比 * 画布中图片的宽度    保证了在微信小程序中裁剪的图片模糊  位置不对的问题
      var canvasW = (_this.data.cutW / _this.data.cropperW) * (_this.data.imageW / pixelRatio)
      var canvasH = (_this.data.cutH / _this.data.cropperH) * (_this.data.imageH / pixelRatio)
      var canvasL = (_this.data.cutL / _this.data.cropperW) * (_this.data.imageW / pixelRatio)
      var canvasT = (_this.data.cutT / _this.data.cropperH) * (_this.data.imageH / pixelRatio)
      console.log(`canvasW:${canvasW} --- canvasH: ${canvasH} --- canvasL: ${canvasL} --- canvasT: ${canvasT} -------- _this.data.imageW: ${_this.data.imageW}  ------- _this.data.imageH: ${_this.data.imageH} ---- pixelRatio ${pixelRatio}`)
      wx.canvasToTempFilePath({
        x: canvasL,
        y: canvasT,
        width: canvasW,
        height: canvasH,
        destWidth: canvasW,
        destHeight: canvasH,
        canvasId: 'myCanvas',
        success: function (res) {
					if(type ==null)return ;
          wx.uploadFile({
						url:config.uploadImg,
						filePath:res.tempFilePath,
						name:type,
						success:function(res){
							if(res.statusCode == 200 ){
									var d = JSON.parse(res.data);
									if(d.error_no == '0'){
										var path = d.path;
										//TODO 回到 设置。
										if(type == "managerHead"){ // 保存管理的头像
												var updateData = {
													funcNo:"1025",
													id:app.globalData.managerData.id
												}
												updateData["portrait_path"] = path;
												network.postRequest(updateData).then(function(res){
													if(res.error_no == "0"){
														app.globalData.managerData["portrait_path"] = path;
														util.setBackexecute(1,'uploadhi',{head:true});
														wx.navigateBack({
															delta:1
														}) 
													}
												});
										}else if(type == 'productCover'){
											util.setBackexecute(1,null,{path:path});
											wx.navigateBack({
															delta:1
											}) 
										}
									}else{
										//TODO 错误提示
									}
							}
							wx.hideLoading();
						}
					})
          // 成功获得地址的地方
          /* wx.hideLoading();
          */
        }
      })
    })
  },

  // 设置大小的时候触发的touchStart事件
  dragStart(e) {
    var _this = this
    sizeConfPageX = e.touches[0].pageX
    sizeConfPageY = e.touches[0].pageY
    initDragCutW = _this.data.cutW
    initDragCutL = _this.data.cutL
    initDragCutT = _this.data.cutT
    initDragCutH = _this.data.cutH
  },

  // 设置大小的时候触发的touchMove事件
  dragMove(e) {
    var _this = this
    var dragType = e.target.dataset.drag
    switch (dragType) {
      case 'left':
			case 'top':

        var dragLengthx = (sizeConfPageX - e.touches[0].pageX) * dragScaleP
				
				var dragLengthy = (sizeConfPageY - e.touches[0].pageY) * dragScaleP
				if(dragLengthx > dragLengthy){
					dragLengthy = dragLengthx;
				}else{
					dragLengthx= dragLengthy;
				}
				
				if (initDragCutH >= dragLengthy && initDragCutT > dragLengthy  &&  (initDragCutW >= dragLengthx && initDragCutL > dragLengthx)) {
					if (dragLengthy < 0 && Math.abs(dragLengthy) >= initDragCutH) return
					if (dragLengthx < 0 && Math.abs(dragLengthx) >= initDragCutW) return
					this.setData({
						cutT: initDragCutT - dragLengthy,
						cutH: initDragCutH + dragLengthy,
						cutL: initDragCutL - dragLengthx,
						cutW: initDragCutW + dragLengthx
					})
				} else {
					return;
				}
        break;
			case 'right':
      case 'bottom':
      case 'rightBottom':
        var dragLengthX = (sizeConfPageX - e.touches[0].pageX) * dragScaleP
        var dragLengthY = (sizeConfPageY - e.touches[0].pageY) * dragScaleP
				if(dragLengthX > dragLengthY){
					dragLengthY = dragLengthX;
				}else{
					 dragLengthX= dragLengthY;
				}
        if (initDragCutH >= dragLengthY && initDragCutW >= dragLengthX) {
          // bottom 方向的变化
          if (((dragLengthY < 0 && _this.data.cropperH > initDragCutT + _this.data.cutH) || (dragLengthY > 0))
							&&
							((dragLengthX < 0 && _this.data.cropperW > initDragCutL + _this.data.cutW) || (dragLengthX > 0))
					) {
            this.setData({
              cutH: initDragCutH - dragLengthY
            })
						this.setData({
							cutW: initDragCutW - dragLengthX
						})
          }
          else {
            return
          }
        } else {
          return
        }
        break;
      default:
        break;
    }
  },
  // 图片上传
  upLoad: function () {

  },
  //取消，不带图片直接跳回
  backOut(){
    wx.navigateBack({
      delta:1
    })
  }
})
