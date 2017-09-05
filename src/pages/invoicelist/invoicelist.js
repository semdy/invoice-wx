
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

function camelDate(dateNum){
  return dateNum.substring(0, 4) + "-" + dateNum.substring(4,6) + "-" + dateNum.substring(6);
};

function object2Array(obj){
  let arr = [];
  for(let i in obj){
    arr.push({
      date: camelDate(i),
      dateNumber: Number(i),
      list: obj[i]
    });
  }

  return arr.sort((a, b) => b.dateNumber - a.dateNumber);
}

// 创建页面实例对象
Page({
  data: {
    rangeArray: RANGE_ARRAY.map(item => item.name),
    statusArray: STATUS_ARRAY.map(item => item.name),
    rangeIndex: 3,
    statusIndex: 0,
    scrollHeight: wx.getSystemInfoSync().windowHeight - 202,
    code: "",
    invoiceDay: "",
    invoiceStatus: "",
    data: [],
    total: 0,
    loaded: false
  },

  page: 1,
  dataMap: {},
  dataArray: [],
  checkedItems: [],
  lineNumber: 0,

  handleDel(){
    if( this.checkedItems.length === 0 )
      return showError("请至少选择一项");

    confirm("确定要删除吗?").then(() => {
      this.doDel(this.checkedItems);
    }, function(){});
  },

  doDel(items){
    let params = {
      invoice: items.map(item => item.id)
    };
    fetch.post("invoice-remove", params).then(data => {
      if( data.success ) {
        this.handleQuery();
      } else {
        showError(data.message);
      }
    });
  },

  fetchData(invoiceNumber="", status="", day="", page=1){
    this.setData({
      loaded: false
    });

    let params = {
      invoiceNumber,
      status,
      day,
      page,
      limit: 10
    };

    fetch.get("invoice", params).then(res => {
      if( !res.success ){
        showError(res.message);
      } else {
        this.dataArray = this.dataArray.concat(res.data.docs);
        res.data.docs.forEach(item => {
          this.lineNumber++;
          if( this.dataMap[item.date] === undefined ){
            this.dataMap[item.date] = [];
          }
          item.statusText = INVOICE_STATUS[item.status].text;
          item.statusColor = INVOICE_STATUS[item.status].color;
          item.lineNumber = this.lineNumber;
          this.dataMap[item.date].push(item);
        });

        this.setData({
          data: object2Array(this.dataMap),
          total: res.data.total,
          loaded: true
        });
      }
    });
  },

  appendData(){
    if( !this.data.loaded ) return;
    this.fetchData(this.data.code, this.data.invoiceStatus, this.data.invoiceDay, ++this.page);
  },

  onIconClick(e){
    
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
    let index = e.currentTarget.dataset.index;
    let item = this.dataArray[index];

    item.checked = isChecked;

    if(isChecked && !this.checkedItems.some(checked => checked.id === item.id)) {
      this.checkedItems.push(item);
    }
    this.checkedItems = this.checkedItems.filter(item => item.checked === true);
  },

  onCheckboxClick(e){

  },

  onRowTap(e){
    let index = e.currentTarget.dataset.index;
    let item = this.dataArray[index];
    wx.navigateTo({
      url: "/pages/detail/detail?id=" + item.id
    });
  },

  onEndReached(){
    this.appendData();
  },

  onButtonTap(){
    this.handleQuery();
  },

  handleQuery(){
    this.lineNumber = 0;
    this.page = 1;
    this.dataMap = {};
    this.dataArray = [];
    this.checkedItems = [];
    this.fetchData(this.data.code, this.data.invoiceStatus, this.data.invoiceDay, this.page);
  },

  onLoad (params) {
    let invoiceStatus = params.status || "";
    let invoiceDay = params.day === undefined ? "" : String(params.day);
    let statusIndex = STATUS_ARRAY.indexOf(STATUS_ARRAY.find(stauts => stauts.value == invoiceStatus));
    let rangeIndex = RANGE_ARRAY.indexOf(RANGE_ARRAY.find(range => range.value == invoiceDay));
   
    this.setData({
      invoiceStatus,
      invoiceDay,
      statusIndex,
      rangeIndex
    });
    this.handleQuery();
  },

  refresh: function(){
    this.handleQuery();
  },

  onPullDownRefresh () {
    this.refresh();
  }
})
