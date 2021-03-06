
import {showError, showToast, confirm} from '../../utils/util';
import fetch, {serverUrl} from '../../service/fetch';
import {session} from '../../service/auth';
import {uploadFile} from '../../utils/wechat';

// 获取全局应用程序实例对象
// const app = getApp()

Page({
  data: {
    imgHeight: wx.getSystemInfoSync().windowWidth,
    tabIndex: 0,
    picturePath: null,
    invoiceData: {},
    prodData: {
      docs: []
    },
    canUpdate: false,
    isPortrait: false,
    loaded: false
  },

  invoiceId: null,
  isInit: true,
  page: 1,

  handleDel(){
    confirm("确定要删除吗?").then(() => {
      this.doDel(this.invoiceId);
    }, function(){});
  },

  doDel(invoiceId){
    let params = {
      invoice: [invoiceId]
    };
    fetch.post("invoice-remove", params).then(data => {
      if( data.success ) {
        this.handleGoBack();
      } else {
        showError(data.message);
      }
    });

  },

  handleQuery(){
    this.page = 1;
    this.fetchData(this.invoiceId, this.page);
  },

  fetchData(invoiceId, page=1, isAppend=false){
    this.setData({
      loaded: false
    });

    fetch.get(`invoice/${invoiceId}/`, {limit: 10, page}).then(res => {
      if(res.success){
        if(isAppend){
          this._appendData(res.data);
        }
        else {
          this._setData(res.data);
        }
      } else {
        showError(res.message);
      }
    }).finally(() => {
      this.setData({
        loaded: true
      });
    });
  },

  _setData(data){
    let invoiceData = data.invoice;
    let prodData = data.sales;
    invoiceData['invoicePrice'] = invoiceData.total.total;
    let state = {
      invoiceData,
      prodData,
      picturePath: serverUrl + invoiceData.fp_path,
      canUpdate: ['codeMark','numberMark','issueDateMark','totalMark','correctMark'].some(key => invoiceData[key] == 1)
    };

    if(this.isInit){
      state.tabIndex = invoiceData.status === "noSales" ? 1 : 0; //无销货明细，跳转至销货明细tab页
    }

    if(invoiceData.fp_path){
      wx.getImageInfo({
        src: state.picturePath,
        success: (res) => {
          state.isPortrait = res.width < res.height;
          this.setData(state);
        }
      });
    } else {
      this.setData(state);
    }
  },

  _appendData(data){
    let docs = data.sales.docs;
    if(docs.length === 0) return showError("没有更多数据了");
    this.data.prodData.docs = this.data.prodData.docs.concat(docs);
    this.setData({
      prodData: this.data.prodData
    });
  },

  refresh(){
    this.handleQuery();
  },

  appendData(){
    if(!this.data.loaded) return;
    this.fetchData(this.invoiceId, ++this.page, true);
  },

  handleGoBack(){
    wx.navigateBack();
    //获得当前页面的栈
    let currPages = getCurrentPages();
    //获得列表页的实例
    let listPage = currPages[currPages.length - 2];
    if( listPage ){
      //刷新列表页
      listPage.refresh();
    }
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
      urls:[this.data.picturePath]
    });
  },

  onEndReached(){
    this.appendData();
  },

  handleUpdate(){
    if( !this.data.canUpdate ) return;

    let invoiceInfo = {};
    let data = this.data.invoiceData;

    [
      'invoiceCode',
      'invoiceNumber',
      'issueDate',
      'invoicePrice',
      'correctCode'
    ].forEach(key => {
        invoiceInfo[key] = data[key];
    });
    
    let params = Object.assign({
      type: data.type,
      isInvoice: data.isInvoice,
      invoiceId: this.invoiceId
    }, invoiceInfo);

    if(params.invoiceCode !== undefined && !/^\d{10}$/.test(params.invoiceCode)){
      return showError("请输入10位数字的发票代码");
    }
    else if(params.invoiceNumber !== undefined && !/^\d{8}$/.test(params.invoiceNumber)){
      return showError("请输入8位数字的发票号码");
    }
    else if(!params.issueDate){
      return showError("请选择开票日期");
    }
    else if(params.invoicePrice !== undefined && !/^\d+(\.)?\d*$/.test(params.invoicePrice)){
      return showError("请输入合法的税前金额");
    }
    else if(params.correctCode !== undefined && !/^\d{6}$/.test(params.correctCode)){
      return showError("请输入后6位的校验码");
    }

    fetch.post("invoice-update", params).then(res => {
      if (res.success) {
        this.refresh();
      } else {
        showError(res.message);
      }
    })
  },

  handleUploadSales(){
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: (res) => {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let imgFilePath = res.tempFilePaths[0];
        this.uploadSales(imgFilePath);
      },
      fail: () => {
        //showError("拍照调用失败");
      }
    })
  },

  uploadSales(filePath){
    let params = {
      invoice: this.invoiceId
    };
   
    return uploadFile('sales-upload', filePath, params).then(data =>{
      if(data.success){
        this.refresh();
        this.setData({
          tabIndex: 0
        });
      } else {
        showError(data.message);
      }
    }, err => {
      showError(err);
    });
  },

  onInvoiceChange(e){
    let key = e.currentTarget.dataset.key;
    if( key ){
      let obj = this.data.invoiceData;
      obj[key] = e.detail.value;
      this.setData({
        invoiceData: obj
      });
    }
  },

  onLoad (params) {
    this.invoiceId = params.id;
    this.refresh();
  },
  onPullDownRefresh () {
    this.refresh();
  }
})
