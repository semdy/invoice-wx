module.exports = {

  // 组件私有数据
  data: {
    title: ""
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
  onClick: function(e){
    var comp = this.components.header;
    if(e.target.dataset.side === 'right'){
      comp.right.onClick && comp.right.onClick(e);
    } else {
      comp.left.onClick && comp.left.onClick(e);
    }
  },
  // 组件私有方法
  methods: {

  }
}