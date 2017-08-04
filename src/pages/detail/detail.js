
import {showError, confirm} from '../../utils/util';
import fetch, {serverUrl} from '../../service/fetch';
import {session} from '../../service/auth';

// 获取全局应用程序实例对象
// const app = getApp()

// 创建页面实例对象
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imgHeight: wx.getSystemInfoSync().windowWidth,
    tabIndex: 0,
    picturePath: "xxx",
    invoiceData: [],
    prodData: [],
    canUpdate: false
  },

  invoiceId: null,
  invoiceNumber: null,
  isInit: null,

  handleDel(){
    confirm("确定要删除吗?").then(() => {
      this.doDel(this.invoiceId, this.invoiceNumber);
    }, function(){});
  },

  doDel(invoice, number){
    fetch.post("delInvoice", {invoice: [invoice], number: [number]}).then(data => {
      if( data === true ) {
        this.handleGoBack();
      } else {
        showError("删除失败: " + (data.message||""));
      }
    }, (errMsg) => {
      showError(errMsg);
    });
  },

  fetchData(invoice, number){
    let params = {invoice, number};
    fetch.get("invoiceInfo", params).then(data => {
      this._setData(data);
    });
  },

  _setData(data){
    let invoiceData = [];
    let prodData = data.sales||[];
    let state = {
      invoiceData,
      prodData,
      picturePath: data.fp_path,
      canUpdate: invoiceData.some(item => item.editable === true) || false
    };

    if( this.isInit ){
      state.tabIndex = data.status === "noSales" ? 1 : 0; //无销货明细，跳转至销货明细tab页
    }

    this.setData(state);
  },

  refresh(){
    this.fetchData(this.invoiceId, this.invoiceNumber);
  },

  handleGoBack(){
    wx.navigateTo({
      url: "/pages/invoicelist/invoicelist"
    });
  },

  changeTab(e){
    let index = e.currentTarget.dataset.index;
    this.isInit = false;
    this.refresh();
    this.setData({
      tabIndex: index
    });
  },

  onSwiperChange(e){
    let current = e.detail.current;
    this.setData({
      tabIndex: current
    });
  },

  onThumbTap(){
    wx.previewImage({
      urls:[serverUrl + this.state.picturePath]
    });
  },

  handleUpdate(){
    if( !this.state.canUpdate ) return;

    let params = {
      customer: session.get().id,
      invoice: this.invoiceId,
      number: this.invoiceNumber
    };

    this.state.invoiceData.forEach(item => {
      if( item.editable ){
        params[item.paramKey] = this.refs.invoicetable.getValueByKey(item.key);
      }
    });

    if(params.invoicePrice !== undefined && !/^\d+(\.)?\d*$/.test(params.invoicePrice)){
      return showError("请输入合法的税前金额");
    }
    else if(params.invoiceCode !== undefined && !/^\d{10}$/.test(params.invoiceCode)){
      return showError("请输入10位数字的发票代码");
    }
    if(params.invoiceCode !== undefined && !/^\d{10}$/.test(params.invoiceCode)){
      return showError("请输入10位数字的发票代码");
    }
    else if(params.invoiceNumber !== undefined && !/^\d{8}$/.test(params.invoiceNumber)){
      return showError("请输入8位数字的发票号码");
    }
    else if(params.correctCode !== undefined && !/^\d{6}$/.test(params.correctCode)){
      return showError("请输入后6位的校验码");
    }

    fetch.post("upInvoice", params).then(data => {
      if (data === true) {
        wx.showToast({title: "更新成功"});
        this.refresh();
      } else {
        showError("更新失败");
      }
    }, errMsg => {
      showError("服务器响应出错");
    })
  },

  handleUploadSales(){
    let navParams = {
      mode: 'camera',
      uploadType: "uploadSales",
      invoiceInfo: {
        id: this.invoiceId,
        number: this.invoiceNumber
      }
    };
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: (res) => {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let imgFile = res.tempFiles[0];
        this.captureDone(imgFile);
      },
      fail: () => {
        //showError("拍照调用失败");
      }
    })
  },

  captureDone(file){
    this.uploadSales(file).then(() => {
      this.refresh();
      this.setData({
        tabIndex: 0
      });
    });
  },

  uploadSales(file){
    let params = {
      number: this.invoiceNumber,
      invoice: this.invoiceId,
      file: file
    };
    return fetch.post("uploadSales", params).then(data => {
      if( data === true ){
        wx.showToast("上传成功");
      } else {
        showError("上传失败 ");
      }

    }, errMsg => {
      showError("上传失败, 请重试!");
    });
  },

  onLoad (params) {
    this.invoiceId = params.id;
    this.invoiceNumber = params.number;
    this.refresh();
  },

  onPullDownRefresh () {
    this.refresh();
  }
})
