module.exports = {

  // 组件私有数据
  data: {

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

  onButtonItemClick(e){
    this.childrens.buttongroup.setData({
      activeIndex: e.currentTarget.id
    });
  },

  // 组件私有方法
  methods: {

  }
}