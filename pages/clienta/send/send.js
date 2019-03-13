// pages/send/send.js
var util = require('../../../utils/util.js')
var config = require('../../../config.js')
var api = require('../../../utils/api.js')
var message = require('../../../utils/message.js')
var network = require('../../../utils/network.js');
var app = getApp();
var that = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    thelist:[],
    show:false,
    value:'',
    souList:[],
		tosendpagedata:null,
    tosendpagedatafp:null,
    inputvalue:'',
    vipView:false,//开通会员
    freeText:"免费试用"
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
wx.hideShareMenu();
    let ch = util.systemTop() + 76
    let sh = util.systemHeight()-ch-194
    this.setData({
      cH: ch,
      sH:sh
    })
		
		this.data.tosendpagedata = wx.getStorageSync("tosendpagedata");
		wx.removeStorage({
			key:"tosendpagedata"
		})
		this.data.tosendpagedatafp = wx.getStorageSync("tosendpagedatafp");
		wx.removeStorage({
			key:"tosendpagedatafp"
		})
    this.getChatList()
    this.getgroup(this.data.thelist)
  },
  //获取聊天列表
  getChatList() {// 渲染 聊天列表，动态列表，总结消息，统计消息
    // 确保 有cusdataMap 
    var cusdataMap = wx.getStorageSync("cusdataMapForInfomation");
    this.setData({
      clist: cusdataMap
    })
    // 如果在 动态，behaviorUnread = 0;
    var list = [];
    var ml = wx.getStorageSync("MESSAGE");
    var gml = wx.getStorageSync("GROUPMESSAGE");
    if (!ml && !gml) return;

    var thesblist = {};// 保持 messagetype ==  g的，第一条
    if (ml) {
      for (var id in ml) {
        var oppo = ml[id];
        var cusdata = cusdataMap[id];
        oppo['nickname'] = cusdata["nickname"];
        oppo["portrait"] = cusdata["portraitpath"];
        oppo["name"] = cusdata["name"];
        var records = wx.getStorageSync("messageList" + id);
        var index = records.length - 1;
        var lastRecord = records[index];
        while (true) {
          if (lastRecord.messagetype == 'g') { // 是群聊消息。
            if (index == records.length - 1) { // 保存最上面一条 群聊
              thesblist[id] = lastRecord;
            }
            index--; // 不选这一条。选看看上一条
            if (index >= 0) { // 还有得选
              lastRecord = records[index]; // 
            } else { // 没有得选了。默认内容。
              lastRecord = {
                content: "",
                contenttype: "text"
              };
              break;
            }
          } else {
            break;
          }
        }
        oppo["content"] = util.getLastMessageShowContent(lastRecord);
        // oppo["contenttype"] = lastRecord["contenttype"];
        oppo["timeline"] = lastRecord["timeline"];
        oppo["timestr"] = util.formatTimeLine(oppo["timeline"]);
        list.push(oppo);
      }
    }

    if (gml) {
      for (var id in gml) {
        var group = gml[id];
        var recodes = wx.getStorageSync("groupMessageList" + id)
        // group["groupid"] = group["groupid"];
        group["nickname"] = group["groupname"] + "(" + group["groupcount"] + ")";
        group["portrait"] = config.groupHeadImgBase64;
        if (recodes.length != 0) {
          var lastRecord = recodes[recodes.length - 1];
          group["content"] = util.getLastMessageShowContent(lastRecord);
          group["contenttype"] = lastRecord["contenttype"];
          group["timeline"] = lastRecord["timeline"];
          group["timestr"] = util.formatTimeLine(group["timeline"]);
        }
        list.push(group);
      }
    }

    list = list.sort(function (a, b) {
      var va = a.timeline;
      var vb = b.timeline;
      va = va ? va : 0;
      vb = vb ? vb : 0;
      return vb - va;
    })
    // thesblist
    for (var i = 0; i < list.length; i++) {
      var one = list[i];
      if (one.id && thesblist[one.id]) {
        var two = thesblist[one.id];
        one["content"] = util.getLastMessageShowContent(two);;
        one["contenttype"] = two["contenttype"];
        one["timestr"] = util.formatTimeLine(two["timeline"]);
      }
    }
    this.data.thelist = list
    this.setData({
      list: list
    })
  },
  //群发列表
  getgroup(list){
    var glist = []
    var rlist = []
    list.forEach(item=>{
      var id = item.groupid
      if (id){glist.push(item)}
    })
    this.setData({
      glist: glist,
    })
  },
  //联系人列表
  getcus(){

  },
  //搜索框聚焦
  inputF(e){
    var carr = api.deepcopy(this.data.clist)
    var garr = api.deepcopy(this.data.glist)
    if(this.data.inputvalue != ''){
      this.setData({
        show:true
      })
    }else{
      this.setData({
        show:true,
        gsList:garr,
        csList:carr
      })
    }
  },
  //搜索=>输入框输入
  inputO(e){
    let entry = e.detail.value
    this.data.inputvalue = e.detail.value
    var carr = api.deepcopy(this.data.clist)
    var garr = api.deepcopy(this.data.glist)
    var csouList = []
    var gsouList = []
    //遍历carr联系人
    Object.values(carr).forEach(item=>{
      let nameArr = item.name ? item.name : item.nickname
      var reg = new RegExp(entry, 'i');
      if (nameArr.match(reg) != null && entry.length != 0) {
        // if (nameArr.search(entry) != -1 && entry.length != 0) {
        csouList.push(item)
      }
    })
    csouList.forEach((item) => {
      let nameArr = item.name ? item.name : item.nickname
      item.nickname = nameArr.replace(entry, "<span style='color:#ff8a01'>" + entry + "</span>")
    })
    //遍历garr群发
    Object.values(garr).forEach(item => {
      let nameArr = item.nickname?item.nickname:item.groupname
      var reg = new RegExp(entry, 'i');
      if (nameArr.match(reg) != null && entry.length != 0) {
        // if (nameArr.search(entry) != -1 && entry.length != 0) {
        gsouList.push(item)
      }
    })
    gsouList.forEach((item) => {
      let nameArr = item.nickname?item.nickname:item.groupname
      item.nickname = nameArr.replace(entry, "<span style='color:#ff8a01'>" + entry + "</span>")
    })
    this.setData({
      csList: csouList,
      gsList: gsouList,
    })
    if (entry.length == 0){
      this.setData({
        csList: carr,
        gsList: garr,
      })
    }
    
  },
  //搜索框close
  inputB(){
    this.setData({
      show: false,
      value:'',
    })
  },tosend(e){
    var name = e.currentTarget.dataset.name
    console.log(name)
		var a = this.data.tosendpagedata;
		var p = this.data.tosendpagedatafp;
		var sharecomment = null;
		if(a){
			sharecomment = a;
		}else if(p){
			sharecomment = p;
		}else{
			console.log('error');
			return ;
		}
		wx.showModal({
			content:"确认发送至："+name,
      cancelColor: '#333301',
      confirmText:'发送',
      confirmColor: '#ffa019',
			success:function(res){
				if(res.confirm){ // 点了确认
					var commentid = null;
          var articleid = null;
          if(a){
            articleid = a.id;
          }else if(p){
            articleid = p.articleid;
          }
          commentid = new Date().getTime()+""+articleid;
          var cd = {articleid:articleid,
          comment:sharecomment.sharecomment,id:commentid};
          cd["funcNo"] = '1040';
          network.postRequest(cd);
					var content = api.deepcopy(sharecomment);
          if (content.imgurl != null && content.imgurl != undefined) {//处理图片路径
            if (content.imgurl.search('image/img') != -1) {
              content.imgurl = content.imgurl.replace('../../../../image/img', '../../../image/img')
            }
          }
					if(commentid!=null){
						content["commentid"] =commentid;
						content["sharecomment"] = "";//防止带太多的内容去消息里。
					}
					// 发送逻辑
					var groupid = e.currentTarget.dataset.groupid;
					var cusid = e.currentTarget.dataset.id;
					var contentType= null;
					if(a){
						contentType = "article";
					}else if(p){
						contentType = "product";
					}
					if(groupid){ // 查群成员
						var groupmemberListData = {
							funcNo:"1005",
							groupchatid:groupid,
							creator:app.globalData.managerData.id
						}
						network.postRequest(groupmemberListData).then(function(res){
							if(res.error_no == '0'){
								var members = res.data;
								if(members!=null){
									message.sendGroupMessage(app.globalData.managerData.id,groupid,content,contentType,members);
									wx.navigateBack({delta:1});
								}
							}
						});
					}else if(cusid){
						message.sendMessage(app.globalData.managerData.id,cusid,content,contentType);
						wx.navigateBack({delta:1});
					}
				}
			}
		});
	},sendconfirm(e){
		
	},totagspage(){

    var md = app.globalData.managerData;
		var now = new Date().getTime();
		if(!md.expire || now > md.expire){// 过期，或者没有会员
			this.setData({
				vipView:true
			});
			if(md.state && md.state>'0'){
				this.setData({
					freeText:"已试用"
				});
			}
			return;
		}
		if(this.data.tosendpagedata){
			wx.setStorageSync("fromsendpagetousertag",{cs:this.data.tosendpagedata})
		}else if(this.data.tosendpagedatafp){
			wx.setStorageSync("fromsendpagetousertagfp",{cs:this.data.tosendpagedatafp})
		}
		wx.navigateTo({
			url:"../usertag/usertag"
		})
	}
	,
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

  },toVipPage(e){
    util.getFormId(e)
		wx.navigateTo({
			url:"/pages/member/member"
		});
	},closeVipView(){
		that.setData({vipView:false});
	},freeMonth(e){
    util.getFormId(e)
		var freeText =  e.currentTarget.dataset.freetext;
		if(freeText == '已试用') return;
		var md = app.globalData.managerData;
		util.freeMonth(md.id,function(expire){
			that.setData({vipView:false});
			md.expire = expire;
			md.state = "1";
		});
	}
})
