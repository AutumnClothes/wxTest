//获取用户信息
//从本地缓存中同步获取指定 key
var openId = (wx.getStorageSync('openId'))
if (openId) {
  //获取用户授权过的信息
  wx.getUserInfo({
    success: function (res) {
      that.setData({
        //用户昵称
        nickName: res.userInfo.nickName,
        //用户头像
        avatarUrl: res.userInfo.avatarUrl,
      })
    },
    // 失败回调
    fail: function () {
      console.log("获取失败！")
    },
    // 完成回调
    complete: function () {
      console.log("获取用户信息完成！")
    }
  })
} else {
  //发起登录
  wx.login({
    //发起请求成功回调
    success: function (res) {
      //打印用户凭证
      console.log(res.code)
      if (res.code) {
        wx.getUserInfo({
          withCredentials: true,
          //成功回调
          success: function (res_user) {
            //发起网络请求
            wx.request({
              //后台接口地址
              url: 'https://....com/wx/login',
              //附带的请求参数
              data: {
                code: res.code,
                encryptedData: res_user.encryptedData,
                iv: res_user.iv
              },
              method: 'GET',//请求类型
              header: {
                'content-type': 'application/json'
              },//请求头
              //请求成功回调
              success: function (res) {
                // this.globalData.userInfo = JSON.parse(res.data);//json转化为对象
                that.setData({
                  //用户昵称
                  nickName: res.data.nickName,
                  //用户头像
                  avatarUrl: res.data.avatarUrl,
                })
                //将 data 存储在本地缓存中指定的 key 中
                wx.setStorageSync('openId', res.data.openId);
              }
            })
          }, 
          //请求失败回调
          fail: function () {
            //模态弹窗
            wx.showModal({
              title: '警告通知',
              content: '您点击了拒绝授权,将无法正常显示个人信息,点击确定重新获取授权。',
              //成功后回调
              success: function (res) {
                if (res.confirm) {
                  //调起客户端小程序设置界面，（已设置过的权限）
                  wx.openSetting({
                    //调起成功后回调
                    success: (res) => {
                      if (res.authSetting["scope.userInfo"]) {////如果用户重新同意了授权登录
                        //重新获取临时登录凭证
                        wx.login({
                          //调用成功后回调
                          success: function (res_login) {
                            if (res_login.code) {
                              //授权信息
                              wx.getUserInfo({
                                withCredentials: true,
                                //成功回调
                                success: function (res_user) {
                                  //发起网络请求
                                  wx.request({
                                    url: 'https://....com/wx/login',
                                    data: {
                                      code: res_login.code,
                                      encryptedData: res_user.encryptedData,//完整用户信息的加密数据
                                      iv: res_user.iv//加密算法的初始向量
                                    },
                                    method: 'GET',//请求类型
                                    header: {
                                      'content-type': 'application/json'
                                    },//请求头
                                    //成功回调
                                    success: function (res) {
                                      that.setData({
                                        //用户昵称
                                        nickName: res.data.nickName,
                                        //用户图片
                                        avatarUrl: res.data.avatarUrl,

                                      })
                                      //将 data 存储在本地缓存中指定的 key 中
                                      wx.setStorageSync('openId', res.data.openId);
                                    }
                                  })
                                }
                              })
                            }
                          }
                        });
                      }
                    }, 
                    //失败回调
                    fail: function (res) {
                      console.log(res)
                    }
                  })

                }
              }
            })
          }, 
          //完成回调
          complete: function (res) {
            console.log(res)
          }
        })
      }
    }
  })

}
