<template>
  <div>
    <el-tabs type="card" v-model="activeTab" @tab-remove="handleTabsEdit" class="custom-tab">
      <el-tab-pane :closable="false" label="治理列表" name="file">
        <div class="content-box">
          <div class="search-box">
            <div class="left">
              <!--<el-select v-model="searchValue.status" placeholder="治理状态">
                <el-option label="运行" :value="1"></el-option>
                <el-option label="停止" :value="2"></el-option>
                <el-option label="停止" :value="0"></el-option>
              </el-select>-->
              <el-input v-model="searchValue" placeholder="请输入治理名称" prefix-icon="el-icon-search" clearable maxlength="20" style="margin: 0;">
                <el-button slot="append" type="success" @click="searchList">搜索</el-button>
              </el-input>
              <p class="search-result" v-if="total">找到相关搜索结果{{total}}条</p>
            </div>
            <div class="right">
              <el-button type="primary" @click="openNewAdd" title="新建">
                <i class="iconfont3 icon-add"></i>
              </el-button>
              <el-button type="danger" @click="removeTableData" title="删除">
                <i class="iconfont3 icon-shanchu"></i>
              </el-button>
              <el-button type="info" @click="reloadData" title="刷新">
                <i class="iconfont3 icon-shuaxin"></i>
              </el-button>
              <!--<el-button type="success" @click="startFlowMore">启动</el-button>-->
              <!--<el-button type="warning">停止</el-button>-->
            </div>
          </div>
          <div class="table-wrap">
            <el-table :data="tableData" stripe border header-cell-class-name="th-style" @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="55"></el-table-column>
              <el-table-column prop="name" label="治理名称">
                <template slot-scope="scope">
                  <el-button type="text" @click="showDetail(scope.row)">{{scope.row.name}}</el-button>
                </template>
              </el-table-column>
              <el-table-column label="创建时间" prop="createTime" width="140" :formatter="getTime"></el-table-column>
              <el-table-column label="治理类型">
                <template slot-scope="scope">
                  <div v-if="scope.row.allowApi && !scope.row.allowDatabase">
                    接口
                  </div>
                  <div v-else-if="!scope.row.allowApi && scope.row.allowDatabase">
                    库表
                  </div>
                  <div v-else-if="scope.row.allowApi && scope.row.allowDatabase">
                    接口/库表
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="最后运行时间" prop="lastTime" width="140" :formatter="getTime"></el-table-column>
              <el-table-column label="日志" width="60">
                <template slot-scope="scope">
                  <el-button type="text" @click="showLogs(scope.row)" v-if="!scope.row.allowApi && scope.row.allowDatabase">详情</el-button>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="运行次数" prop="runNum" width="80"></el-table-column>
              <el-table-column label="质量报告" width="80">
                <template slot-scope="scope">
                  <el-button v-if="!scope.row.allowApi && scope.row.allowDatabase" type="text" @click="showReport(scope.row)">查看</el-button>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="运行结果" width="80">
                <template slot-scope="scope">
                  <el-button type="text" @click="showRunResult(scope.row)">查看</el-button>
                </template>
              </el-table-column>
              <el-table-column label="治理时间策略" prop="timePolicy" :formatter="getPolicy"></el-table-column>
              <el-table-column label="当前状态" prop="status" width="100">
                <template slot-scope="scope">
                  <span v-if="scope.row.status === 0 " style="color: #66CC00">{{scope.row.statusString}}</span>
                  <span v-else-if="scope.row.status === -1 " style="color: #FF6600">{{scope.row.statusString}}</span>
                  <span v-else>{{scope.row.statusString}}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template slot-scope="scope">
                  <div v-if="scope.row.status === 0">
                    <el-button type="text" @click="startFlow(scope.row)">启动</el-button>
                    <el-button type="text" @click="showDetail(scope.row, true)">编辑</el-button>
                  </div>
                  <div v-else-if="scope.row.status === -1">
                    <el-button type="text" @click="showDetail(scope.row, true)">编辑</el-button>
                  </div>
                  <div v-else-if="scope.row.status === 2">
                    <el-button type="text" @click="stopProcess(scope.row)">停止</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="page-wrap">
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="currentPage"
                :page-sizes="[10, 20, 40, 50]"
                :page-size="pageSize"
                layout="total, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane v-for="item in tabList" :closable="true" :key="item.id" :label="item.label" :name="item.name" >
        <data-government @close-add="closeAdd" :current-id="currentId"></data-government>
      </el-tab-pane>
    </el-tabs>
    <el-dialog :visible.sync="dialogVisible" :width="dialogWidth" :title="dialogTitle" custom-class="dialog-box" :close-on-click-modal="false" :close-on-press-escape="false">
      <component :is="componentType" :form-data="formData" ref="logs"></component>
    </el-dialog>
    <el-dialog :visible.sync="runResultDialog" width="50%" :title="runResultTitle" custom-class="dialog-box" :close-on-click-modal="false" :close-on-press-escape="false">
      <component :is="runResultType"></component>
    </el-dialog>
  </div>
</template>

<script>
import moment from "moment";
import LogMain from "@/components/Log";
import QualityReport from "@/components/QualityReport";
import DataGovernment from "@/components/DataGovernment";
import request from "@/libs/request";
import DataBase from "@/components/run-result/DataBaseTable";
import ApiInterface from "@/components/run-result/ApiInterface";
import {mapState} from "vuex";
export default {
  name: "GovernmentList",
  components: {
    LogMain,
    QualityReport,
    DataGovernment,
    DataBase,
    ApiInterface
  },
  watch: {
    activeTab(val,oldVal){
      if(val === "file"){
        this.getDataList();
      }
    },
  },
  computed: {
    dialogTitle(){
      if(this.dialogType === "log"){
        return "日志"
      }else{
        return "质量报告"
      }
    },
    componentType(){
      if(this.dialogType === "log"){
        return "LogMain"
      }else{
        return "QualityReport"
      }
    },
    ...mapState(["databaseRunResult", "interfaceRunResult"])
  },
  data(){
    return {
      runResultType: "DataBase",
      runResultTitle: "",
      runResultDialog: false, //运行结果弹窗变量
      dialogWidth: "50%",
      isEdit: true, //是否可编辑流程
      currentId: "",
      activeTab: "file",
      tabList: [], //数据治理页面
      tableData: [], //列表数据
      selectTableData: [], //列表选择数据
      searchValue: "",
      currentPage: 1, //当前页
      pageSize: 10, //每页显示多少条数据
      total: 0, //总记录数
      dialogVisible: false, //弹窗变量
      dialogType: "log",
      formData: {
        isEdit: false,
        score: 0,
        wz: 0,
        yx: 0,
        wy: 0,
        historyList: [],
        id: "",
        isEmpty: false
      }
    }
  },
  created() {
    this.getDataList();
  },
  methods: {
    async showRunResult(row){ //显示运行结果
      if(row.allowApi === true && row.allowDatabase === false){
        this.getInterfaceResult(row);
      }else if(row.allowApi === false && row.allowDatabase === true){
        this.getDataBaseResult(row);
      }
      this.runResultTitle = row.name + "运行结果";
    },
    async getInterfaceResult(row){ //获取接口类运行结果数据
      let {data, status, message} = await request.get("/processing-core/output/"+ row.id,{}, {loading: true, loadingTitle: "获取结果数据……"});
      if(status === 200){
        this.interfaceRunResult.address = data.api.address || "";
        this.interfaceRunResult.format = data.api.responseType === 1 ? "JSON" : "XML";
        this.interfaceRunResult.method = data.api.requestMode === 1 ? "GET" : "POST";
        this.interfaceRunResult.description = data.api.description || "";
        this.interfaceRunResult.requestParams = data.api.requestParam ? JSON.parse(data.api.requestParam) : [];
        this.interfaceRunResult.responseParams = data.api.responseParam ? JSON.parse(data.api.responseParam) : [];
        this.interfaceRunResult.errorCode = data.api.errorCode ? JSON.parse(data.api.errorCode) : [];
        this.interfaceRunResult.requestDemo = data.api.requestDemo ? data.api.requestDemo : "";
        this.interfaceRunResult.responseDemo = data.api.responseDemo ? data.api.responseDemo : "";
        this.runResultType = "ApiInterface";
        this.runResultDialog = true;
      }else{
        this.$message.warning(message);
      }
      this.$store.commit("changeInterfaceRunResult",this.interfaceRunResult);
    },
    async getDataBaseResult(row){ //获取库表类运行结果数据
      let {data, status, message} = await request.get("/processing-core/output/"+ row.id,{}, {loading: true, loadingTitle: "获取结果数据……"});
      if(status === 200){
        this.databaseRunResult.tableColumn = data.columns.map(item => {
          return {
            id: Math.random(),
            name: item.column,
            description: item.comment,
            length: item.length,
            type: item.type
          }
        });
        this.databaseRunResult.tableResult = data.records;
        this.runResultType = "DataBase";
        this.runResultDialog = true;
      }else{
        this.databaseRunResult.tableColumn = [];
        this.databaseRunResult.tableResult = [];
        this.$message.warning(message);
      }
      this.$store.commit("changeDataBaseRunResult", this.databaseRunResult);

    },
    reloadData(){ //刷新数据
      this.searchValue = "";
      this.currentPage = 1;
      this.getDataList();
    },
    async stopProcess(row){ //停止自动运行流程
      try {
        let {status, message} = await request.put(`/processing-core/processing/${row.id}/stop`, {}, {
          loading: true,
          loadingTitle: "正在停止自动运行流程……"
        });
        if(status === 200){
          this.$message.success("停止流程成功");
          this.getDataList();
        }else{
          this.$message.warning(message);
        }
      }catch (e) {

      }
    },
    searchList(){ //搜索按钮事件
      this.getDataList();
    },
    async startFlow(row){ //启动治理流程
      try {
        let url = "";
        if(row){
          url = `/processing-core/processing/${row.id}/start`;
        }else{
          url = `/processing-core/processing/${this.selectTableData[0].id}/start`;
        }
        let {status, message} = await request.put(url, {}, {
          loading: true,
          loadingTitle: "启动流程中……"
        });
        if(status === 200){
          this.$message.success("流程启动成功");
          this.getDataList();
        }else{
          this.$message.warning(message);
        }
      }catch (e) {

      }
    },
    async startFlowMore(){ //批量启动流程
      try {
        let params = this.selectTableData.map(item => item.id);
        let {status, message} = await request.put("/processing-core/processing/startMultiple", {
          ids: params
        }, {loading:true, loadingTitle: "正在启动流程……"});
        if(status === 200){
          this.$message.success("流程启动成功！");
          this.getDataList();
        }else{
          this.$message.warning(message);
        }
      }catch (e) {

      }
    },
    closeAdd(){ //关闭新建
      this.tabList = [];
      this.activeTab = "file";
    },
    async getDataList(){ //获取列表数据
      try {
        let {data,message,status,total} = await request.get("/processing-core/processing/getProcessingListByPages", {
          pageIndex: this.currentPage,
          pageSize: this.pageSize,
          name: this.searchValue ? this.searchValue : null
        }, {loading:true, loadingTitle: "获取治理列表数据……"});
        if(status === 200){
          this.total = total;
          this.tableData = data.map(item => {
            return {
              id: item.id,
              name: item.name,
              createTime: item.createTime,
              lastTime: item.lastRunTime,
              runNum: item.runTimes,
              statusString: item.statusString,
              timePolicy: item.syncCycle,
              status: item.status,
              allowApi: item.allowApi,
              allowDatabase: item.allowDatabase,
              editable: item.editable
            }
          })
        }else if(status === 204){
          this.tableData = [];
        }else{
          this.$message.warning(message);
        }
      }catch (e) {

      }
    },
    openNewAdd(){  //新增治理
      this.currentId = "";
      this.tabList = [
        {
          label: "新增数据治理",
          name: "newAdd",
          id: Math.random()
        }
      ]
      this.activeTab = "newAdd";
      this.$store.commit("changeEditStatus", true);
    },
    async removeTableData(){  //删除
      try {
        if(!this.selectTableData.length){
          this.$message.warning("请选择要删除的数据！");
          return ;
        }
        let confirm = await this.$confirm(`是否确定删除该${this.selectTableData.length}条数据`, "删除", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        });
        if(confirm){
          let params = this.selectTableData.map(item => item.id);
          let {status,message} = await request.delete("/processing-core/processing/deleteMultiple", {ids: params}, {
            loading: true,
            loadingTitle: "正在删除治理流程……"
          });
          if(status === 200){
            this.$message.success("删除成功");
            this.getDataList();
          }else{
            this.$message.warning(message);
          }
        }
      }catch (e) {

      }
    },
    handleSelectionChange(val){ //列表选择事件
      this.selectTableData = val;
    },
    showDetail(row, isEdit){ //显示详情
      this.currentId = row.id;
      if(isEdit){
        this.$store.commit("changeEditStatus", true);
      }else{
        this.$store.commit("changeEditStatus", false);
      }
      let label = `${row.name}治理流程`;
      this.tabList = [
        {
          label: label,
          name: "newAdd",
          id: Math.random()
        }
      ]
      this.activeTab = "newAdd";
    },
    getTime(row, col, val){ //格式化时间
      if(val){
        return moment(val).format("YYYY-MM-DD HH:mm:ss");
      }else{
        return "";
      }
    },
    getStatus(row,col,val){ //格式化状态
      if(val){
        return "已完成"
      }else{
        return "未完成"
      }
    },
    handleSizeChange(val){ //改变每页显示多少条数据
      this.pageSize = val;
      this.getDataList();
    },
    handleCurrentChange(val){ //改变当前页
      this.currentPage = val;
      this.getDataList();
    },
    showLogs(row){ //显示日志
      this.dialogWidth = "50%";
      this.dialogVisible = true;
      this.dialogType = "log";
      this.formData.id = row.id;
      if(this.$refs.logs){
        setTimeout(() => {
          this.$refs.logs.getDataList();
        },100);
      }
    },
    showReport(row){ //显示质量报告
      this.dialogWidth = "30%";
      this.dialogVisible = true;
      this.dialogType = "report";
      console.log(row);
      this.getReportData(row);
      //this.formData = row.report;
    },
    async getReportData(row){ //
      try {
        this.formData.isEdit = row.editable;
        this.formData.isEmpty = false;
        this.formData.isEmpty = false;
        let {status,message,data} = await request.get("/processing-core/report/"+row.id, {}, {
          loading: true,
          loadingTitle: "获取质量报告数据中……"
        });
        if(status === 200){
          this.formData.wz = 0;
          this.formData.wy = 0;
          this.formData.yx = 0;
          this.formData.score = 0;
          this.formData.wz = parseInt(data.reportContent.completeness.toFixed(2) *100);
          this.formData.wy = parseInt(data.reportContent.uniqueness.toFixed(2) *100);
          this.formData.yx = parseInt(data.reportContent.validity.toFixed(2) * 100);
          this.formData.score = Math.round((this.formData.wz +this.formData.wy+this.formData.yx )/3);
        }else if(status === 204){
          this.formData.isEmpty = true;
        }else{
          this.$message.warning(message);
        }
      }catch (e) {

      }
    },
    handleTabsEdit(targetName){ //跳转到治理面板
      this.tabList = [];
      this.activeTab = "file";
    },
    getPolicy(row,col, val){ //格式化时间策略
      if(val === "MANUAL"){
        return "手动"
      }else{
        return "自动"
      }
    }
  }
}
</script>

<style scoped lang="less">
  .search-box{
    .el-input{
      margin-left: 20px;
      width: 300px;
      .el-button{

      }
    }
    .search-result{
      margin-left: 20px;
      color: #999;
    }
  }
</style>
