//地址
var BASE_URL = 'http://132.232.181.134:8081/willsBus/EnterServlet';

//报头
var header = {
  'centent-type': 'application/json'
}

function getReq(url, params) {
  //显示loading提示
  wx.showLoading({
    title: '加载中',
  })

  var promise = new Promise((resolve, reject) => {
    //发起网络请求
    wx.request({
      url: BASE_URL + url,//开发者服务器接口地址
      method: 'get',//get请求
      params: params,//params参数数组
      header: header,
      //请求成功的回调
      success: function (res) {
        //成功后隐藏loading
        wx.hideLoading();
        //如果返回的状态码为200
        if (res.statusCode == '200') {
          //如果返回数据的resultCode != '1000'与resultMsg
          if (res.data.resultCode != '1000' && res.data.resultMsg) {
            //显示消息提示框
            wx.showToast({
              title: res.data.resultMsg,
              icon: 'none'
            })
          }
          //回调，运行该函数可指示承诺已成功完成。
          resolve(res.data);
        } else {//返回错误提示信息
          //模态弹窗
          wx.showModal({
            title: '网络错误',
            content: '网络出错，请刷新重试',
            showCancel: false
          })
          //回调，运行该函数可指示出现错误，承诺已被拒绝。
          reject(false);
        }
      },
      //请求失败的回调
      fail: function () {
        //隐藏 loading 提示框
        wx.hideLoading();
        //显示模态弹窗
        wx.showModal({
          title: '网络错误',
          content: '网络出错，请刷新重试',
          showCancel: false
        })
        //回调，运行该函数可指示出现错误，承诺已被拒绝。
        reject(false)
      }
    })
  })
  return promise;
}