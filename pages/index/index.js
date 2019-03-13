//index.js
//获取应用实例
var network = require("../../utils/network.js")
var message = require('../../utils/message.js')
const app = getApp();
var openidFromCode = null;
Page({
	data: {},
	//事件处理函数
	bindViewTap: function() {},
	onLoad: function(options) {
		wx.hideShareMenu();
		wx.showLoading({
			title: "loading",
			mask: true
		});
		wx.login({
			success: res => {
				var code = res["code"];
				var rdata = {
					funcNo: "1012",
					code: code
				}
				// 请求，确认身份
				network.postRequest(rdata).then(function(r) {
					if (r.error_no == '0') { // 请求成功

						var redirectToUrl = null;
						wx.setStorageSync("openidFromCode", r.openid);
						var clienttype = wx.getStorageSync("clienttype");
						if (r["manager"].length >= 1) {
							app.globalData["managerData"] = r["manager"][0];

							if (r["customer"].length >= 1) {
								app.globalData["customerData"] = r["customer"][0];
							}

							if(!app.globalData["managerData"].create_time){ // 老客户的初始化数据。
								wx.setStorage({
									key: "guidanceonceData",
									data: {
										mine: true,
										job: true,
										cusd: true,
										bcard:true,
										cardbox:true
									}
								});
								wx.setStorage({ //教程    0是start。
									key:"course",
									data:[false,
											false,false,false,false,
											true,false,false,false,]
								});
							}

							if(clienttype == 'a'){
								redirectToUrl = '/pages/clienta/clienta';
							}else if(clienttype == 'b'){
								redirectToUrl ='/pages/cardbox/cardbox';
							}else{
								redirectToUrl = '/pages/clienta/clienta';
							}

							if(options["fromTemplateTo"] && options["fromTemplateTo"] == 'receive'){
								redirectToUrl = '/pages/member/receive/receive?fromTemplateTo=1';
							}

							if(options["fromTemplateTo"] && options["fromTemplateTo"] == 'cardbox'){
								redirectToUrl = '/pages/cardbox/cardbox?fromTemplateTo=1';
							}
						} else if (r["customer"].length >= 1) {
							app.globalData["managerData"] = null;
							app.globalData["customerData"] = r["customer"][0];
							redirectToUrl = '/pages/cardbox/cardbox';

							if(options["fromTemplateTo"] && options["fromTemplateTo"] == 'cardbox'){
								redirectToUrl = '/pages/cardbox/cardbox?fromTemplateTo=1';
							}
						} else {
							redirectToUrl = '/pages/cardbox/cardbox';
						}

						if(options["fromPublicTo"]){
							if(!app.globalData.managerData){
								redirectToUrl = "/pages/accredit/accredit";
							}else if(options["fromPublicTo"] == 'behavior'){
								redirectToUrl = "/pages/clienta/clienta?fromPublicTo=behavior";
							}else if(options["fromPublicTo"] == 'index'){
								redirectToUrl = "/pages/clienta/clienta";
							}
						}
						if(options["fromShareTo"] && options["fromShareTo"] == 'qun'){
							var sceneValue = wx.getStorageSync("sceneValue");
							if(!(sceneValue == '1044' || (sceneValue == '1014' && !!options["gid"]))){
								wx.showModal({
									title:"",
									content:"请分享至微信群，与群成员交换名片，共享资讯哦",
									showCancel:false,
									success:function(r){
										if(r.confirm){
											if(app.globalData.managerData){
												if(clienttype == 'a'){
													redirectToUrl = '/pages/clienta/clienta';
												}else if(clienttype == 'b'){
													redirectToUrl ='/pages/cardbox/cardbox';
												}else{
													redirectToUrl = '/pages/clienta/clienta';
												}
											}else{
												redirectToUrl ='/pages/cardbox/cardbox';
											}
										}
										wx.redirectTo({
											url: redirectToUrl
										});
										wx.hideLoading({});
									}
								});
								return ;
							}else{
								redirectToUrl = '/pages/circle/member/member?fromShareTo=1';
								if(options["gid"]){
									redirectToUrl = redirectToUrl+"&gid="+options["gid"];
								}
							}
						}

						wx.redirectTo({
							url: redirectToUrl
						});
						wx.hideLoading({});
					}
				});
			},
			fail:function(r){
				console.log(r);
			}
		})
	},
	getUserInfo: function() {

	}
})
