<template>
<!--内容区域-->
<div class="content-wrap">
  <el-tabs type="card" v-model="activeTab" class="custom-tab">
    <el-tab-pane label="数据追溯" name="file">
      <div class="content-box">
        <div class="search-box">
          <div class="left">
            <span>创建时间：</span>
            <el-date-picker v-model="dateValue" :picker-options="pickerOptions" type="daterange"
                            range-separator="至" start-placeholder="开始时间"
                            end-placeholder="结束时间" style="max-width:300px" v-on:change="onSelect()"></el-date-picker>

            <el-input v-model="searchValue.text" placeholder="请输入服务名称" maxlength="20"
                      prefix-icon="el-icon-search" style="max-width:260px">
              <el-button slot="append" type="success" v-on:click="getDataList()">搜索</el-button>
            </el-input>
            <p class="search-result" v-model="totalNum">找到相关搜索结果 {{totalNum}} 条</p>
          </div>
        </div>

        <el-row class="visual-box" type="flex" justify="space-between" v-if="'file' === activeTab">
          <el-col :span="12" class="table-wrap">
            <el-table :data="tableData" stripe border header-cell-class-name="th-style">
              <el-table-column label="服务名称" prop="name"></el-table-column>
              <el-table-column label="创建时间" prop="createTime" :formatter="getTime"></el-table-column>
              <el-table-column label="数据追溯" width="200">
                <template slot-scope="scope">
                <el-button type="text" @click="showTrace(scope.row)">查看</el-button>
                </template>
              </el-table-column>
            </el-table>
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
          </el-col>
          <el-col :span="12">
            <div class="databack-box">
              <p class="databack-name">
                <span v-if="currentName">{{`${currentName}-`}}</span>数据追溯图谱</p>
              <!--<data-box :form-data="dataTraceList"></data-box>-->
              <div id="trace-box" style="width: 100%; height: 489px;">
              </div>
            </div>
          </el-col>
          <!--<el-col :span="10">-->
          <!--<div style="padding-left: 10px">-->
          <!--<div class="img-wrap" style="border: 1px solid #EDF1F2; box-sizing: border-box">-->
          <!--<p style="padding-bottom: 20px; width: 100%; position: relative;  text-align: center; font-size: 14px; padding: 10px 0; background-color:#EDF1F2;"><span v-if="currentName">{{`${currentName}-`}}</span>数据追溯图谱</p>-->
          <!--<div id="trace-box" style="width: 100%; height: 440px;"></div>-->
          <!--</div>-->
          <!--</div>-->
          <!--</el-col>-->
        </el-row>
      </div>
    </el-tab-pane>
  </el-tabs>
</div>
</template>

<script>
import moment from "moment";
import request from "@/libs/request";
import Echart from "echarts";

export default {
  name: "DataBack",
  data() {
    return {
      webkitDep: { //关系图数据
        "type": "force",
        "nodes": [],
        "links": [],
      },
      selectDate: '',
      currentName: "",
      //日期选择范围在一个月内
      pickerOptions: {
        disabledDate: (time) => {
          return time.getTime() > Date.now()
        },
      },
      tableData: [], //列表数据
      activeTab: "file",
      dataTraceList: [
        "输入", "治理组件1", "治理组件2", "输出"
      ],
      dateValue: {},
      dateStartValue: "",
      dateEndValue: "",
      searchValue: {  //搜索值
        text: "",
      },
      totalNum: 0, //总记录数
      currentPage: 1, //当前页码,
      pageSize: 10, //每页显示多少条
    }
  },
  created() {
    this.getDataList();
  },
  methods: {
    showTrace(row) { //查看数据追溯详情
      this.currentName = row.name;
      this.getFlowData(row.id);
      console.log(row.id);
    },
    //服务列表
    async getDataList() {
      if (this.dateValue && this.dateValue.length) {
        this.dateStartValue = moment(this.dateValue[0]).format("YYYY-MM-DD");
        this.dateEndValue = moment(this.dateValue[1]).format("YYYY-MM-DD");
      } else {
        this.dateStartValue = "";
        this.dateEndValue = "";
      }
      let oData = await request.get("/processing-core/processing/getProcessingDetailListByPages?pageIndex=" + this.currentPage + "&pageSize=" + this.pageSize + "&name=" + this.searchValue.text + "&startCreateTime=" + this.dateStartValue + "&endCreateTime=" + this.dateEndValue, {}, {loading: true});
      if (oData.status === 200) {
        this.totalNum = oData.total;
        this.tableData = oData.data;
      } else if (oData.status === 204) {
        this.tableData = null;
        this.totalNum = 0;
      } else {
        this.$message.warning(oData.message);
      }
    },
    // 筛选数据列表
    async onSelect() {
      if (this.dateValue && this.dateValue.length) {
        this.dateStartValue = moment(this.dateValue[0]).format("YYYY-MM-DD");
        this.dateEndValue = moment(this.dateValue[1]).format("YYYY-MM-DD");
      } else {
        this.dateStartValue = "";
        this.dateEndValue = "";
      }
      this.currentPage = 1;
      this.pageSize = 10;
      let oData = await request.get("/processing-core/processing/getProcessingDetailListByPages?pageIndex=" + this.currentPage + "&pageSize=" + this.pageSize + "&name=" + this.searchValue.text + "&startCreateTime=" + this.dateStartValue + "&endCreateTime=" + this.dateEndValue, {}, {loading: true});
      if (oData.status === 200) {
        this.totalNum = oData.total;
        this.tableData = oData.data;
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
    },
    createTraceImg() {
      const myEchart = Echart.init(document.getElementById("trace-box"));
      console.log(this.webkitDep.nodes);
      let options = {
        series: [{
          type: 'graph',
          layout: 'force',
          animation: false,
          itemStyle: {
            color: "#4887ED"
          },
          lineStyle: {
            color: "red",
            width: 4
          },
          label: {
            normal: {
              show: true,
              position: 'right'
            }
          },
          draggable: true,
          data: this.webkitDep.nodes,
          top: "top",
          force: {
            edgeLength: 155,//连线的长度
            repulsion: 200  //子节点之间的间距
          },
          symbol: "circle",
          symbolSize: [40, 40],
          edges: this.webkitDep.links,
          edgeSymbol: ['none', 'arrow'],
          edgeSymbolSize: 15,
          degeLabel: {
            show: true
          }
        }]
      }
      myEchart.setOption(options);
    },
    async getFlowData(id) { //获取工作流数据
      try {
        let {data, status, message} = await request.get("/processing-core/processing/" + id, {}, {
          loading: true, loadingTitle: "获取工作流记录中……"
        });
        if (status === 200) {
          this.webkitDep.nodes = data.nodes.map((item, index) => {
            // let name = item.name.split("_");
            // return {
            //     id: item.id,
            //     name: name[0],
            //     idx: index
            // }

            // let name = item.description;
            var name;
            if (item.description == null || item.description == "" || item.description == undefined) {
              name = item.name;
            } else {
              name = item.description;
            }
            return {
              id: item.id,
              name: name,
              idx: index
            }
          });
          this.webkitDep.links = data.links.map((item, index) => {
            let source = this.webkitDep.nodes.find(node => {
              return node.id === item.sourceNodeId
            });
            let target = this.webkitDep.nodes.find(node => {
              return node.id === item.destinationNodeId
            });
            return {
              source: source.idx,
              target: target.idx
            }
          });
          console.log(this.webkitDep.nodes);
          if (this.webkitDep.nodes.length != 0) {
            this.createTraceImg();
          } else {
            this.webkitDep = { //关系图数据
              "type": "force",
              "nodes": [],
              "links": [],
            };
            this.createTraceImg();
          }
        } else {
          this.$message.warning(message);
        }
      } catch (e) {

      }
    }
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

  .databack-box {
    border: 1px solid #EBEEF5;
    margin-left: 20px;
    margin-top: 20px;
    overflow: hidden;
    /*max-height:530px;*/
  }

  .databack-name {
    background: #EDF1F2;
    color: #000;
    text-align: center;
    line-height: 40px;
    height: 40px;
    font-weight: bold;
  }

  .databack-content {
    text-align: center;
    padding: 30px;
    max-height: 430px;
    overflow: hidden;
    overflow-y: auto;

    i {
      color: #4887ED;
      font-size: 42px;
      display: block;
    }
  }

  .databack-component {
    margin: auto auto;
    width: 300px;
    font-size: 14px;
    height: 36px;
    line-height: 36px;
    color: white;
    background: #4887ED;
    border-radius: 50px;
  }
</style>
