var util = require('../utils/util.js')
// var posterQRCodeid = null;
var mLeft = 133;
var mleft = '';
var mTop = '';
var RemarkHeight = 0;
var tagsarrLeft = '';
var id = null;
var data = null;
var comment = null;
var fromListData = null;
var list = null;
var posterQRCodeid = null;
var keys = ''

function posterBind(posterData) {
  var that = this;
  // var data = managerData
  id = posterData.id;
  data = posterData.managerData;
  comment = posterData.comment;
  fromListData = posterData.fromListData;
  list = posterData.list;
  posterQRCodeid = posterData.posterQRCodeid;
  if(posterData.keys){keys = true}else{keys = false}
  console.log('posterData',posterData)
  if (!data.name) data.name = '——';
  var name = data.name;
  var company = data.company, position = data.position;
  if (!data.company) company = '';
  if (!data.position) position = '';
  if ((data.company == '') && (data.position == '')) company = '您身边的专业顾问'
  var text = '长按识别小程序码阅读全文';
  var localpath = data.portraitpath;
  var localIdPath = 'https://www.willsfintech.cn:9004/commonqrcode/' + id + '.jpg' //二维码
  // localIdPath = 'https://www.willsfintech.cn:9004/commonqrcode/28.jpg';
  //文字内容信息
  // console.log('文章内容',{'文章封面':fromListData,'文章主体':list,'点评':comment})
  wx.showLoading({
    title: '正在生成中...',
  })
  //点评内容逻辑(可能没有点评)
  //点评框高度应该从页面获取
  var remarktext = comment;
  if (!remarktext) {
    RemarkHeight = 0;
    remarktext = '';
    var remarktextarr =''
  } else {
    remarktext = '  ' + remarktext;
    var remarktextarr = util.longTextEnter(remarktext, 590, 62, 32, 1, 50, false, 75)
    console.log(remarktextarr,remarktext)
    RemarkHeight = remarktextarr[remarktextarr.length - 1].y + 40
  }
  //封面逻辑1一个关键字，2俩个，3三个，4图文
  var coverkeys = fromListData.style
  var cover = {}
  var content = []
  var contentarr = []
  if (coverkeys == 1 || coverkeys == 2 || coverkeys == 3) {
    var y = RemarkHeight + 70
    cover.title = fromListData.title
  }
  if (coverkeys == 4) {
    var y = RemarkHeight + 70
    console.log('y', y,fromListData)
    //封面cover：图，标题，亮点，标签
    var img = fromListData.imgurl
    getImageInfo([img], function (arr) {     //
      // if (arr[0] != undefined) {
        cover.img = arr[0]
      // }
    })
    cover.title = fromListData.title
  }
  cover.profile = fromListData.profile
  if (fromListData.tagsarr) {
    cover.tagsarr = fromListData.tagsarr
    cover.coverkeys = coverkeys
    //标签：计算出第一个标签的X坐标点：（750-总长度）/2
    var tagl = 0;
    cover.tagsarr.forEach(item => {
      tagl = tagl + item.length * 24
    })
    tagsarrLeft = (750 - ((cover.tagsarr.length - 1) * 70 + tagl)) / 2
  }
  //关键词：分块，块内居中。算出画图所需所有数据组合成一个新的数组传入
  cover.keysarr = keysStylePosition(fromListData)
  contentarr['cover'] = cover
  //主体内容：有图，有文
  // getContentArr(list,0,480)
  // contentarr['content'] = newList
  var newList = [];
  getContentArr(list,0,480,newList)     //

  contentarr['content'] = newList

  getImageInfo([localpath, localIdPath], function (arr) { //
    if (arr[0] != undefined && arr[1] != undefined) {
      console.log('画图数据',arr[0], arr[1], name, position, company, text, remarktextarr, contentarr)
      draw(arr[0], arr[1], name, position, company, text, remarktextarr, contentarr)
    };
  });
}
//canvas需要调用的方法
function draw(localpath, localIdPath, name, position, company, text, remarktextarr, contentarr) {
  const ctx = wx.createCanvasContext('viewCanvas')
  var coverkeys = fromListData.style
  //画出外框
  ctx.setFillStyle('#fff');
  ctx.fillRect(0, 0, 750, 1334)
  var y = RemarkHeight
  //点评
  if (remarktextarr) {
    // ctx.setFillStyle('#f6f6f6')
    // drawRoundRect(ctx,35,30,680,y,14,'#f6f6f6','#f6f6f6')
    drawRoundRect(ctx, 35, 30, 680, y, 14, '#f6f6f6', '#f6f6f6')
    ctx.drawImage('../../../../image/img/mark.png', 85, 70, 34, 28);
    ctx.setFillStyle('#333')
    ctx.font = 'normal normal 32px PingFangSC';
    remarktextarr.forEach(item => {
      ctx.fillText(item.text, item.x, item.y + 35);
    })
    y = y + 20
  }
  //封面
  ctx.setFillStyle('#e5e5e5')
  if (remarktextarr) {
    ctx.fillRect(0, y + 40, 750, 1)
  }
  //
  if (coverkeys == 1 || coverkeys == 2 || coverkeys == 3) {
    ctx.setFillStyle('#333')
    ctx.font = 'normal normal 34px PingFangSC';
    var titlearr = util.longTextEnter(contentarr['cover'].title, 660, y + 120, 34, 1, 42, true)
    titlearr.forEach((item, index) => {
      ctx.fillText(item.text, item.x, item.y);
    })
    ctx.setFillStyle('#b2b2b2')
    ctx.font = 'normal normal 24px PingFangSC';
    var profilearr = util.longTextEnter(contentarr['cover'].profile, 660, y + 408, 24, 1, 36, true)
    profilearr.forEach((item, index) => {
      ctx.fillText(item.text, item.x, item.y);
      if (index == profilearr.length - 1) { ctx.fillRect(0, item.y + 45, 750, 1) };
    })
    //判断有无标签的情况
    if (contentarr['cover'].tagsarr) {
      if (coverkeys == 1) {
        ctx.setStrokeStyle('#fe685a')
        contentarr['cover'].tagsarr.forEach(item => {
          // ctx.strokeRect(tagsarrLeft-24, y + 295, item.length*24+48, 42)
          drawRoundRect(ctx, tagsarrLeft - 24, y + 295, item.length * 22 + 48, 42, 4, '#fe685a', '#ffffff')
          ctx.setFillStyle('#fe685a')
          ctx.font = 'normal normal 22px PingFangSC';
          ctx.fillText(item, tagsarrLeft, y + 325);
          tagsarrLeft = tagsarrLeft + item.length * 22 + 58
        })
        //关键词
        contentarr['cover'].keysarr.forEach(item => {
          ctx.setFillStyle('#ff523b')
          ctx.font = 'normal normal 64px PingFangSC';
          if (item.keyp) {
            ctx.fillText(item.key, item.x, y + 224);
            ctx.setFillStyle('#ababab')
            ctx.font = 'normal normal 24px PingFangSC';
            ctx.fillText(item.keyp, item.xp, y + 272);
          } else {
            ctx.fillText(item.key, item.x, y + 248);
          }
        })
      }
      if (coverkeys == 2) {
        contentarr['cover'].tagsarr.forEach(item => {
          drawRoundRect(ctx, tagsarrLeft - 24, y + 145, item.length * 22 + 48, 42, 4, '#fe685a', '#ffffff')
          ctx.setFillStyle('#fe685a')
          ctx.font = 'normal normal 22px PingFangSC';
          ctx.fillText(item, tagsarrLeft, y + 175);
          tagsarrLeft = tagsarrLeft + item.length * 22 + 58
        })
        //关键词
        ctx.setFillStyle('#ff523b')
        contentarr['cover'].keysarr.forEach(item => {
          if (item.keyp) {
            ctx.font = 'normal normal 64px PingFangSC';
            ctx.fillText(item.key, item.x, y + 286);
            ctx.setFillStyle('#ababab')
            ctx.font = 'normal normal 24px PingFangSC';
            ctx.fillText(item.keyp, item.xp, y + 332);
          } else {
            ctx.font = 'normal normal 64px PingFangSC';
            ctx.fillText(item.key, item.x, y + 308);
          }
          ctx.setFillStyle('#333')
        })
        ctx.setFillStyle('#e5e5e5')
        ctx.fillRect(375, y + 232, 1, 110)
      }
      if (coverkeys == 3) {
        contentarr['cover'].tagsarr.forEach(item => {
          // ctx.strokeRect(tagsarrLeft-24, y + 143, item.length*24+48, 42)
          drawRoundRect(ctx, tagsarrLeft - 24, y + 143, item.length * 22 + 48, 42, 4, '#fe685a', '#ffffff')
          ctx.setFillStyle('#fe685a')
          ctx.font = 'normal normal 22px PingFangSC';
          ctx.fillText(item, tagsarrLeft, y + 172);
          tagsarrLeft = tagsarrLeft + item.length * 22 + 58
        })
        //关键词
        ctx.setFillStyle('#ff523b')
        contentarr['cover'].keysarr.forEach(item => {
          if (item.keyp) {
            ctx.font = 'normal normal 44px PingFangSC';
            ctx.fillText(item.key, item.x, y + 286);
            ctx.setFillStyle('#ababab')
            ctx.font = 'normal normal 24px PingFangSC';
            ctx.fillText(item.keyp, item.xp, y + 330);
          } else {
            ctx.font = 'normal normal 44px PingFangSC';
            ctx.fillText(item.key, item.x, y + 307);
          }
          ctx.setFillStyle('#333')
        })
      }
    } else {
      if (coverkeys == 1) {
        //关键词
        contentarr['cover'].keysarr.forEach(item => {
          ctx.setFillStyle('#ff523b')
          ctx.font = 'normal normal 64px PingFangSC';
          if (item.keyp) {
            ctx.fillText(item.key, item.x, y + 262);
            ctx.setFillStyle('#ababab')
            ctx.font = 'normal normal 24px PingFangSC';
            ctx.fillText(item.keyp, item.xp, y + 310);
          } else {
            ctx.fillText(item.key, item.x, y + 286);
          }
        })
      }
      if (coverkeys == 2) {
        //关键词
        ctx.setFillStyle('#ff523b')
        contentarr['cover'].keysarr.forEach(item => {
          if (item.keyp) {
            ctx.font = 'normal normal 64px PingFangSC';
            ctx.fillText(item.key, item.x, y + 254);
            ctx.setFillStyle('#ababab')
            ctx.font = 'normal normal 24px PingFangSC';
            ctx.fillText(item.keyp, item.xp, y + 300);
          } else {
            ctx.font = 'normal normal 64px PingFangSC';
            ctx.fillText(item.key, item.x, y + 276);
          }
          ctx.setFillStyle('#333')
        })
        ctx.setFillStyle('#e5e5e5')
        ctx.fillRect(375, y + 200, 1, 110)
      }
      if (coverkeys == 3) {
        //关键词
        ctx.setFillStyle('#ff523b')
        contentarr['cover'].keysarr.forEach(item => {
          if (item.keyp) {
            ctx.font = 'normal normal 44px PingFangSC';
            ctx.fillText(item.key, item.x, y + 254);
            ctx.setFillStyle('#ababab')
            ctx.font = 'normal normal 24px PingFangSC';
            ctx.fillText(item.keyp, item.xp, y + 300);
          } else {
            ctx.font = 'normal normal 44px PingFangSC';
            ctx.fillText(item.key, item.x, y + 276);
          }
          ctx.setFillStyle('#333')
        })
      }
    }
  }
  if (coverkeys == 4) {
    ctx.setFillStyle('#333')
    ctx.font = 'normal normal 34px PingFangSC';
    var titlearr = util.longTextEnter(contentarr['cover'].title, 380, y + 115, 34, 1, 42, false, 35)
    titlearr.forEach((item, index) => {
      ctx.fillText(item.text, item.x, item.y);
    })
    ctx.setFillStyle('#333')
    ctx.font = 'normal normal 24px PingFangSC';
    var profilearr = util.longTextEnter(contentarr['cover'].profile, 380, y + 218, 24, 1, 36, false, 35)
    profilearr.forEach((item, index) => {
      ctx.fillText(item.text, item.x, item.y);
    })
    if (contentarr['cover'].tagsarr) {
      var tagsarr = contentarr['cover'].tagsarr
      var tagWidth = 0
      var x = 35
      tagsarr.forEach((item, index) => {
        drawRoundRect(ctx, x, y + 298, item.length * 22 + 22, 40, 4, '#fe685a', '#ffffff')
        ctx.setFillStyle('#fe685a')
        ctx.font = 'normal normal 22px PingFangSC';
        ctx.fillText(item, x + 11, y + 326);
        x = x + item.length * 22 + 32
      })
    }
    var drawImgPath = "";
    drawImgPath = contentarr['cover'].img;
    ctx.drawImage(drawImgPath, 457, y + 80, 258, 258);
    ctx.setFillStyle('#e5e5e5')
    ctx.fillRect(0, y + 380, 750, 1)
  }
  //正文
  if (contentarr['content']) {
    if (coverkeys == 4) {
      y = y + 380;
    } else {
      y = y + 480;
    }
    console.log(contentarr['content'])
    contentarr['content'].forEach(item => {
      if (item.keys == 'img') {
        var imgWidth;
        var imgHeight;
        if (item.imgWidth > 680) {
          imgWidth = 680;
          imgHeight = item.imgHeight * (imgWidth / item.imgWidth)
        } else {
          imgWidth = item.imgWidth;
          imgHeight = item.imgHeight;
        }
        var x = (750 - imgWidth) / 2
        ctx.drawImage(item.src, x, y + 64, imgWidth, imgHeight);
        y = y + imgHeight + 64
      }
      if (item.keys == 'txt') {
        var txtarr = util.longTextEnter(item.content, 660, y + 108, 32, 1, 58, false, 35)
        ctx.setFillStyle('#333')
        ctx.font = 'normal normal 32px PingFangSC';
        txtarr.forEach((item, index) => {
          ctx.fillText(item.text, item.x, item.y);
          if (index == txtarr.length - 1) { y = item.y }
        })
      }
    })
  }
  //底部
  ctx.save()
  ctx.setFillStyle('#fff')
  ctx.setShadow(0, -30, 60, 'rgba(255,255,255,0.95)');
  ctx.fillRect(0, 1050, 750, 290)
  ctx.setFillStyle('#666')
  ctx.fillRect(35, 1103, 140, 1)
  ctx.fillRect(575, 1103, 140, 1)
  ctx.setFillStyle('#000')
  ctx.font = 'normal normal 28px PingFangSC';
  ctx.fillText(text, 207, 1115);
  ctx.save()
  drawRoundRect(ctx, 40, 1180, 80, 80, 40, '#ffffff', '#ffffff');
  ctx.clip()
  ctx.drawImage(localpath, 40, 1180, 80, 80);
  ctx.restore()
  ctx.setFillStyle('#000')
  ctx.font = 'normal bold 34px PingFangSC';
  ctx.fillText(name, 133, 1215);
  ctx.setFillStyle('#aaa')
  ctx.font = 'normal normal 26px PingFangSC';
  nameLeft(name, company, position, 1215, 1255)
  ctx.fillText(position, mleft, mTop);
  ctx.fillText(company, 133, 1255);
  ctx.save()
  drawRoundRect(ctx, 595, 1160, 120, 120, 60, '#ffffff', '#ffffff');
  ctx.clip()
  ctx.drawImage(localIdPath, 595, 1160, 120, 120);
  // ctx.restore()
  ctx.draw(false, function () {
    setTimeout(() => {
      wx.canvasToTempFilePath({
        canvasId: 'viewCanvas',
        success: function (res) {
          console.log('1')
          wx.hideLoading()
          var remarktext = comment;
          var posterData = {
            remarktext: remarktext,
            title: contentarr['cover'].title
          }
          wx.setStorageSync('jobs', posterData)
          if(keys){
            wx.navigateTo({
              url: '../../../poster/poster?img=' + res.tempFilePath + '&key=' + 'jobs'+ '&keys=' + 'jobsb' + '&id='+posterQRCodeid,
            })
          }else{
            wx.navigateTo({
              url: '../../../poster/poster?img=' + res.tempFilePath + '&key=' + 'jobs' + '&id='+posterQRCodeid,
            })
          }
        }
      }, this)
    }, 500);
  })
}
function drawRoundRect(ctx, x, y, width, height, radius, strokeStyle, fillStyle, strokeFlag) {
  if (!strokeFlag) {
    ctx.fillStyle = fillStyle;
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
    if (strokeStyle != fillStyle) {
      drawRoundRect(ctx, x, y, width, height, radius, strokeStyle, fillStyle, true)
    }
  } else {
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
}
function getImageInfo(url, callback) {
  var arr = []
  url.forEach((item, index) => {
    wx.getImageInfo({
      src: item,
      success: function (res) {
        arr[index] = res.path
        callback(arr);
      },
      fail(err) { }
    })
  })
}
//职位定位
function nameLeft(name, company, position, nametop, companytop) {
  var nameStrL = name.length
  var cStrL = company.length
  var pStrL = position.length + cStrL
  if (pStrL <= 16) {
    mleft = mLeft + 1 + (26 * cStrL)
    mTop = companytop
  } else {
    mleft = mLeft + 10 + (34 * nameStrL)
    mTop = nametop
  }
}
//关键词：分块，块内居中。算出画图所需所有数据组合成一个新的数组传入
function keysStylePosition(obj) {
  var style = obj.style
  var arr = []
  if (style == 1) {
    arr = [{ key: obj.key1, keyp: obj.keyp1 }]
    arr[0].x = (750 - arr[0].key.length * 65) / 2
    arr[0].xp = (750 - arr[0].keyp.length * 25) / 2
  } else if (style == 2) {
    arr = [{ key: obj.key1, keyp: obj.keyp1 }, { key: obj.key2, keyp: obj.keyp2 }]
    arr[0].x = (340 - arr[0].key.length * 65) / 2 + 35
    arr[0].xp = (340 - arr[0].keyp.length * 25) / 2 + 35
    arr[1].x = ((340 - arr[1].key.length * 65) / 2) + 375
    arr[1].xp = ((340 - arr[1].keyp.length * 25) / 2) + 375
  } else if (style == 3) {
    arr = [{ key: obj.key1, keyp: obj.keyp1 }, { key: obj.key2, keyp: obj.keyp2 }, { key: obj.key3, keyp: obj.keyp3 }]
    arr[0].x = (226 - arr[0].key.length * 44) / 2 + 36
    arr[0].xp = (226 - arr[0].keyp.length * 25) / 2 + 36
    arr[1].x = (226 - arr[1].key.length * 44) / 2 + 263
    arr[1].xp = (226 - arr[1].keyp.length * 25) / 2 + 263
    arr[2].x = (226 - arr[2].key.length * 44) / 2 + 490
    arr[2].xp = (226 - arr[2].keyp.length * 25) / 2 + 490
  }
  return arr
}
//解决图片异步问题
function getContentArr(content,index,y,newList){
  var item = content[index];
  if(item.keys == 'img'){
    getImageInfo([item.src],function(arr){
      if(arr[0] != undefined){
        item.src = arr [0] ;
        newList[index] = item;
        if(index<content.length)index++;                                                            
        if(y<1334 && index < content.length){
          y = y + item.imgHeight     
          getContentArr(content,index,y,newList);
        }
      }
    })
  }
  if(item.keys == 'txt'){
    var one = util.longTextEnter(item.content,510,y,32,1,42,false,35)
    newList[index] = item;
    if(index<content.length)index++;
    if(y<1334 && index < content.length){
      y = y + one[one.length-1].y;
      getContentArr(content,index,y,newList);
    }
  }
}

module.exports = {posterBind:posterBind}