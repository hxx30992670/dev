<template>
  <div>
    <el-tabs type="card" v-model="activeTab" class="custom-tab">
      <el-tab-pane label="数据列表" name="file">
        <div class="content-box">
          <div class="search-box">
            <div class="left">
              <el-select
                v-model="searchValue.dataType"
                clearable
                placeholder="请选择数据类型"
                v-on:change="searchDataList"
              >
                <el-option label="文件" value="1"></el-option>
                <el-option label="接口" value="2"></el-option>
                <el-option label="库表" value="3"></el-option>
              </el-select>
              <el-input
                v-model="searchValue.text"
                maxlength="20"
                placeholder="请输入数据名称"
                prefix-icon="el-icon-search"
              >
                <el-button slot="append" type="success" v-on:click="searchDataList">搜索</el-button>
              </el-input>
              <div class="time-section">
                <span>创建时间</span>
                <el-date-picker
                  v-model="searchValue.timeSection"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  value-format="yyyy-MM-dd"
                  :picker-options="pickerOptions"
                  v-on:change="searchDataList"
                ></el-date-picker>
              </div>
              <p class="search-result">找到相关搜索结果{{total}}条</p>
            </div>
            <div class="right">
              <el-button type="danger" @click="removeTableData" title="删除">
                <i class="iconfont3 icon-shanchu"></i>
              </el-button>
              <el-button type="info" @click="refList()" title="刷新">
                <i class="iconfont3 icon-shuaxin"></i>
              </el-button>
            </div>
          </div>
          <div class="table-wrap">
            <el-table
              :data="tableData"
              stripe
              border
              header-cell-class-name="th-style"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="55"></el-table-column>
              <el-table-column :show-overflow-tooltip="true" label="数据名称" prop="name"></el-table-column>
              <el-table-column label="数据描述" prop="description"></el-table-column>
              <el-table-column label="数据类型" prop="dataType" width="150">
                <template slot-scope="scope">
                  <span v-if="scope.row.dataType === 1">文件</span>
                  <span v-if="scope.row.dataType === 2">接口</span>
                  <span v-if="scope.row.dataType === 3">库表</span>
                </template>
              </el-table-column>
              <el-table-column :show-overflow-tooltip="true" label="所属目录" prop="subName"></el-table-column>
              <el-table-column width="150" label="数据存储条数" prop="syncNum">
                <template slot-scope="scope">
                  <a
                    href="javascript:;"
                    v-if="scope.row.dataType === 1 || scope.row.dataType === 3"
                    :style="{color: scope.row.status === 2 ? 'red' : ''}"
                    @click="showDataNum(scope.row)"
                  >{{scope.row.syncNum}}</a>
                  <span v-else-if="scope.row.dataType === 2">-</span>
                  <!-- <span v-else-if="scope.row.dataType === 3" :style="{color: scope.row.status === 2 ? 'red' : ''}">{{scope.row.syncNum}}</span> -->
                </template>
              </el-table-column>
              <el-table-column width="150" label="数据存储量(B)" prop="dataSize">
                <template slot-scope="scope">
                  <span v-if="scope.row.dataType !== 2">{{scope.row.dataSize}}</span>
                  <span v-if="scope.row.dataType === 2">-</span>
                </template>
              </el-table-column>
              <el-table-column width="160" label="创建时间" prop="createTime"></el-table-column>
              <el-table-column width="160" label="操作">
                <template slot-scope="scope">
                  <el-button type="text" @click="showDetail(scope.row)">详情</el-button>
                  <el-button
                    type="text"
                    :style="{color: scope.row.serviceStatus === 1 ? '#ccc' : 'green'}"
                    @click="showServiceVisible(scope.row)"
                    :disabled="scope.row.serviceStatus === 1"
                  >{{scope.row.serviceStatus === 2 ? '生成服务' : '已生成服务'}}</el-button>

                  <el-button type="text" style="color:red" @click="deleteCurrentData(scope.row)">删除</el-button>
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
              :total="total"
            ></el-pagination>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <data-detail :dialog-title="dialogTitle" :form-data="formData" ref="dataDetail"></data-detail>
    <el-dialog
      :visible.sync="dataNumDialog"
      custom-class="dialog-box"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      title="入库日志"
      width="40%"
    >
      <div>
        <ul class="log-list">
          <li>{{getTime(runResultLog.createTime)}} - 总数量：{{runResultLog.num}}</li>
          <li
            style="color: #F56C86"
            v-if="runResultLog.status === 2"
          >{{getTime(runResultLog.createTime)}} {{runResultLog.area}} 失败</li>
          <li
            style="color: #4887ED"
            v-else-if="runResultLog.status === 1"
          >{{getTime(runResultLog.createTime)}} {{runResultLog.area}} 成功</li>
          <li
            style="color: #27CA8E"
            v-else-if="runResultLog.status === 0"
          >{{getTime(runResultLog.createTime)}} 入库中 {{runResultLog.area}}</li>
        </ul>
      </div>
    </el-dialog>
    <!-- 生成服务弹窗 -->
    <el-dialog
      title="生成服务项"
      :visible.sync="serviceVisible"
      custom-class="dialog-box"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="40%"
      destroy-on-close
    >
      <create-service
        @close-service="closeServiceVisible"
        :current-data="serviceData"
      />
    </el-dialog>
  </div>
</template>

<script>
import moment from "moment";
import DataDetail from "@/components/DataDetail";
import request from "@/libs/request";
import CreateService from "@/components/CreateService";

export default {
  name: "DataListName",
  components: {
    DataDetail,
    CreateService
  },
  data() {
    return {
      serviceData: {},
      serviceVisible: false,
      runResultLog: {
        createTime: "",
        sum: "",
        area: "",
        status: 0
      },
      dataNumDialog: false, //数量存储量点击弹窗变量
      selectDate: "",
      //日期选择范围在一个月内
      pickerOptions: {
        disabledDate: time => {
          return time.getTime() > Date.now();
        }
      },
      formData: {
        name: "",
        metaList: [],
        createTime: null,
        requestRemark: [
          { name: "测试", must: true, type: "Object", desc: "说明" }
        ],
        responseRemark: [{ name: "测试", type: "Object", desc: "说明" }],
        errorCode: [{ name: "测试", desc: "说明" }],
        resultExample: "",
        callExample: "",
        saveNum: "",
        syncNum: "",
        requestMode: "",
        dataType: "",
        dataSource: ""
        // requsetParam: "",
        // responseParam: "",
        // requsetDemo: "",
        // responseDemo: "",
        // sourceName: "",
        // rootSubName: "",
        // fileFormat: "",
        // dbname: "",
        // dbtype:"",
      },
      tableData: [], //表格数据
      selectTable: [], //选择表格数据
      activeTab: "file",
      searchValue: {
        text: "",
        timeSection: ""
      },
      pageSize: 10,
      currentPage: 1,
      total: 0,
      dialogTitle: "数据详情"
    };
  },
  created() {
    this.getDataList();
  },
  methods: {
    //删除当前行数据
    async deleteCurrentData(row) {
      try {
        let confirm = await this.$confirm("确定删除该数据吗？", "删除", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        });
        if (confirm) {
          let params = {
            idList: [row.id]
          };
          let { status, message } = await request.post(
            "/collection/info/Data/delete",
            params,
            { loading: true, loadingTitle: "删除中" }
          );
          if (status === 200) {
            this.$message.success("删除成功");
            this.getDataList();
          } else {
            this.$message.error(message);
          }
        }
      } catch (e) {
        this.$message.info("取消删除");
      }
    },
    //点击生成服务按钮
    showServiceVisible(row) {
      if ((row.dataType === 1 || row.dataType === 3) && row.syncNum === 0) {
        return this.$message.warning("数据内容为空，不可生成服务项");
      }
      this.serviceData = row;
      this.serviceVisible = true;
    },
    //关掉生成服务弹窗
    closeServiceVisible() {
      this.getDataList();
      this.serviceVisible = false;
    },
    async showDataNum(row) {
      //显示数据条数详情信息
      //console.log(row);
      try {
        let { status, data, message } = await request.post(
          "/collection/info/DataFile/selectFileLogByDataId",
          {
            id: row.id,
            dataType: row.dataType
          },
          { loading: true, loadingTitle: "正在获取运行日志……" }
        );
        if (status === 200) {
          this.runResultLog.createTime = data.createTime;
          this.runResultLog.num = data.dataNum;
          this.runResultLog.area = data.insertNum;
          this.runResultLog.status = data.status;
          this.dataNumDialog = true;
        } else if (status === 204) {
          this.$message.warning("无相关数据");
          Object.keys(this.runResultLog).forEach(item => {
            this.runResultLog[item] = "";
          });
        }
      } catch (e) {}
    },
    getTime(val) {
      return moment(val).format("YYYY-MM-DD HH:mm:ss");
    },
    //获取表格数据
    getDataList() {
      let params = {
        dataType:
          this.searchValue.dataType === "" || undefined
            ? null
            : this.searchValue.dataType,
        name:
          this.searchValue.text === "" || undefined
            ? null
            : this.searchValue.text,
        pageIndex: this.currentPage,
        pageSize: this.pageSize
      };
      if (this.searchValue.timeSection && this.searchValue.timeSection.length) {
        params.startTime = this.searchValue.timeSection[0];
        params.endTime = this.searchValue.timeSection[1];
      } else {
        params.startTime = null;
        params.endTime = null;
      }
      request
        .post("/collection/info/Data/listSelect", params, {
          loading: true,
          loadingTitle: "数据加载中"
        })
        .then(res => {
          if (res.status === 200 || res.status === 204) {
            this.tableData = res.data;
            console.log(this.tableData);
            this.total = res.total;
            this.pageSize = 10;
            this.currentPage = res.pageIndex;
          } else {
            this.message.error(res.message);
          }
        })
        .catch(() => {});
    },
    //筛选数据列表
    searchDataList() {
      this.currentPage = 1;
      this.getDataList();
    },
    //删除表格数据
    async removeTableData() {
      if (this.selectTable.length) {
        try {
          let length = this.selectTable.length;
          let confirm = await this.$confirm(
            `确定删除选中的${length}项吗?`,
            "删除",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            }
          );
          if (confirm) {
            //获取所选框id
            var ids = this.selectTable.map(item => item.id);
            let params = {
              idList: ids
            };
            let oData = await request.post(
              "/collection/info/Data/delete",
              params,
              {
                loading: true,
                loadingTitle: "删除中"
              }
            );
            if (oData.status === 200) {
              this.$message({
                type: "success",
                message: "删除成功！"
              });
              this.getDataList();
            } else {
              this.$message.error(oData.message);
              this.getDataList();
            }
          }
        } catch (e) {
          this.$message({
            type: "info",
            message: "取消删除"
          });
        }
      } else {
        this.$message.warning("请选择要删除的数据");
      }
    },
    //选择表格数据
    handleSelectionChange(val) {
      this.selectTable = val;
    },
    //查看详情按钮
    showDetail(row) {
      this.$refs.dataDetail.dataDetailDialog = true;
      let params = {
        id: row.id
      };
      request
        .post("/collection/info/Data/selectByPrimaryKey", params, {
          loading: true,
          loadingTitle: "数据加载中"
        })
        .then(res => {
          if (res.status === 200 || res.status === 204) {
            console.log(res.data);
            if (res.data.dataEntity.dataType === 1) {
              this.formData = {
                name: res.data.dataEntity.name,
                description: res.data.dataEntity.description,
                dataUse: res.data.dataEntity.purpose,
                dataSource: res.data.dataEntity.dataSource,
                dataType: res.data.dataEntity.dataType,
                rootSubName:
                  res.data.dataEntity.rootName +
                  "/" +
                  res.data.dataEntity.subName,
                createTime: res.data.dataEntity.createTime,
                syncNum: row.syncNum,
                saveNum: row.dataSize,
                fileFormat: res.data.dataFileEntity.format,
                fileName: res.data.dataFileEntity.name,
                metaList: res.data.directoryMetaEntityList,
                fileStatus: res.data.dataEntity.status
              };
            } else if (res.data.dataEntity.dataType === 2) {
              this.formData = {
                name: res.data.dataEntity.name,
                description: res.data.dataEntity.description,
                dataUse: res.data.dataEntity.purpose,
                dataSource: res.data.dataEntity.dataSource,
                dataType: res.data.dataEntity.dataType,
                rootSubName:
                  res.data.dataEntity.rootName +
                  "/" +
                  res.data.dataEntity.subName,
                createTime: res.data.dataEntity.createTime,
                syncNum: row.syncNum,
                saveNum: row.dataSize,
                address: res.data.dataApiEntity.address,
                responseType: res.data.dataApiEntity.responseType,
                requestMode: res.data.dataApiEntity.requestMode,
                requsetParam: JSON.parse(res.data.dataApiEntity.requsetParam),
                responseParam: JSON.parse(res.data.dataApiEntity.responseParam),
                requsetDemo: res.data.dataApiEntity.requsetDemo,
                responseDemo: res.data.dataApiEntity.responseDemo,
                errorCode: JSON.parse(res.data.dataApiEntity.errorCode)
              };
            } else if (res.data.dataEntity.dataType === 3) {
              this.formData = {
                name: res.data.dataEntity.name,
                description: res.data.dataEntity.description,
                dataUse: res.data.dataEntity.purpose,
                dataSource: res.data.dataEntity.dataSource,
                dataType: res.data.dataEntity.dataType,
                rootSubName:
                  res.data.dataEntity.rootName +
                  "/" +
                  res.data.dataEntity.subName,
                createTime: res.data.dataEntity.createTime,
                syncNum: row.syncNum,
                saveNum: row.dataSize,
                dbname: res.data.dbSyncAndSourceEntity.dbSourceEntity.name,
                sourceTable: res.data.dbSyncAndSourceEntity.sourceTable,
                syncStrategy: res.data.dbSyncAndSourceEntity.syncStrategy,
                dbtype: res.data.dbSyncAndSourceEntity.type,
                metaList: res.data.directoryMetaEntityList,
                updateTime: res.data.dataEntity.updateTime
              };
            }
          } else {
            this.$message.error(res.message);
          }
        });
    },
    //改变每页显示多少条
    // handleSizeChange(val) {
    //     this.pageSize = val;
    //     this.getDataList();
    // },
    //改变当前页码
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getDataList();
    },
    //刷新
    refList() {
      this.searchValue.dataType = "";
      this.searchValue.text = "";
      this.searchValue.timeSection = [];
      this.currentPage = 1;
      this.getDataList();
    }
  }
};
</script>

<style scoped lang="less">
.search-box {
  .el-select {
    width: 150px;
  }

  .el-input {
    margin-left: 20px;
    width: 240px;

    .el-button {
    }
  }

  .time-section {
    margin-left: 20px;

    span {
      margin-right: 10px;
    }

    .el-date-editor {
      width: 300px;
    }
  }

  .search-result {
    margin-left: 20px;
    color: #999;
  }
}
.log-list {
  li {
    padding: 10px 10px;
  }
}
</style>
