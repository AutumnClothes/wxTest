//index.js
//获取应用实例
var network = require("../../utils/network.js")
const app = getApp();
var openidFromCode = null;
Page({
	data: {},
	//事件处理函数
	onLoad: function(options) {
		wx.hideShareMenu();
		wx.showLoading({
			title: "loading",
			mask: true
		});
		if(options.scene){
			var id = options.scene;
			var referenceData = {
				funcNo:'1050',
				id:id
			  }
			  network.postRequest(referenceData).then(function(r){
				if(r.error_no == '0'){
					var one = r.data[0];
					var path = one.param;
					wx.redirectTo({
						url:path
					});
				}
			  });
		}
	}
})
