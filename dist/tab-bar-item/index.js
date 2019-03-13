Component({
    externalClasses: ['i-class'],

    relations: {
        '../tab-bar/index': {
            type: 'parent'
        }
    },

    properties: {
        icon: {
            type: String,
            value: ''
        },
        currentIcon: {
            type: String,
            value: ''
        },
        img: {
            type: String,
            value: ''
        },
        currentImg: {
            type: String,
            value: ''
        },
        key: {
            type: String,
            value: ''
        },
        title: {
            type: String,
            value: ''
        },
        dot: {
            type: Boolean,
            value: false
        },
        count: {
            type: Number,
            value: 0
        }
    },
    data: {
        current: false,
        currentColor: ''
    },
    methods: {
        imgBind(e){
          let x = (40-e.detail.width)/2
          let y = (40 - e.detail.height)/2
          this.setData({
            xl:x,
            yt:y
          })
        },
        changeCurrent (current) {
            this.setData({ current });
        },
        changeCurrentColor (currentColor) {
            this.setData({ currentColor });
        },
        handleClickItem () {
            const parent = this.getRelationNodes('../tab-bar/index')[0];
            parent.emitEvent(this.data.key);
        }
    }
});
