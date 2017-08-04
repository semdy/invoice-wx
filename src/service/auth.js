
import fetch from './fetch';

export const login = (username, password) => {
  return new Promise((resolve, reject) => {
    fetch.post('auth/login', {username, password})
      .then(res => {
        if( res.success === false ){
          reject(res.message);
        } else {
          session.set(res);
          resolve(res);
        }
    }, err => reject(err));
  });
};

export const logout = () => {
  return new Promise((resolve, reject) => {
      session.clear();
      resolve();
  });
};

export const session = {
  set(info){
    try {
      wx.setStorageSync('session', info);
    } catch (e) {
      console.error("storage save fail with key 'session'");
    }
  },
  get(){
    try {
      return wx.getStorageSync('session');
    } catch (e) {
      return null;
    }
  },
  clear(){
    try {
      wx.removeStorageSync('session');
    } catch (e) {
      console.error("storage remove fail with key 'session'");
    }
  }
};