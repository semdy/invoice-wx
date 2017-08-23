// 获取全局应用程序实例对象
const app = getApp();

import fetch from './fetch';
import {session} from './auth'

export const login = (username, password, openId) => {
  return new Promise((resolve, reject) => {
    fetch.post('auth/login', {username, password, machine: openId})
      .then(res => {
        if( res.success === false ){
          reject(res.message);
        } else {
          session.set(Object.assign({}, app.data.userInfo, res.token));
          resolve(res);
        }
      }, reject);
  });
};

export const logout = () => {
  return new Promise((resolve, reject) => {
    session.clear();
    resolve();
  });
};