var api = require('../../../utils/api.js')
var network = require('../../../utils/network.js')
var message = require('../../../utils/message.js')
var util = require('../../../utils/util.js')
var app = getApp();
var myid = null;
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
		var that = this
		var pageStack =  getCurrentPages();
		if(pageStack.length >2){
			this.setData({
				fromEditor:true
			});
		}
		wx.getStorage({
			key:"fromsendpagetousertag",
			success:function(r){
				that.data.fromsendpagetousertag = r.data;
				wx.removeStorageSync("fromsendpagetousertag");
			}
		})
		wx.getStorage({
			key:"fromsendpagetousertagfp",
			success:function(r){
				that.data.fromsendpagetousertagfp = r.data;
				wx.removeStorageSync("fromsendpagetousertagfp");
			}
		})
		
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
    // that.setData({
    //   //给定初始宽度
    //   inputWidth: this.data.inputWidth
    // })
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
  },
	changeSelected(groupid,tagid){
		var tl = this.data.tagList;
		for(let i = 0 ; i<tl.length;i++){
			let one = tl[i];
			if(one.groupid == groupid){
				let theGroupList = one.list;
				for(let j = 0 ; j<theGroupList.length;j++){
					var onetag = theGroupList[j];
					if(onetag.tagid == tagid){
						onetag.selected = !onetag.selected;
					}
				}
			}
		}
	},totagdetail(e){
		var dataset = e.currentTarget.dataset;
		if(this.data.fromsendpagetousertag){ // 发送，后面的操作都不做。
			var cs = this.data.fromsendpagetousertag.cs;
			wx.showModal({
				content:"确认发送至："+dataset.tagname,
        confirmColor: '#ffa019',
        cancelColor: '#333301',
        confirmText: '发送',
				success:function(res){
          if(res.confirm){
            var commentid = null;
            if (cs.sharecomment) { // 是否有特殊的分享。
              commentid = new Date().getTime() + "" + cs.id;
              var cd = {
                articleid: cs.id,
                comment: cs.sharecomment, id: commentid
              };
              cd["funcNo"] = '1040';
              network.postRequest(cd);
            }
            if (commentid != null) {
              cs["commentid"] = commentid;
              delete cs["sharecomment"];
            }
            var tagid = dataset.tagid;
            var listData = {
              funcNo: '1030',
              tagid: tagid
            };
            network.postRequest(listData).then(function (res) {
              if (res.error_no == '0') {
                var list = res.data;
                for (var i = 0; i < list.length; i++) {
                  var one = list[i];
                  message.sendMessage(app.globalData.managerData.id, one.cusid, cs, "article");
                }
                wx.navigateBack({ delta: 2 });
              }
            });
          }
				}
			});
			return ;
		}
		if(this.data.fromsendpagetousertagfp){ // 产品
			var cs = this.data.fromsendpagetousertagfp.cs;
			wx.showModal({
				content:"确认发送至："+dataset.tagname,
        cancelColor: '#333301',
        confirmText: '发送',
        confirmColor: '#ffa019',
				success:function(res){
          if(res.confirm){
            var commentid = null;
            commentid = new Date().getTime() + "" + cs.articleid;
            var cd = {
              articleid: cs.articleid,
              comment: cs.sharecomment, id: commentid
            };
            cd["funcNo"] = '1040';
            network.postRequest(cd);
            cs["commentid"] = commentid;
            delete cs["sharecomment"];
            var tagid = dataset.tagid;
            var listData = {
              funcNo: '1030',
              tagid: tagid
            };
            network.postRequest(listData).then(function (res) {
              if (res.error_no == '0') {
                var list = res.data;
                for (var i = 0; i < list.length; i++) {
                  var one = list[i];
                  message.sendMessage(app.globalData.managerData.id, one.cusid, cs, "product");
                }
                wx.navigateBack({ delta: 2 });
              }
            });
          }
				}
			});
			return ;
		}
		if(this.data.fromEditor){
			wx.setStorageSync("tocusintagpage",dataset);	
			wx.navigateTo({
				url:'./cusintag/cusintag'
			})
		}else{
			wx.setStorageSync("totagdetailpage",dataset);
			wx.navigateTo({
				url:'./tagdetail/tagdetail'
			})
		}
	},
  //选中标签
  tagbind(e){
		let groupid =e.currentTarget.dataset.groupid;
    let tagid = e.currentTarget.dataset.tagid
		var selected = e.currentTarget.dataset.selected;
		var arr = this.data.tagarray;
		if(selected){//
			var index = null;
			for(let i = 0 ; i<arr.length; i++){
				let one = arr[i];
				if(one == tagid){
					index = i;
					break;
				}
			}
			arr.splice(index,1);
			this.changeSelected(groupid,tagid);
			this.setData({
				tagList:this.data.tagList
			})
		}else{
			arr.push(tagid);
			this.changeSelected(groupid,tagid);
			this.setData({
				tagList:this.data.tagList
			})
		}
    this.setData({
      tagArrLength: this.data.tagarray.length,
    })
  },
  //获取标签数据
 tagPost(){
    network.postRequest({ creator: myid, funcNo: 1010 }).then((res)=>{
      let arr = res.data
      // let tagArr = api.deepcopy(arr);
			var groupmp = {};
      let tagArrList = [];
			arr.forEach((item, index) => {
				var groupid = item.groupid;
				if (groupmp[groupid]) {
					groupmp[groupid].list.push({
						tagid: item.tagid,
						quantity: item.quantity,
						tagname: item.tagname
					})
				} else {
					groupmp[groupid] = {
						groupname: item.groupname,
						groupid: item.groupid,
						color: "",
						list: [],
						tagShow: true
					}
					if (item.tagname) {
						groupmp[groupid].list.push({
							tagid: item.tagid,
							quantity: item.quantity,
							tagname: item.tagname
						});
					}
				}
			})
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
			
			var taggroupSequence = wx.getStorageSync("taggroupSequence");// 排序
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
  },
  //创建标签
  tagAdd(e){
		this.data.addFromTagGroupid = e.currentTarget.dataset.groupid;
    this.setData({
      modalMeng:true,
      modalInput:true,
    })
  },
  modalCancel(){
    this.setData({
      modalMeng: false,
      modalInput: false,
    })
  },
  inputOver(){
    this.setData({
      modalMeng: false,
      modalInput: false,
    })
		// this.data.addFromTagGroupid
		//String creator= getStrParameter("creator");
		// String groupid = getStrParameter("groupid");
		// String tagname = getStrParameter("tagname"); 
		var that = this;
		var tagname = this.data.value;
		var groupid = this.data.addFromTagGroupid;
		var createtag = {
			funcNo:'1029',
			creator:app.globalData.managerData.id,
			groupid:groupid,
			tagname:tagname
		};
		network.postRequest(createtag).then(function(res){
			if(res.error_no == '0'){
				for(var i = 0 ; i <  that.data.tagList.length; i++){
					var one = that.data.tagList[i];
					if(one.groupid == groupid ){
						one.list.push({
							tagid:res.tagid,
							quantity:0,
							tagname:tagname
						});
						break;
					}
				}
				that.setData({
					tagList:that.data.tagList
				})
			}
		})
  },
  inputEnd(e){
    this.data.value = e.detail.value
  },
  //创建标签(组)
  addTagArr() {
    network.postRequest({funcNo: 1006 ,creator:myid}, "post").then((res) => {
				this.tagPost();
    })
  },
	deleteTag(e){
		if(this.data.tagarray.length==0)return ;
		var tags = "";
		for(var i = 0 ; i< this.data.tagarray.length;i++){
			if(i == 0){
				tags +=this.data.tagarray[i];
			}else{
				tags +=","+this.data.tagarray[i];
			}
		}
		network.postRequest({funcNo: 1009 ,tagid:tags}).then((res) => {
				if(res.error_no == '0'){
					var tl = this.data.tagList;
					for(var i = 0 ; i< this.data.tagarray.length;i++){
						var tagid = this.data.tagarray[i];
						deleteTagFromGroupLocal(tl,tagid);
					}
					this.data.tagarray = [];
					this.setData({
						tagList:this.data.tagList,
						tagarray:this.data.tagarray,
						tagArrLength:0
					});
				}
		})
	},
  //删除标签（组）
  deleteTagArr(e) {
    var that = this
    wx.showModal({
      content: '确定将该标签组移除？',
      cancelColor:'#333301' ,
      confirmText:'删除',
      confirmColor:'#ffa019',
      success:function(res){
        if(res){
          let groupid = e.target.dataset.groupid
          network.postRequest({ groupid: groupid, funcNo: 1007 }, "post").then((res) => {
            if (res.error_no == '0') {
              var index = -1;
              for (let i = 0; i < that.data.tagList.length; i++) {
                var one = that.data.tagList[i];
                if (one.groupid == groupid) {
                  index = i;
                  break;
                }
              }
              that.data.tagList.splice(index, 1);
              that.setData({
                tagList: that.data.tagList
              })
            }
          })
        }else{
        }
      }
    })
    
  },
  //修改标签名（组） && input事件
  alterTagArr(e) {
		var elementGroupId = e.target.dataset.groupid;
		var isShow = e.target.dataset.show;
		var theGroup = null;
		for(let i = 0  ; i<this.data.tagList.length ; i++){
			var one =  this.data.tagList[i];
			if(one.groupid  == elementGroupId){
				theGroup = one;
			}
		}
		if(theGroup){
			theGroup.tagShow = !theGroup.tagShow;
		}
		this.setData({
			tagList: this.data.tagList,
      tagSho: !this.data.tagSho,
      focuss: true
		})
  },
  //修改标签=>input输入
  bindInput(e){
		if(e.detail.value.length > 10){
			var s = e.detail.value;
			s = s.substr(0,10);
			return s;
		}
  },
	bindblur(e){
		this.inputConfirm(e);
	},
  //修改标签=>input失去焦点
  //修改标签=>input完成
  inputConfirm(e){
    let groupid = e.currentTarget.dataset.groupid
    let groupname = e.detail.value
		var theGroup = null;
    network.postRequest({ groupid: groupid, name: groupname, funcNo: 1008 }).then((res) => {
				if(res.error_no == '0'){
					for(let i = 0  ; i<this.data.tagList.length ; i++){
						var one =  this.data.tagList[i];
						if(one.groupid  == groupid){
							theGroup = one;
						}
					}
					theGroup["groupname"] = groupname;
					theGroup["tagShow"] = true;
					this.setData({
						tagList:this.data.tagList
					})
				}
    })
  }
})
