<template>
  <div class="content-wrap">
    <el-tabs type="card" v-model="activeTab" @tab-click="selectTab" class="custom-tab">
      <el-tab-pane label="库表同步" name="file">
        <div class="content-box">
          <div class="search-box">
            <div class="left">
              <el-select v-model="searchValue.status" placeholder="请选择当前状态" v-on:change="searchDataList()"
                         clearable>
                <el-option label="失败" :value="1"></el-option>
                <el-option label="运行中" :value="2"></el-option>
                <el-option label="已停止" :value="3"></el-option>
                <el-option label="准备完毕" :value="4"></el-option>
                <el-option label="同步完成" :value="5"></el-option>
                <el-option label="同步中" :value="6"></el-option>
              </el-select>
              <el-input v-model="searchValue.text" placeholder="请输入同步名称" prefix-icon="el-icon-search" maxlength="20"
                        clearable >
                <el-button slot="append" type="success" v-on:click="searchDataList()">搜索</el-button>
              </el-input>
              <p class="search-result">找到相关搜索结果{{total}}条</p>
            </div>
            <div class="right">
              <el-button type="primary" @click="openNewAdd" title="新建">
                <i class="iconfont3 icon-add" style=""></i>
              </el-button>
              <el-button type="danger" @click="removeTableData(1)" title="删除">
                <i class="iconfont3 icon-shanchu"></i>
              </el-button>
              <el-button type="info" @click="refList()" title="刷新">
                <i class="iconfont3 icon-shuaxin"></i>
              </el-button>
              <el-button type="success" @click="startTableData()" title="启动">
                <i class="iconfont3 icon-play"></i>
              </el-button>
              <el-button type="warning" @click="stopTableData()" title="停止">
                <i class="iconfont3 icon-tingzhi"></i>
              </el-button>
            </div>
          </div>
          <div class="table-wrap">
            <el-table :data="tableData" stripe border header-cell-class-name="th-style"
                      @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="55"></el-table-column>
              <el-table-column prop="syncName" :show-overflow-tooltip="true" label="同步名称">
                <template slot-scope="scope">
                  <el-button type="text" @click="showDetail(scope.row)"> {{scope.row.syncName}}</el-button>
                </template>
              </el-table-column>
              <el-table-column label="数据名称" :show-overflow-tooltip="true"
                               prop="dataName"></el-table-column>
              <el-table-column label="数据源" :show-overflow-tooltip="true"
                               prop="dbSourceName"></el-table-column>
              <el-table-column label="创建时间" prop="createTime" width="160"></el-table-column>
              <el-table-column label="同步类型" prop="syncType" width="100">
                <template slot-scope="scope">
                  <span v-if="scope.row.syncType === 1">全量同步</span>
                  <span v-if="scope.row.syncType === 2">增量同步</span>
                </template>
              </el-table-column>
              <el-table-column label="同步策略" prop="syncStrategy" width="100"></el-table-column>
              <el-table-column label="运行次数" prop="successSizes+defeatedSizes+stopSizes" width="100">
                <template slot-scope="scope">
                  <span>{{scope.row.successSizes+scope.row.defeatedSizes}}</span>
                </template>
              </el-table-column>
              <el-table-column label="成功/失败/手动停止次数" prop="successSizes+defeatedSizes+stopSizes">
                <template slot-scope="scope">
                  <span>{{scope.row.successSizes}}/{{scope.row.defeatedSizes}}/{{scope.row.stopSizes}}</span>
                </template>
              </el-table-column>
              <el-table-column label="当前状态" prop="status" width="100">
                <template slot-scope="scope">
                  <span v-if="scope.row.status === 1" style="color: #F4AB37">失败</span>
                  <span v-if="scope.row.status === 2">运行中</span>
                  <span v-if="scope.row.status === 3">已停止</span>
                  <span v-if="scope.row.status === 4">准备完毕</span>
                  <span v-if="scope.row.status === 5">同步完成</span>
                  <span v-if="scope.row.status === 6">同步中</span>
                </template>
              </el-table-column>
              <el-table-column label="最后一次执行时间" prop="lastExecuteTime" width="160"></el-table-column>
              <el-table-column label="历史执行" prop="historyRun" width="80">
                <template slot-scope="scope">
                  <el-button type="text" @click="openHistory(scope.row)">查看</el-button>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template slot-scope="scope">
                  <div v-if="scope.row.status != 6">
                    <el-button type="text">
                      <span
                        v-if="scope.row.status == 1"
                        @click="startBtn(scope.row)"
                        style="color:#F4AB37; font-size: 20px"
                        class="iconfont3 icon-mimazhongzhi"
                        title="重试"
                      ></span>
                      <span
                        v-if="scope.row.status == 2"
                        @click="stopBtn(scope.row)"
                        style="color:#F56C86; font-size: 20px"
                        class="iconfont3 icon-tingzhi"
                        title="停止"
                      ></span>
                      <span
                        v-if="scope.row.status == 3 || scope.row.status == 4 || scope.row.status == 5"
                        @click="startBtn(scope.row)"
                        style="color:#27CA8E; font-size: 20px"
                        class="iconfont3 icon-play"
                        title="启动"
                      ></span>
                    </el-button>
                    <el-button
                      v-if="scope.row.status != 2"
                      type="text"
                      @click="openEdit(scope.row)">
                      <span class="iconfont3 icon-bianji" title="编辑" style="font-size: 20px"></span>
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="page-wrap">
            <el-pagination
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-size="pageSize"
              layout="total, prev, pager, next, jumper"
              :total="total">
            </el-pagination>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="数据源管理" name="two">
        <div class="content-box">
          <div class="search-box">
            <div class="left">
              <el-input v-model="searchValueTwo.text" placeholder="请输入数据源名称" prefix-icon="el-icon-search"
                        style="margin: 0" maxlength="20">
                <el-button slot="append" type="success" @click="searchDataListTwo">搜索</el-button>
              </el-input>
              <p class="search-result">找到相关搜索结果{{totalNumTwo}}条</p>
            </div>
            <div class="right">
              <el-button type="primary" @click="newAddSource">新建</el-button>
              <el-button type="danger" @click="removeTableData(2)">删除</el-button>
              <el-button type="info" @click="refListTwo()">刷新</el-button>
            </div>
          </div>
          <div class="table-wrap">
            <el-table :data="tableDataTow" stripe border header-cell-class-name="th-style"
                      @selection-change="selectDataSourceData">
              <el-table-column type="selection" width="55"></el-table-column>
              <el-table-column :show-overflow-tooltip="true" label="数据源名称" prop="name">
                <template slot-scope="scope">
                  <el-button type="text" class="dataSourceName"
                     @click="openDataSource(scope.row)">{{scope.row.name}}</el-button>
                </template>
              </el-table-column>
              <el-table-column label="数据源类型" prop="dbType" width="100">
                <template slot-scope="scope">
                  <span v-if="scope.row.dbType === 1">Mysql</span>
                  <span v-if="scope.row.dbType === 2">oracle</span>
                  <span v-if="scope.row.dbType === 3">PostgreSQL</span>
                </template>
              </el-table-column>
              <el-table-column label="数据库地址" prop="host"></el-table-column>
              <el-table-column label="端口" prop="port" width="80"></el-table-column>
              <el-table-column label="数据库名称" prop="databaseName"></el-table-column>
              <el-table-column label="用户名" prop="account"></el-table-column>
              <el-table-column label="创建时间" prop="createTime"></el-table-column>
              <el-table-column label="操作" width="80">
                <template slot-scope="scope">
                  <el-button type="text" v-on:click="validation(scope.row)">测试</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <!--分页-->
          <div class="page">
            <el-pagination
              @current-change="handleCurrentTwoChange"
              :current-page="currentPageTwo"
              :page-size="pageSizeTwo"
              layout="total, prev, pager, next, jumper"
              :total="totalNumTwo">
            </el-pagination>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <el-dialog :visible.sync="newAddDialog" :width="dialogWidth" :title="dialogTitle" custom-class="dialog-box"
               :close-on-click-modal="false" :close-on-press-escape="false" :before-close="dialogBeforeClose"  >
      <component :is="dialogStyle" ref="syncDialog" @close-new-add="closeNewAdd"
                 @open-history="openHistory" :history="historyData" :historyid="this.historyid"
                 :historytotal="historyTotalNum" :historypage="currentPage2" :historysize="pageSize2"
                 @get-history="getHistoryList" :table-sync-data.sync="formData"
                 @jump-data="jumpDataSource"></component>
    </el-dialog>
    <el-dialog :visible.sync="newSourceDialog" :title="sourceDialogTitle" custom-class="dialog-box"
               :close-on-click-modal="false" :before-close="dataSourceBeforeClose" close="closeDataSource">
      <data-source :dialog-type="sourceDialogType" :form-data.sync="formDataTwo"
                   @close-dialog="closeDataSource" ref="dataSource"></data-source>
    </el-dialog>
  </div>
</template>

<script>
  import AddTable from "@/components/table-sync/AddTableSync";
  import EditTable from "@/components/table-sync/EditTableSync";
  import DetailTable from "@/components/table-sync/DetailTableSync";
  import HistoryRun from "@/components/table-sync/HistoryRun";
  import DataSource from "@/components/DataSource";
  import request from "@/libs/request";
  import {mapState} from "vuex";

  export default {
    name: "TableSync",
    watch: {
      newAddDialog(val, oldVal) {
        if (!val) {
          if (this.dialogType === "new") {
            this.$refs.syncDialog.steps = 1;
          }
        }
      }
    },
    components: {
      AddTable,
      EditTable,
      DetailTable,
      HistoryRun,
      DataSource
    },
    data() {
      return {
        historyData: [],
        historyid: "",
        historyTotalNum: 0,
        currentPage2: 1, //当前页码,
        pageSize2: 10, //每页显示多少条
        formData: {
          beLongCatalog: [],  //所选目录
          sourceData: "", //源数据库
          sourceTable: "", //源数据表
          fileCatalog: [ //源数据表解析出来的数据列表
          ],
          syncStrategy: 1,
          specificTime: "",
          oneWeek: 1,
          oneMonth: 1,
          oneYear: 1,
          syncType: 1,
          saveType: 1,
          timeStamp: "",
          syncName: "",
          dataName: "",
          dataDescription: "",
          dataUsage: "",
          dataSource: "",
          timestampArr: [],
          timestampColumnOptions: [],
        },
        formDataTwo: { //数据源变量
          name: "",  //数据源名称
          type: "",  //数据源类型
          address: "",//服务器地址
          port: "",  //端口
          dataBase: "", //数据库名称
          userName: "", //用户名
          password: "",  //密码
          versionNum: "",
          dbVersion: "",
          dbType: "",
          schemaName: ""
        },
        tableData: [], //库表列表数据
        tableDataTow: [], //数据源数据列表
        selectTable: [], //表格选中数据
        selectTableTwo: [], //数据源选中表格数据
        activeTab: "file", //选项卡选中值
        searchValue: {  //搜索值
          status: "",
          text: "",
        },
        searchValueTwo: {  //数据源搜索值
          status: "",
          text: "",
        },
        total: 0, //总记录数
        currentPage: 1, //当前页码,
        pageSize: 10, //每页显示多少条
        totalNumTwo: 0,//数据源列表总数
        pageSizeTwo: 10,//数据源列表每页显示条数
        currentPageTwo: 1,//数据源列表当前页
        newAddDialog: false, //库表同步弹窗变量
        dialogType: 'new',
        dialogTitle: "新建库表同步",
        newSourceDialog: false, //数据源弹窗变量
        sourceDialogTitle: "新建数据源", //数据源弹窗标题
        sourceDialogType: true,  //判断是新建还是详情
      }
    },
    computed: {
      /*...mapState(["catalogList", "dataSourceList"]),*/
      ...mapState({
        catalogList: state => state.catalogList,
        sourceDataList: state => state.sourceDataList
      }),
      getButtonTitle() {
        if (this.steps === 3) {
          return "提交"
        } else {
          return "下一步"
        }
      },
      dialogStyle() {
        if (this.dialogType === "new") {
          return "AddTable";
        } else if (this.dialogType === "edit") {
          return "EditTable";
        } else if (this.dialogType === "detail") {
          return "DetailTable";
        } else if (this.dialogType === "history") {
          return "HistoryRun";
        }
      },
      dialogWidth(){
        if (this.dialogType === "new") {
          return "70%";
        } else if (this.dialogType === "edit") {
          return "50%";
        } else if (this.dialogType === "detail") {
          return "50%";
        } else if (this.dialogType === "history") {
          return "70%";
        }
      },
      breadcrumbList() {
        return this.$store.state.breadcrumbList;
      }
    },
    created() {
      this.getDataList();
      this.getDataListTwo();
    },
    methods: {
      //新建数据源关闭前关闭验证图标变量
      dataSourceBeforeClose(done) {
        const dataSource = this.$refs.dataSource;
        dataSource.validationSuccess = false;
        dataSource.validationEro = false;
        done();
      },
      // 获取库表同步数据列表
      getDataList() {
        let params = {
          "status": this.searchValue.status,
          "syncName": this.searchValue.text,
          "pageIndex": this.currentPage,
          "pageSize": this.pageSize
        };
        request.post('/collection/info/DbSync/listSelect', params, {loading: true})
          .then(res => {
            if (res.status === 200 || res.status === 204) {
              this.tableData = res.data;
              this.total = res.total;
              this.pageSize = 10;
            } else {
              this.message.error(res.message);
            }
          }).catch(() => {
        })
      },
      //筛选库表同步列表
      searchDataList() {
          this.currentPage = 1;
          this.getDataList();
      },
      // 启用选中的表格数据
      async startTableData() {
        if (this.selectTable.length) {
          try {
            let length = this.selectTable.length;
            let confirm = await this.$confirm(`是否确定启动这${length}条数据?`, "启用", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            });
            if (confirm) {
              //获取所选框id
              let ids = this.selectTable.map(item => item.id);
              let oData = await request.post("/collection/data/sync/startTask", {ids: ids}, {
                loading: true,
                loadingTitle: "启动中"
              });
              if (oData.status === 200) {
                this.$message({
                  type: 'success',
                  message: '启动成功！'
                });
                this.getDataList();
              } else {
                this.$message.error(oData.message);
              }
            }
          } catch (e) {
            ;
            this.$message({
              type: 'info',
              message: '取消启动'
            });
          }
        } else {
          this.$message.warning("请选择要启动的同步任务");
        }
      },
      // 停用选中的表格数据
      async stopTableData() {
        if (this.selectTable.length) {
          try {
            let length = this.selectTable.length;
            let confirm = await this.$confirm(`是否确定停止这${length}条数据?`, "停用", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            });
            if (confirm) {
              //获取所选框id
              var ids = this.selectTable.map(item => item.id);
              let oData = await request.post("/collection/data/sync/stopTask", {ids: ids}, {
                loading: true,
                loadingTitle: "停止中"
              });
              if (oData.status === 200) {
                this.$message({
                  type: 'success',
                  message: '停止成功！'
                });
                this.getDataList();
              } else {
                this.$message.error(oData.message);
              }
            }
          } catch (e) {
            this.$message({
              type: 'info',
              message: '取消停止'
            });
          }
        } else {
          this.$message.warning("请选择要停止的用户");
        }
      },
      //单个启动
      async startBtn(row) {
        this.$confirm('确定启动此同步任务?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          request.post("/collection/data/sync/startTask", {ids: [row.id]}, {
            loading: true,
            loadingTitle: "启动中"
          }).then(oData => {
            if (oData.status === 200) {
              this.$message({
                type: 'success',
                message: '启动成功！'
              });
              this.getDataList();
            } else {
              this.$message.error(oData.message);
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消此操作！',
          });
        });
      },
      //单个停止
      async stopBtn(row) {
        this.$confirm('确定停止此同步任务?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          request.post("/collection/data/sync/stopTask", {ids: [row.id]}, {
            loading: true,
            loadingTitle: "停止中"
          }).then(oData => {
            if (oData.status === 200) {
              this.$message({
                type: 'success',
                message: '停止成功！'
              });
              this.getDataList();
            } else {
              this.$message.error(oData.message);
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消此操作！',
          });
        });
      },
      //获取数据源管理列表
      getDataListTwo() {
        let params = {
          "name": this.searchValueTwo.text,
          "pageIndex": this.currentPageTwo,
          "pageSize": this.pageSizeTwo
        };
        request.post('/collection/info/DbSource/listSelect', params, {loading: true})
          .then(res => {
            if (res.status === 200 || res.status === 204) {
              this.tableDataTow = res.data;
              this.totalNumTwo = res.total;
              this.pageSizeTwo = 10;
              this.currentPageTwo = res.pageIndex;
            } else {
              this.message.error(res.message);
            }
          }).catch(() => {
        })
      },
      //筛选数据源管理列表
      searchDataListTwo() {
          this.currentPageTwo = 1;
          this.getDataListTwo();
      },
      //验证数据库信息
      validation(row) {
        let params = {
          "dbType": row.dbType,
          "host": row.host,
          "port": parseInt(row.port),
          "databaseName": row.databaseName,
          "user": row.account,
          "pwd": row.password,
          "version": row.dbVersion,
          "schemaName": row.schemaName
        };
        request.post('/collection/data/database/testConnection', params, {loading: true, loadingTitle: "验证中"})
          .then(res => {
            if (res.status === 200) {
              this.$message({
                message: '验证通过',
                type: 'success'
              });
            } else {
              this.$message({
                message: '验证失败',
                type: 'warning'
              });
            }
          })
      },
      // 选项卡选择
      selectTab(tab, event) {
        let navList = this.$route.meta.nav;

        if (tab.name === "file") {
          navList.pop();
          navList.push("库表同步");
        } else {
          this.getDataListTwo();
          navList.pop();
          navList.push("数据源管理");
        }
        this.$store.commit("changeBreadCrumbList", navList);
      },
      //库表分页
      //改变当前页
      handleCurrentChange(val) {
        this.currentPage = val;
        this.getDataList();
      },
      //数据源分页
      //改变当前页
      handleCurrentTwoChange(val) {
        this.currentPageTwo = val;
        this.getDataListTwo();
      },
      // 库表表格选中复选框
      handleSelectionChange(val) {
        this.selectTable = val;
      },
      //数据源表格复选框
      selectDataSourceData(val) {
        this.selectTableTwo = val;
      },
      // 删除选中的表格数据
      async removeTableData(num) {
        if (num === 1) {
          if (this.selectTable.length) {
            try {
              let length = this.selectTable.length;
              let confirm = await
                this.$confirm(`是否确定删除这${length}条数据?`, "删除", {
                  confirmButtonText: "确定",
                  cancelButtonText: "取消",
                  type: "warning"
                });
              if (confirm) {
                //获取所选框id
                let ids = this.selectTable.map(item => item.dataId);

                let oData = await request.post("/collection/info/Data/delete", {idList: ids}, {
                  loading: true,
                  loadingTitle: "删除中"
                });
                if (oData.status === 200) {
                  this.$message({
                    type: 'success',
                    message: '删除成功！'
                  });
                  this.getDataList();
                } else {
                  this.$message.error(oData.message);
                }
              }
            } catch (e) {
              this.$message({
                type: 'info',
                message: '取消删除'
              });
            }
          } else {
            this.$message.warning("请选择要删除的数据");
          }
        } else {
          if (this.selectTableTwo.length) {
            try {
              let length = this.selectTableTwo.length;
              let confirm = await
                this.$confirm(`是否确定删除这${length}条数据?`, "删除", {
                  confirmButtonText: "确定",
                  cancelButtonText: "取消",
                  type: "warning"
                });
              if (confirm) {
                //获取所选框id
                let ids = this.selectTableTwo.map(item => item.id);
                let oData = await request.post("/collection/info/DbSource/delete", {idList: ids}, {
                  loading: true,
                  loadingTitle: "删除中"
                });
                if (oData.status === 200) {
                  this.$message({
                    type: 'success',
                    message: '删除成功！'
                  });
                  this.getDataListTwo();
                } else {
                  this.$message.error(oData.message);
                }
              }
            } catch (e) {
              this.$message({
                type: 'info',
                message: '取消删除'
              });
            }
          } else {
            this.$message.warning("请选择要删除的数据");
          }
        }

      },
      dialogBeforeClose(done){ //新建库表同步关闭前回调
        if(this.$refs.syncDialog){
          if(this.$refs.syncDialog.clearContent){
            this.$refs.syncDialog.clearContent();
          }
          if(done){
            done();
          }
        }
      },
      //打开新建库表同步弹窗
      openNewAdd() {
        console.log("最新");
        this.dialogType = "new";
        this.dialogTitle = "新建库表同步";
        this.newAddDialog = true;
        this.getCatalogList();
        this.getDataResList();
        this.getDataList();

      },
      //打开新建数据源弹窗
      newAddSource() {
        this.sourceDialogTitle = "新建数据源";
        this.formDataTwo = { //数据源变量
          name: "",  //数据源名称
          type: "",  //数据源类型
          address: "",//服务器地址
          port: "",  //端口
          dataBase: "", //数据库名称
          userName: "", //用户名
          password: "",  //密码
          versionNum: "",
          dbVersion: "",
          dbType: "",
          schemaName: "",
          databaseName: "",
          host: "",
          account: "",
        };
        this.sourceDialogType = true;
        this.newSourceDialog = true;

        if (this.$refs.dataSource) {
          setTimeout(() => {
            this.$refs.dataSource.clearValidate();
          }, 100);
        }
      },
      async getCatalogList() { //获取目录信息
        try {
          let result = await request.post('/collection/info/DirectoryRoot/listRootAndSupDirectory', {}, {
            loading: true,
            loadingTitle: "获取目录信息"
          });
          let list = [];
          if (result.status === 200) {
            list = result.data;
          } else if (result.status === 204) {
            list = [];
          } else {
            this.$message.warning(result.message);
          }
          this.$store.commit("changeCatalogData", list);
        } catch (e) {

        }
      },
      //获取数据源
      async getDataResList() {
        try {
          let result = await request.post('/collection/info/DbSource/getAllDbsource', {}, {
            loading: true,
            loadingTitle: "获取数据源数据"
          });
          let list = [];
          if (result.status === 200) {
            list = result.data;
          } else if (result.status === 204) {
            list = [];
          } else {
            this.$message.warning(result.message);
          }
          this.$store.commit("changeDataSourceList", list);
        } catch (e) {

        }
      },
      // 打开编辑弹窗
      async openEdit(row) {
        let params = {
          "id": row.dataId
        };
        try {
          let {data, message, status} = await request.post("/collection/info/Data/selectByPrimaryKey", params,
            {loading: true, loadingTitle: "获取数据详细信息"});
          if (status === 200) {
            this.formData.id = data.dbSyncAndSourceEntity.id;
            this.formData.dataId = data.dbSyncAndSourceEntity.dataId;
            this.formData.sourceData = data.dbSyncAndSourceEntity.dbSourceEntity.name;
            this.formData.sourceTable = data.dbSyncAndSourceEntity.sourceTable;
            this.formData.syncType = data.dbSyncAndSourceEntity.type;
            this.formData.syncStrategy = data.dbSyncAndSourceEntity.syncUnit;
            this.formData.specificTime = data.dbSyncAndSourceEntity.time;
            this.formData.oneWeek = data.dbSyncAndSourceEntity.week;
            this.formData.oneMonth = data.dbSyncAndSourceEntity.day ? Number(data.dbSyncAndSourceEntity.day) : "";
            this.formData.oneYear = data.dbSyncAndSourceEntity.month ? Number(data.dbSyncAndSourceEntity.month) : "";
            this.formData.saveType = data.dbSyncAndSourceEntity.syncType;
            this.formData.syncName = data.dbSyncAndSourceEntity.syncName;
            this.formData.dataName = data.dataEntity.name;
            this.formData.dataDescription = data.dataEntity.description;
            this.formData.dataUse = data.dataEntity.purpose;
            this.formData.dataSource = data.dataEntity.dataSource;
            this.formData.timeStamp = data.dbSyncAndSourceEntity.timestampColumn;
            this.formData.timestampArr = data.directoryMetaEntityList.filter(item => {
              let type = item.type.toString();
              return type.startsWith("4");
            });
            this.dialogType = "edit";
            this.dialogTitle = "编辑库表同步";
            this.newAddDialog = true;
          } else {
            this.$message.warning(message);
          }
        } catch (e) {

        }
      },
      //显示同步详情
      showDetail(row) {
        this.dialogType = "detail";
        this.dialogTitle = "库表同步详情";
        this.newAddDialog = true;
        let params = {
          "id": row.dataId
        };
        request.post('/collection/info/Data/selectByPrimaryKey', params, {loading: true})
          .then(res => {
            if (res.status === 200 || res.status === 204) {
              this.formData = {
                name: res.data.dbSyncAndSourceEntity.dbSourceEntity.name,
                sourceTable: res.data.dbSyncAndSourceEntity.sourceTable,
                syncStrategy: res.data.dbSyncAndSourceEntity.syncStrategy,
                syncType: res.data.dbSyncAndSourceEntity.syncType,
                timestampColumn: res.data.dbSyncAndSourceEntity.timestampColumn,
                syncName: res.data.dbSyncAndSourceEntity.syncName,
                dataName: res.data.dataEntity.name,
                description: res.data.dataEntity.description,
                purpose: res.data.dataEntity.purpose,
                dataSource: res.data.dataEntity.dataSource
              };
            } else {
              this.message.error(res.message);
            }
          })
      },
      //打开历史记录
      async openHistory(row) {
        this.historyid = row.id;
        this.currentPage2 = 1;
        this.getHistoryList();
        this.dialogType = "history";
        this.dialogTitle = "历史执行";
        this.newAddDialog = true;
      },
      async getHistoryList(page) {

        if(page){
          this.currentPage2 = page;
        }
        var params = {
          "id": this.historyid,
          "pageIndex": this.currentPage2,
          "pageSize": this.pageSize2
        }
        let oData = await request.post("/collection/data/sync/getHistory", params, {loading: true});
        if (oData.status === 200) {
          this.historyData = oData.data;
          this.historyTotalNum = oData.total;
        } else if (oData.status === 204) {
          this.tableData = null;
        } else {
          this.$message.warning(oData.message);
        }
      },
      //闭关新建弹窗
      closeNewAdd() {
        this.dialogBeforeClose();
        this.newAddDialog = false;
        this.getDataList();
        this.formData = {
          beLongCatalog: [],  //所选目录
          sourceData: "", //源数据库
          sourceTable: "", //源数据表
          fileCatalog: [ //源数据表解析出来的数据列表
          ],
          syncStrategy: 1,
          specificTime: "",
          oneWeek: 1,
          oneMonth: 1,
          oneYear: 1,
          syncType: 1,
          saveType: 1,
          timeStamp: "",
          syncName: "",
          dataName: "",
          dataDescription: "",
          dataUsage: "",
          dataUse: "",
          dataSource: "",
          timestampArr: [],
          timestampColumnOptions: [],
        }
      },
      //关闭新据源弹窗
      closeDataSource() {
        this.formDataTwo = { //数据源变量
          name: "",  //数据源名称
          type: "",  //数据源类型
          address: "",//服务器地址
          port: "",  //端口
          dataBase: "", //数据库名称
          userName: "", //用户名
          password: "",  //密码
          versionNum: "",
          dbVersion: "",
          dbType: "",
          schemaName: "",
          databaseName: "",
          host: "",
          account: "",
        };
        this.$refs.dataSource.openIsDisabled = true;
        this.newSourceDialog = false;
        this.getDataList();
        this.getDataListTwo();
      },
      //打开数据源详情
      openDataSource(row) {
        this.formDataTwo = {
          ...row
        };
        this.sourceDialogTitle = "数据源详情";
        this.sourceDialogType = false;
        this.newSourceDialog = true;
        if (this.$refs.dataSource) {
            setTimeout(() => {
                this.$refs.dataSource.clearValidate();
            }, 100);
        }
      },
      //筛选
      async onSelectedTwo() {
        var params = {
          "name": this.searchValueTwo.text,
          "pageSize": this.pageSize,
          "pageIndex": this.currentPage
        }
        let oData = await
          request.post("/collection/info/DbSource/listSelect", params, {loading: true});

        if (oData.status === 200 || oData.status === 204) {
          this.tableDataTow = oData.data;
          this.totalNumTwo = oData.total;
          this.pageSizeTwo = 10;
          this.currentPageTwo = oData.pageIndex;
        } else {
          this.$message.warning(oData.message);
        }
      },
      //刷新数据源
      refListTwo() {
          this.currentPageTwo = 1;
        this.searchValueTwo.text = "";
        this.getDataListTwo();
      },
      //刷新库表同步列表
      refList() {
        this.searchValue.status = "";
        this.searchValue.text = "";
        this.currentPage = 1;
        this.getDataList();
      },
      jumpDataSource() { //中转到数据源管理
        this.newAddDialog = false;
        this.activeTab = "two";
        this.newAddSource();
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

  .page {
    margin-top: 20px;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    justify-content: center;
  }
</style>
