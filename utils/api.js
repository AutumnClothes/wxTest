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

//copy 防污染
export function deepcopy(source) {
  if (!source) {
    return source;
  }
  let sourceCopy = source instanceof Array ? [] : {};
  for (let item in source) {
    sourceCopy[item] = typeof source[item] === 'object' ? deepcopy(source[item]) : source[item];
  }
  return sourceCopy;
}

//去null数据
export function removeNullArr(arr){
  for(var i=0;i<arr.length;i++){
    if(arr[i].openid == '' || arr[i].openid == null || arr[i].openid== undefined){
      arr.splice(i,1);
      i--
    }
  }
  return arr;
} 

/**  *  * json转字符串  */ 
export function stringToJson(data) { return JSON.parse(data); } 
 /**  *字符串转json  */ 
export function jsonToString(data) { return JSON.stringify(data); }

// module.exports = {
//   getRequestUrl: 'https://.........cn'
// }