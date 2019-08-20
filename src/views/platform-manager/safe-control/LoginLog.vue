<template>
<div class="content-wrap">
  <el-tabs type="card" v-model="activeTab" class="custom-tab">
    <el-tab-pane label="用户操作日志" name="file">
      <div class="content-box">
        <div class="search-box">
          <div class="left">
            <el-select v-model="searchValue.status" placeholder="请选择用户类型" clearable v-on:change="onSelect">
              <el-option label="数据管理员" v-bind:value=0></el-option>
              <el-option label="资源用户" v-bind:value=1></el-option>
            </el-select>
            <el-input v-model="searchValue.text" placeholder="请输入用户名" maxlength="10" prefix-icon="el-icon-search">
              <el-button slot="append" maxlength="20" type="success" v-on:click="onSelect">搜索</el-button>
            </el-input>
            <p class="search-result" v-model="totalNum">找到相关搜索结果 {{totalNum}} 条</p>
          </div>
          <div class="right">
            <el-button type="info" @click="refreshData()">
              <i class="iconfont3 icon-shuaxin"></i>
            </el-button>
          </div>
        </div>
        <div class="table-wrap">
          <el-table :data="tableData" stripe border header-cell-class-name="th-style">
            <el-table-column label="用户名" prop="username" width="200" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column label="用户类型" prop="userType" width="120">
              <template slot-scope="scope">
              <span v-if="scope.row.userType == 1">资源用户</span>
              <span v-if="scope.row.userType == 0">数据管理员</span>
              </template>
            </el-table-column>
            <el-table-column label="所属组织" prop="orgName" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column label="操作内容" prop="content" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column label="操作IP" prop="ip" width="160px"></el-table-column>
            <el-table-column label="操作时间" prop="operationTime" :formatter="getTime" width="180px"></el-table-column>
          </el-table>
        </div>
        <!--分页-->
        <div class="page-wrap">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-size="pageSize"
            layout="total, prev, pager, next, jumper"
            :total="totalNum">
          </el-pagination>
        </div>
      </div>
    </el-tab-pane>
  </el-tabs>
</div>
</template>

<script>
import moment from "moment";
import request from "@/libs/request";

export default {
  name: "LoginLog",
  data() {
    return {
      tableData: [], //列表数据
      activeTab: "file", //选项卡选中值
      searchValue: {  //搜索值
        status: "",
        text: "",
      },
      currentPage: 1,//分页初始值为1
      totalNum: 0,//分页总数
      pageSize: 10,//设置分页大小
    }
  },
  created() {
    this.getDataList();
  },
  methods: {
    // 获取数据列表
    async getDataList() {
      var params = {
        "pageSize": this.pageSize,
        "pageNum": this.currentPage,
        "userName": this.searchValue.text,
        "userType": this.searchValue.status
      };
      let oData = await request.post("/monitoring/selectUserOperationsLog", params, {loading: true});
      if (oData.status === 200) {
        this.tableData = oData.data.list;
        this.totalNum = oData.data.total;
        // this.currentPage = oData.pageIndex;
      } else if (oData.status === 204) {
        this.tableData = null;
        this.totalNum = 0;
      } else {
        this.$message.warning(oData.message);
      }
    },
    // 获取数据列表
    async onSelect() {
      this.currentPage = 1;
      this.getDataList();
    },
    refreshData() { // 刷新数据列表
      this.searchValue.status = "";
      this.searchValue.text = "";
      this.onSelect();
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

<style scoped lang="less">
  .search-box {
    .el-input {
      margin-left: 20px;
      width: 300px;

      .el-button {

      }
    }

    .search-result {
      margin-left: 20px;
      color: #999;
    }
  }
</style>
