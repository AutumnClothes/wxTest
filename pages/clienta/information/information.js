var util = require("../../../utils/util.js");
var network = require("../../../utils/network.js");
var config = require("../../../config.js");
var app = getApp();
var that = null;
var pageSize = 20;
var pageIndex = 1;
var nomoredata = false;
Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    tab1: {
      type: Boolean,
      value: ''
    },
    scrollHight: {
      type: Number,
      value: ''
    }
  },
  data: {
    dynamicunread: false,
    curr: 0,
    current: '0',
    attention: "",
    //聊天测试数据
    //动态-标签测试数据
    labelList: [{
        name: '最新动态',
      },
      {
        name: '存量客户'
      },
      {
        name: '潜在客户'
      }
    ],
    label: '最新动态',
    //动态-list测试数据
    dynamicList: [],
    dynamicItemIndex: 0,
    //引导数据
    startCourse: false,
    guidance1: false,
    guidance2: false,
    guidance3: false, //添加到我的小程序
    vipView: false, //开通会员
    freeText: "免费试用"
  },
  attached() {
    that = this;
    pageIndex = 1;
    nomoredata = false;
    let h = util.systemTop()
    let ch = util.systemTop() + 80
    let sh = util.systemHeight() - ch - 190
    let gh = util.gHeight()
    console.log(util.systemTop())
    this.setData({
      H: h,
      cH: ch,
      sH: sh,
      sHt: sh - 88,
      gH: gh
    })

  },
  methods: {
    addToMyMini() {
      this.setData({
        guidance3: true
      });
      setTimeout(() => {
        that.setData({
          guidance3: false
        });
      }, 3000);
    },
    tocusdatapage(e) {
      var tocusdatapage = {
        id: e.currentTarget.dataset.id
      }
      wx.setStorageSync("tocusdatapage", tocusdatapage);
      wx.navigateTo({
        url: "./cusdata/cusdata"
      })
    },
    tapchange() {
      var bb = this.data.tab1
      if (bb) {}
      wx.getStorage({
        key: "course",
        success: function(r) {
          var ad = r.data;
          if (!ad) {
            return;
          }
          if (ad[2]) {
            that.course2Text1(false);
          }
        }
      })
    },
    //tabs标签点击事件
    tabBind(e) {
      let id = e.target.dataset.id
      this.setData({
        current: id
      })
    },
    //table点击切样式
    labelBind(e) {
      util.getFormId(e)
      var itm = e.currentTarget.dataset
      var index = itm.index;
      this.data.dynamicItemIndex = index;
      if (index == 1 || index == 2) { // 初始化
        this.statistics(index);
      }
      if (index == 0) {
        this.waterfall();
      }
      this.setData({
        label: itm.labelItm
      })
    },
    statistics(index) {
      var flag = index == 1 ? '1' : '0'; // 0 新 1 老
      var timeline = null;
      var nowTime = new Date().getTime();
      timeline = wx.getStorageSync("statisticsTimeline" + flag);

      wx.setStorageSync("statisticsTimeline" + flag, nowTime);
      if (timeline == '') timeline = 0;
      if (timeline > nowTime - 60 * 60 * 1000)
        timeline = nowTime - 60 * 60 * 1000;
      var bl = wx.getStorageSync("behaviorList");
      var cusdataMap = wx.getStorageSync("cusdataMapForInfomation");
      var list = []; // 筛选出来的动态。
      var cusBehaviorMap = {};
      for (var i = 0; i < bl.length; i++) {
        var one = bl[i];
        var cusid = one["cusid"]; // {id:list};
        var cusdata = cusdataMap[cusid];
        /*
        if(cusdata){
        	one['nickname'] = cusdata["nickname"];
        	one["portrait"] = cusdata["portraitpath"];
        	one["name"] = cusdata["name"];
        }else{
        	one['nickname'] = "..."
        	one["portrait"] = ""
        	one["name"] = "..."
        } */
        var newcus = cusdata["newcus"]; // 0 新 1 老

        if (one.timeline < timeline) continue;
        if (newcus == flag) {
          if (cusBehaviorMap[cusid]) {
            cusBehaviorMap[cusid].push(one);
          } else {
            cusBehaviorMap[cusid] = [];
            cusBehaviorMap[cusid].push(one);
          }
        }
      }
      // console.log(cusBehaviorMap);
      //  {cusid,timeline, list};
      // 人  行为列表
      var showMap = [];
      for (var cusid in cusBehaviorMap) {
        var cusdata = cusdataMap[cusid];
        if (!cusdata) {
          cusdata = {
            nickname: "",
            portrait: "",
            name: ""
          }
        }
        var oneShow = {
          list: []
        };
        var cusList = cusBehaviorMap[cusid];
        var group = this.getGroup(cusList);
        var sum = 0;
        for (var type in group) { // 按行为类型   行为列表
          var grouplist = group[type];
          sum += grouplist.length;
          if (grouplist.length < 3) continue; // 一个类型的互动，三次以上。
          var lgtimeline = grouplist[grouplist.length - 1].timeline;
          var contenttype = util.contenttype(type);

          var ab = {
            cusid: cusid,
            portrait: cusdata["portraitpath"],
            nickname: cusdata["nickname"],
            name: cusdata["name"],
            content: grouplist.length + "次",
            contenttype: contenttype,
            timeline: lgtimeline
          };
          oneShow.list.push(ab);
        }
        if (sum >= 3) { // 总量大于三次。
          oneShow.list = oneShow.list.sort(function(a, b) {
            return b.timeline - a.timeline;
          });
          oneShow.list.unshift({
            cusid: cusid,
            portrait: cusdata["portraitpath"],
            nickname: cusdata["nickname"],
            name: cusdata["name"],
            content: sum + "次",
            contenttype: "与您互动",
            timeline: cusList[cusList.length - 1].timeline
          })
          oneShow["sum"] = sum;
          showMap.push(oneShow);
        }
      }
      showMap = showMap.sort(function(a, b) { // 人，按互动次数排序
        return b.sum - a.sum
      });
      // console.log(showMap);
      var finalArray = [];
      for (var i = 0; i < showMap.length; i++) { // 把所有的汇总行为放到一个数组里。
        var one = showMap[i];
        var oneList = one.list;
        finalArray.push(...oneList);
      }
      this.setData({
        dynamicList: finalArray
      })
    },
    getGroup(list) {
      var group = {
        rc: [],
        tc: [],
        rp: [],
        tp: [],
        rt: [],
        tt: [],
        rm: []
      };
      for (var i = 0; i < list.length; i++) {
        var one = list[i];
        var type = one.contenttype;
        if (type == 'fc') type = 'rc';
        group[type].push(one);
      }
      return group;
    },
    toChat(e) {
      var toData = e.currentTarget.dataset;
      if (toData.id) {
        wx.setStorageSync("torealchatpage", toData);
        wx.navigateTo({
          url: '/pages/clienta/realchat/realchat',
        })
      } else if (toData.groupid) {
        wx.setStorageSync("togroupchatpage", toData);
        wx.navigateTo({
          url: '/pages/clienta/group/group',
        })
      }
    },
    getcusDataMap(callback) {
      var getCusDataMap = {
        funcNo: '1001',
        managerid: app.globalData.managerData.id
      };
      var cusdataMap = {};
      network.postRequest(getCusDataMap).then(function(res) {
        if (res.error_no == '0') {
          var cuslist = res.data;
          for (var i = 0; i < cuslist.length; i++) {
            var one = cuslist[i];
            var cusid = one.id;
            cusdataMap[cusid] = one;
          }
          wx.setStorageSync("cusdataMapForInfomation", cusdataMap);
          callback();
        }
      })
    },
    getChatList() { // 渲染 聊天列表，动态列表，总结消息，统计消息
      // 确保 有cusdataMap 
      var that = this;
      var cusdataMap = wx.getStorageSync("cusdataMapForInfomation");
      if (!cusdataMap) {
        this.getcusDataMap(function() {
          that.getChatList();
        });
        return;
      }



      // 如果在 动态，behaviorUnread = 0;
      var list = [];
      var ml = wx.getStorageSync("MESSAGE");
      var gml = wx.getStorageSync("GROUPMESSAGE");
      console.log(ml);
      if (!ml && !gml) return;

      var thesblist = {}; // 保持 messagetype ==  g的，第一条
      if (ml) {
        for (var id in ml) {
          var oppo = ml[id];
          oppo["forindex"] = 's' + id;
          var cusdata = cusdataMap[id];
          if (cusdata) {
            oppo['nickname'] = cusdata["nickname"];
            oppo["portrait"] = cusdata["portraitpath"];
            oppo["name"] = cusdata["name"];
          } else {
            oppo['nickname'] = "..."
            oppo["portrait"] = ""
            oppo["name"] = "..."
          }

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
          oppo["timeline"] = lastRecord["timeline"];
          oppo["timestr"] = util.formatTimeLine(oppo["timeline"]);
          list.push(oppo);
        }
      }
      if (gml) {
        for (var id in gml) {
          var group = gml[id];
          group["forindex"] = 'g' + id;
          var recodes = wx.getStorageSync("groupMessageList" + id)
          // group["groupid"] = group["groupid"];
          group["nickname"] = group["groupname"] + "(" + group["groupcount"] + ")";
          group["portrait"] = config.groupHeadImgBase64;
          group["unread"] = 0;
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
      // console.log(list);
      list = list.sort(function(a, b) {
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
          one["content"] = util.getLastMessageShowContent(two);
          one["contenttype"] = two["contenttype"];
          one["timestr"] = util.formatTimeLine(two["timeline"]);
        }
      }
      list.forEach(item => {
        if (item.unread > 99) {
          item.unread = '99+'
        }
      })
      this.setData({
        list: list
      })
      this.waterfall(cusdataMap); //动态的瀑布流

      this.attention(); // 总结消息。
    },
    waterfall(cusdataMap) {
      var behaviorUnread = wx.getStorageSync("behaviorUnread");
      if (behaviorUnread !== 0 && behaviorUnread !== "") {
        this.setData({
          dynamicunread: true
        });
      } else {
        this.setData({
          dynamicunread: false
        });
      }
      if (this.data.dynamicItemIndex != '0') return

      if (!cusdataMap) { // 用于列表的头像昵称数据。
        cusdataMap = wx.getStorageSync("cusdataMapForInfomation");
      }
      var behaviorList = wx.getStorageSync("behaviorList");

      wx.getStorage({ // 引导文案
        key: "fromcreateToclienta",
        success: function(r) {
          if (r.data.once) { // 第一次进入clienta  到 动态
            that.setData({
              current: 1,
              curr: 1
            });
            wx.setStorage({
              key: "fromcreateToclienta",
              data: {
                once: false
              }
            });
          }
        }
      });
      wx.getStorage({
        key: "course",
        success: function(r) {
          var ad = r.data;
          if (!ad) {
            return;
          }
          var updateFlag = false;
          if (!ad[0]) {
            that.startCourseControl(true);
            ad[0] = true;
            updateFlag = true;
          }
          if (!ad[1]) {
            if (behaviorList.length == 0) {
              that.course1Text(true);
            } else {
              ad[1] = true;
              updateFlag = true;
              that.course1Text(false);
              that.course1Done(true, ad);
              that.course2Text1(true);

              // 历史遗留问题
              that.startCourseControl(false);
            }
          } else if (!ad[2]) {
            that.course2Text1(true);
          } else {
            that.course2Text1(false);
          }
          if (!ad[8]) {
            let sum = 0;
            for (var i in cusdataMap) {
              sum++;
            }
            if (sum >= 5) {
              ad[8] = true;
              updateFlag = true;
              var o = util.nextCourseText(ad);
              o.show = true;
              that.triggerEvent("toNextButton", o, null);
            }
          }
          if (updateFlag) {
            wx.setStorageSync("course", ad);
          }
        }
      })
      var end = 0;
      if (pageIndex * pageSize < behaviorList.length) {
        end = behaviorList.length - pageIndex * pageSize;
        nomoredata = false;
      }
      that.dynamicListShow(behaviorList, cusdataMap, end);
    },
    closestartCourseClick(e) {
      util.getFormId(e)
      this.startCourseControl(false);
    },
    startCourseControl(flag) { // 开始教程框
      if (flag) {
        this.setData({
          startCourse: true
        });
      } else {
        this.setData({
          startCourse: false
        });
      }
    },
    course1Text(flag) { // 教程一提示文本
      if (flag) {
        this.setData({
          guidance1: true
        });
      } else {
        this.setData({
          guidance1: false
        });
      }
    },
    course1Done(flag, ad) { // 教程一 完成卡
      if (flag) {
        var o = util.nextCourseText(ad);
        o.show = true;
        that.triggerEvent("toNextButton", o, null);
      } else {

      }
    },
    course2Text1(flag) { //教程2 第一段提示文本  动态头像下的点击头像，    给潜在客户发消息提示文本
      if (flag) {
        this.setData({
          guidance2: true
        });
      } else {
        this.setData({
          guidance2: false
        });
      }
    },
    toNextButton() { // 教程一完成之后的按钮的触发事件
      this.course1Done(false);
      this.course2Text1(true);
    },
    scrolltobottom(e) {
      if (nomoredata) return;
      pageIndex++;
      var behaviorList = wx.getStorageSync("behaviorList");
      var cusdataMap = wx.getStorageSync("cusdataMapForInfomation");
      if (pageIndex * pageSize < (behaviorList.length + pageSize)) {
        wx.showLoading({
          title: "loading",
          mask: true
        });
        var end = behaviorList.length - pageIndex * pageSize;
        if (end < 0) end = 0;
        that.dynamicListShow(behaviorList, cusdataMap, end);
        wx.hideLoading();
      } else {
        var dl = that.data.dynamicList;
        var firstBehavior = dl[dl.length - 1]; //目前展示的， 时间上的最早的一个，列表上的最后一个。
        var paramTimeLine = firstBehavior["timeline"];
        var moreRD = {
          funcNo: '1013',
          toid: app.globalData.managerData.id,
          timeline: paramTimeLine
        };
        network.postRequest(moreRD).then(function(r) {
          if (r.error_no == '0') {
            var d = r.data;
            if (d.length == 0) {
              nomoredata = true;
              var end = 0;
              that.dynamicListShow(behaviorList, cusdataMap, end);
            } else {
              var messageListFS = [];
              for (var j = 0; j < d.length; j++) { // 跟某一个人的聊天记录
                var oneMessage = d[j];
                messageListFS.push({
                  cusid: oneMessage["fromid"],
                  content: oneMessage['content'],
                  contenttype: oneMessage['contenttype'],
                  timeline: oneMessage["timeline"]
                });
              }
              behaviorList = messageListFS.concat(behaviorList);
              wx.setStorageSync("behaviorList", behaviorList);
              var end = 0;
              that.dynamicListShow(behaviorList, cusdataMap, end);
            }
          }
        });
      }
    },
    dynamicListShow(behaviorList, cusdataMap, end) {
      var behaviorUnread = wx.getStorageSync("behaviorUnread");
      var showList = [];
      for (var i = behaviorList.length - 1; i >= end; i--) { // 反向遍历
        var oppo = behaviorList[i];
        var cusdata = cusdataMap[oppo["cusid"]];
        oppo["forindex"] = oppo["cusid"] + oppo["timeline"];
        if (cusdata) {
          oppo['nickname'] = cusdata["nickname"];
          oppo["portrait"] = cusdata["portraitpath"];
          oppo["name"] = cusdata["name"];
        } else {
          oppo['nickname'] = "..."
          oppo["portrait"] = ""
          oppo["name"] = "..."
        }
        oppo["timestr"] = util.formatTimeLine(oppo["timeline"]);
        oppo["contenttype"] = util.contenttype(oppo.contenttype);

        if (behaviorUnread > 0) {
          behaviorUnread--;
          oppo["reddot"] = true;
        } else {
          oppo["reddot"] = false;
        }
        showList.push(oppo);
      }
      that.setData({
        dynamicList: showList
      });
    },
    attention() {
      var behaviorList = wx.getStorageSync("behaviorList");
      var attentionClickTime = wx.getStorageSync("attentionClickTime");
      if (!attentionClickTime) {
        attentionClickTime = 0;
      }
      var frc = [];
      var rt = [];
      var rp = [];
      for (var i = behaviorList.length - 1; i >= 0; i--) {
        var oppo = behaviorList[i];
        if (oppo.timeline < attentionClickTime) break;
        switch (oppo.contenttype) {
          case 'fc':
            frc.push(oppo);
            break;
          case 'rt':
            rt.push(oppo);
            break;
          case 'rp':
            rp.push(oppo);
            break;
        }
      }
      var rpsum = 0; {
        var map = {};
        for (var i = 0; i < rp.length; i++) {
          var cusid = rp[i].cusid;
          if (!map[cusid]) {
            map[cusid] = '1';
            rpsum++;
          }
        }
      }

      var rtsum = 0; {
        var map = {};
        for (var i = 0; i < rt.length; i++) {
          var cusid = rt[i].cusid;
          if (!map[cusid]) {
            map[cusid] = '1';
            rtsum++;
          }
        }
      }
      console.log(rpsum, rtsum);
      var attentionstr = null;
      if (frc.length >= 2) {
        attentionstr = '有' + frc.length + "位客户首次查看了您的名片";
      } else if (rtsum >= 10) {
        attentionstr = '有' + rtsum + "位客户阅读了您的文章";
      } else if (rpsum >= 10) {
        attentionstr = '有' + rpsum + "位客户查看了您的产品";
      }
      if (attentionstr == null) {
        this.setData({
          attention: ""
        });
      } else {
        this.setData({
          attention: attentionstr
        });
      }
    },
    noticeClick() {
      var that = this;
      wx.setStorageSync("attentionClickTime", new Date().getTime());
      this.setData({
        current: 1
      })
      setTimeout(function() {
        that.setData({
          attention: ""
        })
      }, 300);
    },
    //左右滑动
    swiperChange(e) {
      let cId = e.detail.current
      this.data.current = cId;
      this.setData({
        curr: cId
      })
      if (this.data.current == 1) {
        this.waterfall();
        // wx.setStorageSync("behaviorUnread",0);
        // this.triggerEvent('updateUnread', {}, {});
      } else {
        wx.setStorageSync("behaviorUnread", 0);
        this.triggerEvent('updateUnread', {}, {});
        this.setData({
          dynamicunread: false
        });
      }
    },
    toCourse() {
      this.setData({
        curr: 1,
        current: 1
      });
    },
    toVipPage(e) {
      util.getFormId(e)
      wx.navigateTo({
        url: "/pages/member/member"
      });
    },
    closeVipView() {
      that.setData({
        vipView: false
      });
    },
    freeMonth(e) {
      util.getFormId(e)
      var freeText = e.currentTarget.dataset.freetext;
      if (freeText == '已试用') return;
      var md = app.globalData.managerData;
      util.freeMonth(md.id, function(expire) {
        that.setData({
          vipView: false
        });
        md.expire = expire;
        md.state = "1";
        that.groupTo();
      });
    },
    groupTo(e) {
      var md = app.globalData.managerData;
      var now = new Date().getTime();
      if (!md.expire || now > md.expire) { // 过期，或者没有会员
        this.setData({
          vipView: true
        });
        if (md.state && md.state > '0') {
          this.setData({
            freeText: "已试用"
          });
        }
        return;
      }

      if (e)
        util.getFormId(e)
      wx.navigateTo({
        url: '/pages/clienta/information/groupcus/groupcus',
      })
    }
  }
})