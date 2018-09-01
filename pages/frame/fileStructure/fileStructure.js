// pages/home/actions/actions.js
var hdText = "小程序包含一个描述整体程序的 app 和多个描述各自页面的 page。"
var bdText = "注意：为了方便开发者减少配置项，描述页面的四个文件必须具有相同的路径与文件名。"
var oneTittle = "一个小程序主体部分由三个文件组成，必须放在项目的根目录，如下："
var twoTittle = "一个小程序页面由四个文件组成，分别是："
var oneArray = [{ text1: "文件", text2: "必须", text3: "作用" }, { text1: "app.js", text2: "是", text3: "小程序逻辑" }, { text1: "app.json", text2: "是", text3: "小程序公共配置" }, { text1: "app.wxss", text2: "否", text3: "小程序公共样式表" }]
var twoArray = [{ text1: "文件类型", text2: "必须", text3: "作用" }, { text1: "js", text2: "是", text3: "页面逻辑" }, { text1: "wxml", text2: "是", text3: "页面结构" }, { text1: "json", text2: "否", text3: "页面配置" }, { text1: "wxss", text2: "否", text3: "页面样式表" }]

Page({
  /**
   * 页面的初始数据
   */
  data: {
    hdtext : hdText,
    bdtext : bdText,
    celltittle: [oneTittle, twoTittle],
    onearray : oneArray,
    twoarray : twoArray,
    isShowFrom: false,
    name: 'name1'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
})