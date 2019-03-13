var app = getApp()
// var network = require('../../utils/network.js')
var util = require('../../utils/util.js')

Component({
    externalClasses: ['i-class'],

    relations: {
        '../tab-bar-item/index': {
            type: 'child',
            linked () {
                this.changeCurrent();
            },
            linkChanged () {
                this.changeCurrent();
            },
            unlinked () {
                this.changeCurrent();
            }
        }
    },

    properties: {
        current: {
            type: String,
            value: '',
            observer: 'changeCurrent'
        },
        color: {
            type: String,
            value: ''
        },
        fixed: {
            type: Boolean,
            value: false
        }
    },

    data: {
        list: []
    },

    methods: {
        changeCurrent (val = this.data.current) {
            let items = this.getRelationNodes('../tab-bar-item/index');
            const len = items.length;

            if (len > 0) {
                const list = [];
                items.forEach(item => {
                    item.changeCurrent(item.data.key === val);
                    item.changeCurrentColor(this.data.color);
                    list.push({
                        key: item.data.key
                    });
                });
                this.setData({
                    list: list
                });
            }
        },
        emitEvent (key) {
            this.triggerEvent('change', { key });
        },
        handleClickItem (e) {
          if(app.globalData.managerData){
            util.getFormId(e);
          }else if(app.globalData.customerData){
            util.getFormIdB(e);
          }
          const key = e.currentTarget.dataset.key;
          this.emitEvent(key);
          if(key == 'jobs' || key == 'home'){
            wx.setNavigationBarColor({
              frontColor: '#ffffff',
              backgroundColor: '',
              animation: {
                duration: 400,
                timingFunc: 'easeIn'
              }
            })
          }else{
            wx.setNavigationBarColor({
              frontColor: '#000000',
              backgroundColor: '',
              animation: {
                duration: 400,
                timingFunc: 'easeIn'
              }
            })
          }
        }
    }
});
