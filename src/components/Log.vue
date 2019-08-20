<template>
  <div class="table-wrap" style="padding-top: 0">
    <div style="padding-bottom: 20px">
      <el-button type="info" @click="getDataList">刷新</el-button>
    </div>
    <el-table :data="tableData" stripe border header-cell-class-name="th-style">
      <el-table-column label="开始时间" prop="startTime" :formatter="getTime"></el-table-column>
      <el-table-column label="结束时间" prop="endTime" :formatter="getTime"></el-table-column>
      <el-table-column label="执行结果" prop="result" width="100">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.result">成功</el-tag>
          <el-tag type="warning" v-else-if="scope.row.result === null">运行中</el-tag>
          <el-tag type="error" v-else>失败</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="源端抽取数据量" prop="sourceNum"></el-table-column>
      <el-table-column label="目的端写入数据量" prop="targetNum"></el-table-column>
    </el-table>
    <div class="page-wrap">
      <el-pagination
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-size="pageSize"
          layout="total, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </div>
    <!--<div class="submit-box">
      <el-button type="info" @click="getDataList">刷新</el-button>
    </div>-->
  </div>
</template>

<script>
const moment = require("moment");
import request from "@/libs/request";
export default {
  props: {
    formData: Object
  },
  name: "Log",
  watch: {
    formData: {
      deep:true,
      handler(val){
        this.getDataList();
      }
    }
  },
  data(){
    return {
      tableData: [], //列表数据
      pageSize: 10,
      currentPage: 1,
      total: 0
    }
  },
  created(){
    this.getDataList();
  },
  updated(){
    //this.getDataList();
  },
  methods: {
    async getDataList(){ //获取列表数据
      try {
        let {status,message,data,total} = await request.get("/processing-core/history/processing/"+this.formData.id,{
          pageIndex: this.currentPage,
          pageSize: this.pageSize
        },{loading: true, loadingTitle: "正在获取历史执行记录数据中……"});
        if(status === 200){
          this.total = total ? total :0;
          this.tableData = data.map(item => {
            return {
              startTime: item.startTime,
              endTime: item.endTime,
              result: item.isSuccess,
              id: item.id,
              sourceNum: item.inputRecords,
              targetNum: item.outputRecords
            }
          });
        }else if(status === 204){
          this.tableData = [];
        }else{
          this.$message.warning(message);
        }
      }catch (e) {

      }
    },
    getTime(row,col,val){ //格式化时间
      if(val){
        return moment(val).format("YYYY-MM-DD HH:mm:ss");
      }else{
        return "";
      }
    },
    getStatus(row,col,val){ //格式化状态
      if(val){
        return "成功";
      }else{
        return "失败";
      }
    },
    handleCurrentChange(val){ //更换分页
      this.currentPage = val;
      this.getDataList();
    }
  }
}
</script>

<style scoped lang="less">
.page-wrap {
  display: flex;
  justify-content: center;
  padding-top: 20px;
}
</style>
