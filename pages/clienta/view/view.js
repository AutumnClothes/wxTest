// pages/clientb/view/view.js
var util= require('../../../utils/util.js')
var network = require('../../../utils/network.js');
var api = require('../../../utils/api.js');
var config = require('../../../config.js')
var app =getApp()
var toviewpagedata = null;
var that = null;
var articlekey = null;
var inCourse4 =null;
var posterQRCodeid= null;
var hasCard = null;
var key = null;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    textareaTrue:true,
    textareaFocus:false,
    mengShow:false,
    shareShow:false,
    comment:null,
		contentJson:[],
    textareavalue:null,
    settextareavalue:null,
		managerData:null,
		headimg:"",
    editFlag:false,
    imguploadsuccessnum:0,
    exist:true,
    //海报
    mLeft: 133,
    mleft: '',
    RemarkHeight:0,
    articleImg:'',
    //引导
    guidance:false,//点评
    guidance1:false,//推荐
    guidance2:false,//分享
    showSaveButton:true,
    pShowAdd:'true'
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    hasCard = null;
    posterQRCodeid = null;
    key = null;
    wx.hideShareMenu();
		that = this;
    var ch = util.systemTop() + 88
    var sh = util.systemHeight()-ch
    var apple = app.globalData.AppleX
    if (apple) {
      this.setData({
        bm: 50,
      })
    } else {
      this.setData({
        bm: 0,
      })
    } 
    this.setData({
      cH:ch,
      sH:sh,
    })
    if(options["key"]){
      key = options["key"];
      if(key == 'quncard'){
        this.setData({
          showSaveButton:false
        })
      }
      if(key == 'column'){
        this.setData({
          showSaveButton:false
        })
      }
      this.setData({
        circle:true
      });
    }
    toviewpagedata = wx.getStorageSync("toviewpagedata");
    var managerData = null;
    var headImgUrl = null;
    if(key){
      var city = toviewpagedata.city
      if (city) city = city.replace(/,/g, '')
      managerData = {
        company : toviewpagedata.company,
        position : toviewpagedata.position,
        user_name :toviewpagedata.user_name,
        profile : toviewpagedata.profile,
        city : city,
        mobile_phone : toviewpagedata.mobile_phone
      };
      headImgUrl= toviewpagedata.portrait_path
    }else{
      var city = app.globalData.managerData.city
      city = city.replace(/,/g,'')
      managerData = app.globalData.managerData;
      managerData.city = city
      headImgUrl = managerData.portrait_path;
    }

    //company和position为空时候设置默认值
    if(!managerData.company)managerData.company ='';
    if(!managerData.position)managerData.position ='';
    if(!managerData.company && !managerData.position){
      managerData.company = '您身边的专业顾问'
      managerData.position = ''
    }
    this.getcompanyPosition(managerData)
    
		if(headImgUrl !=null && headImgUrl.indexOf("wills")!=-1)
      headImgUrl = headImgUrl.substr(0,headImgUrl.length - 4)+"s.jpg";
    this.composeLength(managerData)
		this.setData({
			headimg:headImgUrl,
			managerData:managerData
		})
    this.data.title = toviewpagedata.title
		if(toviewpagedata){
      if(toviewpagedata.commentid){
        var rd = {
          funcNo:"1048",
          id:toviewpagedata.commentid
        }
        network.postRequest(rd).then(function(r){
          if(r.error_no == '0'){
            if(r.data!=null && r.data.length !=0){
              var c =r.data[0].content;
              if(c == "")c =null;
              that.setData({
                comment:c
              });
            }
          }
        });
      }else if(toviewpagedata.comment){
        that.setData({
					comment:toviewpagedata.comment
				});
      }
			if(toviewpagedata.type == 2 || toviewpagedata.type.indexOf("wills")!=-1){
				this.setData({
					editFlag:true
				});
			}
			var src = "https://www.willsfintech.cn:9001/article?articleid="+toviewpagedata.id
			network.get(src).then(function(r){
        if(r == "delete"){
          that.setData({
            exist:false
          });
          return;
        }
				var c = [
          {
            name:'div',
            attrs:{
              style:'width:92%;height:auto;margin:20px auto;font-size:17px;line-height:1.6'
            },
            children:[]
          }
        ];
        c[0].children.push(r); // 文章扒取 不是数组 所以需要一个数组去加载。
				articlekey = 0;
				// 补丁
				if(toviewpagedata.type == '1'){ // 本身就是数组
          c = r;
          articlekey = 1;
          toviewpagedata["content"] = r;
				}
				if( toviewpagedata.type == 2 || toviewpagedata.type.indexOf("wills")!=-1){ // 本身是数组，解析完了也是。
          toviewpagedata["content"] = r;
          c = that.getNodeInfo(r);
          articlekey = 2;
        }
        if(toviewpagedata.type == 0 || toviewpagedata.type == 2){
          that.setData({
            articleTitle:toviewpagedata.title,
            fromName:toviewpagedata.nickname
          })
        }
        //给个父级，控制边距
				that.setData({
					contentJson:c
				});
      })
      this.getProduct();
    }
    //TODO
    wx.getStorage({
      key:"course",
      success:function(r){
        var ad = r.data;
        if(!ad){
          return ;
        }
        if(!ad[3]){ 
        }else if(!ad[4]){
          inCourse4 = true;
          that.course4Text2(true);
        }
      }
    })
    var Tj = wx.getStorageSync('Tj')
    if(Tj == '0'){ this.data.pShowAdd = false }else{
      this.data.pShowAdd = true
    }
    this.setData({pShowAdd:this.data.pShowAdd})
  },richtexttap(e){
    console.log(e);
  },course4Text2(flag){
    if(flag){// TODO
      this.setData({
        guidance:true,//点评
        guidance1:true,//推荐
        guidance2:true//分享
      });
      // 点此写入个人见解或推荐理由  体现你的专业能力
      //点击推荐资讯
    }
  },
  //公司职位定位
  getcompanyPosition(data){
    if(!data)return ;
		var len =0;
		if(data.company){
			len += data.company.length;
		}
		if(data.position){
			len += data.position.length
		}
    if (len > 13){
      this.setData({
        companyPosition:true
      })
    }else{
      this.setData({
        companyPosition: false
      })
    }
  },
  getNodeInfo(list){
    var richText = [];
    list.forEach(item=>{
			var obj = null;
      if(item.keys == 'img'){
        let w = item.imgWidth/2+'px',h = item.imgHeight/2+'px'
        if(item.imgWidth >= '648'){
          w = '100%'
          h = 'auto'
        }
        obj = {
          name:'div',
          attrs:{
            style:'width:86%;height:auto;border-radius: 6px;margin:29px auto 22px auto;text-align: center;'
          },
          children:[{
            type:'node',
            name:'img',
            attrs:{
              src:item.src,
              style:'width:'+w+';height:'+h+';'
            }
          }]
        }
      }
      else if (item.keys == 'txt'){
        let arr = item.content.split("\n");
        let chilObj = null;
        obj = {
          name: 'div',
          attrs: {
            style: 'width:86%;height:auto;border-radius: 6px;margin:15px auto 22px auto;font-size:16px;line-height:29px;color:#333;white-space:normal;word-break:break-all;text-align:justify;letter-spacing:1px; '
          },
          children: []
        }
        arr.forEach(ite=>{
          if(ite == "") ite="　";
          chilObj = {
            name:'div',
            attrs:'',
            children:[{
              type:'text',
              text:ite
            }]
          }
          if(chilObj!= null){obj.children.push(chilObj)}
        })
      }
			if(obj !=null)richText.push(obj);
    })
    // if (this.data.title != null && this.data.title != undefined && this.data.title != '') {
    //   var obj = null
    //   obj = {
    //     name: 'div',
    //     attrs: {
    //       style: 'width:86%;height:auto;margin:27px 6% 17px 6%;font-size:21px;color:#333;word-wrap: break-word;word-break: normal;letter-spacing:1px;line-height:30px;text-align:center;font-weight:500;margin-bottom:20px;'
    //     },
    //     children: [{
    //       type: 'text',
    //       text: this.data.title
    //     }]
    //   }
    //   richText.unshift(obj)
    // }
    return richText;
  },
  //编辑按钮
  editBind(e){
    util.getFormId(e);
		
		wx.setStorageSync("tocompilepagedata",toviewpagedata);
    wx.navigateTo({
      url: '../jobs/compile/compile',
    })
  },
  //点评按钮
  consult(e){
    util.getFormId(e)
    if (this.data.textareaTrue){
      this.setData({
        textareaTrue: false,
        textareaFocus:true,
        mengShow:true,
        completeShow:true,
      })
      wx.createSelectorQuery().select('#bgspan').fields({
        size:true
      },function(r){
        let h = r.height/util.rHeight()
        if(h<40){h = 40};
        that.data.RemarkHeight = h;
        that.setData({
          textareaH:h
        })
      }).exec()
      this.setData({
        scrollId:'scrollid',
        textareavalue:this.data.comment
      })
    }
    this.setData({
      guidance:false//点评
      ,guidance1:false
    });
  },guidance_close(){
    this.setData({
      guidance3:false
    });
  },tocreate(){
    wx.reLaunch({
      url:"/pages/clienta/mine/card/card"
    });
  },
  //shareShow
  comment(){
    if(key){
      if(!app.globalData.managerData){
        this.setData({
          guidance3:true
        });
        return ;
      }
      var rd = {
        funcNo:'1062',
        type:"article",
        entityid:toviewpagedata.id,
        toid:app.globalData.managerData.id
      }
      network.postRequest(rd).then(function(r){
        if(r.error_no == '0'){
          wx.showToast({
            title:"资讯已保存",
            duration:3000,
            mask:true
          });
        }
      });
      return ;
    }

    if(inCourse4){
      this.setData({
        guidance:false,//点评
        guidance1:false//推荐
      });
    }
    this.setData({
      mengShow:true,
      shareShow:true,
      textareaTrue:false,
      textareaFocus: false,
      scrollId:'scrollid',
      textareavalue:this.data.comment,
    })
    if(hasCard == null){
      var theCardurl = "https://www.willsfintech.cn:9004/shareArticleCard/" +
            toviewpagedata.pathid + ".jpg" + "?time=" + new Date().getTime();
      wx.getImageInfo({
        src:theCardurl,
        success:function(r){
          hasCard = r.path;
        },
        fail:function(){
          hasCard = "https://www.willsfintech.cn:9004/staticFile/image/articleproduct.png";
        }
      });
    }
  },
  //关闭shareShow
  closemeng(){
    this.setData({
      mengShow: false,
      shareShow: false,
      textareaTrue: true,
      textareaFocus: false,
      textareavalue:""
    })
  },textareainput(e){
		this.data.textareavalue = e.detail.value;
	},cancelComment(e){
    util.getFormId(e)
    that.closemeng();
    that.setData({
      completeShow:false
    });
    if(inCourse4){
      this.setData({
        guidance1:true
      });
    }
  },
	updateComment(e){
    if(inCourse4){
      this.setData({
        guidance1:true
      });
    } 
		util.getFormId(e)
    var tav = this.data.textareavalue;
		if(tav ==null ){ // 没有输入
			that.closemeng();
			that.setData({
				completeShow:false
			});
			return ;
    }
		var d = {
			funcNo:'1039',
			id:toviewpagedata.id,
			comment:tav
		}
		network.postRequest(d).then(function(r){
			that.closemeng();
			that.setData({
				comment:tav,
				completeShow:false
			});
		});
	},
	tocontact(){
    var tav =  this.data.textareavalue;
    if(tav == null){
      tav = this.data.comment;
    }
    if(tav == null) tav = "";
    toviewpagedata["sharecomment"]=tav;
    var tosendpagedata = api.deepcopy(toviewpagedata);
    delete  tosendpagedata["content"];
    wx.setStorageSync("tosendpagedata",tosendpagedata);
    toviewpagedata["sharecomment"] = null;
		wx.navigateTo({
			url:"../send/send"
		})
	},tomoment(){
    var tav =  this.data.textareavalue;
    if(tav == null){
      tav = this.data.comment;
    }
    if(tav == null) tav = "";
    toviewpagedata["sharecomment"]= tav;
    var tosendpagedata = api.deepcopy(toviewpagedata);
    delete  tosendpagedata["content"];
    wx.setStorageSync("topublishmomentpagedata",tosendpagedata);
    toviewpagedata["sharecomment"] = null;
		wx.navigateTo({
			url:"../jobs/columnadd/columnadd"
		})
	},
  //分享海报
  sharePoster(){
    wx.showToast({
      title: '敬请期待',
      icon:'none'
    })
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
    that = this
    that.closemeng()
		util.backexecute(function(r){
			var title = r.title;
      var articleContent = r.articleContent;
			if(articleContent ){
        articleContent = JSON.parse(articleContent);
      }
			toviewpagedata["content"] = articleContent;
      toviewpagedata["title"] = title;
      that.setData({
        title:title
      });
      var c = that.getNodeInfo(articleContent);
			that.setData({
        contentJson:c
      });
    },"reload");
    

    util.backexecute(function(r){
      var title = null;
      var list = null;
      var nulllist = {keys: "txt", content: "请完善内容", addShow: true};
      var nulltitle = "请完善标题";
      if(r.title){
        title = r.title;
      }else{
        title = nulltitle;
      }
      if(r.list.length !=1){
        r.list.splice(0,1);
        list = r.list;
      }else{
        list = [];
        list.push(nulllist);
      }
      wx.showModal({
        content:"是否保存之前编辑内容",
        confirmColor: '#ffa019',
        cancelColor: '#333301',
        confirmText:"保存",
        cancelText:"放弃",
        success:function(r){
          if(r.confirm){
            that.uploadImg(list,function(){
              that.postProductData(title,list);
            });
          }
        }
      })
    },"exceptionclose");

    util.backexecute(function(){that.getProduct();},'product')

  },uploadImg(list,callback){
    var l = list;
    if(l.length ==0){ // 没有图片需要保存。
		  callback();
		  return ;
	  }
	  for(var i= 0 ; i<l.length ; i++)
		{
		  var one = l[i];
		  if(one.keys == 'title' || one.keys == 'txt'){
			that.imguploadfinish(l.length,callback);  
			continue;
		  }
		  if(one.src.indexOf("wills")!=-1){
				that.imguploadfinish(l.length,callback);
				continue;
		  }
		  that.uploadOneImg(one,callback,l.length);
	  }
  },uploadOneImg(one,callback,len){
		var that = this;
		wx.uploadFile({
			url:config.uploadImg,
			filePath:one.src,
			name:"productContent",
			success:function(res){
				if(res.statusCode == 200 ){
					var d = JSON.parse(res.data);
					if(d.error_no == '0'){
						var path = d.path;
						one.src = path;
						that.imguploadfinish(len,callback);
					}else{
						//TODO 错误提示
					}
				}
			}
		})
	},
	imguploadfinish(len,callback){
		this.data.imguploadsuccessnum++;
		if(this.data.imguploadsuccessnum == len){
			this.data.imguploadsuccessnum =0;
			callback();
		}
  },postProductData(title,l){
    var type = '2';
    var l = JSON.stringify(l);
    for(var i = 0 ; i<l.length ;i++){
      var one = l[i];
      if(one.keys == 'img'){
        if(one.originalWidth>=77 && one.originalHeight >=77) {
          type = one.src;
        }
      }
    }
		var rd = {
			funcNo:"1036",
			title:title,
			articleContent:l,
      creator:app.globalData.managerData.id,
      id:toviewpagedata.id,
      type:type
		}
		/* if(editid !=null){
			rd["id"] = editid;
		} */
		network.postRequest(rd).then(function(r){
			if(r.error_no == '0'){
        l = JSON.parse(l);
        l = that.getNodeInfo(l);
        that.setData({
					contentJson:l
				});
			}
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
		var commentid = new Date().getTime()+""+toviewpagedata.id;
		var title = toviewpagedata.title;
		var shareobj = {
      title: title
    }
    if(hasCard){
      shareobj["imageUrl"] =hasCard;
    }
    //"https://www.willsfintech.cn:9004/shareArticleCard/" +toviewpagedata.pathid + ".jpg" + "?time=" + new Date().getTime();
    
		var path= "pages/clientb/view/view?articleid="+toviewpagedata.id
		+"&sharefrom="+app.globalData.managerData.id;
		
		
		var tav =  this.data.textareavalue;
    if(tav == null){
      tav = this.data.comment;
    }
    if(tav == null) tav = "";
    path += "&commentid="+commentid;
    var cd = {
      funcNo:'1040',
      articleid:toviewpagedata.id,
      comment:tav,
      id:commentid
    };
    network.postRequest(cd);
		shareobj["path"]  = path;
		return shareobj;
  },
  posterPre(e){
    var commentid = new Date().getTime()+""+app.globalData.managerData.id;
    var id= commentid;
    posterQRCodeid = id;
    var param= "/pages/clientb/view/view?articleid="+toviewpagedata.id
    +"&sharefrom="+app.globalData.managerData.id;
    
    var tav =  this.data.textareavalue;
    if(tav == null){
      tav = this.data.comment;
    }
    if(tav == null) tav = "";
    param += "&commentid="+commentid;
    var cd = {
      funcNo:'1040',
      articleid:toviewpagedata.id,
      comment:tav,
      id:commentid
    };
    network.postRequest(cd);
    
    var referenceData = {
      funcNo:'1049',
      id:id,
      param:param
    }
    network.postRequest(referenceData).then(function(r){
      if(r.error_no == '0'){
        // TODO   画图      必须要等请求回复。因为图片可能还没有画好。
        that.posterBind(id);
      }
    });
  },
  /*******************分享海报************************/
  posterBind(id) {
    var that = this;
    var data = app.globalData.managerData
    if(!data.user_name)data.user_name = '——';
    var name = data.cn_name ? data.cn_name : data.user_name;
    var company = data.company,position = data.position;
    if (!data.company) company = '';
    if (!data.position) position = '';
    if ((company == '') && (position == '')) company = '您身边的专业顾问' 
    var text = '长按识别小程序码阅读全文';
    var localpath = data.portrait_path;
    // var localIdPath = 'https://www.willsfintech.cn:9004/qrcode/' + 26 + '.jpg' //二维码
    var localIdPath = 'https://www.willsfintech.cn:9004/commonqrcode/' + id+ '.jpg' //二维码
    //文字内容信息
    
    wx.showLoading({
      title: '正在生成中...',
      mask:true
    })
    //公司职位定位
    // this.nameLeft(name, company, position)
    //点评内容逻辑(可能没有点评)
    //点评框高度计算
    var remarktext = this.data.textareavalue;
    if(remarktext == null){
      remarktext = this.data.comment;
    }
    if(!remarktext){
      this.data.RemarkHeight = 0;
      remarktext = ''
    }else{
      // wx.createSelectorQuery().select('.input-value').fields({
      //   size:true
      // },function(r){
      //   that.data.RemarkHeight = r.height/util.rHeight
      // }).exec()
      //处理点评内容，以最后一行的高度值加60为点评框高度（PS：dom获取高度可能因为性能延迟导致获取不及时，且算法待研究。）
      remarktext = '  '+remarktext;
      var remarktextarr = util.longTextEnter(remarktext,590,67,32,1,50,false,75)
      this.data.RemarkHeight = remarktextarr[remarktextarr.length-1].y + 35
    }
    
    //资讯分类0扒取，1收录，2自编
    const content = toviewpagedata.content;
    var contentarr = {};
    var that = this;
    
    if(articlekey == 0){
      //扒取的文章获取头图缓存本地(应该有)，标题（应该有），说明（可能没有）
      //图片最低高度为1000，不满1000自动分配间距，超过1000按最小间距
      var articleimg = util.getArticleTitleImg(toviewpagedata)
      articleimg = articleimg.replace('/title','/htitle')
      wx.getImageInfo({
        src:articleimg,
        success(res){
          var texty = 0;
          contentarr['img'] = res.path
          //如宽超出，高度最大限制为422。如高超出，宽度最大为750.保持比例，居中截取
          //采用选取框画图，选取框大小为750*422
          //图片等比例缩放，选取框居中
          contentarr['iw'] = 750
          contentarr['ih'] = (750/res.width)*res.height
          if(contentarr['ih'] < 422){
            contentarr['iw'] = (422/contentarr['ih'])*contentarr['iw']
            contentarr['ih'] = 422
          }
          if(contentarr['ih']>422){var h = 422}else{ var h = contentarr['ih']}
          contentarr['titlearr'] = util.longTextEnter(toviewpagedata.title,650,h+104,54,1,70,true)
          texty = contentarr['titlearr'][contentarr['titlearr'].length-1].y;
          if(toviewpagedata.remark){
            contentarr['remarkarr'] = util.longTextEnter(toviewpagedata.remark,660,texty+84,34,1,52,true)
            contentarr['canvasHeight'] = contentarr['remarkarr'][contentarr['remarkarr'].length-1].y + 330 + that.data.RemarkHeight
          }else{
            contentarr['canvasHeight'] =texty + 320 + that.data.RemarkHeight
          }
          if(contentarr['canvasHeight']<1125){
            var j = 2
            if(contentarr['remarkarr'] || remarktextarr){j=3}
            if(contentarr['remarkarr'] && remarktextarr){j=4}
            contentarr['repairHeight'] = (1125 - contentarr['canvasHeight'] )/j
            contentarr['canvasHeight'] = 1125
          }else{
            contentarr['repairHeight'] = 0
          }
          that.setData({
            canvasHeight:contentarr['canvasHeight']
          })
          that.getImageInfo([localpath, localIdPath,articleimg], function(arr) {
            if (arr[0] != undefined && arr[1] != undefined && arr[2]!=undefined) {
              // contentarr["img"] = arr[2];
              that.draw(arr[0], arr[1], name, position, company,text,remarktextarr,contentarr)
            };
          });
        }
      })
    }
    if(articlekey == 1){
      // 内容只有文本，没有图片，没有卡片。
      // 区分顾问or客户，所有高度自动，获取内容，根据内容设置高度
      contentarr['title'] = toviewpagedata.title
      var contentData = content[0].children
      if(remarktext){
        contentarr['remarkarr'] = util.longTextEnter(remarktext,660,84,34,1,52,true)
      }else{
      }
      var arr = []
      var y = 0
      contentData.forEach((item,index)=>{
        var obj = {}
        obj.keys = item.attrs.class
        if(y<1334){
          if(item.attrs.class == 'send-box'){
            var img = item.children[0].attrs.src;
            wx.getImageInfo({
              src:img,
              success(res){
                obj.img = res.path
              },
              fail(err) {}
            })
            obj.text = item.children[1].children[0].text
            obj.text = util.longTextEnter(obj.text,420,y+10,32,1,42,false,35)
            y =obj.text[obj.text.length-1].y + 90
          }else{
            obj.text = item.children[0].children[0].text
            obj.text = util.longTextEnter(obj.text,420,y+10,32,1,42,false,35)
            y =obj.text[obj.text.length-1].y + 90
          }
          arr[index] = obj
        }
      })
      //得到内容后，计算出高度
      contentarr['content'] = arr
      contentarr['contentHeight'] = y 
      this.setData({
        canvasHeight:1334
      })
      that.getImageInfo([localpath, localIdPath], function(arr) {
        if (arr[0] != undefined && arr[1] != undefined) {
          // contentarr["img"] = arr[2];
          that.draw(arr[0], arr[1], name, position, company,text,remarktextarr,contentarr)
        };
      });
      // wx.showToast({
      //   title:'敬请期待',
      //   icon:'none'
      // })
    }
    if(articlekey == 2){
      contentarr['title'] = toviewpagedata.title
      contentarr['content'] = content
      this.getContentArr(contentarr['content'] ,0,0);// 异步   回调的时候，才会 吧contentarr 里的数据，更新。
      this.setData({
        canvasHeight:1334
      })
      this.getImageInfo([localpath, localIdPath], function(arr) { // 异步的回调。
        if (arr[0] != undefined && arr[1] != undefined) {
          that.draw(arr[0], arr[1], name, position, company,text,remarktextarr,contentarr) ; // 要用到 contentarr的更新后的数据，不然就会报错。
        };
      });
    }
  },
  //canvas需要调用的方法
  draw(localpath, localIdPath, name, position, company,text,remarktextarr,contentarr) {
    const ctx = wx.createCanvasContext('viewCanvas')
    //画出外框
    
    //文章内容
    if(articlekey == 0){
      //顶部头图，标题自动Y，说明有则画
      var texty = 0;
      ctx.setFillStyle('#fff');
      ctx.fillRect(0, 0, 750, contentarr['canvasHeight'])
      var h = null;
      if(contentarr['ih']>422){ h = 422}else{h = contentarr['ih']}
      // ctx.drawImage( contentarr['img'] ,(contentarr['iw']-750)/2 , (contentarr['ih']-h)/2,750,h, (750-contentarr['iw'])/2 , (h-contentarr['ih'])/2 , contentarr['iw'], contentarr['ih']);
      ctx.save()
      ctx.rect(0, 0, 750, h)
      ctx.clip()
      ctx.drawImage(contentarr['img'],(750-contentarr['iw'])/2 , (h-contentarr['ih'])/2 , contentarr['iw'], contentarr['ih'])
      ctx.restore();
      ctx.setFillStyle('#333')
      ctx.font = 'normal normal 54px PingFangSC';
      contentarr['titlearr'].forEach((item,index)=>{
        ctx.fillText(item.text, item.x, item.y+contentarr['repairHeight']);
        if(index == contentarr['titlearr'].length-1 ){texty = item.y + contentarr['repairHeight']}
      })
      ctx.setFillStyle('#aaa')
      ctx.font = 'normal normal 34px PingFangSC';
      if(contentarr['remarkarr']){
        contentarr['remarkarr'].forEach((item,index)=>{
          ctx.fillText(item.text, item.x, item.y+contentarr['repairHeight']*2);
          if(index == contentarr['remarkarr'].length-1 ){texty = item.y + contentarr['repairHeight']}
        })
      }
      if(remarktextarr){
        ctx.setFillStyle('#f6f6f6')
        this.drawRoundRect(ctx,35,texty+50+contentarr['repairHeight'],680,this.data.RemarkHeight,14)
        ctx.drawImage('../../../image/img/mark.png', 78, texty+89+contentarr['repairHeight'], 34, 28);
        ctx.setFillStyle('#333')
        ctx.font = 'normal normal 32px PingFangSC';
        remarktextarr.forEach(item=>{
          ctx.fillText(item.text,item.x,item.y + texty + 51 + contentarr['repairHeight']);
        })
      }
      //底部信息
      var y = contentarr['canvasHeight']
      ctx.save()
      ctx.setFillStyle('#fff');
      ctx.fillRect(0, y-270, 750, 290)
      ctx.setFillStyle('#666')
      ctx.fillRect(35, y-230, 140, 1)
      ctx.fillRect(575, y-230, 140, 1)
      ctx.setFillStyle('#000')
      ctx.font = 'normal normal 28px PingFangSC';
      ctx.fillText( text , 207 , y-215 );
      ctx.save()
      this.drawRoundRect(ctx, 40,y-155, 80, 80, 40);
      ctx.clip()
      ctx.drawImage(localpath, 40,y-155, 80, 80);
      ctx.restore()
      ctx.setFillStyle('#000')
      ctx.font = 'normal normal 34px PingFangSC';
      ctx.fillText(name, 133, y-118);
      ctx.setFillStyle('#aaa')
      ctx.font = 'normal normal 26px PingFangSC';
      ctx.fillText(company, 133, y-78);
      that.nameLeft(name, company, position,y-118,y-78)
      ctx.fillText(position, this.data.mleft, this.data.mTop);
      this.drawRoundRect(ctx, 595, y-174, 120, 120, 60,'#ffffff','#ffffff');
      ctx.clip()
    // ctx.drawImage(localIdPath, 595, 1160, 120, 120);
      ctx.drawImage(localIdPath, 595, y-174, 120, 120);
      // ctx.restore()
    }
    if(articlekey == 1){
      var texty = 0;
      ctx.setFillStyle('#fff');
      ctx.fillRect(0, 0, 750, 1334);
      var remarkHeight = 0;
      if(contentarr['remarkarr']){
        ctx.setFillStyle('#f6f6f6')
        this.drawRoundRect(ctx,35,25,680,this.data.RemarkHeight,14)
        ctx.drawImage('../../../image/img/mark.png', 78, texty+60, 34, 28);
        ctx.setFillStyle('#333')
        ctx.font = 'normal normal 32px PingFangSC';
        remarktextarr.forEach(item=>{
          ctx.fillText(item.text,item.x,item.y + 20);
        })
        remarkHeight = this.data.RemarkHeight+20
      }
      ctx.setFillStyle('#f0f1f6');
      this.drawRoundRect(ctx,25,25+remarkHeight,700,contentarr['contentHeight']+contentarr.content.length*10,14)
      contentarr.content.forEach(item=>{
        var itemWidth = 0;
        if(item.text[0].y == item.text[item.text.length-1].y){itemWidth = item.text[item.text.length-1].x + 50}
        else{itemWidth = 500}
        if(item.keys == "send-box"){
          ctx.save()
          this.drawRoundRect(ctx, 40, item.text[0].y+40+remarkHeight, 74, 74, 37);
          ctx.clip()
          ctx.drawImage(item.img, 40, item.text[0].y+40+remarkHeight, 74, 74);
          ctx.restore()
          this.drawRoundRectColor(ctx, 130,item.text[0].y+41+remarkHeight, itemWidth, item.text[item.text.length-1].y-item.text[0].y+80, 12,'#5da9ff','#5da9ff',false);
          ctx.setFillStyle('#fff')
          ctx.font = 'normal normal 32px PingFangSC';
          item.text.forEach(ite=>{
            ctx.fillText(ite.text, ite.x +125, ite.y+90+remarkHeight);
          })
        }else{
          this.drawRoundRectColor(ctx, 200,item.text[0].y+41+remarkHeight, itemWidth, item.text[item.text.length-1].y-item.text[0].y+80, 12,'#ffffff','#ffffff',false);
          ctx.setFillStyle('#333')
          ctx.font = 'normal normal 32px PingFangSC';
          item.text.forEach(ite=>{
            ctx.fillText(ite.text, ite.x +200, ite.y+90+remarkHeight);
          })
        }
      })
      //底部信息
      ctx.save()
      ctx.setFillStyle('#fff');
      ctx.setShadow(0, -30, 60, 'rgba(255,255,255,0.95)')
      ctx.fillRect(0, 1050, 750, 290)
      ctx.setFillStyle('#666')
      ctx.fillRect(35, 1103, 140, 1)
      ctx.fillRect(575, 1103, 140, 1)
      ctx.setFillStyle('#000')
      ctx.font = 'normal normal 28px PingFangSC';
      ctx.fillText(text, 207,1115);
      ctx.save()
      this.drawRoundRect(ctx, 40, 1180, 80, 80, 40);
      ctx.clip()
      ctx.drawImage(localpath, 40, 1180, 80, 80);
      ctx.restore()
      ctx.setFillStyle('#000')
      ctx.font = 'normal normal 34px PingFangSC';
      ctx.fillText(name, 133, 1215);
      ctx.setFillStyle('#aaa')
      ctx.font = 'normal normal 26px PingFangSC';
      that.nameLeft(name, company, position,1215,1255)
      ctx.fillText(position, this.data.mleft, this.data.mTop);
      ctx.fillText(company, 133, 1255);
      this.drawRoundRect(ctx, 595,1160, 120, 120, 0,'#ffffff','#ffffff');
      ctx.clip()
      ctx.drawImage(localIdPath, 595, 1160, 120, 120);
      ctx.restore()
    }
    if(articlekey == 2){
      var texty = 0;
      ctx.setFillStyle('#fff');
      ctx.fillRect(0, 0, 750, 1334)
      if(remarktextarr){
        ctx.setFillStyle('#f6f6f6')
        this.drawRoundRect(ctx,35,30,680,this.data.RemarkHeight,14)
        ctx.drawImage('../../../image/img/mark.png', 78, 68, 34, 28);
        ctx.setFillStyle('#333')
        ctx.font = 'normal normal 32px PingFangSC';
        remarktextarr.forEach(item=>{
          ctx.fillText(item.text,item.x,item.y+30);
        })
      }
      ctx.setFillStyle('#333')
      ctx.font = 'normal normal 42px PingFangSC';
      var titlearr = util.longTextEnter(contentarr['title'],650,this.data.RemarkHeight+124,42,1,60,true)
      titlearr.forEach((item,index)=>{
        ctx.fillText(item.text,item.x,item.y);
        if(index == titlearr.length-1){texty = item.y + 18}
      })
      var two = contentarr['content']
      for(var i=0; i<two.length;i++){
        if(texty > 1050) break;
        var one = two[i]
        if(one.keys == 'img'){
          var imgWidth;
          if(one.imgWidth>680){
            imgWidth = 680;
            one.imgHeight = one.imgHeight*(imgWidth/one.imgWidth)
          }else{
            imgWidth = one.imgWidth;
          }
          var x = (750 - imgWidth)/2
          ctx.drawImage( one.src , x , texty+50 , imgWidth, one.imgHeight);
          texty = texty + one.imgHeight+50
        }
        if(one.keys == 'txt'){
          var txtarr = util.longTextEnter(one.content,660,texty+102,32,1,58,false,35)
          ctx.setFillStyle('#333')
          ctx.font = 'normal normal 32px PingFangSC';
          txtarr.forEach((item,index)=>{
            ctx.fillText(item.text, item.x , item.y);
            if(index == txtarr.length-1){texty = item.y}
          })
        }
      }
      //底部信息
      ctx.save()
      ctx.setFillStyle('#fff');
      ctx.setShadow(0, -30, 60, 'rgba(255,255,255,0.95)')
      ctx.fillRect(0, 1050, 750, 290)
      ctx.setFillStyle('#666')
      ctx.fillRect(35, 1103, 140, 1)
      ctx.fillRect(575, 1103, 140, 1)
      ctx.setFillStyle('#000')
      ctx.font = 'normal normal 28px PingFangSC';
      ctx.fillText(text, 207,1115);
      ctx.save()
      this.drawRoundRect(ctx, 40, 1180, 80, 80, 40);
      ctx.clip()
      ctx.drawImage(localpath, 40, 1180, 80, 80);
      ctx.restore()
      ctx.setFillStyle('#000')
      ctx.font = 'normal normal 34px PingFangSC';
      ctx.fillText(name, 133, 1215);
      ctx.setFillStyle('#aaa')
      ctx.font = 'normal normal 26px PingFangSC';
      that.nameLeft(name, company, position,1215,1255)
      ctx.fillText(position, this.data.mleft, this.data.mTop);
      ctx.fillText(company, 133, 1255);
      this.drawRoundRect(ctx, 595,1160, 120, 120, 60,'#ffffff','#ffffff');
      ctx.clip()
      ctx.drawImage(localIdPath, 595, 1160, 120, 120);
      ctx.restore()
    }
    ctx.draw(false, function() {
      setTimeout(() => {
        wx.canvasToTempFilePath({
          canvasId: 'viewCanvas',
          success: function(res) {
            wx.hideLoading()
            var remarktext = that.data.textareavalue;
            if(remarktext == null){
              remarktext = that.data.comment;
            }
            var posterData = {
              remarktext:remarktext,
              title:toviewpagedata.title
            }
            wx.setStorageSync('jobs',posterData)
            wx.navigateTo({
              url: '../../poster/poster?img=' + res.tempFilePath + '&key=' + 'jobs'+"&id="+posterQRCodeid,
            })
          }
        }, this)
      }, 300);
    })
  },
  drawRoundRect(ctx, x, y, width, height, radius) {
    ctx.strokeStyle = "#f6f6f6";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
    ctx.lineTo(width - radius + x, y);
    ctx.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
    ctx.lineTo(width + x, height + y - radius);
    ctx.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2);
    ctx.lineTo(radius + x, height + y);
    ctx.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI);
    ctx.closePath();
    ctx.fill();
  },
  drawRoundRectColor(ctx, x, y, width, height, radius,strokeStyle,fillStyle,strokeFlag) {
    if(!strokeFlag){
      ctx.fillStyle = fillStyle ;
      ctx.beginPath();
      ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
      ctx.lineTo(width - radius + x, y);
      ctx.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
      ctx.lineTo(width + x, height + y - radius);
      ctx.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2);
      ctx.lineTo(radius + x, height + y);
      ctx.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI);
      ctx.closePath();
      ctx.fill();
      if(strokeStyle != fillStyle){
        this.drawRoundRect(ctx, x, y, width, height, radius,strokeStyle,fillStyle,true)
      }
    }else{
      ctx.strokeStyle = strokeStyle;
      ctx.beginPath();
      ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
      ctx.lineTo(width - radius + x, y);
      ctx.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
      ctx.lineTo(width + x, height + y - radius);
      ctx.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2);
      ctx.lineTo(radius + x, height + y);
      ctx.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI);
      ctx.closePath();
      ctx.stroke();
    }
  },
  getImageInfo(url, callback) { //  图片缓存本地的方法
    var arr = []
    url.forEach((item, index) => {
      wx.getImageInfo({ //  小程序获取图片信息API
        src: item,
        success: function(res) {
          arr[index] = res.path
          callback(arr);
        },
        fail(err) {}
      })
    })
  },
  //职位定位
  nameLeft(name, company, position,nametop,companytop,y) {
    var nameStrL = name.length
    var cStrL = company.length
    var pStrL = position.length + cStrL
    if (pStrL <= 16) {
      this.data.mleft = this.data.mLeft + 1 + (26 * cStrL)
      this.data.mTop = companytop
    } else {
      this.data.mleft = this.data.mLeft + 10 + (34 * nameStrL)
      this.data.mTop = nametop
    }
  },
  //解决图片异步问题
  getContentArr(contentarr,index,y){
    var that = this
    var item = contentarr[index];
    if(item.keys == 'img'){
      this.getImageInfo([item.src],function(arr){
        if(arr[0] != undefined){
          item.src = arr [0] ;
          contentarr[index] = item;
          if(index<contentarr.length)index++;
          y = y + item.imgHeight;
          if(y<1334 && index < contentarr.length){
            that.getContentArr(contentarr,index,y);
          }
        }
      })
    }
    if(item.keys == 'txt'){
      var one = util.longTextEnter(item.content,510,y,32,1,42,false,35)
      contentarr[index] = item;
      if(index<contentarr.length)index++;
      y = y + one[one.length-1].y;
      if(y<1334 && index < contentarr.length){
        that.getContentArr(contentarr,index,y);
      }
    }
  },
  //控制公司名称与职位的位置
  composeLength(data) {
    if(data.company == null)data.company = '';
    if(data.position == null)data.position = '';
    if((data.company == null || data.company == '') && (data.position == null || data.position == ''))data.company = '您身边的专属顾问';
    if ((data.company != null || data.company != '') && (data.position != null || data.position != '')) {
      let composeLength = data.company.length + data.position.length
      if (composeLength <= 16) {
        data.compose = true
      } else {
        data.compose = false
      }
    } else {
      data.compose = true
    }
  },
  toproductlist(e) {
    util.getFormId(e)
    util.setBackexecute(0,'product');
    var tj = '0'
    wx.setStorageSync('Tj',tj)
    wx.navigateTo({
      url: "../jobs/product/product"
    });
  },
  toproduct() {
    wx.setStorageSync("toproductreadpage", {
      data: this.data.product
    });
    wx.navigateTo({
      url: "../jobs/productread/productread"
    })
  },
  getProduct() {
    var rd = {
      funcNo: "1044",
      creator: app.globalData.managerData.id
    }
    network.postRequest(rd).then(function(r) {
      if (r.error_no == '0') {
        var l = r.data;
        var p = null;
        for (var i = 0; i < l.length; i++) {
          var one = l[i];
          if (one["private"] == '1') {
            continue;
          }
          if (one.tags) {
            one.tagsarr = one.tags.split(",");
          }
          if (one.keyp1 == null) {
            one.keyp1 = "";
          }
          if (one.keyp2 == null) {
            one.keyp2 = "";
          }
          if (one.keyp3 == null) {
            one.keyp3 = "";
          }
          p = one;
          break;
        }
        that.setData({
          product: p
        });
      }
    });
  }
})
