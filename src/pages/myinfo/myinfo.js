import fetch from '../../service/fetch';
import {session} from '../../service/auth';
import {showError,showToast} from '../../utils/util';

// 获取全局应用程序实例对象
// const app = getApp()

Page({
  data: {
    isEditing: false,
    data: {}
  },

  onButtonTap(){

    if( this.data.isEditing ) return;

    let {name, username, email, phone, password, passwordrm} = this.data.data;

    if(email.trim() !== "" && !/^.+@.+\..+$/.test(email)) return showError("邮箱不合法");
    if(phone.trim() !== "" && !/^1[345789]\d{9}$/.test(phone)) return showError("手机号不合法");
    if(password !== passwordrm) return showError("两次输入的密码不一致");

    this.setData({
      isEditing: true
    });

    fetch.post("user",
      {
        userId: session.get().user.id,
        name,
        username,
        phone,
        email,
        password
      })
      .then(res => {
        if( res.success ) {
          showToast(res.message);
        } else {
          showError(res.message);
        }
        this.setData({
          isEditing: false
        });
      });
  },

  onLoad () {
    fetch.get(`user/${session.get().user.id}`).then(res => {
      if( res.success ){
        this.setData({
          data: Object.assign(res.data, {password: '', passwordrm: ''})
        });
      } else {
        showError(res.message);
      }
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
