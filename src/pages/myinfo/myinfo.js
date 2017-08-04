import fetch from '../../service/fetch';
import {session} from '../../service/auth';
import {showError} from '../../utils/util';

// 获取全局应用程序实例对象
// const app = getApp()

// 创建页面实例对象
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isEditing: false,
    data: {}
  },

  handleSubmit(){

    if( this.data.isEditing ) return;

    let {name, username, email, phone, password, passwordrm} = this.data.data;

    if(email.trim() !== "" && !/^.+@.+\..+$/.test(email)) return showError("邮箱不合法");
    if(phone.trim() !== "" && !/^1[345789]\d{9}$/.test(phone)) return showError("手机号不合法");
    if(password !== passwordrm) return showError("两次输入的密码不一致");

    this.setData({
      isEditing: true
    });

    fetch.post("upCustomer",
      {
        customer: session.get().id,
        name,
        username,
        phone,
        email,
        password
      })
      .then(data => {
        if( data.success ) {
          wx.showToast("修改成功");
        } else {
          showError("修改失败");
        }
        this.setData({
          isEditing: false
        });
      }, err => {
        this.setData({
          isEditing: false
        });
        showError("修改失败: " + err);
      });
  },

  onLoad () {
    fetch.get("getCustomer", {customer: session.get().id}).then(res => {
      if( res.success ){
        this.setData({
          data: Object.assign(res.data, {password: '', passwordrm: ''})
        });
      } else {
        showError("用户信息获取失败");
      }
    }, err => {

    });
  },

  onInputChange(e){
    let name = e.target.dataset.name;
    if( name ){
      this.data.data[name] = e.detail.value;
      this.setData({
        data: this.data.data
      });
    }
  }
})
