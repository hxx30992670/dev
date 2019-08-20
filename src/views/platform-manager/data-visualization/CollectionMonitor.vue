<template>
<!--内容区域-->
<div class="content-wrap">
  <el-tabs type="card" v-model="activeTab" class="custom-tab">
    <el-tab-pane label="采集监控" name="file">

      <div class="content-box">
        <div class="visual-top">
          <div class="status-ball-box3" v-if="statusBall>=60">
            <div class="status-ball-num">{{statusBall}}</div>
            <div class="status-ball-content">正常</div>
          </div>
          <div class="status-ball-box1" v-if="statusBall==0">
            <div class="status-ball-num">{{statusBall}}</div>
            <div class="status-ball-content">故障</div>
          </div>
          <div class="status-ball-box2" v-if="statusBall>=35 && statusBall<60">
            <div class="status-ball-num">{{statusBall}}</div>
            <div class="status-ball-content">异常</div>
          </div>

          <el-row class="visual-top-content" type="flex" justify="space-between">
            <el-col :span="4">
              <div class="grid-content grid-content-border">
                <div class="grid-content-name">数据存储量</div>
                <div class="grid-content-num">{{(this.syncStatus.dataSize/1048576).toFixed(2)}}<span> M</span></div>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="grid-content grid-content-border">
                <div class="grid-content-name">数据条数</div>
                <div class="grid-content-num">{{this.syncStatus.dataTotal}}<span> 条</span></div>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="grid-content grid-content-border">
                <div class="grid-content-name">运行时长</div>
                <div class="grid-content-num">{{Math.round(this.syncStatus.runTime/3600)}}<span> 小时</span></div>

              </div>
            </el-col>
            <el-col :span="4">
              <div class="grid-content grid-content-border">
                <div class="grid-content-name">同步过程</div>
                <div class="grid-content-num">{{this.syncStatus.syncTotal}}<span> 个</span></div>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="grid-content grid-content-border">
                <div class="grid-content-name">成功</div>
                <div class="grid-content-num">{{this.syncStatus.successTotal}}<span> 次</span></div>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="grid-content">
                <div class="grid-content-name">失败</div>
                <div class="grid-content-num">{{this.syncStatus.failedTotal}}<span> 次</span></div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>

        <el-row class="visual-box" type="flex" justify="space-between">
          <el-col :span="12">
            <div class="content-box" style="margin-right:10px">
            <div class="visual-name">CPU占用量</div>
            <div id="cpu-occupation-null" class="visual-null">暂 无 数 据</div>
            <div id="cpu-occupation" style="height:400px;display:none"></div>
            </div>
          </el-col>

          <el-col :span="12">
            <div class="content-box" style="margin-left:10px">
            <div class="visual-name">内存占用量</div>
            <div id="memory-occupation-null" class="visual-null">暂 无 数 据</div>
            <div id="memory-occupation" style="height:400px;display:none"></div>
            </div>
          </el-col>
        </el-row>

      <div class="content-box">
        <div class="visual-table-box">
          <div class="visual-name">同步监控列表</div>
          <div class="table-wrap">
            <el-table :data="tableData" stripe border header-cell-class-name="th-style">
              <el-table-column label="同步名称" prop="syncName" :show-overflow-tooltip="true"></el-table-column>
              <el-table-column label="创建人" prop="creator" width="140" :show-overflow-tooltip="true"></el-table-column>
              <el-table-column label="创建时间" prop="createTime" :formatter="getTime" width="180"></el-table-column>
              <el-table-column label="同步类型" prop="syncType" width="120">
                <template slot-scope="scope">
                <span v-if="scope.row.syncType === 1">全量同步</span>
                <span v-if="scope.row.syncType === 2">增量同步</span>
                </template>
              </el-table-column>
              <el-table-column label="同步策略" prop="syncStrategy" :show-overflow-tooltip="true"></el-table-column>
              <el-table-column label="运行次数" prop="dataNum" width="100"></el-table-column>
              <el-table-column label="同步数据条数" prop="syncNum" width="100">
                <template slot-scope="scope">
                <span v-if="scope.row.syncNum!=null">{{scope.row.syncNum}}</span>
                <span v-if="scope.row.syncNum === null">-</span>
                </template>
              </el-table-column>
              <el-table-column label="最后一次执行时间" prop="lastExecuteTime"
                               :formatter="getTime" width="180">
                <template slot-scope="scope">
                <span v-if="scope.row.lastExecuteTime!=null">{{scope.row.lastExecuteTime}}</span>
                <span v-if="scope.row.lastExecuteTime === null">-</span>
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
  </el-tabs>
</div>
</template>

<script>
import echarts from "echarts";
import moment from "moment";
import request from "@/libs/request";

export default {
  name: "CollectionMonitor",
  data() {
    return {
      activeTab: "file",
      cpuData: [],
      memoryData: [],
      syncStatus: {},
      // tableDataNum:[],
      tableData: [], //列表数据
      statusBall: 100,
      totalNum: 0, //总记录数
      currentPage: 1, //当前页码,
      pageSize: 10, //每页显示多少条
    }
  },
  created() {
    this.createStatusBall();
    this.createSyncStatus();
    this.getDataList();
  },
  mounted() {
    this.createCpuOccupation();
    this.createMemoryOccupation();
  },
  methods: {
    async createCpuOccupation() {
      let oData = await request.get("/monitoring/sync/getCpuStaus", {}, {loading: true});
      if (oData.status === 200) {
        this.cpuData = oData.data;
        this.cpuData.t = this.cpuData.map(item => moment(item.t).format("HH:mm"));
        this.cpuData.d = this.cpuData.map(item => item.d);
        $("#cpu-occupation-null").hide();
        $("#cpu-occupation").show();
      } else if (oData.status === 204) {
        // this.cpuData = null;
        $("#cpu-occupation-null").show();
        $("#cpu-occupation").hide();
      } else {
        this.$message.warning(oData.message);
      }
      ;
      var myChart = echarts.init(document.getElementById('cpu-occupation'));
      this.option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow"
          },
          formatter: '{b}<br /><span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:#27CA8E"></span>cpu占用量：{c}%'
        },
        grid: {
          top: 30,
          bottom: 30,
          right: 60,
          left: 60,
          calculable: true,
        },
        xAxis: {
          type: 'category',
          data: this.cpuData.t,
          // axisTick: {
          //     alignWithLabel: true
          // },
          // axisLabel: {
          //     interval:100
          // }
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          axisLabel: {
            show: true,
            interval: 'auto',
            formatter: '{value} %'
          },
          show: true,
          minInterval: 1
        },
        dataZoom: [{
          type: "inside",
          start: 0,
          end: 20
        }],
        series: [{
          color: "#27CA8E",
          data: this.cpuData.d,
          type: 'line',
          areaStyle: {
            color: 'rgb(240, 249, 235)'
          },
          // smooth: true,
        }]
      };
      myChart.setOption(this.option);
    },
    async createMemoryOccupation() {
      let oData = await request.get("/monitoring/sync/getMemoryStatus", {}, {loading: true});
      if (oData.status === 200) {
        this.memoryData = oData.data;
        this.memoryData.t = this.memoryData.map(item => moment(item.t).format("HH:mm"));
        this.memoryData.d = this.memoryData.map(item => item.d);
        $("#memory-occupation-null").hide();
        $("#memory-occupation").show();
      } else if (oData.status === 204) {
        // this.memoryData = null;
        $("#memory-occupation-null").show();
        $("#memory-occupation").hide();
      } else {
        this.$message.warning(oData.message);
      }
      ;
      var myChart = echarts.init(document.getElementById('memory-occupation'));
      this.option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow"
          },
          formatter: '{b}<br /><span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:#27CA8E"></span>内存占用量：{c}%'
        },
        grid: {
          top: 30,
          bottom: 30,
          right: 60,
          left: 60,
          calculable: true,
        },
        xAxis: {
          type: 'category',
          data: this.memoryData.t,
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          axisLabel: {
            show: true,
            interval: 'auto',
            formatter: '{value} %'
          },
          show: true,
          minInterval: 1
        },
        dataZoom: [{
          type: 'inside'
        }],
        series: [{
          color: "#27CA8E",
          data: this.memoryData.d,
          type: 'line',
          areaStyle: {
            color: 'rgb(240, 249, 235)'

          },
          // smooth: true,
          itemStyle: {},
        }]
      };
      myChart.setOption(this.option);
    },
    async createStatusBall() {
      let oData = await request.get("/monitoring/sync/getScore", {}, {loading: true});
      if (oData.status === 200) {
        this.statusBall = oData.data.socre;
      } else if (oData.status === 204) {
        this.statusBall = 100;
      } else {
        this.$message.warning(oData.message);
      }
    },
    async createSyncStatus() {
      let oData = await request.get("/monitoring/sync/getSyncStatus", {}, {loading: true});
      if (oData.status === 200) {
        this.syncStatus = oData.data;
      } else if (oData.status === 204) {
        this.syncStatus = {
          dataSize: 0,
          dataTotal: 0,
          runTime: 0,
          syncTotal: 0,
          successTotal: 0,
          failedTotal: 0
        };
      } else {
        this.$message.warning(oData.message);
      }
    },
    async getDataList() {
      var params = {
        "pageSize": this.pageSize,
        "pageIndex": this.currentPage
      };
      let oData = await request.post("/collection/info/DbSync/listSelect", params, {loading: true});
      if (oData.status === 200) {
        this.totalNum = oData.total;
        this.tableData = oData.data;
        for (var i = 0; i < this.tableData.length; i++) {
          // this.tableDataNum.push(this.tableData[i].stopSizes + this.tableData[i].successSizes + this.tableData[i].defeatedSizes);
          this.tableData[i].dataNum = this.tableData[i].stopSizes + this.tableData[i].successSizes + this.tableData[i].defeatedSizes
        }
      } else if (oData.status === 204) {
        this.tableData = null;
        this.totalNum = 0;
      } else {
        this.$message.warning(oData.message);
      }
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
    }
  }
}
</script>

<style scoped>
  /*可视化顶部*/
  .visual-top {
    height: 140px;
    /*margin-bottom: 40px*/
  }

  .status-ball-box1 {
    width: 136px;
    height: 136px;
    margin-right: 20px;
    float: left;
    border-radius: 50%;
    border: 2px solid #F56C86;
    color: #F56C86;
    background-color: #feedf0;
    text-align: center;
  }

  .status-ball-box2 {
    width: 136px;
    height: 136px;
    margin-right: 20px;
    float: left;
    border-radius: 50%;
    border: 2px solid #F4AB37;
    color: #F4AB37;
    background-color: #fef5e7;
    text-align: center;
  }

  .status-ball-box3 {
    width: 136px;
    height: 136px;
    margin-right: 20px;
    float: left;
    border-radius: 50%;
    border: 2px solid #27CA8E;
    color: #27CA8E;
    background-color: #e5f9f1;
    text-align: center;
  }

  .status-ball-num {
    font-size: 42px;
    margin-top: 28px
  }

  .status-ball-content {
    font-size: 16px;
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

  .visual-name {
    font-size: 16px;
    margin-top: 16px;
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

  /*.custom-tab>.el-tabs__content {*/
    /*background: none!important;*/
    /*box-shadow: none!important;*/
  /*}*/
</style>
