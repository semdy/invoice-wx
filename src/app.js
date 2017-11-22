/**
 * API module
 * @type {Object}
 * 用于将微信官方`API`封装为`Promise`方式
 * > 小程序支持以`CommonJS`规范组织代码结构
 */

import './pollyfill/index';
import './libs/wx-component/index';

import wechat from './utils/wechat';
import {showError} from './utils/util';
import {session} from './service/auth';

App({
  /**
   * Global shared
   * 可以定义任何成员，用于在整个应用中共享
   */
  data: {
    userInfo: null
  },

  /**
   * 获取用户信息
   * @return {Promise} 包含获取用户信息的`Promise`
   */
  getUserInfo () {
    return new Promise((resolve, reject) => {
      if (this.data.userInfo) return resolve(this.data.userInfo);

      wx.showLoading({
        mask: true,
        title: '请稍候...'
      });

      wechat.login()
        .then((res) => wechat.getUserInfo(res))
        .then(res => (this.data.userInfo = res.userInfo))
        .then(info => resolve(info))
        .catch(error => {
          error = JSON.stringify(error);
          reject(error);
          console.error('failed to get user info, error: ' + error);
          setTimeout(function () {
            showError('用户信息获取失败: ' + error);
          });
        })
        .finally(wx.hideLoading);
    })
  },

  /**
   * 生命周期函数--监听小程序初始化
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch () {
    //this.getUserInfo();
    if(!session.get()) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
    } 
  },
  /**
   * 生命周期函数--监听小程序显示
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow () {
    
  },
  /**
   * 生命周期函数--监听小程序隐藏
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide () {
    
  }
});
