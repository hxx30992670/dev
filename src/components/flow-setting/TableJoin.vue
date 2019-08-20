<template>
  <div class="setting-panel">
    <!--<div class="setting-header">
      <el-button type="text" @click="closePanel">关闭</el-button>
      <p>表整合</p>
      <el-button type="text" @click="saveSetting" :disabled="!isEdit">保存</el-button>
    </div>-->
    <CommonHeader
      @close-panel="closePanel"
      @save-setting="saveSetting"
      :is-edit="isEdit"
      title="表整合"
    />
    <div class="setting-body">
      <el-form
        :rules="rules"
        :model="formData"
        ref="formBox"
        label-position="right"
        label-width="100px"
        size="small"
      >
        <el-form-item label="整合表：" prop="joinTableName">
          <!--<el-select v-model="getJoinTableName" @change="changeSourceTable" :disabled="!isEdit || !runEdit">
            <el-option :value="item.id" :label="item.name" v-for="item in getJoinList" :key="item.id"></el-option>
          </el-select>-->
          <el-button
            :disabled="!isEdit || !runEdit"
            style="width: 80%;"
            type="primary"
            @click="openSelectTable"
          >{{joinTableName}}</el-button>
        </el-form-item>
        <el-form-item label="选择表字段：" prop="joinTableColumn" required>
          <el-button
            type="primary"
            @click="showDialog"
            :disabled="!isEdit || !runEdit || !formData.joinTableName"
            style="width: 80%"
          >选择</el-button>
        </el-form-item>
        <div
          class="table-wrap"
          v-if="formData.joinTableColumn.length"
          style="padding-bottom: 20px;"
        >
          <!--<div class="search-box">
            <el-input prefix-icon="el-icon-search" v-model="searchValue" clearable placeholder="请输入"></el-input>
          </div>-->
          <el-table
            :data="getTable"
            stripe
            border
            header-cell-class-name="th-style"
            style="width: 100%;"
            max-height="300"
          >
            <el-table-column type="index" label="序号" width="50"></el-table-column>
            <el-table-column label="名称" prop="name"></el-table-column>
            <el-table-column label="类型" prop="type"></el-table-column>
            <el-table-column label="说明" prop="comment"></el-table-column>
            <el-table-column label="操作" width="60" v-if="isEdit && runEdit">
              <template slot-scope="scope">
                <el-button type="text" @click="removeRow(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-form-item label="整合字段：" required>
          <el-table
            :data="formData.joinList"
            stripe
            border
            header-cell-class-name="th-style"
            max-height="300"
          >
            <el-table-column>
              <template slot="header">
                <span class="must" style="color: red; margin-right: 4px;">*</span>
                <label>源表</label>
              </template>
              <template slot-scope="scope">
                <el-form-item
                  :prop="`joinList.${scope.$index}.sourceTable`"
                  :rules="joinRules.sourceTable"
                  :inline-message="true"
                  style="margin: 0;"
                >
                  <el-select v-model="scope.row.sourceTable" :disabled="!isEdit || !runEdit">
                    <el-option
                      v-for="item in formData.flow.inputColumnEntitiesJson"
                      :label="item.column"
                      :value="item.uuid"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="整合表">
              <template slot="header">
                <span class="must" style="color: red; margin-right: 4px;">*</span>
                <label>整合表</label>
              </template>
              <template slot-scope="scope">
                <el-form-item
                  :prop="`joinList.${scope.$index}.joinTable`"
                  :rules="joinRules.joinTable"
                  :inline-message="true"
                  style="margin: 0;"
                >
                  <el-select v-model="scope.row.joinTable" :disabled="!isEdit || !runEdit">
                    <el-option
                      v-for="item in dialogTableData"
                      :label="item.name"
                      :value="item.column"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100px" v-if="isEdit && runEdit">
              <template slot-scope="scope">
                <el-button type="text" @click="addJoinRow">添加</el-button>
                <el-button type="text" @click="removeJoinRow(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
    </div>
    <el-dialog
      :visible.sync="dialogVisible"
      width="45%"
      title="选择表字段"
      custom-class="dialog-box"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      append-to-body
    >
      <div class="table-wrap">
        <div class="search-box" style="width: 50%; padding-bottom: 15px;">
          <el-input
            v-model="dialogSearch"
            placeholder="请输入"
            prefix-icon="el-icon-search"
            clearable
            @change="getSearchData"
          >
            <el-button slot="append" type="success" v-on:click="getSearchData">搜索</el-button>
          </el-input>
        </div>
        <el-table
          :data="dialogSearchList"
          stripe
          border
          header-cell-class-name="th-style"
          @selection-change="handleSelectionChange"
          ref="tableSelect"
          max-height="300"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column label="名称" prop="name"></el-table-column>
          <el-table-column label="类型" prop="type"></el-table-column>
          <el-table-column label="说明" prop="comment"></el-table-column>
        </el-table>
      </div>
      <div class="submit-box">
        <el-button type="primary" @click="submitDialog">确定</el-button>
        <el-button @click="cancelDialog">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="tableSelectVisible"
      width="45%"
      title="选择源表"
      custom-class="dialog-box"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :append-to-body="true"
    >
      <div class="table-wrap">
        <div class="search-box" style="width: 50%; padding-bottom: 15px;">
          <el-input
            v-model="tableSelectSearch"
            placeholder="请输入搜索内容"
            prefix-icon="el-icon-search"
            clearable
          >
            <!--<el-button slot="append" type="success" v-on:click="getSearchData">搜索</el-button>-->
          </el-input>
        </div>
        <el-table
          :data="getJoinList"
          stripe
          border
          header-cell-class-name="th-style"
          @selection-change="handleSelectionChange"
          ref="tableSelect"
          max-height="300"
        >
          <!--<el-table-column type="selection" width="55"></el-table-column>-->
          <el-table-column label="选择" width="50">
            <template slot-scope="scope">
              <el-radio v-model="currentSelectTable" :label="scope.row.id">&nbsp;</el-radio>
            </template>
          </el-table-column>
          <el-table-column label="表名称" prop="name"></el-table-column>
          <el-table-column label="数据名称" prop="databaseName"></el-table-column>
          <el-table-column label="所属用户" prop="creator"></el-table-column>
          <el-table-column label="创建时间" prop="createTime" :formatter="getTime"></el-table-column>
        </el-table>
      </div>
      <div class="submit-box">
        <el-button type="primary" @click="saveSelectTable">确定</el-button>
        <el-button @click="closeSelectTable">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from "vuex";
import request from "@/libs/request";
import CommonHeader from "./CommonHeader";
import moment from "moment";
export default {
  name: "TableJoin",
  props: {
    runEdit: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    tableInputData: {
      deep: true,
      handler(val) {
        if (!val.tableData.length || val.tableData.length < 1) {
          this.formData.joinList.forEach(item => {
            item.sourceTable = "";
          });
          this.$store.commit("changeTableJoinData", this.formData);
        }
      }
    }
  },
  components: {
    CommonHeader
  },
  computed: {
    ...mapState({
      formData: state => state.tableJoinData,
      tableInputData: state => state.tableInputSetting,
      diffData: state => state.tableDiffData,
      isEdit: state => state.isEdit
    }),
    joinTableName() {
      if (this.formData.joinTableName) {
        const table = this.sourceList.find(
          item => item.id === this.formData.joinTableName
        );
        return table.name;
      } else {
        return "选择";
      }
    },
    getJoinTableName: {
      get() {
        if (this.formData.joinTableName) {
          let bOn = this.sourceList.some(
            item => item.id === this.formData.joinTableName
          );
          if (bOn) {
            return this.formData.joinTableName;
          } else {
            return "";
          }
        } else {
          return "";
        }
      },
      set(val) {
        this.formData.joinTableName = val;
      }
    },
    getTable() {
      return this.formData.joinTableColumn;
    },
    getJoinList() {
      return this.sourceList.filter(
        item =>
          item.id !== this.tableInputData.sourceTable &&
          item.id !== this.diffData.diffTableName &&
          item.name.includes(this.tableSelectSearch)
      );
    }
  },
  data() {
    const validTableColumn = (rule, value, callBack) => {
      let num = this.formData.joinTableColumn.filter(item => !item.delete);
      if (num.length >= 1) {
        callBack();
      } else {
        callBack(new Error("表字段不能为空"));
      }
    };
    return {
      rules: {
        joinTableName: [
          { required: true, message: "整合表不能为空", trigger: "blur" }
        ],
        sourceTable: [
          { required: true, message: "源表不能为空", trigger: "change" }
        ],
        joinTableColumn: [{ validator: validTableColumn, trigger: "change" }]
      },
      joinRules: {
        sourceTable: [
          { required: true, message: "源表字段不能为空", trigger: "change" }
        ],
        joinTable: [
          { required: true, message: "整合表字段不能为空", trigger: "change" }
        ]
      },
      searchValue: "",
      dialogSearch: "",
      dialogVisible: false,
      dialogTableData: [],
      selectedData: [],
      allSelectData: [],
      sourceList: [],
      dialogSearchList: [],
      tableSelectVisible: false,
      tableSelectSearch: "",
      currentSelectTable: ""
    };
  },
  async created() {
    await this.getDataList();
    this.isDeleteSourceTable();
    if (this.formData.joinTableName !== "") {
      await this.changeSourceTable("noReal");
    }
  },
  activated() {
    this.clearValidate();
    this.isDeleteSourceTable();
  },
  mounted() {},
  methods: {
    //格式化时间
    getTime(row, col, val) {
      return moment(val).format("YYYY-MM-DD HH:mm:ss");
    },
    //保存选择源表
    saveSelectTable() {
      if (this.currentSelectTable === "") {
        return this.$message.warning("请先选择源表");
      }
      this.getJoinTableName = this.currentSelectTable;
      this.changeSourceTable();
      this.tableSelectVisible = false;
    },
    //关闭选择源表
    closeSelectTable() {
      this.currentSelectTable = "";
      this.tableSelectVisible = false;
    },
    openSelectTable() {
      this.currentSelectTable = this.getJoinTableName;
      this.tableSelectVisible = true;
    },
    isDeleteSourceTable() {
      if (
        this.formData.joinTableName &&
        this.sourceList &&
        this.sourceList.length
      ) {
        let bOn = this.sourceList.some(
          item => item.id === this.formData.joinTableName
        );
        if (!bOn) {
          this.formData.joinTableName = "";
        }
      }
    },
    removeJoinRow(row) {
      //删除整合表一行数据
      if (this.formData.joinList.length <= 1) {
        this.$message.warning("至少保留一条数据");
        return;
      }
      this.formData.joinList = this.formData.joinList.filter(
        item => item.id !== row.id
      );
      this.$store.commit("changeTableJoinData", this.formData);
    },
    addJoinRow() {
      let data = {
        id: Math.random(),
        sourceTable: "",
        joinTable: "",
        delete: false
      };
      this.formData.joinList.push(data);
      this.$store.commit("changeTableJoinData", this.formData);
    },
    getSearchData() {
      //选择字段搜索功能
      if (this.dialogSearch !== "") {
        this.dialogSearchList = this.dialogTableData.filter(item =>
          item.column.includes(this.dialogSearch)
        );
      } else {
        this.dialogSearchList = [...this.dialogTableData];
      }
      this.getDialogTableData();
    },
    clearValidate() {
      //清除验证
      if (this.$refs.formBox) {
        this.$refs.formBox.clearValidate();
      }
    },
    async getDataList() {
      //获取列表数据
      try {
        let { status, data, message } = await request.get(
          "/processing-core/source/getDatabaseSourceList",
          {},
          { loading: true, loadingTitle: "获取源数据中……" }
        );
        if (status === 200) {
          this.sourceList = data;
          let bOn = this.sourceList.some(
            item => item.id === this.formData.joinTableName
          );
          if (!bOn) {
            this.formData.joinTableName = "";
            this.formData.tableName = "";
            this.formData.joinTableColumn = [];
            this.$store.commit("changeTableJoinData", this.formData);
          }
        } else {
          this.$message.warning(message);
        }
      } catch (e) {}
    },
    handleSelectionChange(val) {
      //选择字段选择事件
      this.selectedData = val;
    },
    showDialog() {
      //打开选择字段弹窗
      this.dialogVisible = true;
      if (this.formData.joinTableColumn.length >= 1) {
        this.getDialogTableData();
      } else {
        setTimeout(() => {
          this.$refs.tableSelect.clearSelection();
        }, 100);
      }
    },
    closePanel() {
      //关闭面板
      this.$emit("close-panel");
      this.$refs.formBox.resetFields();
    },
    getDialogTableData() {
      //获取弹窗数据
      setTimeout(() => {
        this.dialogSearchList.forEach(item => {
          let bOn = this.formData.joinTableColumn.some(
            table => table.name === item.name
          );
          if (bOn) {
            this.$refs.tableSelect.toggleRowSelection(item, true);
          } else {
            this.$refs.tableSelect.toggleRowSelection(item, false);
          }
        });
      }, 100);
    },
    submitDialog() {
      //保存数据
      //this.selectedData = [...this.allSelectData, ...this.selectedData];
      this.formData.joinTableColumn = [...this.selectedData];
      this.$store.commit("changeTableJoinData", this.formData);
      this.dialogVisible = false;
      //this.selectedData = [];
    },
    cancelDialog() {
      //取消数据
      this.dialogVisible = false;
      this.selectedData = [];
    },
    removeRow(row) {
      //删除行
      this.formData.joinTableColumn = this.formData.joinTableColumn.filter(
        item => item.name !== row.name
      );
      this.$store.commit("changeTableJoinData", this.formData);
    },
    async changeSourceTable(val) {
      //选择源表获取表字段
      try {
        /*if(!this.formData.tableName){
        }*/
        let table = this.sourceList.find(
          item => item.id === this.formData.joinTableName
        );
        this.formData.tableName = table.tableName;
        this.$store.commit("changeTableJoinData", this.formData);
        let { status, message, data } = await request.get(
          "/processing-core/source/columns/" + this.formData.joinTableName,
          {},
          {
            loading: true,
            loadingTitle: "获取表字段数据中……"
          }
        );
        if (status === 200 || status === 204) {
          this.dialogTableData = data.map(item => {
            item.name = item.column;
            return item;
          });
          this.dialogSearchList = [...this.dialogTableData];
          if (val !== "noReal") {
            this.formData.joinTableColumn = [];
            this.formData.joinList.forEach(item => {
              item.joinTable = "";
            });
          }
          this.$store.commit("changeTableJoinData", this.formData);
        } else {
          this.$message.warning(message);
        }
      } catch (e) {}
    },
    async saveSetting() {
      // 保存配置
      try {
        let formBox = this.$refs.formBox;

        formBox.validate(async valid => {
          if (valid) {
            //let table = this.sourceList.find(item => item.id === this.formData.sourceTable);
            let dataBase = this.sourceList.find(
              item => item.id === this.formData.joinTableName
            );
            let keys = {};
            this.formData.joinList.forEach(item => {
              keys[item.joinTable] = item.sourceTable;
            });
            let params = {
              id: this.formData.flow.flowId,
              name: this.formData.flow.name,
              positionX: 0,
              positionY: 0,
              processingId: this.formData.processingId,
              properties: {
                databaseConnectionPoolingService: this.formData.joinTableName,
                columnsA: this.tableInputData.tableData,
                columns: this.formData.joinTableColumn,
                foreignKeyPairs: keys,
                tableName: this.formData.tableName,
                dataName: dataBase.name
              },
              templateId: this.formData.flow.templateId
            };
            let { status, message, data } = await request.put(
              "/processing-core/node/updateNodeConfig",
              params,
              {
                loading: true,
                loadingTitle: "保存配置中……"
              }
            );
            if (status === 200) {
              this.$message.success("保存配置成功");
              this.$emit("close-panel");
            } else {
              this.$message.warning(message);
            }
          } else {
            this.$message.warning("请完善必填信息");
          }
        });
      } catch (e) {}
    }
  }
};
</script>

<style lang="less">
@import "../../assets/css/setting-panel.less";
</style>
