// pages/home/actions/actions.js
var oneTittle = "app.json 配置项列表"
var twoTittle = "index.json 配置项列表"
var oneArray = [{ text1: "属性", text2: "类型", text3: "必填", text4: "描述", }, { text1: "pages", text2: "String Array", text3: "是", text4: "页面路径列表", }, { text1: "window", text2: "Object", text3: "否", text4: "全局的默认窗口表现", }, { text1: "tabBar", text2: "Object", text3: "否", text4: "底部 tab 栏的表现", }, { text1: "networkTimeout", text2: "Object", text3: "否", text4: "网络超时时间", }, { text1: "debug", text2: "Boolean", text3: "否", text4: "是否开启 debug 模式，默认关闭", }, { text1: "functionalPages", text2: "Boolean", text3: "否", text4: "是否启用插件功能页，默认关闭", }, { text1: "subPackages", text2: "Object Array", text3: "否", text4: "分包结构配置", }, { text1: "workers", text2: "String", text3: "否", text4: "Worker 代码放置的目录", }, { text1: "requiredBackgroundModes", text2: "Array", text3: "否", text4: "需要在后台使用的能力，如“音乐播放”", }, { text1: "plugins", text2: "Object", text3: "否", text4: "使用到的插件", }]

Page({

  /**
   * 页面的初始数据
   */
  data: {
    celltittle: [oneTittle, twoTittle],
    onearray:oneArray,
    html: '<div class="div_class" style="line-height: 60px;">全局配置(app.json)页面配置(index.json)</div>',
    name:'name1'
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
  tap() {
    console.log('tap')
  }
})