// pages/customer/customer.js
var api = require('../../../utils/api.js');
var util = require('../../../utils/util.js');
var asd =  require('./asd.js');
var network = require('../../../utils/network.js')
var app = getApp();
var record = null;
var moveExecuteTime = 0;
var that = null;
Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    tab2: {
      type: Boolean,
      value: ''
    }
  },
  data: {
    onload:false,
		topreddot:false,
    customer: [],
    idx: 0,
    curr:'0',
    current: '0',
    curren:'0',
    souList: [],
    hidden: true,
    souTrue:true,
    //index索引
    stockWords:'',
    latentWords:'',
    startTop: 0,
    startHeight: 0,
    indexShow:true,
    newIndex:'',
    val: '',
    ind: '',
    indexobj0:{key:0,index:0,val:'A0'},
    indexobj1:{key: 0, index: 0, val: 'A1' },
    set_scroll_into:false,
    guidance:false,//潜在用户任务
  },
  attached() {
    that = this;
    let h = util.systemTop() + 100
    let sh = util.systemHeight()-270-h
    let st = h+88
    let sch = util.systemHeight()-st-100
    this.setData({
      cH: h,
      sH: sh,
      sT:st,
      scH:sch
    })
  },
  methods: {
		onShow(){
			record = wx.getStorageSync("newCusRecord");
			if(!record){
				record = {singleDotList:[],topDotList:[],reloadFlag:false};
      }
      this.onReady();
    },
    onChange(event) {
      this.setData({
        curren : event.detail.index
      })
    },
    tapchange() {
			var bb = this.data.tab2
			record = wx.getStorageSync("newCusRecord");
			if(!record){
				record = {singleDotList:[],topDotList:[],reloadFlag:false};
			}
			if(record.reloadFlag){
				 bb = true;
				 record.reloadFlag = false;
			}
      if (bb) {
        // console.log("代码块2执行：", bb)
        this.onReady();
      }

      wx.getStorage({
				key:"course",
				success:function(r){
          var ad = r.data;
					if(!ad){
						return ;
          }
          if(!ad[8]){
            that.setData({
              guidance:true
            });
          }else{
            that.setData({
              guidance:false
            });
          }
        }
      });
    },
    //列表渲染
    indexListUp(data,key) {
      let stockName = new Array();
      const word = [];
      //不显示不存在的索引
      data = api.removeNullArr(data)
      data.forEach((item) => {
        var showName = item.name?item.name:item.nickname;
        let pinyin = asd.ConvertPinyin(showName)
        let firstName = pinyin.substring(0, 1).toUpperCase();
        if (firstName >= 'a' && firstName <= 'z' || firstName >= 'A' && firstName <= 'Z'){
          word.push(firstName)
        }else{
          firstName = '#'
          word.push(firstName)
        }
      })
      word.sort();
      let words = [...new Set(word)]
      words.forEach((item, index) => {
        stockName[index] = {
          key: item,
          list: []
        }
      })
      data.forEach((item) => {
				var showName = item.name?item.name:item.nickname;
        let pinyin = asd.ConvertPinyin(showName)
        let firstName = pinyin.substring(0, 1).toUpperCase();
        if (firstName >= 'a' && firstName <= 'z' || firstName >= 'A' && firstName <= 'Z') {
          word.push(firstName)
        } else {
          firstName = '#'
          word.push(firstName)
        }
        let index = words.indexOf(firstName);
        stockName[index].list.push({
					id:item.id,
          name: showName,
          key: firstName,
					reddot:item.reddot,
          portraitpath: item.portraitpath
        })
      })
      this.data.customer = stockName;
      if (key == '0'){
        this.setData({
          stock: this.data.customer,
          stockWords:words,
          indextrue: this.data.indexobj0.index,
          iteind: this.data.indexobj0.val
        })
        this.data.stockWords = words
      } else if (key == '1'){
        this.setData({
          latent: this.data.customer,
          latentWords: words,
          indextrue: this.data.indexobj0.index,
          iteind: this.data.indexobj0.val
        })
        this.data.latentWords = words
      }
      
    },
    //tabs标签点击事件
    tabBind(e){
      util.getFormId(e)
      let id = e.currentTarget.dataset.id
      this.setData({
        current:id
      })
    },
    //input事件
    inputentry(e) {
      this.data.souList = []
      this.souList(e)
    },
    //搜索List
    souList(e) {
      var that = this
      let entry = e.detail.value
      var arr = that.data.customers
      var arr1 = api.deepcopy(arr)
      arr1.forEach((item) => {
        let nameArr =item.name? item.name:item.nickname
				var reg = new RegExp(entry,'i'); 
				if (nameArr.match(reg) != null && entry.length != 0) {
        // if (nameArr.search(entry) != -1 && entry.length != 0) {
          that.data.souList.push(item)
        }
      })
      that.data.souList.forEach((item) => {
        let nameArr = item.name? item.name:item.nickname
        item.nickname = nameArr.replace(entry, "<span style='color:#ff8a01'>" + entry + "</span>")
      })
      that.setData({
        souList: that.data.souList
      })
      let soulength = that.data.souList.length
      let inputlength = entry.length
      if (soulength == 0 && inputlength > 0){
        this.setData({
          souTrue:false,
          souValue: entry,
        })
      } else if (inputlength == 0){
        this.setData({
          souTrue: true, 
        })
      }
    },
    //聚焦
    inputfocus(e) {
      this.setData({
        hidden: false
      })
    },
    //失去
    inputblur(e) {
      let entry = e.detail.value
      if (!entry) {
        this.setData({
          souList: []
        })
      }
    },
    //完成
    inputconfirm(e) {
    },
    //取消搜索
    cancelbind(e) {
      util.getFormId(e)
      var pages = getCurrentPages()
      this.setData({
        souTrue: true,
        hidden: true,
        inputValue:'',
        souValue:'',
      })
    },
    onReady: function () {
			if(record.topDotList.length!=0){
				if(this.data.current =='1'){
					record.topDotList = [];
				}
				this.setData({
					topreddot:true
				});
			}else{
				this.setData({
					topreddot:false
				});
			}
      //列表数据请求
			var  myid = app.globalData.managerData.id;
			var rdata = { managerid:myid, funcNo: '1001' };
      network.postRequest(rdata).then(res => {
        
        if(res.error_no == '0'){
					record.reloadFlag = false; // 但凡请求成功了。reload标志就置false
					wx.setStorageSync("newCusRecord",record);
					var resData = res.data;
					this.setData({
						customers: resData
					})
					var stock = new Array();
					var latent = new Array();
					resData.forEach(item => {
						if (item.newcus == "1") {
							stock.push(item)
						} else {
							var reddot = this.inArray(record.singleDotList,item.id);
							item.reddot = reddot;
							latent.push(item);
						}
					})
					this.setData({
						stock: stock,
						latent: latent
					})
					this.indexListUp(stock,0);
          this.indexListUp(latent, 1);
        }
        this.setData({
          onload:true
        });
      },rej =>{
        wx.showToast({
          title:rej,
          duration:3000
        });
        this.setData({
          onload:true
        });
			});
    },
    //标签--跳转
    nextTo(e){
      util.getFormId(e)
      wx.navigateTo({
        url: '/pages/clienta/usertag/usertag',
      })
    },
    toChat(e){
      var toData = e.currentTarget.dataset;
      wx.setStorageSync("tocusdatapage",toData);
      wx.navigateTo({url: '/pages/clienta/cusdata/cusdata'});
    },
    swiperUpData(e){
      let cId = e.detail.current
      this.data.current = cId;
      this.setData({
        curr:cId
      })
      if(cId == 0){
        this.setData({
          indexShow:true,
          indextrue: this.data.indexobj0.index,
          iteind: this.data.indexobj0.val
        })
      }else{
        this.setData({
          indexShow:false,
          indextrue: this.data.indexobj1.index,
          iteind: this.data.indexobj1.val
        })
      }
      
			if(this.data.current == '1'){
				record.topDotList = [];
        wx.setStorageSync("newCusRecord",record);
        this.setData({
          topreddot:false
        });
			}
    },inArray(arr,id){
			for(var i = 0 ; i< arr.length; i++){
				var one = arr[i];
				if(one == id)return true;
			}
			return false;
    },
    handlerToouchStart(event) {
      moveExecuteTime = 0;
      //点击改变index索引
      const className = '.i-index-fixed'
      const query = wx.createSelectorQuery().in(this)
      query.select(className).boundingClientRect(res => {
        this.data.startTop = res.top
        this.data.startHeight = res.height
      }).exec()
      var index = event.currentTarget.dataset.index
      if (this.data.current == 0) {
        var val = this.data.stockWords[index] + '0'
      } else {
        var val = this.data.latentWords[index] + '1'
      }
      this.data.ind = index;
      this.data.val = val;
      this.data.set_scroll_into = true;
      this.setData({
        indextrue: index,
        iteind: val
      })
    },
    handlerTouchMove(event) {
      //touch改变index索引
      
      const data = this.data;
      const touches = event.touches[0] || {}
      const pageY = touches.pageY;
      var now = new Date().getTime();
      if(now - moveExecuteTime >100){
        moveExecuteTime = now;
      }else{
        return ;
      }
      const rest = pageY - data.startTop;
      if(this.data.current == 0){
        var index = Math.ceil(rest / (data.startHeight/data.stockWords.length));
        index = (index >= data.stockWords.length) ? data.stockWords.length - 1 : index;
        if (index < 0) index = 0;
        var val = this.data.stockWords[index] + this.data.current
      }else{
        var index = Math.ceil(rest / (data.startHeight/data.latentWords.length));
        index = (index >= data.latentWords.length) ? data.latentWords.length - 1 : index;
        if (index < 0) index = 0;
        var val = this.data.latentWords[index] + this.data.current
      }
      this.data.ind = index;
      this.data.val = val
      this.data.set_scroll_into = true;
      if(this.data.indextrue == index  && this.data.iteind == val){
        return ;
      }
      this.setData({
        indextrue: index,
        iteind: val,
      })
    },
    handlerTouchEnd() {
      //记住状态，回来时恢复
      var keys = this.data.current
      var ind = this.data.ind
      var val = this.data.val
      if (keys == 0) {
        this.data.indexobj0 = {
          key: keys,
          index: ind,
          val: val
        }
      } else {
        this.data.indexobj1 = {
          key: keys,
          index: ind,
          val: val
        }
      }
    },
    //滑动时更新index索引
    scrollOn(e){
      if(this.data.set_scroll_into){
        this.data.set_scroll_into = false;
        return ;
      }
      var that = this
      if(this.data.current == '0'){
        var className = '.i-index-item-header-stock';
      }else{
        var className = '.i-index-item-header-latent';
      }
      const query = wx.createSelectorQuery().in(this);
      query.selectAll( className ).boundingClientRect((res)=>{
        for(var i=0;i<=res.length-1;i++){
          var one = res[i]
          if(one.top<185 && one.top>165){
            that.setData({
              indextrue:i
            })
            return false;
          }
        }
      }).exec()
    },toCourse(){
      this.setData({
        current:1,
        curr:1
      });  
    }
  }
})