<template>
  <div class="setting-panel">
    <common-header
      @close-panel="closePanel"
      @save-setting="saveSetting"
      :is-edit="isEdit"
      title="表输入"
    />
    <div class="setting-body">
      <el-form :rules="rules" :model="formData" ref="formBox" label-position="right" label-width="100px" size="small">
        <el-form-item label="源表：" prop="sourceTable" required>
          <!--<el-select v-model="getTableName" @change="changeSourceTable" :disabled="!isEdit || !runEdit">
            <el-option :value="item.id" :label="item.name" v-for="item in filterSourceList" :key="item.id"></el-option>
          </el-select>-->
          <el-button type="primary" @click="showSelectTable" class="custom-btn">{{getSourceTableName}}</el-button>
        </el-form-item>
        <el-form-item label="选择表字段：" prop="tableData" required>
          <el-button type="primary" @click="showDialog" :disabled="!isEdit || !runEdit || !formData.sourceTable"  class="custom-btn">选择</el-button>
        </el-form-item>
        <div class="table-wrap" v-if="formData.tableData.length">
          <!--<div class="search-box">
            <el-input prefix-icon="el-icon-search" v-model="searchValue" clearable placeholder="请输入"></el-input>
          </div>-->
          <el-table :data="getTable" stripe border header-cell-class-name="th-style" style="width: 100%;" max-height="300">
            <el-table-column type="index" label="序号" width="50"></el-table-column>
            <el-table-column label="名称" prop="name"></el-table-column>
            <el-table-column label="类型" prop="type"></el-table-column>
            <el-table-column label="说明" prop="comment"></el-table-column>
            <el-table-column label="操作"  width="60" v-if="isEdit && runEdit">
              <template slot-scope="scope">
                <el-button type="text" @click="removeRow(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form>
    </div>
    <el-dialog :visible.sync="dialogVisible" width="45%" title="选择表字段" custom-class="dialog-box" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false" :append-to-body="true">
      <div class="table-wrap">
        <div class="search-box" style="width: 50%; padding-bottom: 15px;">
          <el-input v-model="dialogSearch" placeholder="请输入" prefix-icon="el-icon-search"
                    clearable @change="getSearchData">
            <el-button slot="append" type="success" v-on:click="getSearchData">搜索</el-button>
          </el-input>
        </div>
        <el-table :data="dialogSearchList" stripe border header-cell-class-name="th-style"
                  @selection-change="handleSelectionChange" ref="tableSelect" max-height="300">
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
          <el-input v-model="tableSelectSearch" placeholder="请输入搜索内容" prefix-icon="el-icon-search"
                    clearable>
            <!--<el-button slot="append" type="success" v-on:click="getSearchData">搜索</el-button>-->
          </el-input>
        </div>
        <el-table :data="filterSourceList" stripe border header-cell-class-name="th-style"
                  @selection-change="handleSelectionChange" ref="tableSelect" max-height="300">
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
import {mapState} from "vuex";
import CommonHeader from "./CommonHeader"
import request from "@/libs/request";
import moment from "moment";
export default {
  name: "TableInput",
  props:{
    runEdit: Boolean,
    default: true,
  },
  components: {
    CommonHeader
  },
  computed: {
    ...mapState({
      formData: state => state.tableInputSetting,
      diffData: state => state.tableDiffData,
      joinData: state => state.tableJoinData,
      isEdit: state => state.isEdit
    }),
    getTableField() {
      if(this.formData.tableData) {
        return this.formData.tableData;
      }else {
        return '选择';
      }
    },
    getSourceTableName() {
      console.log(this.sourceList);
      if(this.formData.sourceTable && this.sourceList.length) {
        let sourceTable = this.sourceList.find(item => item.id === this.formData.sourceTable);
        return sourceTable.name ;
      }else {
        return '选择';
      }
    },
    getTableName: {
      get(){
        if(this.formData.sourceTable){
          let bOn = this.sourceList.some(item => item.id === this.formData.sourceTable);
          if(bOn){
            return this.formData.sourceTable;
          }else{
            return "";
          }
        }else{
          return "";
        }
      },
      set(val){
        this.formData.sourceTable = val;
      }
    },
    getTable(){
      /*if(this.searchValue === ""){
        return this.formData.tableData;
      }else{
        return this.formData.tableData.filter(item => item.name.includes(this.searchValue));
      }*/
	    return this.formData.tableData;
    },
    filterSourceList(){
      return this.sourceList.filter( item => item.id !== this.diffData.diffTableName && item.id !== this.joinData.joinTableName && item.name.includes(this.tableSelectSearch));
    }
  },
  data(){
    const validTableColumn = (rule,value,callBack) => {
      let num = this.formData.tableData;
      if(num.length >= 1){
        callBack();
      }else{
        callBack(new Error("表字段不能为空"));
      }
    }
    return {
      rules: {
        sourceTable: [
          {required: true, message: "源表不能为空", trigger: "change"}
        ],
        tableData: [
          {validator: validTableColumn, trigger: "change"}
        ]
      },
      tableSelectVisible: false,
      currentSelectTable: "",
      tableSelectSearch: "",
      searchValue: "",
      dialogSearch: "",
      dialogVisible: false,
      dialogTableData: [],
      selectedData: [],
      allSelectData: [],
      sourceList: [],
      dialogSearchList: [],
    }
  },
  async created(){
    await this.getDataList();
    if(this.formData.sourceTable !== ""){
      await this.changeSourceTable("noReal");
    }
  },
  activated(){
    this.clearValidate();
  },
  methods: {
    //选择源表按钮事件
    showSelectTable() {
      this.tableSelectVisible = true;
      if(this.formData.sourceTable) {
        this.currentSelectTable = this.formData.sourceTable;
      }
    },
    //关闭源表弹窗按钮事件
    closeSelectTable() {
      this.tableSelectVisible = false;
      this.currentSelectTable = this.formData.sourceTable;

    },
    //确定选择的源表并关闭弹窗
    saveSelectTable() {
      if(!this.currentSelectTable) {
        this.$message.warning("请选择一张表");
        return;
      }
      this.formData.sourceTable = this.currentSelectTable;
      this.changeSourceTable();
      this.tableSelectVisible = false;
    },
    getSearchData(){ //选择字段搜索功能
      if(this.dialogSearch !== ""){
        this.dialogSearchList = this.dialogTableData.filter(item => item.column.includes(this.dialogSearch));
      }else{
        this.dialogSearchList = [...this.dialogTableData];
      }
      this.getDialogTableData();
    },
    clearValidate(){ //清除验证
      if(this.$refs.formBox){
        this.$refs.formBox.clearValidate();
      }
    },
    async getDataList(){ //获取列表数据
      try {
        let {status,data,message} = await request.get("/processing-core/source/getDatabaseSourceListByOrganization", {},
          {loading:true, loadingTitle: "获取源数据中……"});
        if(status === 200){
          this.sourceList = data;
          let bOn = this.sourceList.some(item => item.id === this.formData.sourceTable);
          if(!bOn){
            this.formData.sourceTable = "";
            this.formData.tableName = "";
            this.formData.tableData = [];
            this.$store.commit("changeInputData", this.formData);
          }

        }else{
          this.$message.warning(message);
        }
      }catch (e) {

      }
    },
    handleSelectionChange(val){ //选择字段选择事件
      this.selectedData = val;
    },
    showDialog(){ //打开选择字段弹窗
      this.dialogVisible = true;
      if(this.formData.tableData.length >=1 && !this.selectedData.length){
        this.getDialogTableData();
      }else{
        setTimeout(() => {
          this.$refs.tableSelect.clearSelection();
        },100);
      }
    },
    closePanel(){ //关闭面板
      this.$emit("close-panel");
      this.$refs.formBox.resetFields();
    },
    getDialogTableData(){ //获取弹窗数据
      setTimeout(() => {
        this.dialogSearchList.forEach(item => {
          let bOn = this.formData.tableData.some(table => table.name === item.name);
          if(bOn){
            this.$refs.tableSelect.toggleRowSelection(item,true);
          }else{
            this.$refs.tableSelect.toggleRowSelection(item,false);
          }
        });
      },100);
    },
    submitDialog(){ //保存数据
      //this.selectedData = [...this.allSelectData, ...this.selectedData];
      this.formData.tableData = [...this.selectedData];
      this.dialogVisible = false;
      //this.selectedData = [];
    },
    cancelDialog(){ //取消数据
      this.dialogVisible = false;
      this.selectedData = [];
    },
    removeRow(row){ //删除行
      this.formData.tableData = this.formData.tableData.filter(item => item.name !== row.name);
      this.$store.commit("changeInputData", this.formData);
    },
    async changeSourceTable(val){ //选择源表获取表字段
      try {
        /*if(!this.formData.tableName){
        }*/
        let table = this.sourceList.find(item => item.id === this.formData.sourceTable);
        this.formData.tableName = table.tableName;
        this.$store.commit("changeInputData", this.formData);
        let {status,message,data} = await request.get("/processing-core/source/columns/" + this.formData.sourceTable, {}, {
          loading: true,
          loadingTitle: "获取表字段数据中……"
        });
        if(status === 200 || status === 204){
          this.dialogTableData = data.map(item => {
            item.name = item.column;
            return item;
          });
          this.dialogSearchList = [...this.dialogTableData];
          if(val !== "noReal"){
            this.formData.tableData = [];
          }
        }else{
          this.$message.warning(message);
        }
      }catch (e) {

      }
    },
    async saveSetting(){ // 保存配置
      try {
        let formBox = this.$refs.formBox;
        let dataBase = this.sourceList.find(item => item.id === this.formData.sourceTable);
        formBox.validate(async valid => {
          if(valid){
            //let table = this.sourceList.find(item => item.id === this.formData.sourceTable);
            let params = {
              id: this.formData.flow.flowId,
              name: this.formData.flow.name,
              positionX: 0,
              positionY: 0,
              processingId:this.formData.processingId,
              properties: {
                databaseConnectionPoolingService: this.formData.sourceTable,
                columns: this.formData.tableData,
                tableName: this.formData.tableName,
                dataName: dataBase.name
              },
              templateId: this.formData.flow.templateId
            }
            let {status, message, data} = await request.put("/processing-core/node/updateNodeConfig", params, {
              loading: true,
              loadingTitle:"保存配置中……"
            });
            if(status === 200){
              this.$message.success("保存配置成功");
              this.$emit("close-panel",data);
            }else{
              this.$message.warning(message);
            }
          }else{
            this.$message.warning("请完善必填信息");
          }
        });
      }catch (e) {

      }
    },
    getTime(row,col,val) { //格式化时间
      return moment(val).format("YYYY-MM-DD HH:MM:ss");
    }
  }
}
</script>

<style lang="less" scoped>
  @import "../../assets/css/setting-panel.less";
  /*.submit-box {
    padding: 0 !important;
    margin-top: 20px;
    text-align: center;
  }*/
  /deep/ .custom-btn {
    width: 90% !important;
  }
</style>
