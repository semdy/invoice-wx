// 获取全局应用程序实例对象
const app = getApp()

// 创建页面实例对象
Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: 'Index page',
    userInfo: {}
  },

  components: {
    header: {
      title: "主页",
      left: {
        side: 'left',
        name: "setting",
        mode: "aspectFit",
        size: "normal",
        onClick: function () {
          console.log(4)
        }
      },
      right: {
        side: "right",
        text: "欢迎"
      }
    },
    buttongroup: {
      activeIndex: 0,
      items: [
        {
          text: '当天上传'
        },
        {
          text: '7天上传'
        },
        {
          text: '30天上传'
        },
        {
          text: '全部'
        }]
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad () {
    console.log(' ---------- onLoad ----------')
    // console.dir(app.data)
    app.getUserInfo()
      .then(info => this.setData({ userInfo: info }))
      .catch(console.info)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {
    console.log(' ---------- onReady ----------')
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
    console.log(' ---------- onShow ----------')
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide () {
    console.log(' ---------- onHide ----------')
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload () {
    console.log(' ---------- onUnload ----------')
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh () {
    console.log(' ---------- onPullDownRefresh ----------')
  }
})
