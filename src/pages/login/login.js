// 获取全局应用程序实例对象
const app = getApp()
import {login} from '../../service/user';

// 创建页面实例对象
Page({
  data: {
    errMsg: '',
    isLogining: false
  },

  usernameVal: '',
  passwordVal: '',

  onUsernameInput(e){
    this.usernameVal = e.detail.value;
  },

  onPasswordInput(e){
    this.passwordVal = e.detail.value;
  },

  onButtonTap() {

    if (this.data.isLogining) return;

    if (!this.usernameVal) {
      return this.setData({
        errMsg: '请输入用户名'
      })
    }

    if (!this.passwordVal) {
      return this.setData({
        errMsg: '请输入密码'
      })
    }

    this.setData({
      isLogining: true
    });

    login(this.usernameVal, this.passwordVal, app.data.userInfo.openid).then((res) => {
      wx.switchTab({
        url: '/pages/home/home'
      });
    }, errMsg => {
      this.setData({
        isLogining: false
      });
    });
  },

  onFocus(){
    this.setData({
      errMsg: ''
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad () {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {
    // TODO: onReady
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
    // TODO: onShow
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide () {
    // TODO: onHide
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload () {
    // TODO: onUnload
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh () {
    // TODO: onPullDownRefresh
  }
})
