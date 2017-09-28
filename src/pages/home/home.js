// 获取全局应用程序实例对象
const app = getApp()

import PercentageCircle from '../../components/percentagecircle/index';
import fetch from '../../service/fetch';
import {session} from '../../service/auth';
import {showError,showToast} from '../../utils/util';
import {uploadFile} from '../../utils/wechat';

function parseDate(dateStr){
  dateStr = String(dateStr);
  return dateStr.substring(0, 4) + '-' + dateStr.substring(4, 6) + '-' + dateStr.substring(6, dateStr.length);
}

Page({
  data: {
    percent: 0,
    formula: '0/0',
    data: {
      sum: 0,
      statusTotal: []
    }
  },

  components: {
    buttongroup: {
      activeIndex: 0,
      items: [
        {
          text: '当天上传',
          value: '1'
        },
        {
          text: '7天上传',
          value: '7'
        },
        {
          text: '30天上传',
          value: '30'
        },
        {
          text: '全部',
          value: ''
        }]
    },
    listgroup: {
      items: [
        {
          icon: {
            name: 'find',
            mode: 'aspectFit',
            size: 'normal'
          },
          text: '查询中',
          value: 0,
          type: 'waiting'
        },
        {
          icon: {
            name: 'need-update',
            mode: 'aspectFit',
            size: 'normal'
          },
          text: '信息需更新',
          value: 0,
          type: 'invoiceChange'
        },
        {
          icon: {
            name: 'list-add',
            mode: 'aspectFit',
            size: 'normal'
          },
          text: '销货明细需更新',
          value: 0,
          type: 'noSales'
        },
        {
          icon: {
            name: 'file-error',
            mode: 'aspectFit',
            size: 'normal'
          },
          text: '查询无结果',
          value: 0,
          type: 'sevenFailed'
        },
        {
          icon: {
            name: 'search-error',
            mode: 'aspectFit',
            size: 'normal'
          },
          text: '无法识别',
          value: 0,
          type: 'failed'
        }]
    }
  },

  day: '1',
  circle: null,

  onButtonItemClick(e){
    let index = e.currentTarget.id;
    let buttongroup = this.childrens.buttongroup;
    this.handleType(buttongroup.data.items[index].value)
    buttongroup.setData({
      activeIndex: index
    });
  },

  handleType(value){
    this.day = value;
    this.fetchData(value);
  },

  _getValueByStatus(status){
    let result = this.data.data.statusTotal.find((item) => {
      return item.status === status;
    });

    return String(result ? (result.total || 0) : 0);
  },

  _getSuccessCount(data){
    let ret = data.find(item => item.status === 'success');
    if( !ret ) return 0;
    return ret.total;
  },

  fetchData(day){
    let params = {
    };
    if( day !== undefined ){
      params.day = day;
    }
    fetch.get('invoice-count', params).then(res => {
      if( res.success ) {
        this._setData(res.data);
      } else {
        showError(res.message);
      }
    });
  },

  _setData(data){
    this.setData({
      percent: data.sum === 0 ? 0 : this._getSuccessCount(data.statusTotal)/data.sum,
      formula: this._getSuccessCount(data.statusTotal) + '/' + data.sum,
      data: data
    });
    this.circle.percent = this.data.percent;
    let listgroup = this.childrens.listgroup;
    let items = listgroup.data.items;
    for(let i in items){
      items[i].value = this._getValueByStatus(items[i].type);
    }
    listgroup.setData({
      items: items
    });
  },

  handleRefresh(){
    this.fetchData(this.day);
  },

  _parseInvoiceInfo(data){
    let codes = data.split(',');
    return {
      QR: true,
      qrDetail: data,
      invoiceType: (codes[0] === '01' && codes[1] === '01') ? '增值' : (codes[0] === '01' && codes[1] === '04' ? '普通' : ''),
      invoiceCode: codes[2],
      invoiceNumber: codes[3],
      invoicePrice: codes[4],
      issueDate: parseDate(codes[5]),
      correctCode: codes[6]
    };
  },

  uploadBarCode(data, goBack) {
    fetch.post('invoice-upload', this._parseInvoiceInfo(data)).then(res => {
      if (res.success) {
        showToast(res.message||'上传成功');
        if (!goBack) {
          this.launchScaner();
        }
      } else {
        showError(res.message||'上传失败');
      }
    }, errMsg => {
      showError('上传失败, 请重试!');
    });
  },

  uploadBarCodeByPic(filePath, goBack){
    let params = {
      QR: false
    };
   
    return uploadFile('invoice-upload', filePath, params).then(res =>{
      if(res.success){
        showToast('上传成功');
        if (!goBack) {
          this.launchScaner();
        }
      } else {
        showError(res.message||'上传失败');
      }
    }, errMsg => {
      showError('上传失败, 请重试!');
    });
  },

  startCapture(){
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: (res) => {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let imgFilePath = res.tempFilePaths[0];
        wx.showModal({
          title: '提示',
          content: '您已成功拍照',
          confirmText: '下一张',
          cancelText: '完成',
          success: (res) => {
            if (res.confirm) {
              this.uploadBarCodeByPic(imgFilePath, false);
            } else if (res.cancel) {
              this.uploadBarCodeByPic(imgFilePath, true);
            }
          }
        });
      },
      fail: () => {
        //showError("拍照调用失败");
      }
    })
  },

  launchScaner(){
    let time = Date.now();
    wx.scanCode({
      success: (res) => {
        this.onBarcodeRead(res);
      },
      fail: () => {
        //if(Date.now() - time >= 6000){
          wx.showModal({
            title: '温馨提示',
            content: '二维码无法识别请拍摄发票',
            confirmText: '开始拍照',
            cancelText: '取消',
            success: (res) => {
              if (res.confirm) {
               this.startCapture();
              }
            }
          });
        //}
      }
    });
  },

  onBarcodeRead(e){
    let isExpectQrcode = true;
    let ret = e.result.split(',');
    if (ret.length < 3) {
      isExpectQrcode = false;
    }
    else if (ret[2].length < 10) {
      isExpectQrcode = false;
    }
    else if( ret[3].length < 8 ){
      isExpectQrcode = false;
    }

    if (isExpectQrcode) {
      wx.showModal({
        title: '二维码识别成功',
        content: e.result,
        confirmText: '下一张',
        cancelText: '完成',
        success: (res) => {
          if (res.confirm) {
            this.uploadBarCode(e.result, false);
          } else if (res.cancel) {
            this.uploadBarCode(e.result, true);
          }
        }
      });
    } else {
      wx.showModal({
        title: '二维码识别失败',
        content: '请扫描发票左上角二维码',
        confirmText: '重新扫描',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.launchScaner();
          }
        }
      });
    }
  },

  gotoInvoiceList(){
    wx.navigateTo({
      url: '/pages/invoicelist/invoicelist'
    })
  },

  onIconClick(){

  },

  onShow(){
    this.handleRefresh();
  },

  onLoad () {
    this.circle = new PercentageCircle('percentage-pie', {percent: 0, radius: 40, borderWidth: 12});
  },

  onReady () {
    wx.setNavigationBarTitle({
      title: `主页 - 欢迎 ${session.get().nickName||''}`
    });
  },

  onPullDownRefresh () {
    this.handleRefresh();
  }
})
