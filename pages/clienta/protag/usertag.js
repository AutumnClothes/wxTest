var api = require('../../../utils/api.js')
var network = require('../../../utils/network.js')
var message = require('../../../utils/message.js')
var util = require('../../../utils/util.js')
var app = getApp();
var myid = null;
var that = null;
function deleteTagFromGroupLocal(tl,tagid){
	var findGroup = null;
	var findTagIndex =null;
	for(let i = 0 ; i<tl.length;i++){
		let one = tl[i];
		let theGroupList = one.list;
		for(let j = 0 ; j<theGroupList.length;j++){
			var onetag = theGroupList[j];
			if(onetag.tagid == tagid){
				findGroup = one;
				findTagIndex = j;
			}
		}
	}
	findGroup.list.splice(findTagIndex,1);
}
Page({
  /**
   * 页面的初始数据
   */
  data: {
		fromEditor:false,
    tagArrLength:'0',
    _tag:'',
    tagarray:[],
    tagSho:false,
    //标签页测试数据
    tagList:[],
    // inputWidth:'',
    // tagShow0:true,
    changeColor:false,
		addFromTagGroupid:"",
		fromsendpagetousertag:null,
		fromsendpagetousertagfp:null
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
wx.hideShareMenu();
		that = this
		myid = app.globalData.managerData.id;
    
    let h = util.systemTop()
    let ch = util.systemTop() + 75
    let sh = util.systemHeight()-ch-88
    var apple = app.globalData.AppleX
    if (apple) {
      this.setData({
        bm: 50
      })
    } else {
      this.setData({
        bm: 0
      })
    } 
    that.setData({
      H:h,
      cH: ch,
      sH:sh
    })
    wx.getSystemInfo({
      success: function (res) {
        let topHeight = ((res.statusBarHeight * (750 / res.windowWidth)) + 10)
        that.setData({
          top_padding: topHeight
        })
      }
    });

    //获取taglist数据
    
    that.tagPost()
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
		var  that  = this;
		util.backexecute(function(){
			that.tagPost();
		});
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

  // /**
  //  * 页面相关事件处理函数--监听用户下拉动作
  //  */
  // onPullDownRefresh: function () {

  // },

  // /**
  //  * 页面上拉触底事件的处理函数
  //  */
  // onReachBottom: function () {

  // },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //标签组排序
  bindSort(e){
    let ind = e.currentTarget.dataset.ind
    let tmp = this.data.tagList[ind]
    let len = this.data.tagList.length
    if ((ind + 1) < len){
      this.data.tagList[ind] = this.data.tagList[ind + 1]
      this.data.tagList[ind + 1] = tmp
    }else{
      let tmp1 = this.data.tagList[ind]
      // console.log(tmp1)
      this.data.tagList.pop()
      this.data.tagList.unshift(tmp1)
    }
    this.setData({
      tagList: this.data.tagList
    })
  },
  //底部管理
  adminTag(e){
		util.getFormId(e)
		util.setBackexecute(0);
    wx.navigateTo({
    	url:"./tagmanager/tagmanager"
    })
  },totagdetail(e){
		util.getFormId(e);
		var dataset = e.currentTarget.dataset;
		wx.setStorageSync("totagdetailpage",dataset);
		wx.navigateTo({
			url:'./tagdetail/tagdetail'
		})
	},
  //选中标签
  //获取标签数据
 tagPost(){
    network.postRequest({ creator: myid, funcNo: 1068 }).then((res)=>{
      let arr = res.data
      // let tagArr = api.deepcopy(arr);
			var groupmp = {};
			if(!arr)return;
			arr.forEach((item, index) => {
				var groupid = item.groupid;
				if (groupmp[groupid]) {
					groupmp[groupid].list.push({
						tagid: item.tagid,
						quantity: item.quantity,
						tagname: item.tagname,
            tagcd:item.tagcd
					})
				} else {
					groupmp[groupid] = {
						groupname: item.groupname,
						groupid: item.groupid,
            groupcd:item.groupcd,
						color: "",
						list: [],
						tagShow: true
					}
					if (item.tagname) {
						groupmp[groupid].list.push({
							tagid: item.tagid,
							quantity: item.quantity,
							tagname: item.tagname,
              tagcd:item.tagcd
						});
					}
				}
			})
			// console.log(groupmp);
			var r = [];
			for (var i in groupmp) {
				r.push(groupmp[i]);
			}
			//标签组color
			let tagColor = ['#fba537', '#f8669c', '#72c976', '#71a8f4', '#b577f8']
			for (tagColor.length; tagColor.length < r.length;) {
				tagColor = [...tagColor, ...tagColor]
			}
			r.forEach((item, index) => {
				r[index].color = tagColor[index]
			})
			
			var taggroupSequence = wx.getStorageSync("ptaggroupSequence");// 排序
			var sortedList = [];
			for(var i = 0 ; i <taggroupSequence.length; i++){
				var groupid = taggroupSequence[i];
				var j= 0 ;
				var loopendFlag = true;
				for(; j< r.length ; j++){
					var twoobj = r[j];
					var innerGroupid = twoobj.groupid;
					if(innerGroupid == groupid){
						sortedList.push(twoobj);
						loopendFlag = false;
						break;
					}
				}
				if(!loopendFlag){
					r.splice(j,1);
				}
			}
			r = sortedList.concat(r);
			
			this.setData({
				tagList: r
			})
    })
  }
})
