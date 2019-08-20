<template>
<!--内容区域-->
<div class="content-wrap">
  <el-tabs type="card" v-model="activeTab" @tab-remove="handleTabsEdit" class="custom-tab">
    <el-tab-pane label="服务监控" name="file">
      <div class="content-box">
        <div class="visual-top">
          <el-row class="visual-top-content" type="flex" justify="space-between">
            <el-col :span="6">
              <div class="grid-content grid-content-border">
                <div class="grid-content-name">服务总量</div>
                <div class="grid-content-num">{{this.syncStatus.serviceTotal}}<span> 个</span></div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="grid-content grid-content-border">
                <div class="grid-content-name">服务总调用次数</div>
                <div class="grid-content-num">{{this.syncStatus.callTotal}}<span> 次</span></div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="grid-content grid-content-border">
                <div class="grid-content-name">服务总调用量</div>
                <div class="grid-content-num">{{this.syncStatus.sizeTotal}}<span> B</span></div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="grid-content">
                <div class="grid-content-name">服务调用用户量</div>
                <div class="grid-content-num">{{this.syncStatus.userCount}}<span> 个</span></div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
        <el-row class="visual-box" type="flex" justify="space-between">
          <el-col :span="12">
            <div class="content-box" style="margin-right:10px">
            <div class="visual-name" style="width:220px">服务调用次数TOP10</div>
            <div id="service-calls10-null" class="visual-null">暂 无 数 据</div>
            <div id="service-calls10" style="height:400px;display:none"></div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="content-box" style="margin-left:10px">
            <div class="visual-name" style="width:220px">服务调用用户数量TOP10</div>
            <div id="service-users10-null" class="visual-null">暂 无 数 据</div>
            <div id="service-users10" style="height:400px;display:none"></div>
            </div>
          </el-col>
        </el-row>
      <div class="content-box">
        <div class="visual-table-box">
          <div class="visual-name">服务列表</div>
          <div class="search-box">
            <div class="left" style="margin-top:20px">
              <el-input v-model="searchValue.text" placeholder="请输入服务名" maxlength="20" prefix-icon="el-icon-search"
                        style="margin-left:0">
                <el-button slot="append" type="success" v-on:click="onSelect()">搜索</el-button>
              </el-input>
              <p class="search-result" v-model="totalNum">找到相关搜索结果 {{totalNum}} 条</p>
            </div>
          </div>
          <div class="table-wrap">
            <el-table :data="tableData" stripe border header-cell-class-name="th-style">
              <el-table-column label="服务名称" prop="servicename" :show-overflow-tooltip="true"></el-table-column>
              <el-table-column label="创建人" prop="createname" width="120"
                               :show-overflow-tooltip="true"></el-table-column>
              <el-table-column label="创建时间" prop="servicecreatetime" :formatter="getTime" width="180"></el-table-column>
              <el-table-column label="调用用户量" prop="usercount" width="120"></el-table-column>
              <el-table-column label="总调用次数" prop="calltotal" width="120"></el-table-column>
              <el-table-column label="总调用量" prop="sizetotal" width="120"></el-table-column>
              <!--<el-table-column label="最后调用时间" v-if="row.lasttime=='-'" :formatter="getTime">暂无</el-table-column>-->
              <el-table-column label="最后调用时间" prop="lasttime" :formatter="getTime" width="180">
                <template slot-scope="scope">
                <span v-if="scope.row.lasttime!='-'">{{scope.row.lasttime}}</span>
                <span v-if="scope.row.lasttime === '-'">-</span>
                </template>
              </el-table-column>
              <el-table-column label="调用记录" width="200">
                <template slot-scope="scope">
                <el-button @click="detailsBtn(scope.row),serviceMonitorDetails=true" type="text" size="small">详情
                </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <!--分页-->
          <div class="page-wrap">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-size="pageSize"
              layout="total,prev, pager, next, jumper"
              :total="totalNum">
            </el-pagination>
          </div>
        </div>
      </div>

    </el-tab-pane>
    <el-tab-pane v-for="item in tabList" :closable="true" :key="item.id" :label="item.label" :name="item.name">
      <div class="content-box">
        <el-row class="visual-box" type="flex" justify="space-between">
          <el-col :span="24">
            <div class="visual-select-box">
              <div class="visual-name" style="float:left">时间序列</div>
            </div>
            <div id="time-series-null" class="visual-null">暂 无 数 据</div>
            <div id="time-series" style="height:400px;display:none"></div>
          </el-col>
        </el-row>

        <div class="visual-table-box">
          <div class="search-box" style="margin-top: 40px">
            <div class="left">
              <span>调用发起时间：</span>
              <el-date-picker v-model="dateValue" :picker-options="pickerOptions" type="datetimerange"
                              range-separator="至" start-placeholder="开始时间"
                              end-placeholder="结束时间" style="margin-left:0px;max-width:220px"
                              v-on:change="onDetailsSelect()"></el-date-picker>
              <el-input v-model="searchDetailsValue.text" placeholder="请输入调用用户名" maxlength="20"
                        prefix-icon="el-icon-search">
                <el-button slot="append" type="success" v-on:click="onDetailsSelect()">搜索</el-button>
              </el-input>
              <p class="search-result" v-model="totalNum2">找到相关搜索结果 {{totalNum2}} 条</p>
            </div>
          </div>
          <div class="table-wrap">
            <el-table :data="detailsTableData" stripe border header-cell-class-name="th-style">
              <el-table-column label="服务名称" prop="servicename" :show-overflow-tooltip="true"></el-table-column>
              <el-table-column label="调用用户" prop="username" width="120" :show-overflow-tooltip="true"></el-table-column>
              <el-table-column label="请求方法" prop="requestMethod" :show-overflow-tooltip="true">
              </el-table-column>
              <el-table-column label="请求包大小(B)" prop="requestSize" width="120"></el-table-column>
              <el-table-column label="返回数据量(B)" prop="responseSize" width="120"></el-table-column>
              <el-table-column label="请求时长(ms)" prop="requestDuration" width="120"></el-table-column>
              <el-table-column label="转发时长(ms)" prop="forwardDuration" width="120"></el-table-column>
              <el-table-column label="返回状态码" prop="responseStatus" width="150">
              </el-table-column>

              <el-table-column label="调用发起时间" prop="requestTime" :formatter="getTime" width="180"></el-table-column>
            </el-table>
          </div>
          <!--分页-->
          <div class="page-wrap">
            <el-pagination
              @size-change="handleSizeChange2"
              @current-change="handleCurrentChange2"
              :current-page="currentPage2"
              :page-size="pageSize2"
              layout="total,prev, pager, next, jumper"
              :total="totalNum2">
            </el-pagination>
          </div>
        </div>
      </div>
    </el-tab-pane>
  </el-tabs>
</div>
</template>

<script>
import echarts from "echarts";
import moment from "moment";
import request from "@/libs/request";

export default {
  name: "InterfaceMonitor",
  data() {
    return {
      tabList: [],//详情
      selectDate: '',
      //日期选择范围在一个月内
      pickerOptions: {
        disabledDate: (time) => {
          return time.getTime() > Date.now()
        }
      },
      pickerOptions2: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      // value4: [new Date(2000, 10, 10, 10, 10), new Date(2000, 10, 11, 10, 10)],
      // value5: '',
      activeTab: "file",
      serviceCalls: [],
      serviceUsers: [],
      serviceDetails: [],
      serviceDetailsForm: {},
      syncStatus: {},
      tableData: [], //列表数据
      detailsTableData: [], //列表数据
      searchValue: {  //搜索值
        text: "",
      },
      searchDetailsValue: {  //搜索值
        text: "",
      },
      dateValue: '',
      serviceMonitorDetails: false,
      totalNum: 0, //总记录数
      currentPage: 1, //当前页码,
      pageSize: 10, //每页显示多少条
      totalNum2: 0, //总记录数
      currentPage2: 1, //当前页码,
      pageSize2: 10, //每页显示多少条
    }
  },
  created() {
    this.getDataList();
    this.createSyncStatus();
  },
  mounted() {
    this.createServiceCalls10();
    this.createServiceUsers10();
  },
  methods: {
    //服务调用次数top10
    async createServiceCalls10() {
      let oData = await request.get("/monitoring/selectMoniterLogOverview", {}, {loading: true});
      if (oData.status === 200) {
        this.serviceCalls = oData.data.callFrequency;
        this.serviceCalls.calltotal = this.serviceCalls.map(item => item.calltotal);
        this.serviceCalls.servicename = this.serviceCalls.map(item => item.servicename);
        $("#service-calls10-null").hide();
        $("#service-calls10").show();
      } else if (oData.status === 204) {
        // this.serviceCalls = null;
        $("#service-calls10-null").show();
        $("#service-calls10").hide();
      } else {
        this.$message.warning(oData.message);
      }
      ;
      var myChart = echarts.init(document.getElementById('service-calls10'));
      this.option = {
        color: ['#4887ED'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        grid: {
          top: 30,
          bottom: 30,
          right: 60,
          left: 60,
          calculable: true,
        },
        xAxis: [
          {
            type: 'category',
            data: this.serviceCalls.servicename,
            axisTick: {
              alignWithLabel: true
            },
            show: false
          }
        ],
        yAxis: [
          {
            type: 'value',
            minInterval: 1
          }
        ],
        series: [
          {
            name: '服务调用次数',
            type: 'bar',
            barWidth: '60%',
            data: this.serviceCalls.calltotal,
            itemStyle: {
              normal: {
                color: function (params) {
                  var colorList = ['#4887ED', 'rgb(179, 216, 255)', 'rgb(179, 216, 255)', 'rgb(179, 216, 255)', 'rgb(179, 216, 255)', 'rgb(179, 216, 255)', 'rgb(179, 216, 255)', 'rgb(179, 216, 255)', 'rgb(179, 216, 255)', 'rgb(179, 216, 255)'];
                  return colorList[params.dataIndex];
                }
              }
            },
          }
        ]
      };
      myChart.setOption(this.option);
    },

    //服务调用用户数量top10
    async createServiceUsers10() {
      let oData = await request.get("/monitoring/selectMoniterLogOverview", {}, {loading: true});
      if (oData.status === 200) {
        this.serviceUsers = oData.data.callUserNumber;
        this.serviceUsers.usercount = this.serviceUsers.map(item => item.usercount);
        this.serviceUsers.servicename = this.serviceUsers.map(item => item.servicename);
        $("#service-users10-null").hide();
        $("#service-users10").show();
      } else if (oData.status === 204) {
        // this.serviceUsers==null;
        $("#service-users10-null").show();
        $("#service-users10").hide();
      } else {
        this.$message.warning(oData.message);
      }
      ;
      var myChart = echarts.init(document.getElementById('service-users10'));
      this.option = {
        color: ['#4887ED'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        grid: {
          top: 30,
          bottom: 30,
          right: 60,
          left: 60,
          calculable: true,
        },
        xAxis: [
          {
            type: 'category',
            data: this.serviceUsers.servicename,
            axisTick: {
              alignWithLabel: true
            },
            show: false
          }
        ],
        yAxis: [
          {
            type: 'value',
            minInterval: 1
          }
        ],
        series: [
          {
            name: '服务调用用户数量',
            type: 'bar',
            barWidth: '60%',
            data: this.serviceUsers.usercount,
            itemStyle: {
              normal: {
                color: function (params) {
                  var colorList = ['#4887ED', 'rgb(179, 216, 255)', 'rgb(179, 216, 255)', 'rgb(179, 216, 255)', 'rgb(179, 216, 255)', 'rgb(179, 216, 255)', 'rgb(179, 216, 255)', 'rgb(179, 216, 255)', 'rgb(179, 216, 255)', 'rgb(179, 216, 255)'];
                  return colorList[params.dataIndex];
                }
              }
            },
          }
        ]
      };
      myChart.setOption(this.option);
    },

    //状态栏
    async createSyncStatus() {
      let oData = await request.get("/monitoring/selectMoniterLogOverview", {}, {loading: true});
      if (oData.status === 200) {
        this.syncStatus = oData.data;
      } else if (oData.status === 204) {
        this.syncStatus = {
          serviceTotal: 0,
          callTotal: 0,
          sizeTotal: 0,
          userCount: 0
        }
      } else {
        this.$message.warning(oData.message);
      }
    },

    //服务列表
    async getDataList() {
      var params = {
        "serviceName": this.searchValue.text,
        "pageSize": this.pageSize,
        "pageNum": this.currentPage
      };
      let oData = await request.post("/monitoring/selectMoniterLogList", params, {loading: true});
      if (oData.status === 200) {
        this.totalNum = oData.data.total;
        this.tableData = oData.data.list;
      } else if (oData.status === 204) {
        this.tableData = null;
        this.totalNum = 0;
      } else {
        this.$message.warning(oData.message);
      }
    },

    //服务列表筛选
    async onSelect() {
      var params = {
        "serviceName": this.searchValue.text,
        "pageSize": 10,
        "pageNum": 1
      };
      let oData = await request.post("/monitoring/selectMoniterLogList", params, {loading: true});
      if (oData.status === 200) {
        this.totalNum = oData.data.total;
        this.tableData = oData.data.list;
      } else if (oData.status === 204) {
        this.tableData = null;
        this.totalNum = 0;
      } else {
        this.$message.warning(oData.message);
      }
    },

    //服务详情列表
    async getDataDetailsList() {
      var params = {
        "serviceId": this.serviceDetailsForm.serviceid,
        "userName": this.searchDetailsValue.text,
        "pageSize": this.pageSize2,
        "pageNum": this.currentPage2
      };
      if (this.dateValue && this.dateValue.length) {
        params.startTime = this.dateValue[0];
        params.endTime = this.dateValue[1];
      } else {
        params.startTime = null;
        params.endTime = null;
      }
      let oData = await request.post("/monitoring/selectMoniterLogDetail", params, {loading: true});
      if (oData.status === 200) {
        this.totalNum2 = oData.data.total;
        this.detailsTableData = oData.data.list;
      } else if (oData.status === 204) {
        this.detailsTableData = null;
        this.totalNum2 = 0;
      } else {
        this.$message.warning(oData.message);
      }
    },

    //服务列表筛选
    async onDetailsSelect() {
      var params = {
        "serviceId": this.serviceDetailsForm.serviceid,
        "userName": this.searchDetailsValue.text,
        "pageSize": 10,
        "pageNum": 1
      };
      if (this.dateValue && this.dateValue.length) {
        params.startTime = this.dateValue[0];
        params.endTime = this.dateValue[1];
      } else {
        params.startTime = null;
        params.endTime = null;
      }
      let oData = await request.post("/monitoring/selectMoniterLogDetail", params, {loading: true});
      if (oData.status === 200) {
        this.totalNum2 = oData.data.total;
        this.detailsTableData = oData.data.list;
      } else if (oData.status === 204) {
        this.detailsTableData = null;
        this.totalNum2 = 0;
      } else {
        this.$message.warning(oData.message);
      }
    },

    //服务详情可视化
    async createServiceDetails() {
      var params = {
        "serviceId": this.serviceDetailsForm.serviceid
      };
      var data = [];
      let oData = await request.post("/monitoring/selectSequential", params, {loading: true});
      if (oData.status === 200) {
        this.serviceDetails = oData.data;
        // this.serviceDetails.calltotal = this.serviceDetails.map(item =>item.callTotal);
        // this.serviceDetails.day = this.serviceDetails.map(item => item.day);

        for (var i = 0; i < this.serviceDetails.length; i++) {
          data.push([moment(this.serviceDetails[i].day).format("YYYY-MM-DD HH:mm"), this.serviceDetails[i].count]);
          // this.tableData[i].dataNum = this.tableData[i].stopSizes + this.tableData[i].successSizes + this.tableData[i].defeatedSizes
        }
        $("#time-series-null").hide();
        $("#time-series").show();
      } else if (oData.status === 204) {
        // this.serviceDetails = null;
        $("#time-series-null").show();
        $("#time-series").hide();
      } else {
        this.$message.warning(oData.message);
      }
      ;

      var myChart = echarts.init(document.getElementById('time-series'));

      this.option = {
        color: ['#4887ED'],
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          },
          formatter:
            function (b) {
              var date = new Date(b[0].value[0]);
              var date2 = moment(new Date(new Date(date).getTime() - 1 * 60 * 60 * 1000)).format("YYYY-MM-DD HH:mm");
              return (date2 + " 到 " + b[0].value[0] + '<br />' + '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:#4887ED"></span>调用次数：' + b[0].value[1]);
            }
        },
        xAxis: {
          name: '时间',
          type: 'time',
          // type: 'category',
          maxInterval: 3600 * 24 * 1000,
          axisTick: {
            alignWithLabel: true
          },

          // axisLabel : {//坐标轴刻度标签的相关设置。
          //     interval:47,
          //     formatter : function(params){
          //         var newParamsName = "";// 最终拼接成的字符串
          //         var paramsNameNumber = params.length;// 实际标签的个数
          //         var provideNumber = 10;// 每行能显示的字的个数
          //         var rowNumber = Math.ceil(paramsNameNumber / provideNumber);// 换行的话，需要显示几行，向上取整
          //         // 条件等同于rowNumber>1
          //         if (paramsNameNumber > provideNumber) {
          //             for (var p = 0; p < rowNumber; p++) {
          //                 var tempStr = "";// 表示每一次截取的字符串
          //                 var start = p * provideNumber;// 开始截取的位置
          //                 var end = start + provideNumber;// 结束截取的位置
          //                 // 此处特殊处理最后一行的索引值
          //                 if (p == rowNumber - 1) {
          //                     // 最后一次不换行
          //                     tempStr = params.substring(start, paramsNameNumber);
          //                 } else {
          //                     // 每一次拼接字符串并换行
          //                     tempStr = params.substring(start, end) + "\n";
          //                 }
          //                 newParamsName += tempStr;// 最终拼成的字符串
          //             }
          //
          //         } else {
          //             // 将旧标签的值赋给新标签
          //             newParamsName = params;
          //         }
          //         //将最终的字符串返回
          //         return newParamsName
          //     }
          //
          // },

          // axisLabel: {
          //     interval:24
          // }
        },
        yAxis: {
          name: '调用次数(次)',
          type: 'value',
          splitLine: {
            show: false
          },
          axisLabel: {
            formatter: '{value}\n'
          },
          z: 10,
          minInterval: 1
        },
        grid: {
          top: 50,
          bottom: 50,
          right: 60,
          left: 60,
          calculable: true,
        },
        dataZoom: [{
          type: 'inside',
          start: 0,
        }],
        series: [{
          name: '调用次数',
          type: 'line',
          barWidth: '60%',
          data: data
        }]
      };
      myChart.setOption(this.option);
    },
    getTime(row, col, val) {
      if (val) {
        return moment(val).format("YYYY-MM-DD HH:mm:ss");
      } else {
        return moment().format("YYYY-MM-DD HH:mm:ss");
      }
    },
    handleSizeChange(val) { // 改变每页显示条数
      this.pageSize = val;
      this.getDataList();
    },
    handleCurrentChange(val) { //改变当前页
      this.currentPage = val;
      this.getDataList();
    },
    handleSizeChange2(val) { // 改变每页显示条数
      this.pageSize2 = val;
      this.getDataDetailsList();
    },
    handleCurrentChange2(val) { //改变当前页
      this.currentPage2 = val;
      this.getDataDetailsList();
    },
    //跳转到详情
    handleTabsEdit() {
      this.tabList = [];
      this.activeTab = "file";
    },
    detailsBtn(row) {
      this.serviceDetailsForm = row;
      this.tabList = [
        {
          label: "服务监控详情",
          name: "details",
        }
      ];
      this.activeTab = "details";
      setTimeout(() => {
        this.createServiceDetails();
      }, 200);
      this.getDataDetailsList();
    },
  }
}
</script>

<style scoped lang="less">
  .search-box {
    .el-input {
      margin-left: 20px;
      width: 300px;
    }

    .search-result {
      margin-left: 20px;
      color: #999;
    }
  }

  /*可视化顶部*/
  .visual-top {
    height: 140px;
    /*margin-bottom: 40px*/
  }

  .grid-content {
    height: 100px;
    margin: 20px auto;
    text-align: center;
    color: #4d4d4d;
    overflow: hidden;
  }

  .grid-content-border {
    border-right: 1px solid #E4E7ED;
  }

  .grid-content-name {
    font-size: 16px;
    margin-top: 16px;
    color: #999;
  }

  .grid-content-num {
    font-size: 22px;
    /*font-weight: bold;*/
    margin-top: 10px;
  }

  .grid-content-num span {
    font-size: 14px;
  }

  /*可视化*/
  .visual-box {
    /*margin-bottom: 40px;*/
  }

  .visual-select-box {
    overflow: hidden;

    el-select {

    }
  }

  .visual-name {
    font-size: 16px;
    color: #999;
    border: 1px solid #E4E7ED;
    text-align: center;
    width: 150px;
    line-height: 32px;
  }

  .visual-null {
    height: 400px;
    line-height: 400px;
    text-align: center;
    font-size: 22px;
    color: #ccc;
    /*display:none*/
  }
</style>
