<template>
<div class="content-wrap">
  <el-tabs type="card" v-model="activeTab" class="custom-tab">
    <el-tab-pane label="目录审核" name="file">
      <div class="content-box">
        <div class="search-box">
          <div class="left">
            <el-select v-model="statusValue" placeholder="请选择状态" clearable v-on:change="onSelect()">
              <el-option label="待审核" v-bind:value=0></el-option>
              <el-option label="已驳回" v-bind:value=1></el-option>
              <el-option label="审核通过" v-bind:value=2></el-option>
            </el-select>
            <el-input v-model="searchValue.text" placeholder="请输入子目录名称" maxlength="20" prefix-icon="el-icon-search">
              <el-button slot="append" type="success" v-on:click="onSelect()">搜索</el-button>
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
            <el-table-column label="根目录名称" :show-overflow-tooltip="true" prop="rootName"></el-table-column>
            <el-table-column label="子目录名称" :show-overflow-tooltip="true" prop="name"></el-table-column>
            <el-table-column label="申请人" prop="creator" width="220px" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column v-if="!authority.mt.startsWith('org_admin')" prop="orgId" label="所属组织" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column label="申请时间" prop="createTime" :formatter="getTime" width="180px"></el-table-column>
            <el-table-column label="状态" prop="auditResult" width="160px">
              <template slot-scope="scope">
              <span v-if="scope.row.auditResult === 0">待审核</span>
              <span v-if="scope.row.auditResult === 1">已驳回</span>
              <span v-if="scope.row.auditResult === 2">审核通过</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template slot-scope="scope">
              <div v-if="scope.row.auditResult === 0">
                <el-button type="text" @click="confirmBtn(scope.row)">通过</el-button>
                <el-button type="text" @click="rejectBtn(scope.row)">驳回</el-button>
              </div>
              <div v-if="scope.row.auditResult === 2">
                <span style="color:#ccc">已通过</span>
              </div>
              <div v-if="scope.row.auditResult === 1">
                <span style="color:#ccc">已驳回</span>
              </div>
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

        <el-dialog title="驳回" :visible.sync="rejectVisible" custom-class="dialog-box">
          <el-form :model="rejectForm" :rules="rules" ref="rejectForm" label-width="100px"
                   class="demo-ruleForm">
            <el-form-item label="备注信息" prop="remark">
              <el-input type="textarea" v-model="rejectForm.remark" :rows="7" placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm('rejectForm',rejectForm)">保 存</el-button>
              <el-button @click="rejectVisible = false,cancelForm('rejectForm')">取 消</el-button>
            </el-form-item>
          </el-form>
        </el-dialog>
      </div>
    </el-tab-pane>
  </el-tabs>
</div>
</template>

<script>
import moment from "moment";
import LocalSave from "@/libs/LocalSave.js";
import request from "@/libs/request";

export default {
  name: "CatalogAudit",
  data() {
    return {
      tableData: [], //列表数据
      activeTab: "file", //选项卡选中值
      searchValue: {  //搜索值
        status: "",
        text: "",
      },
      statusValue: '',//服务状态value
      currentPage: 1,//分页初始值为1
      totalNum: 0,//分页总数
      pageSize: 10,//设置分页大小
      rejectVisible: false,
      rejectForm: {
        remark: ''
      },
      rules: {
        remark: [
          {max: 100, message: '长度不大于 100 个字符', trigger: 'blur'}
        ]
      }
    }
  },
  created() {
    this.getDataList();
    this. getAuthority();
  },
  methods: {
    getAuthority(){
      this.authority = JSON.parse(LocalSave.getSession("authority"));
      console.log(this.authority);
    },
    // 获取数据列表
    async getDataList() {
      var params = {
        "auditResult": this.statusValue,
        "name": this.searchValue.text,
        "pageSize": this.pageSize,
        "pageIndex": this.currentPage
      }
      let oData = await request.post("/collection/info/DirectoryRoot/listRootAndSupDirectoryByStatus", params, {loading: true});
      if (oData.status === 200) {
        this.tableData = oData.data;
        console.log(this.tableData);
        this.totalNum = oData.total;
      } else if (oData.status === 204) {
        this.tableData = null;
        this.totalNum = 0;
      } else {
        this.$message.warning(oData.message);
      }
    },
    async onSelect() {
      this.currentPage = 1;
      this.getDataList();
    },
    refreshData() { // 刷新数据列表
      this.statusValue = "";
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
    },
    async confirmBtn(row) {
      this.$confirm('确定通过此审核?', '通过', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request.post("/collection/info/DirectoryAudit/passSupDirectory", {subId: row.id}, {loading: true})
          .then(oData => {
            if (oData.status === 200) {
              this.$message({
                type: 'success',
                message: '此审核已通过!',
              });
              this.getDataList();
            } else {
              this.$message.warning(oData.message);
            }
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消此操作！',
        });
      });
    },
    rejectBtn(row) {
      //记录数据
      setTimeout(() => {
        this.$refs.rejectForm.resetFields();
        this.rejectId = row.id;
      }, 1);
      //显示弹窗
      this.rejectVisible = true;
    },
    async submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          request.post("/collection/info/DirectoryAudit/rejectSupDirectory", {
            subId: this.rejectId, reason: this.rejectForm.remark
          }, {loading: true})
            .then(oData => {
              if (oData.status === 200) {
                this.$message({
                  type: 'success',
                  message: '驳回提交成功!',
                });
                this.rejectVisible = false;
                this.$refs[formName].resetFields();
                this.getDataList();
              } else {
                this.$message.error(oData.message);
              }
            })
        } else {
          this.$message.error('表单校验未通过！');
        }
      })
    },
    cancelForm(formName) {
      this.$message({
        type: 'info',
        message: '取消输入'
      });
      this.$refs[formName].resetFields();
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
