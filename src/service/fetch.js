
import {showError} from '../utils/util';

export const serverUrl = "http://fpserver.qtdatas.com/";

let requestCount = 0;

let fetchApi = (url, params) => {
  return new Promise((resolve, reject) => {

    requestCount++;

    if (requestCount === 1) {
      wx.showLoading({
        title: '请稍候...'
      })
    }

    wx.request({
      url: serverUrl + "api/" + url,
      data: params.data,
      method: params.method || 'GET',
      header: params.header || {
        'content-type': 'application/json'
      },
      success: function(res) {
        resolve(res.data, res.statusCode, res.header);
      },
      fail: function(){
        reject('requrest fail');
        showError('与服务器连接失败');
      },
      complete: function () {
        if (--requestCount === 0) {
          wx.hideLoading();
          wx.stopPullDownRefresh();
        }
      }
    });
  });
};

fetchApi.post = (url, params = {}) => {
  return fetchApi(url, Object.assign({data: params}, {method: 'POST'}));
};

fetchApi.get = (url, params = {}) => {
  return fetchApi(url, Object.assign({data: params}, {method: 'GET'}));
};

export default fetchApi;
