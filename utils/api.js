//API的post请求页
var http = require('http.js')


//例：
//查询用户个人信息
export function getUserBaseinfo() {
  return http.post('/100care-wechat/userController/getUserBaseinfo')
}

//获得手机验证码
export function getVerifyCode(data) {
  return http.post('/100care-wechat/userController/getVerifyCode', data)
}

//绑定手机号
export function verifyMobile(data) {
  return http.post('/100care-wechat/userController/verifyMobile', data)
}

// module.exports = {
//   getRequestUrl: 'https://clinic.100care.cn'
// }