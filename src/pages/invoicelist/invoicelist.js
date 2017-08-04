
import {showError, confirm} from '../../utils/util';
import fetch from '../../service/fetch';
import {session} from '../../service/auth';

// 获取全局应用程序实例对象
const app = getApp();
const RANGE_ARRAY = [
  {
    value: "1",
    name: "当天上传"
  },
  {
    value: "7",
    name: "7天上传"
  },
  {
    value: "30",
    name: "30天上传"
  },
  {
    value: "",
    name: "全部"
  },
  {
    value: "40",
    name: "当月开票"
  },
  {
    value: "50",
    name: "上月开票"
  }
];

const STATUS_ARRAY = [
  {
    value: "",
    name: "全部"
  },
  {
    value: "waiting",
    name: "查询中"
  },
  {
    value: "failed",
    name: "查询无结果"
  },
  {
    value: "noSales",
    name: "销货明细需补充"
  },
  {
    value: "needChange",
    name: "信息需更新"
  },
  {
    value: "noInvoice",
    name: "无法识别"
  },
  {
    value: "success",
    name: "已完成"
  }
];

const INVOICE_STATUS = {
  "success": {text: "已完成", color: "green"},
  "needChange": {text: "信息需更新", color: "#f90"},
  "noInvoice": {text: "无法识别", color: "#cc0000"},
  "failed": {text: "查询无结果", color: "#cc0000"},
  "noSales": {text: "销货明细需补充", color: "#f90"},
  "waiting": {text: "查询中", color: "#666"}
};

let keyIndex = 0;
function object2Array(obj){
  let arr = [];
  for(let i in obj){
    arr.push({
      date: i,
      key: keyIndex++,
      list: obj[i]
    });
  }

  return arr;
}

// 创建页面实例对象
Page({
  /**
   * 页面的初始数据
   */
  data: {
    rangeArray: RANGE_ARRAY.map(item => item.name),
    statusArray: STATUS_ARRAY.map(item => item.name),
    rangeIndex: 3,
    statusIndex: 0,
    scrollHeight: wx.getSystemInfoSync().windowHeight - 272, //242
    code: "",
    invoiceDay: "",
    invoiceStatus: "",
    data: [],
    total: 0,
    loaded: false
  },

  page: 1,
  dataMap: {},
  checkedItems: [],

  handleDel(){
    if( this.checkedItems.length === 0 )
      return showError("请至少选择一项");

    confirm("确定要删除吗?").then(() => {
      this.doDel(this.checkedItems);
    }, function(){});
  },

  doDel(items){
    let params = {
      invoice: items.map(item => item.invoice.id),
      number: items.map(item => item.number)
    };
    fetch.post("delInvoice", params).then(data => {
      if( data === true ) {
        this.handleQuery();
      } else {
        showError("删除失败: " + (data.message||""));
      }
    }, (errMsg) => {
      showError(errMsg);
    });
  },

  handleCheck(item, isChecked){
    item.checked = isChecked;
    if( isChecked && !this.checkedItems.some(checked => checked.number === item.number) ) {
      this.checkedItems.push(item);
    }
    this.checkedItems = this.checkedItems.filter(item => item.checked === true);
  },

  fetchData(invoiceNumber="", status="", day="", page=1){
    this.setData({
      loaded: false
    });

    let params = {
      customer: session.get().id,
      invoiceNumber,
      status,
      day,
      page
    };

    let data = this.dataMap;

    fetch.get("invoiceList", params).then(res => {
      res.invoiceList.forEach(item => {
        if( data[item.date] === undefined ){
          data[item.date] = [];
        }
        data[item.date].push(item);
      });

      this.setData({
        data: object2Array(data),
        total: res.sum,
        loaded: true
      });
    });
  },

  appendData(){
    if( !this.data.loaded ) return;
    this.fetchData(this.data.code, this.data.invoiceStatus, this.data.invoiceDay, ++this.page);
  },

  onIconClick(e){
    this.handleDel();
  },

  onCodeChange(e){
    this.setData({
      code: e.detail.value
    })
  },

  onRangePickerChange(e){
    this.setData({
      rangeIndex: e.detail.value,
      invoiceDay: RANGE_ARRAY[e.detail.value].value,
    });
  },

  onStatusPickerChange(e){
    this.setData({
      statusIndex: e.detail.value,
      invoiceStatus: STATUS_ARRAY[e.detail.value].value,
    });
  },

  onCheckboxChange(e){
    let isChecked = e.detail.value[0] !== undefined;
    let indexs = e.target.dataset.index.split("|");
    let item = this.data.data[indexs[0]][indexs[1]];

    item.checked = isChecked;

    if( isChecked && !this.checkedItems.some(checked => checked.number === item.number) ) {
      this.checkedItems.push(item);
    }
    this.checkedItems = this.checkedItems.filter(item => item.checked === true);
  },

  onCheckboxClick(e){

  },

  onRowTap(e){
    let indexs = e.currentTarget.dataset.index.split("|");
    //let item = this.data.data[indexs[0]][indexs[1]];
    let item = {
      invoice: {
        id: 232323
      },
      number: 43
    }
    wx.navigateTo({
      url: "/pages/detail/detail?id=" + item.invoice.id + "&number=" + item.number
    });
  },

  onEndReached(){
    this.appendData();
  },

  onButtonTap(){
    this.handleQuery();
  },

  handleQuery(){
    this.page = 1;
    this.dataMap = {};
    this.checkedItems = [];
    this.fetchData(this.data.code, this.data.invoiceStatus, this.data.invoiceDay, this.page);
  },

  onLoad (params) {
    this.setData({
      invoiceStatus: params.status || "",
      invoiceDay: params.day === undefined ? "" : String(params.day)
    });
    this.handleQuery();
  },

  onPullDownRefresh () {
    this.handleQuery();
  }
})
