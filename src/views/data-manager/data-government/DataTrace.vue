<template>
  <!--内容区域-->
  <div class="content-wrap">
    <el-tabs type="card" v-model="activeTab" class="custom-tab">
      <el-tab-pane label="数据追溯" name="file">
        <div class="content-box">
          <el-row>
            <el-col :span="16">
              <div class="search-box">
                <div class="left">
                  <el-input prefix-icon="el-icon-search" v-model="searchValue.name" style="width: 35%">
                    <el-button slot="append" icon="el-icon-search"></el-button>
                  </el-input>
                  <div class="date-box" style="margin-left: 10px;">
                    <span>创建时间：</span>
                    <el-date-picker
                        v-model="searchValue.dateRange"
                        type="daterange"
                        range-separator="至"
                        start-placeholder="开始时间"
                        end-placeholder="结束时间"
                        clearable
                        :picker-options="dateOption">
                    </el-date-picker>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
          <div class="table-wrap">
            <el-row>
              <el-col :span="14">
                <el-table :data="tableData" stripe border header-cell-class-name="th-style">
                  <el-table-column label="治理名称" prop="name"></el-table-column>
                  <el-table-column label="创建时间" prop="createTime" :formatter="getTime"></el-table-column>
                  <el-table-column label="数据追溯" width="100">
                    <template slot-scope="scope">
                      <el-button type="text" @click="showTrace(scope.row)">查看</el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <div class="page-wrap">
                  <el-pagination
                      @size-change="handleSizeChange"
                      @current-change="handleCurrentChange"
                      :current-page="currentPage"
                      :page-sizes="[10, 15, 20]"
                      :page-size="pageSize"
                      layout="total, sizes, prev, pager, next, jumper"
                      :total="total">
                  </el-pagination>
                </div>
              </el-col>
              <el-col :span="10">
                <div style="padding-left: 10px">
                  <div class="img-wrap" style="border: 1px solid #EDF1F2; box-sizing: border-box">
                    <p style="padding-bottom: 20px; width: 100%; position: relative;  text-align: center; font-size: 14px; padding: 10px 0; background-color:#EDF1F2;"><span v-if="currentName">{{`${currentName}-`}}</span>数据追溯图谱</p>
                    <div id="trace-box" style="width: 100%; height: 440px;"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
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
  name: "DataTrace",
  components: {
  },
  data(){
    return {
      webkitDep: { //关系图数据
        "type": "force",
        "nodes":[],
        "links": [],
      },
      selectDate: '',
      currentName: "",
      dateOption: {
        disabledDate: (time) => {
            return time.getTime() > Date.now()
        }
      },
      tableData: [],
      breadcrumbList: [],
      activeTab: "file",
      dataTraceList: [
        "输入", "治理组件1","治理组件2","输出"
      ],
      searchValue: {
        name: "",
        dateRange: ""
      },
      pageSize: 10,
      currentPage: 1,
      total: 0
    }
  },
  created() {
    this.getDataList();
  },
  methods: {
    showTrace(row){ //查看数据追溯详情
      this.currentName = row.name;
      this.getFlowData(row.id);
    },
    async getDataList(){ //获取列表数据
      try {
        let {data,message,status,total} = await request.get("/processing-core/processing/getProcessingListByPages", {
          pageIndex: this.currentPage,
          pageSize: this.pageSize
        }, {loading:true, loadingTitle: "获取治理列表数据……"});
        if(status === 200){
          this.total = total;
          this.tableData = data.map(item => {
            return {
              id: item.id,
              name: item.name,
              createTime: item.createTime,
              lastTime: item.updateTime,
              runNum: item.runTimes,
              statusString: item.statusString,
              timePolicy: item.syncCycle,
              status: item.status,
              allowApi: item.allowApi,
              allowDatabase: item.allowDatabase
            }
          })
        }else{
          this.$message.warning(message);
        }
      }catch (e) {

      }
    },
    handleSizeChange(val){ //每页显示多少条切换
      this.pageSize = val;
      this.getDataList();
    },
    handleCurrentChange(val){ //切换分页
      this.currentPage = val;
      this.getDataList();
    },
    getTime(row,col,val){ //格式化时间
      if(val){
        return moment(val).format("YYYY-MM-DD HH:mm:ss")
      }
    },
    createTraceImg(){
      const myEchart = Echart.init(document.getElementById("trace-box"));

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
              show:true,
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
          symbolSize: [40,40],
          edges: this.webkitDep.links,
          edgeSymbol:['none', 'arrow'],
          edgeSymbolSize: 15,
          degeLabel: {
            show: true
          }
        }]
      }
      myEchart.setOption(options);
    },
    async getFlowData(id){ //获取工作流数据
      try {
        let {data,status,message} = await request.get("/processing-core/processing/"+id, {}, {loading: true, loadingTitle: "获取工作流记录中……"});

        if(status === 200){
          this.webkitDep.nodes = data.nodes.map((item,index) => {
            // let name = item.name.split("_");
            // return {
            //   id: item.id,
            //   name: name[0],
            //   idx: index
            // }
              // let name = item.description;
              var name;
              if(item.description == null||item.description == ""||item.description == undefined){
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
          this.webkitDep.links = data.links.map((item,index) => {
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
          if(this.webkitDep.nodes.length){
            this.createTraceImg();
          }
        }else{
          this.$message.warning(message);
        }
      }catch (e) {

      }
    },
  }
}
</script>

<style scoped>

</style>
