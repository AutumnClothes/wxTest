//小程序的网络请求
function postRequest(url, data, method, header) {
  //构造函数
  var promise = new Promise((resolve, reject) => {
    //网络请求
    wx.request({
      url: url,
      data: data,//请求的参数
      method: method,//请求类型
      header: header,//请求的 header
      success: function (res) {//服务器返回数据
        console.log(res)
        //如果返回的状态码为200
        if (res.data.statusCode = '200') {
          resolve(res.data.data);
        } else {//返回错误提示信息
          reject(res.data.info);
        }
      },
      error: function (e) {
        reject('网络出错');
      }
    })
  });
  return promise;
}


module.exports = {
  postRequest: postRequest
}