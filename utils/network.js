//小程序的网络请求
var app = getApp();
var version = app.globalData.version;
var config  = require("../config.js");
var sessionCode = null;
/**
 * 
 * @param {请求数据} data 
 * @param {重试次数} times 
 * @param {重试间隔时间，单位ms} delay 
 * @param {重试结束，是否提示重新执行} errorDispose 
 * @param {是否隐藏请求loading} hideLoading 
 */
function postRequest (data,times,delay,errorDispose,hideLoading){
    var temptime = null;
    if(!hideLoading){
      wx.showLoading({
        title:"...",
        mask:true
      });
    }
    if(!times && times !=0){   // if time < 0  unlimited
      times = 3; // 默认三次
    }
    temptime = times;
    if(!delay){
      delay = 3000;
    }
    if(!errorDispose){
      errorDispose = false;
    }
		return new Promise(function(resolve, reject) {
		  var attempt = function() {
        fetchData(data,hideLoading).then(resolve).catch(function(err) {
          if (0 == times) {
            
            if(!hideLoading)
              wx.hideLoading({});
            if(errorDispose){
              wx.showModal({
                content:"网络异常，请确认网络环境之后重试",
                showCancel:false,
                confirmText:"重试",
                success:function(r){
                  if(r.confirm){
                    wx.showLoading({
                      title:"...",
                      mask:true
                    });
                    times = temptime;
                    attempt();
                  }
                }
              });

            }else{
              wx.showToast({
                title:"网络异常"
              });
              reject(err);  
            }
            
          } else {
            times--;
            setTimeout(function(){
              attempt()
            }, delay);
          }
        });
		  };
		  attempt();
		});
}
function fetchData(data,hideLoading) {
  //构造函数
  var promise = new Promise((resolve, reject) => {
    //网络请求
		// var dataStr = JSON.stringify(data);
    // dataStr = encodeURI(dataStr);
    if(data["funcNo"]!='1012'){
      data["sessionCode"] = sessionCode;
    }
    data["version"] = version;
    wx.request({
      url:config.dataUrl ,
      data: data,//请求的参数
      method: "POST",//请求类型
      header: { 'content-type': 'application/x-www-form-urlencoded;charset=utf-8' },//请求的 header
      success: function (res) {//服务器返回数据
        //如果返回的状态码为200
        if(res.statusCode = '200') {

          // session错误处理。
          if(res.data.error_no == '-998'){
            wx.showModal({
              title:"",
              content:"系统错误，请联系运维人员",
              showCancel:false
            });
          }
          if(res.data.error_no == '-997'){
            wx.showModal({
              title:"",
              content:"连接超时,即将重启小程序",
              showCancel:false,
              success:function(r){
                wx.reLaunch({
                  url:"/pages/index/index"
                });
              }
            });
          }

          if(data["funcNo"] == '1012'){
            sessionCode = res.data["sessionCode"]
          }
          resolve(res.data);
          if(!hideLoading)
            wx.hideLoading({});
        }else {
          data.error_type = "httpError";
          reject(data);  // to catch 
        }
      },
      fail: function (e) {
        data.error_type = "networkError";
        reject(data);   // to catch 
      }
    })
  });
  return promise;
}
function get(url){
	var promise = new Promise((resolve, reject) => {
		//网络请求
		wx.request({
			url:url ,
			method: "get",//请求类型
			header: { 'content-type': 'application/x-www-form-urlencoded;charset=utf-8' },//请求的 header
			success: function (res) {//服务器返回数据
				//如果返回的状态码为200
				if (res.statusCode = '200') {
					resolve(res.data);
				} else {
					reject("系统错误");
				}
			},
			fail: function (e) {
				reject('网络出错');
			}
		})
	});
	return promise;
}
module.exports = {
  postRequest: postRequest,
	get:get
}