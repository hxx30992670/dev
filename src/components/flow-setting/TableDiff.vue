<template>
  <div class="setting-panel">
    <!--<div class="setting-header">
      <el-button type="text" @click="closePanel">关闭</el-button>
      <p>表对比</p>
      <el-button type="text" @click="saveSetting" :disabled="!isEdit">保存</el-button>
    </div>-->
    <CommonHeader
      @close-panel="closePanel"
      @save-setting="saveSetting"
      :is-edit="isEdit"
      title="表对比"
    />
    <div class="setting-body">
      <el-form
        :rules="rules"
        :model="formData"
        ref="formBox"
        label-position="right"
        label-width="120px"
        size="small"
      >
        <el-form-item label="对比表：" prop="diffTableName">
          <!--<el-select v-model="getDiffTableName" @change="changeSourceTable" :disabled="!isEdit || !runEdit">
            <el-option :value="item.id" :label="item.name" v-for="item in getDiffList" :key="item.id"></el-option>
          </el-select>-->
          <el-button
            type="primary"
            style="width: 80%"
            :disabled="!isEdit || !runEdit"
            @click="openSelectTable"
          >{{diffTableName}}</el-button>
        </el-form-item>
        <el-form-item label="选择表字段：" prop="diffTableColumn" required>
          <el-button
            type="primary"
            @click="showDialog"
            :disabled="!isEdit || !runEdit || !formData.diffTableName"
            style="width: 80%"
          >选择</el-button>
        </el-form-item>
        <div
          class="table-wrap"
          v-if="formData.diffTableColumn.length"
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
        <el-form-item label="关联字段：">
          <el-table
            :data="formData.relatedColumn"
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
                  :prop="`relatedColumn.${scope.$index}.sourceTable`"
                  :rules="diffRules.sourceTable"
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
                  :prop="`relatedColumn.${scope.$index}.diffTable`"
                  :rules="diffRules.diffTable"
                  :inline-message="true"
                  style="margin: 0;"
                >
                  <el-select v-model="scope.row.diffTable" :disabled="!isEdit || !runEdit">
                    <el-option
                      v-for="item in formData.diffTableColumn"
                      :label="item.name"
                      :value="item.uuid"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100px" v-if="isEdit && runEdit">
              <template slot-scope="scope">
                <el-button type="text" @click="addRelatedRow">添加</el-button>
                <el-button type="text" @click="removeRelatedRow(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item label="对比字段：">
          <el-table
            :data="formData.diffList"
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
                  :prop="`diffList.${scope.$index}.sourceTable`"
                  :rules="diffRulesTwo.sourceTable"
                  :inline-message="true"
                  style="margin: 0;"
                >
                  <el-select v-model="scope.row.sourceTable" :disabled="!isEdit || !runEdit">
                    <!--<el-option v-for="item in tableInputData.tableData" :label="item.name" :value="item.uuid" ></el-option>-->
                    <el-option
                      v-for="item in formData.flow.inputColumnEntitiesJson"
                      :label="item.column"
                      :value="item.uuid"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column>
              <template slot="header">
                <span class="must" style="color: red; margin-right: 4px;">*</span>
                <label>对比表</label>
              </template>
              <template slot-scope="scope">
                <el-form-item
                  :prop="`diffList.${scope.$index}.diffTable`"
                  :rules="diffRulesTwo.diffTable"
                  :inline-message="true"
                  style="margin: 0;"
                >
                  <el-select
                    v-model="scope.row.diffTable"
                    :disabled="!isEdit || !runEdit"
                    style="flex: 1"
                  >
                    <el-option
                      v-for="item in formData.diffTableColumn"
                      :label="item.name"
                      :value="item.uuid"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100px" v-if="isEdit && runEdit">
              <template slot-scope="scope">
                <el-button type="text" @click="addDiffRow">添加</el-button>
                <el-button type="text" @click="removeDiffRow(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item label="对比规则名称：" prop="ruleName">
          <el-input v-model="formData.ruleName"></el-input>
        </el-form-item>
        <el-form-item label="对比结果参数说明：">
          <div style="color: #666">0(一致)、1(不一致)、2(不存在)</div>
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
        <!--<div class="search-box" style="width: 50%; padding-bottom: 15px;">
          <el-input v-model="dialogSearch" placeholder="请输入" prefix-icon="el-icon-search"
                    clearable @change="getSearchData">
            <el-button slot="append" type="success" v-on:click="getSearchData">搜索</el-button>
          </el-input>
        </div>-->
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
          :data="getDiffList"
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
  name: "TableDiff",
  props: {
    runEdit: {
      type: Boolean,
      default: true
    }
  },
  components: {
    CommonHeader
  },
  computed: {
    ...mapState({
      formData: state => state.tableDiffData,
      tableInputData: state => state.tableInputSetting,
      joinData: state => state.tableJoinData,
      isEdit: state => state.isEdit
    }),
    diffTableName() {
      if (this.formData.diffTableName) {
        const table = this.sourceList.find(
          item => item.id === this.formData.diffTableName
        );
        return table.name;
      } else {
        return "选择";
      }
    },
    getDiffTableName: {
      get() {
        if (this.formData.diffTableName) {
          let bOn = this.sourceList.some(
            item => item.id === this.formData.diffTableName
          );
          if (bOn) {
            return this.formData.diffTableName;
          } else {
            return "";
          }
        } else {
          return "";
        }
      },
      set(val) {
        this.formData.diffTableName = val;
      }
    },
    getTable() {
      return this.formData.diffTableColumn;
    },
    getDiffList() {
      return this.sourceList.filter(
        item =>
          item.id !== this.tableInputData.sourceTable &&
          item.id !== this.joinData.joinTableName &&
          item.name.includes(this.tableSelectSearch)
      );
    }
  },
  watch: {
    getTable: {
      deep: false,
      immediate: false,
      handler(val) {
        if (!val.length || val.length === 0) {
          this.formData.relatedColumn.forEach(item => {
            item.diffTable = "";
          });
          this.formData.diffList.forEach(item => {
            item.diffTable = "";
          });
          this.$store.commit("changeTableDiffData", this.formData);
        } else {
          this.formData.relatedColumn.forEach(item => {
            let diffTable = val.some(join => join.uuid === item.diffTable);
            if (!diffTable) {
              item.diffTable = "";
            }
          });
          this.formData.diffList.forEach(item => {
            let diffTable = val.some(join => join.uuid === item.diffTable);
            if (!diffTable) {
              item.diffTable = "";
            }
          });
        }
        /*if(this.formData.relatedColumn.length){
          this.formData.relatedColumn.forEach(item => {
            let sourceTable = this.tableInputData.tableData.some(table  => table.column === item.sourceTable);
            if(!sourceTable){
              item.sourceTable = "";
            }
          });
        }
        if(this.formData.diffList.length){
          this.formData.diffList.forEach(item => {
            let sourceTable = this.tableInputData.tableData.some(table => table.column === item.sourceTable);
            if(!sourceTable){
              item.sourceTable = "";
            }
          });
        }*/
      }
    }
  },
  data() {
    const validTableColumn = (rule, value, callBack) => {
      let num = this.formData.diffTableColumn;
      if (num.length >= 1) {
        callBack();
      } else {
        callBack(new Error("表字段不能为空"));
      }
    };
    return {
      rules: {
        diffTableName: [
          { required: true, message: "源表不能为空", trigger: "change" }
        ],
        diffTableColumn: [{ validator: validTableColumn, trigger: "change" }],
        ruleName: [
          { required: true, message: "对比规则名称不能为空", trigger: "blur" },
          { max: 20, message: "对比规则名称长度不能超过20", trigger: "blur" },
          {
            pattern: /^[a-zA-Z\_]+$/g,
            message: "对比规则名称必须为英文字母或者英文字母加下划线",
            trigger: "blur"
          }
        ]
      },
      diffRules: {
        sourceTable: [
          { required: true, message: "源表字段不能为空", trigger: "change" }
        ],
        diffTable: [
          { required: true, message: "整合表字段不能为空", trigger: "change" }
        ]
      },
      diffRulesTwo: {
        sourceTable: [
          { required: true, message: "源表字段不能为空", trigger: "change" }
        ],
        diffTable: [
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
    if (this.formData.diffTableName !== "") {
      await this.changeSourceTable("noReal");
    }
  },
  activated() {
    this.clearValidate();
  },

  methods: {
    //格式化时间
    getTime(row, col, val) {
      return moment(val).format("YYYY-MM-DD HH:mm:ss");
    },
    //打开选择表
    openSelectTable() {
      this.currentSelectTable = this.getDiffTableName;
      this.tableSelectVisible = true;
    },
    //关掉选择表
    closeSelectTable() {
      this.currentSelectTable = "";
      this.tableSelectVisible = false;
    },
    //保存选择的表并关掉弹窗
    saveSelectTable() {
      if (this.currentSelectTable === "") {
        return this.$message.warning("请先选择源表");
      }
      this.getDiffTableName = this.currentSelectTable;
      this.changeSourceTable();
      this.tableSelectVisible = false;
    },
    isDeleteSourceTable() {
      if (this.formData.diffTableName) {
        let bOn = this.sourceList.some(
          item => item.id !== this.formData.diffTableName
        );
        if (!bOn) {
          this.formData.diffTableName = "";
        }
      }
    },
    addRelatedRow() {
      let data = {
        id: Math.random(),
        sourceTable: "",
        diffTable: "",
        delete: false
      };
      this.formData.relatedColumn.push(data);
      this.$store.commit("changeTableDiffData", this.formData);
    },
    removeRelatedRow(row) {
      if (this.formData.relatedColumn.length <= 1) {
        this.$message.warning("至少保留一条数据");
        return;
      }
      this.formData.relatedColumn = this.formData.relatedColumn.filter(
        item => item.id !== row.id
      );
      this.$store.commit("changeTableDiffData", this.formData);
    },
    removeDiffRow(row) {
      //删除对比字段一行数据
      if (this.formData.diffList.length <= 1) {
        this.$message.warning("至少保留一条数据");
        return;
      }
      this.formData.diffList = this.formData.diffList.filter(
        item => item.id !== row.id
      );
      this.$store.commit("changeTableDiffData", this.formData);
    },
    addDiffRow() {
      let data = {
        id: Math.random(),
        sourceTable: "",
        diffTable: "",
        delete: false
      };
      this.formData.diffList.push(data);
      this.$store.commit("changeTableDiffData", this.formData);
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
            item => item.id === this.formData.diffTableName
          );
          if (!bOn) {
            this.formData.diffTableName = "";
            this.formData.tableName = "";
            this.formData.diffTableColumn = [];
            this.$store.commit("changeTableDiffData", this.formData);
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
      this.getDialogTableData();
      this.getDialogTableData();
      /*if(this.formData.diffTableColumn.length >=1 && !this.selectedData.length){
        this.getDialogTableData();
      }else{

      }*/
    },
    closePanel() {
      //关闭面板
      this.$emit("close-panel");
      this.$refs.formBox.resetFields();
    },
    getDialogTableData() {
      //获取弹窗数据
      setTimeout(() => {
        if (this.formData.diffTableColumn.length) {
          this.dialogSearchList.forEach(item => {
            let bOn = this.formData.diffTableColumn.some(
              table => table.name === item.name
            );
            if (bOn) {
              this.$refs.tableSelect.toggleRowSelection(item, true);
            } else {
              this.$refs.tableSelect.toggleRowSelection(item, false);
            }
          });
        } else {
          this.$refs.tableSelect.clearSelection();
        }
      }, 100);
    },
    submitDialog() {
      //保存数据
      //this.selectedData = [...this.allSelectData, ...this.selectedData];
      this.formData.diffTableColumn = [...this.selectedData];
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
      this.formData.diffTableColumn = this.formData.diffTableColumn.filter(
        item => item.name !== row.name
      );
      this.$store.commit("changeTableDiffData", this.formData);
    },
    async changeSourceTable(val) {
      //选择源表获取表字段
      try {
        /*if(!this.formData.tableName){
        }*/
        let table = this.sourceList.find(
          item => item.id === this.formData.diffTableName
        );
        this.formData.tableName = table.tableName;
        this.$store.commit("changeTableDiffData", this.formData);
        let { status, message, data } = await request.get(
          "/processing-core/source/columns/" + this.formData.diffTableName,
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
            this.formData.diffTableColumn = [];
          }
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
              item => item.id === this.formData.diffTableName
            );
            let comparisonKeyPairs = this.formData.diffList.map(item => {
              let sourceItem = this.tableInputData.tableData.find(
                source => source.uuid === item.sourceTable
              );
              let diffItem = this.formData.diffTableColumn.find(
                diff => diff.uuid === item.diffTable
              );
              return {
                sourceTable: sourceItem,
                joinTable: diffItem
              };
              /*comparisonKeyPairs[item.diffTable] = item.sourceTable;*/
            });
            let foreignKeyPairs = this.formData.relatedColumn.map(item => {
              let sourceItem = this.tableInputData.tableData.find(
                source => source.uuid === item.sourceTable
              );
              let diffItem = this.formData.diffTableColumn.find(
                diff => diff.uuid === item.diffTable
              );
              return {
                sourceTable: sourceItem,
                joinTable: diffItem
              };
            });
            let params = {
              id: this.formData.flow.flowId,
              name: this.formData.flow.name,
              positionX: 0,
              positionY: 0,
              processingId: this.formData.processingId,
              properties: {
                databaseConnectionPoolingService: this.formData.diffTableName,
                columns: this.formData.diffTableColumn,
                foreignKeyPairs: foreignKeyPairs,
                comparisonKeyPairs: comparisonKeyPairs,
                comparisonResult: this.formData.ruleName,
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
              this.$emit("close-panel", data);
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
