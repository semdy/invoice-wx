// 获取全局应用程序实例对象
// const app = getApp()
import {showError} from '../../utils/util';
import {login, session} from '../../service/auth';

// 创建页面实例对象
Page({
  /**
   * 页面的初始数据
   */
  data: {
    usernameVal: '',
    passwordVal: '',
    errMsg: '',
    isLogining: false
  },

  onUsernameInput(e){
    this.setData({
      usernameVal: e.detail.value
    });
  },

  onPasswordInput(e){
    this.setData({
      passwordVal: e.detail.value
    });
  },

  onButtonTap(){

    if( this.data.isLogining ) return;

    if( !this.data.usernameVal ) {
      return this.setData({
        errMsg: '请输入用户名'
      })
    }
    if( !this.data.passwordVal ) {
      return this.setData({
        errMsg: '请输入密码'
      })
    }

    this.setData({
      isLogining: true
    });

    login(this.data.usernameVal, this.data.passwordVal).then(userinfo => {
      wx.switchTab({
        url: '/pages/home/home'
      })
    }, errMsg => {
      showError(errMsg);
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
    // TODO: onLoad
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
