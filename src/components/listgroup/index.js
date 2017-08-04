module.exports = {

  // 组件私有数据
  data: {
    items: []
  },

  // 组件属性
  // 可以预先定义默认值
  // 也可以外部传入覆盖默认值
  props: {

  },

  // 当组件被加载
  onLoad() {

  },
  // 当组件被卸载
  onUnload() {

  },

  onListItemClick(e){
    let filterType = e.currentTarget.dataset.type;
    if( filterType ){
      wx.navigateTo({
        url: '/pages/invoicelist/invoicelist?status=' + filterType + "&day=" + this.day
      })
    }
  },

  // 组件私有方法
  methods: {

  }
}