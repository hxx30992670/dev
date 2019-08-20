<template>
<div class="content-wrap">
  <el-tabs type="card" v-model="activeTab" @tab-remove="handleTabsEdit" class="custom-tab">
    <el-tab-pane label="接口管控" name="file">
      <div class="content-box">
        <div class="search-box">
          <div class="left">
            <el-select v-model="searchValue.status" placeholder="请选择接口状态" clearable v-on:change="onSelect()">
              <el-option label="使用中" v-bind:value=0></el-option>
              <el-option label="已禁用" v-bind:value=1></el-option>
            </el-select>
            <el-input v-model="searchValue.text" placeholder="请输入接口名称" prefix-icon="el-icon-search">
              <el-button slot="append" type="success" maxlength="20" v-on:click="onSelect()">搜索</el-button>
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
            <el-table-column label="接口名称" prop="servicename" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column label="创建人" prop="creator" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column label="所属组织" prop="orgName" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column label="创建时间" prop="createtime" width="180px" :formatter="getTime"></el-table-column>
            <el-table-column label="调用用户量" prop="usercount" :show-overflow-tooltip="true"
                             width="100px"></el-table-column>
            <el-table-column label="接口状态" prop="interfacestatus" width="120">
              <template slot-scope="scope">
              <span v-if="scope.row.interfacestatus == 1" style="color:#F56C86">已禁用</span>
              <span v-if="scope.row.interfacestatus == 0">使用中</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template slot-scope="scope">
              <el-button type="text">
                <span v-if="scope.row.interfacestatus == 1" @click="startBtn(scope.row)" style="color:#27CA8E" class="iconfont3 icon-play"
                      title="启用"></span>
                <span v-if="scope.row.interfacestatus == 0" @click="stopBtn(scope.row)" style="color:#F56C86" class="iconfont3 icon-tingzhi"
                      title="禁用"></span>
              </el-button>
              <el-button @click="detailsBtn(scope.row),interfaceControl=true" type="text" size="small">详情</el-button>
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
            layout="total, prev, pager, next, jumper"
            :total="totalNum">
          </el-pagination>
        </div>
      </div>
    </el-tab-pane>
    <!--<el-tab-pane label="接口详情" name="details" v-if="interfaceControl">-->
    <el-tab-pane v-for="item in tabList" :closable="true" :key="item.id" :label="item.label" :name="item.name">
      <div class="content-box">
        <div class="search-box">
          <div class="left">
            <el-select v-model="searchDetailsValue.status" placeholder="请选择接口状态" clearable
                       v-on:change="onDetailsSelect()">
              <el-option label="使用中" v-bind:value=0></el-option>
              <el-option label="已禁用" v-bind:value=1></el-option>
            </el-select>
            <el-input v-model="searchDetailsValue.text" placeholder="请输入接口名称" prefix-icon="el-icon-search">
              <el-button slot="append" type="success" maxlength="20" v-on:click="onDetailsSelect()">搜索</el-button>
            </el-input>
            <p class="search-result" v-model="totalNum2">找到相关搜索结果 {{totalNum2}} 条</p>
          </div>
          <div class="right">
            <el-button type="info" @click="refreshData()">刷新</el-button>
          </div>
        </div>
        <div class="table-wrap">
          <el-table :data="interfaceDetailData" stripe border header-cell-class-name="th-style">
            <el-table-column label="接口名称" prop="interfacename" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column label="调用用户" prop="username" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column label="调用频率限制" prop="rateLimiting" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column label="调用状态" prop="status" width="120">
              <template slot-scope="scope">
              <span v-if="scope.row.status == 1" style="color:#F56C86">已禁用</span>
              <span v-if="scope.row.status == 0">使用中</span>
              </template>
            </el-table-column>
            <el-table-column label="最后调用时间" prop="callTime" :formatter="getTime" width="180"></el-table-column>
            <el-table-column label="操作" width="200">
              <template slot-scope="scope">
              <div>
                <el-button type="text">
                  <span v-if="scope.row.status == 1" @click="startBtn2(scope.row)" style="color:#27CA8E" class="iconfont3 icon-play"
                        title="启用"></span>
                  <span v-if="scope.row.status == 0" @click="stopBtn2(scope.row)" style="color:#F56C86" class="iconfont3 icon-tingzhi"
                        title="禁用"></span>
                </el-button>
                <el-button type="text" @click="editBtn(scope.row)" class="iconfont3 icon-bianji" title="编辑"></el-button>
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
            :current-page="currentPage2"
            :page-size="pageSize2"
            layout="total, prev, pager, next, jumper"
            :total="totalNum2">
          </el-pagination>
        </div>
        <!--编辑弹窗-->
        <el-dialog title="编辑" :visible.sync="editVisible" custom-class="dialog-box">
          <el-form :model="editForm" :rules="editRules" ref="editForm" label-width="180px" class="demo-ruleForm">
            <el-form-item label="调用频率限制（次/秒）" prop="callNum">
              <el-input v-model="editForm.callNum" placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm('editForm')">保 存
              </el-button>
              <el-button @click="editVisible = false,cancelForm('editForm')">取 消</el-button>
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
import request from "@/libs/request";

export default {
  name: "InterfaceControl",
  data() {
    return {
      tabList: [],//详情
      tableData: [], //接口管控列表数据
      interfaceDetailData: [], //接口详情数据
      activeTab: "file", //选项卡选中值
      interfaceControl: false,
      editVisible: false,
      searchValue: {  //搜索值
        status: "",
        text: "",
      },
      searchDetailsValue: {  //搜索值
        status: "",
        text: "",
      },
      currentPage: 1,//分页初始值为1
      totalNum: 0,//分页总数
      pageSize: 10,//设置分页大小
      currentPage2: 1,//分页初始值为1
      totalNum2: 0,//分页总数
      pageSize2: 10,//设置分页大小
      editForm: {
        callNum: '',
        userId: '',
      },
      detailsId: "",
      editRules: {
        callNum: [
          {required: true, message: '请输入调用频率限制', trigger: 'blur'},
          {max: 5, message: '长度不大于 5 个字符', trigger: 'blur'}
        ]
      }
    }
  },
  created() {
    this.getDataList();
    this.getInterfaceDetailDataList();
  },
  methods: {
    // 获取数据列表
    async getDataList() {
      var params = {
        "pageSize": this.pageSize,
        "pageNum": this.currentPage,
        "interfaceStatus": this.searchValue.status,
        "interfaceName": this.searchValue.text
      };
      let oData = await request.post("/monitoring/selectInterfaceList", params, {loading: true});
      if (oData.status === 200) {
        this.tableData = oData.data.list;
        this.totalNum = oData.data.total;
      } else if (oData.status === 204) {
        this.tableData = null;
        this.totalNum = 0;
      } else {
        this.$message.warning(oData.message);
      }
    },
    // 筛选数据列表
    async onSelect() {
      this.currentPage = 1;
      this.getDataList();
    },
    // 获取数据详情列表
    async getInterfaceDetailDataList() {
      var params = {
        "interfaceId": this.detailsId,
        "pageSize": this.pageSize2,
        "pageNum": this.currentPage2,
        "status": this.searchDetailsValue.status,
        "interfaceName": this.searchDetailsValue.text
      };
      let oData = await request.post("/monitoring/InterfaceDetails", params, {loading: true});
      if (oData.status === 200) {
        this.interfaceDetailData = oData.data.list;
        this.totalNum2 = oData.data.total;
      } else if (oData.status === 204) {
        this.interfaceDetailData = null;
        this.totalNum2 = 0;
      } else {
        this.$message.warning(oData.message);
      }
    },
    // 筛选数据详情列表
    async onDetailsSelect() {
      this.currentPage2 = 1;
      this.getInterfaceDetailDataList();
    },
    getTime(row, col, val) {
      if (val) {
        return moment(val).format("YYYY-MM-DD HH:mm:ss");
      } else {
        return moment().format("YYYY-MM-DD HH:mm:ss");
      }
    },
    refreshData() { // 刷新数据列表
      this.searchValue.status = "";
      this.searchValue.text = "";
      this.searchDetailsValue.status = "";
      this.searchDetailsValue.text = "";
      this.onSelect();
      this.onDetailsSelect();
    },
    async startBtn(row) {
      this.$confirm('确定启用此接口?', '启用', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        var params = {
          "interfaceStatus": 1,
          "interfaceId": row.id,
          // "pageSize": this.pageSize,
          // "pageNum": this.currentPage,
        };
        request.post("/monitoring/InterfaceStatus", params, {loading: true})
          .then(oData => {
            if (oData.status === 200) {
              // this.tableData = oData.data.list;
              // this.totalNum = oData.data.total;
              this.$message({
                type: 'success',
                message: '此接口已启用!',
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
    async stopBtn(row) {
      this.$confirm('确定禁用此接口?', '禁用', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        var params = {
          "interfaceStatus": 0,
          "interfaceId": row.id,
          // "pageSize": this.pageSize,
          // "pageNum": this.currentPage,
        };
        request.post("/monitoring/InterfaceStatus", params, {loading: true})
          .then(oData => {
            if (oData.status === 200) {
              // this.tableData = oData.data.list;
              // this.totalNum = oData.data.total;
              this.$message({
                type: 'success',
                message: '此接口已禁用!',
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
    async startBtn2(row) {
      this.$confirm('确定启用此接口?', '启用', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        var params = {
          "status": 1,
          "interfaceId": this.detailsId,
          "userId": row.userId,
        };
        request.post("/monitoring/consumerInterfaceStatus", params, {loading: true})
          .then(oData => {
            if (oData.status === 200) {
              // this.tableData = oData.data.list;
              // this.totalNum = oData.data.total;
              this.$message({
                type: 'success',
                message: '此接口已启用!',
              });
              this.getInterfaceDetailDataList();
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
    async stopBtn2(row) {
      this.$confirm('确定禁用此接口?', '禁用', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        var params = {
          "status": 0,
          "interfaceId": this.detailsId,
          "userId": row.userId,
        };
        request.post("/monitoring/consumerInterfaceStatus", params, {loading: true})
          .then(oData => {
            if (oData.status === 200) {
              // this.tableData = oData.data.list;
              // this.totalNum = oData.data.total;
              this.$message({
                type: 'success',
                message: '此接口已禁用!',
              });
              this.getInterfaceDetailDataList();
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
    handleSizeChange(val) { // 改变每页显示条数
      this.pageSize = val;
      this.getDataList();
    },
    handleCurrentChange(val) { //改变当前页
      this.currentPage = val;
      this.getDataList();
    },
    //跳转到详情
    handleTabsEdit() {
      this.tabList = [];
      this.activeTab = "file";
    },
    detailsBtn(row) {
      this.tabList = [
        {
          label: "服务监控详情",
          name: "details",
        }
      ];
      this.activeTab = "details";
      //记录数据
      this.detailsId = row.id;
      this.getInterfaceDetailDataList();
    },
    editBtn(row) {
      //记录数据
      setTimeout(() => {
        // this.$refs.editForm.resetFields();
        this.editForm.callNum = '';
        this.editForm.userId = row.userId;
      }, 1);
      //显示弹窗
      this.editVisible = true;
    },
    async submitForm(formName) {
      // let oData = await request.post("/usergroup/create/createUser", params, {loading: true});
      // this.$refs[formName].validate((valid) => {
      if (this.editForm.callNum && this.editForm.callNum.length <= 5) {
        var params = {
          "interfaceId": this.detailsId,
          "userId": this.editForm.userId,
          "limiting": this.editForm.callNum
        };
        request.post("/monitoring/updateInterfaceLimiting", params, {loading: true})
          .then(oData => {
            if (oData.status === 200) {
              this.getInterfaceDetailDataList();
              this.editVisible = false;
              this.$message({
                type: 'success',
                message: '提交成功！',
              });
              // this.$refs[formName].resetFields();
            } else {
              this.$message.error(oData.message);
            }
          })
      } else {
        this.$message.error('表单校验未通过！');
        // return false;
        // this.$refs[formName].resetFields();
      }
      // })
    },
    cancelForm(formName) {
      this.$message({
        type: 'info',
        message: '取消输入'
      });
      // this.$refs[formName].resetFields();
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
