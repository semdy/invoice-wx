// 获取全局应用程序实例对象
const app = getApp()

import PercentageCircle from '../../components/percentagecircle/index';
import fetch from '../../service/fetch';
import {session} from '../../service/auth';
import {showError,showToast} from '../../utils/util';

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
          type: 'needChange'
        },
        {
          icon: {
            name: 'list-add',
            mode: 'aspectFit',
            size: 'normal'
          },
          text: '销货明细需补充',
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
          type: 'failed'
        },
        {
          icon: {
            name: 'search-error',
            mode: 'aspectFit',
            size: 'normal'
          },
          text: '无法识别',
          value: 0,
          type: 'noInvoice'
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
      formula: this._getSuccessCount(data.statusTotal) + "/" + data.sum,
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
    let codes = data.split(",");
    return {
      QR: true,
      qrDetail: data,
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
        showToast(res.message);
        if (!goBack) {
          this.launchScaner();
        }
      } else {
        showError(res.message);
      }
    }, errMsg => {
      showError('上传失败, 请重试!');
    });
  },

  launchScaner(){
    wx.scanCode({
      success: (res) => {
        this.onBarcodeRead(res);
      },
      fail: () => {
        //showError('扫码调用失败');
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
            this.uploadBarCode(e.result, false)
          } else if (res.cancel) {
            this.uploadBarCode(e.result, true)
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

  onLoad () {
    if( !session.get() ){
      wx.redirectTo({
        url: '/pages/login/login'
      });
    } else {
      this.circle = new PercentageCircle('percentage-pie', {percent: 0, radius: 40, borderWidth: 12});
      this.handleRefresh();
    }
  },

  onReady () {
    wx.setNavigationBarTitle({
      title: `主页 - 欢迎 ${session.get().nickName}`
    });
  },

  onPullDownRefresh () {
    this.handleRefresh();
  }
})
