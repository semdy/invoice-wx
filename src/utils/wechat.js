import {appId, appSecret, version, from, ref} from '../config';
import {session} from '../service/auth';
import {serverUrl} from '../service/fetch';

function login () {
  return new Promise((resolve, reject) => {
    wx.login({
      success (res) {
        getOpenId(res.code).then(function(info){
          resolve(Object.assign({}, res, info))
        }, reject)
      },
      fail: reject
    })
  })
}

function getUserInfo (mergeData) {
  return new Promise((resolve, reject) => {
    wx.getUserInfo({success: function(res){
      if( typeof mergeData === 'object' ){
        Object.assign(res.userInfo, mergeData);
      }
      resolve(res);
    }, fail: reject })
  })
}

function getOpenId(code){
  return new Promise((resolve, reject) => {
    wx.request({
      url: `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`,
      data: {},
      method: 'GET',
      success: function (res) {
        if( res.data.errcode === undefined ) {
          let info = {};
          info.openid = res.data.openid;
          info.expires_in = Date.now() + res.data.expires_in;
          if( res.data.unionid ) {
            info.unionid = res.data.unionid;
          }
          resolve(info);
        } else {
          reject(res.data);
        }
      },
      fail: reject
    });
  });
}

function uploadFile(url, filePath, formParams, header){
    let params = Object.assign({
      from,
      ref
    }, formParams||{});

    let tokenParam = {};
    let sessionInfo = session.get();
    if(sessionInfo && sessionInfo.token){
      tokenParam = {
        token: sessionInfo.token
      };
    }

    wx.showLoading({
      mask: true,
      title: '上传中...'
    });

    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${serverUrl}api/${url}?version=${version}`,
        filePath: filePath,
        name: 'file',
        header: Object.assign(tokenParam, header || {
          'content-type': 'application/json'
        }),
        formData: params,
        success: function(res){
          if(res.statusCode === 200) {
            let data = JSON.parse(res.data);
            if( data.success ){
              resolve(data);
            } else {
              reject(data.message);
            }
          } else {
            reject(res.errMsg);
          }
        },
        fail: function(){
          reject('上传接口调用失败');
        },
        complete: function(){
          wx.hideLoading();
        }
      });
    });
}

module.exports = { login, getUserInfo, getOpenId, uploadFile }
