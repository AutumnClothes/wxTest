//获取时间
const formatTime = date => {
  const year = date.getFullYear()//年
  const month = date.getMonth() + 1  //月
  const day = date.getDate()//日
  const hour = date.getHours()//时
  const minute = date.getMinutes()//分
  const second = date.getSeconds()//秒
  //返回获取到的时间
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
//formatNumber把字符串转化为数字，封装算法
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime
}
