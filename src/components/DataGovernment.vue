<template>
  <div class="content-box">
    <div class="government-wrap">
      <div class="left">
        <el-input v-model="searchValue" prefix-icon="el-icon-search" clearable @keypress.native="searchTemplate" @change="searchTemplate" placeholder="请输入">
          <el-button slot="append">搜索</el-button>
        </el-input>
        <div class="tree-box">
          <!--<el-tree :data="componentList" :expand-on-click-node="false" default-expand-all node-key="id" ref="tree">
            <div class="tree-node" slot-scope="{node,data}" @mousedown="nodeAddEvent(node,data,$event)" :node-data="saveNode(data)">
              <p class="text">{{data.label}}</p>
            </div>
          </el-tree>-->
          <ul class="component-list">
            <li class="tree-node" :node-data="saveNode(item)" v-for="item in componentList" :key="item.id" style="border-bottom: 1px solid #999" :class="getDisabled(item)">
              <div style="padding: 10px 10px">
                <p style="height: 30px; line-height: 30px; padding: 0 10px; border-radius: 4px;"><i class="el-icon-setting" style="margin-right: 8px"></i>{{item.nameChn}}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="right" @click.stop="hideRightMenu">
        <div class="header">
          <h3>请拖拽工作节点创建工作流</h3>
          <div class="btn-box">
            <el-button type="success" @click="startRun" :disabled="!isEdit">运行</el-button>
            <!--<el-button @click="runResultMethod">执行结果</el-button>-->
            <el-button type="primary" @click="savePosition" :disabled="!isEdit">保存</el-button>
          </div>
        </div>
        <div id="flowBox">
          <div :id="'flow'+flow.flowId" class="flow-node" v-for="flow in flowList" :key="flow.flowId" :style="flow.style" @contextmenu.prevent.capture="showRightMenu(flow)" ref="flow">
            <p class="text">{{flow.label}}</p>
            <ul class="menu-list" v-show="flow.menu === 2">
              <li><el-button type="text" @click="openPanel(flow)">{{isEdit? '配置' : '查看配置'}}</el-button></li>
              <li v-if="isEdit && runEdit"><el-button type="text" @click="reName(flow)">重命名</el-button></li>
              <li v-if="isEdit && runEdit && flow.panel !== 'InputDatabaseTable' && flow.panel !== 'OutputDatabase'"><el-button type="text" @click="removeFlow(flow)">删除</el-button></li>
            </ul>
            <div class="success" v-if="flow.isValid && flow.columnsIsValid" title="配置成功">
              <i class="el-icon-success"></i>
            </div>
            <div class="error" v-else title="缺少配置">
              <i class="el-icon-warning"></i>
            </div>
          </div>
          <!--<div id="flow0.32378237238" class="flow-node" style="left:50px; top:20px;"></div>
          <div id="flow0.32378237236" class="flow-node" style="left:50px; top:100px;"></div>-->

        </div>
        <div class="mark-layout" v-if="statusLayout">
          <p class="tips" v-if="layout === 1">运行中，请耐心等待……</p>
          <div v-else-if="layout === 2" style="text-align: center">
            <p class="tips">
              <i class="el-icon-success"></i>
              运行成功
            </p>
            <el-button type="success" @click="returnList">返回治理列表</el-button>
          </div>
          <div style="text-align: center" v-else-if="layout === 3">
            <p class="tips error">
              <i class="el-icon-error"></i>
              运行失败
            </p>
            <el-button type="success" @click="startEdit">继续编辑</el-button>
          </div>
        </div>
        <transition name="run">
          <div class="run-result" v-if="runBon">
            <div class="header">
              <p class="title">{{runResult.title}}</p>
              <el-button type="warning" icon="el-icon-close" circle @click="runBon=false"></el-button>
            </div>
            <div class="result-main">
              <el-table :data="runResult.tableData" stripe border header-cell-class-name="th-style">
                <el-table-column label="开始时间" prop="startTime" :formatter="getTime"></el-table-column>
                <el-table-column label="结束时间" prop="endTime" :formatter="getTime"></el-table-column>
                <el-table-column label="执行结果" prop="result">
                  <template slot-scope="scope">
                    <el-tag type="success" v-if="scope.row.result">成功</el-tag>
                    <el-tag type="warning" v-else-if="scope.row.result === null">运行中</el-tag>
                    <el-tag type="error" v-else>失败</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="源端抽取数据量" prop="sourceNum"></el-table-column>
                <el-table-column label="目的端写入数据量" prop="targetNum"></el-table-column>
              </el-table>
            </div>
            <div class="page">
              <el-pagination
                  @current-change="handleCurrentTwoChange"
                  :current-page="resultCurrent"
                  :page-size="10"
                  layout="total, prev, pager, next, jumper"
                  :total="resultTotal">
              </el-pagination>
            </div>
          </div>
        </transition>
        <transition name="setting">
          <!--<keep-alive>
            <component :is="getSettingPanel" v-if="showPanel" @close-panel="closePanel" ref="setting" :run-edit="runEdit"  :class="{move: isMove}"></component>
          </keep-alive>-->
          <component :is="getSettingPanel" v-if="showPanel" @close-panel="closePanel" ref="setting" :run-edit="runEdit"  :class="{move: isMove}"></component>

        </transition>
	      <transition name="setting">
		      <div class="panel-layout" v-if="showPanel && assemblyUpload">
			      <el-button @click="closeAllPanel">关闭</el-button>
			      <div class="tips">组件已升级，请删除后重新拖入。</div>
		      </div>
	      </transition>
      </div>
    </div>
    <el-dialog :visible.sync="dialogVisible" width="50%" :title="dialogTitle" custom-class="dialog-box" :close-on-click-modal="false" :close-on-press-escape="false" >
      <component :is="dialogType" :form-data="dataTraceList"></component>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisibleTwo" width="35%" title="结果选择" custom-class="dialog-box" :close-on-click-modal="false" :close-on-press-escape="false" @close="addLineData" >
      <div style="display: flex;">
        <div v-for="item in sourcePortIdArray" :key="item.id" style="padding: 10px; flex: 1 1 auto;">
          <el-radio v-model="formData.sourcePortId" :label="item.id" >{{item.nameCHN}}</el-radio>
        </div>
      </div>
      <!--<div class="ok-btn" style="padding-top: 20px; text-align: center">
        <el-button type="primary" @click="closeSourcePortId">确定</el-button>
      </div>-->
    </el-dialog>
    <!--新增流程输入名称-->
    <el-dialog :visible.sync="precessDialog" width="35%" custom-class="dialog-box" :close-on-click-modal="false" :close-on-press-escape="false" title="新增治理流程"  :show-close="true" @close="cancelNewAdd">
      <el-form :model="precessFormData" ref="newPrecess" label-width="140px" label-position="right" :rules="newRules" @submit.native.prevent>
        <el-form-item label="治理名称：" prop="name">
          <el-input v-model="precessFormData.name" placeholder="请输入" style="width: 85%" @keyup.native.enter="saveNewAdd"></el-input>
        </el-form-item>
        <div class="submit-box">
          <el-button type="primary" @click="saveNewAdd">确定</el-button>
          <el-button @click="cancelNewAdd">取消</el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import $ from "jquery";
import moment from "moment";
import "jquery-ui/ui/widgets/draggable"
import "jquery-ui/ui/widgets/droppable"
import "jquery-ui/themes/base/all.css"
import {jsPlumb, jsPlumbInstance} from 'jsplumb'
import Vue from "vue";
import {mapState} from "vuex";
import request from "@/libs/request";
import TableInput from "@/components/flow-setting/TableInput";
import EnumMapping from "@/components/flow-setting/EnumMapping";
import RuleFilter from "@/components/flow-setting/RuleFilter";
import RuleUpdate from "@/components/flow-setting/RuleUpdate";
import OutputSetting from "@/components/flow-setting/OutPut";
import ApiInput from "@/components/flow-setting/ApiInput";
import ApiOutPut from "@/components/flow-setting/ApiOutput";
import TableJoin from "@/components/flow-setting/TableJoin";
import TableDiff from "@/components/flow-setting/TableDiff";
export default {
  name: "DataGovernment",
  props: {
    "currentId": String,
  },
  computed: {
    ...mapState({
      tableInputSetting: state => state.tableInputSetting,
      enumMappingSetting: state => state.enumMappingSetting,
      ruleFilterSetting: state => state.ruleFilterSetting,
      ruleUpdateSetting: state => state.ruleUpdateSetting,
      outputSetting: state => state.outputSetting,
      apiInputSetting: state => state.apiInputData,
      apiOutputSetting: state => state.apiOutputData,
      tableJoinSetting: state => state.tableJoinData,
      tableDiffSetting: state => state.tableDiffData,
      isEdit: state => state.isEdit
    }),

    getFlowElement(){
      if(this.$refs.flow || this.$refs.flow.length){
        return this.$refs.flow
      }else{
        return null;
      }
    },
    dialogTitle(){
      if(this.dialogType === "DataTrace"){
        return "数据追溯"
      }
    },
    getSettingPanel(){
      if(this.panelType === "input"){
        return "TableInput";
      }else if(this.panelType === "enum"){
        return "EnumMapping";
      }else if(this.panelType === "rule"){
        return "RuleFilter";
      }else if(this.panelType === "update"){
        return "RuleUpdate";
      }else if(this.panelType === "output"){
        return "OutputSetting"
      }else if(this.panelType === "apiInput"){
        return "ApiInput";
      }else if(this.panelType === "apiOutput"){
        return "ApiOutPut";
      }else if(this.panelType === "tableJoin"){
        return "TableJoin";
      }else if(this.panelType === "tableDiff"){
        return "TableDiff";
      }
    }
  },
  components: {
    TableInput,
    EnumMapping,
    RuleFilter,
    RuleUpdate,
    OutputSetting,
    ApiInput,
    ApiOutPut,
    TableJoin,
    TableDiff
  },
  data(){
    const repeatName = async(rule,value,callBack) => {
      let {status} = await request.post("/processing-core/processing/selectByName", {name:value});
      if(status === 200){
        callBack();
      }else{
        callBack(new Error("治理名称已经存在"));
      }
    };
    return {
      isMove: true,
	    assemblyUpload: false,
      newRules: {
        name: [
          {required: true, message: "流程名称不能为空", trigger: "blur"},
          {max: 50, message: "流程名称长度不能超过50", trigger: "blur"},
          {pattern: /^[^\s]+$/ ,message: "流程名称不能包含空格", trigger: "change"},
          {validator:repeatName, trigger: "blur"}
        ]
      },
      newStatus: true,
      precessDialog:false,
      precessFormData: {
        name: ""
      },
      statusLayout: false,
      layout: 1,
      resultCurrent: 1,
      resultTotal: 0,
      inputId: "",
      dataTraceList: [],
      panelType: "InputDatabaseTable",
      showPanel: false,
      dialogVisibleTwo: false,
      allowApi: true,
      allowDatabase: true,
      formData: {
        destinationNodeId: "",
        destinationPortId: "",
        processingId: "",
        sourceNodeId: "",
        sourcePortId: ""
      },
      currentLine: {

      },
      sourcePortIdArray: [],
      defaultOption: {
        label: "nameChn",
        children: "children",
      },
      id: "",
      dialogVisible: false, //弹窗变量
      dialogType: "DataTrace",
      runBon: false, //显示执行结果变量
      flowMap: null,
      searchValue: "",
      componentList: [
        {
          id: Math.random(),
          label: "组件列表",
          master: true,
          children: []
        },
      ],
      flowList: [

      ], //右边图形数据列表
      common: {
        isSource: false,
        isTarget: false,
        connector: ['Flowchart'],
      },
      lineList: [],
      runResult: { //组件执行结果数据
        title: "组件执行结果",
        tableData: [
          {
            startTime: new Date(),
            endTime: new Date(),
            result: "成功",
            sourceNum: 10000,
            targetNum: 20000
          }
        ]
      },
      runEdit: true,
    }
  },
  watch: {

  },
  created(){
    this.showPanel = false;
  },
  async mounted(){
    if(this.currentId){
      this.id = this.currentId;
      await this.getFlowData();
      this.getComponents();
    }else{
      await this.newAddName();
      this.getComponents();
    }
    this.panelChangeSize();
  },
  methods: {
	  closeAllPanel() {
	  	this.showPanel = false;
	  	this.assemblyUpload = false;
	  },
    closeAddDialog(e) {
    },
    hideRightMenu(){
      this.flowList.forEach(item => {
        item.menu = 1;
      });
    },
    async searchTemplate(){ //模糊搜索模板
      try {
        let {data,message,status} = await request.get("/processing-core/template/getTemplateList", {
          name: this.searchValue ? this.searchValue : null
        }, {
          loading: true,
          loadingTitle: "获取流程组件数据中……"
        });
        if(status === 200){
          this.componentList = data.map(item => {
            item.label = item.nameChn;
            return item;
          });
        }else if(status === 204){
          this.componentList = [];
        }else{
          this.$message.warning(message);
        }
      }catch (e) {

      }
    },
    testFlow(flow){

    },
    returnList(){ //返回治理列表
      this.$emit("close-add");
    },
    handleCurrentTwoChange(val){ //执行结果换页
      this.resultCurrent = val;
      this.getResult();
    },
    async openPanel(flow){ //打开编辑面板
	  	console.log(flow);
      if(this.showPanel === true){
        this.$message.warning("请先保存或者关闭已有的配置项");
        return;
      }else{
        if(flow.panel === "InputDatabaseTable"){  //等于输入
          this.tableInputSetting.flow = flow;
          this.tableInputSetting.processingId = this.id;
          this.inputId = flow.flowId;
          await this.getInputDatabaseTable();
          this.panelType = "input";
        }else if(flow.panel === "PropertiesLookupBasedColumnReplace"){ //等于枚举映射
          this.enumMappingSetting.flow = flow;
          this.enumMappingSetting.processingId = this.id;
          this.getEnumData();
          this.panelType = "enum";
        }else if(flow.panel === "RuleBasedFiltering"){
          this.ruleFilterSetting.processingId = this.id;
          this.ruleFilterSetting.flow = flow;
          this.getRuleFilterData(flow.flowId);
          this.panelType = "rule";
        }else if(flow.panel === "RuleBasedUpdateColumn"){
          this.ruleUpdateSetting.processingId = this.id;
          this.ruleUpdateSetting.flow = flow;
          this.getRuleBasedUpdate(flow.flowId);
          this.panelType = "update";
        }else if(flow.panel === "OutputDatabase"){
          this.outputSetting.processingId = this.id;
          this.outputSetting.flow = flow;
          this.getOutPutData(flow.flowId);
          this.panelType = "output";
        }else if(flow.panel === "InputApi"){
          this.apiInputSetting.processingId = this.id;
          this.apiInputSetting.flow = flow;
          this.getApiInputData();
          this.panelType = "apiInput"
        }else if(flow.panel === "OutputApi"){
          this.apiOutputSetting.processingId = this.id;
          this.apiOutputSetting.flow = flow;
          this.getApiOutputData();
          this.panelType = "apiOutput";
        }else if(flow.panel === "MergeJoin"){
          this.panelType = "tableJoin";
          this.tableJoinSetting.processingId = this.id;
          this.tableJoinSetting.flow = flow;
          this.getTableJoinData();
        }else if(flow.panel === "DataComparison"){
          this.panelType = "tableDiff";
          this.tableDiffSetting.processingId = this.id;
          this.tableDiffSetting.flow = flow;
          this.getTableDiffData()
        }
        if(flow.templateDeprecated) {
        	this.assemblyUpload = flow.templateDeprecated;
        }else {
	        this.assemblyUpload = false;
        }
        this.showPanel = true;
        if(this.$refs.setting){
          setTimeout(() =>{
            if(this.$refs.setting.clearValidate){
              this.$refs.setting.clearValidate();
            }
          },200);
        }
      }

    },
    async closePanel(data){
      /*if(data && data.id){
        this.flowList = this.flowList.map(item => {
          if(item.id === data.id){
            if(item.panel === "OutputDatabase"){
              this.getFlowData(true);
            }
            item = {
              ...item,
              ...data
            }
          }
          return item;
        });
      }*/
      this.getFlowData();
      await this.savePositionNoTips();
      this.showPanel = false;
    },
    getTableDiffData(){
      this.getInputDatabaseTable();
      if(this.tableDiffSetting.flow && this.tableDiffSetting.flow.configJson){
        this.tableDiffSetting.diffTableName = this.tableDiffSetting.flow.configJson.databaseConnectionPoolingService;
        this.tableDiffSetting.diffTableColumn = this.tableDiffSetting.flow.configJson.columns.map(item => {
          item.name = item.column;
          return item;
        });
        this.tableDiffSetting.relatedColumn = this.tableDiffSetting.flow.configJson.foreignKeyPairs.map(item => {
          let sourceTable = item.sourceTable.uuid;
          let bOn = true;
          if(this.tableDiffSetting.flow.inputColumnEntitiesJson && this.tableDiffSetting.flow.inputColumnEntitiesJson.length) {
            bOn = this.tableDiffSetting.flow.inputColumnEntitiesJson.some(json => json.uuid === sourceTable);
          }else {
            bOn = false;
          }
          return  {
            sourceTable: bOn ? item.sourceTable.uuid : '',
            diffTable: item.joinTable.uuid
          }

        });
        this.tableDiffSetting.diffList = this.tableDiffSetting.flow.configJson.comparisonKeyPairs.map(item => {
          let sourceTable = item.sourceTable.uuid;
          let bOn = true;
          if(this.tableDiffSetting.flow.inputColumnEntitiesJson && this.tableDiffSetting.flow.inputColumnEntitiesJson.length) {
            bOn = this.tableDiffSetting.flow.inputColumnEntitiesJson.some(json => json.uuid === sourceTable);
          }else {
            bOn = false;
          }

          return {
            sourceTable: bOn ?  item.sourceTable.uuid : '',
            diffTable: item.joinTable.uuid
          }
        });
        this.tableDiffSetting.tableName = this.tableDiffSetting.flow.configJson.tableName;
        this.tableDiffSetting.ruleName = this.tableDiffSetting.flow.configJson.comparisonResult;

      }else{
        this.tableDiffSetting.diffTableName = "";
        this.tableDiffSetting.diffTableColumn = [];
        this.tableDiffSetting.relatedColumn = [
          {id: Math.random(),sourceTable: "", diffTable: "", delete: false}
        ];
        this.tableDiffSetting.diffList = [
          {id: Math.random(),sourceTable: "", diffTable: "", delete: false}
        ];
        this.tableDiffSetting.tableName = "";
        this.tableDiffSetting.ruleName = "";
      }
      this.$store.commit("changeTableDiffData",this.tableDiffSetting);
    },
    getApiInputData(){ //获取接口输入面板数据
      if(this.apiInputSetting.flow && this.apiInputSetting.flow.configJson){
        this.apiInputSetting.interfaceName = this.apiInputSetting.flow.configJson.id;
      }else{
        this.apiInputSetting.interfaceName = "";
      }
      this.$store.commit("changeApiInputData",this.apiInputSetting);
      setTimeout(() =>{
        if(this.$refs.setting){
          this.$refs.setting.clearValidate();
        }
      })
    },
    getApiOutputData(){
      if(this.apiOutputSetting.flow && this.apiOutputSetting.flow.configJson){
        this.apiOutputSetting.theme = this.apiOutputSetting.flow.configJson.topicId;
      }else{
        this.apiOutputSetting.theme = "";
      }
      this.$store.commit("changeApiOutputData",this.apiOutputSetting);
      setTimeout(() =>{
        if(this.$refs.setting){
          this.$refs.setting.clearValidate();
        }
      },500);
    },
    async getTableJoinData(){
      this.getInputDatabaseTable();
      if(this.tableJoinSetting.flow && this.tableJoinSetting.flow.configJson){
        this.tableJoinSetting.joinTableName = this.tableJoinSetting.flow.configJson.databaseConnectionPoolingService;
        this.tableJoinSetting.joinTableColumn = this.tableJoinSetting.flow.configJson.columns.map(item => {
          item.name = item.column;
          return item;
        });
        this.tableJoinSetting.tableName = this.tableJoinSetting.flow.configJson.tableName;
        let foreKeys = Object.keys(this.tableJoinSetting.flow.configJson.foreignKeyPairs);
        let foreignKeyPairs = this.tableJoinSetting.flow.configJson.foreignKeyPairs;
        if(foreKeys && foreKeys.length >=1){
          this.tableJoinSetting.joinList = foreKeys.map(key => {
            let bOn = true;
            if(this.tableJoinSetting.flow.inputColumnEntitiesJson && this.tableJoinSetting.flow.inputColumnEntitiesJson.length) {
              bOn = this.tableJoinSetting.flow.inputColumnEntitiesJson.some(item => item.uuid === foreignKeyPairs[key]);
            }else {
              bOn = false;
            }
            return {
              "id": Math.random(),
              "joinTable": key,
              "sourceTable": bOn ? foreignKeyPairs[key] : '',
              "delete": false
            }
          });
        }
      }else{
        this.tableJoinSetting.joinTableName = "";
        this.tableJoinSetting.joinTableColumn = [];
        this.tableJoinSetting.joinList = [
          {id: Math.random(),sourceTable: "", joinTable: "", delete: false}
        ];
        this.tableJoinSetting.tableName = "";
      }
      this.$store.commit("changeTableJoinData", this.tableJoinSetting);
    },
    async getOutPutData(id){
      this.getInputDatabaseTable(true);
      let objJoin  =this.flowList.find(item => item.panel === "MergeJoin");
      if(objJoin && objJoin.configJson){
        this.tableJoinSetting.joinTableColumn = objJoin.configJson.columns.map(item => {
          item.name = item.column;
          item.id = Math.random();
          return item;
        });
      }else{
        this.tableJoinSetting.joinTableColumn = [];
      }
      this.$store.commit("changeTableJoinData", this.tableJoinSetting);

      let objDiff = this.flowList.find(item => item.panel === "DataComparison");
      if(objDiff && objDiff.configJson && objDiff.configJson.columns){
        this.tableDiffSetting.diffTableColumn = objDiff.configJson.columns.map(item => {
          item.name = item.column;
          return item;
        });
      }else{
        this.tableDiffSetting.diffTableColumn = [];
      }
      this.$store.commit("changeTableDiffData", this.tableDiffSetting);
      if(this.outputSetting.flow.configJson){
      	if(this.outputSetting.flow.configJson.primaryKeys && this.outputSetting.flow.configJson.primaryKeys.length) {
      		this.outputSetting.primaryKey = this.outputSetting.flow.configJson.primaryKeys[0].uuid;
	      }else {
		      this.outputSetting.primaryKey = "";
	      }
        this.outputSetting.sourceTable =this.outputSetting.flow.configJson.columnMappingList.map(item => {
          let oData = {
            id: Math.random(),
            ...item,
            originName: item.rename ? item.rename : "",
            setLength: item.length ? item.length : "",
            name: item.rename ? item.rename : item.originName ? item.originName : "",
          }
          return oData;
        });
        this.outputSetting.sourceTable = this.outputSetting.sourceTable.filter(item => {
          let bOn = true;
          if(this.outputSetting.flow.inputColumnEntitiesJson && this.outputSetting.flow.inputColumnEntitiesJson.length) {
            bOn = this.outputSetting.flow.inputColumnEntitiesJson.some(json => json.column === item.originName);
          } else {
            bOn = false;
          }
          return bOn;
        });
        this.outputSetting.realSourceTable = this.outputSetting.sourceTable.filter(item => !item.delete);
        this.outputSetting.theme = this.outputSetting.flow.configJson.topicId;
        this.outputSetting.tableName = this.outputSetting.flow.configJson.tableName;
        if(this.outputSetting.flow.configJson.timeStrategy &&  this.outputSetting.flow.configJson.timeStrategy.schedulingStrategy === "CRON_DRIVEN"){
          this.outputSetting.updateMethod = 2
        }else{
          this.outputSetting.updateMethod = 1
        }
        if(this.outputSetting.updateMethod === 2){
          if(this.outputSetting.flow.configJson.timeStrategy.schedule.strategy.toUpperCase() === "WEEK"){
            this.outputSetting.updateCycle = 3;
          }else if(this.outputSetting.flow.configJson.timeStrategy.schedule.strategy.toUpperCase() === "YEAR"){
            this.outputSetting.updateCycle = 1;
          }else if(this.outputSetting.flow.configJson.timeStrategy.schedule.strategy.toUpperCase() === "DAY"){
            this.outputSetting.updateCycle = 4;
          }else if(this.outputSetting.flow.configJson.timeStrategy.schedule.strategy.toUpperCase() === "MONTH"){
            this.outputSetting.updateCycle = 2;
          }
          this.outputSetting.month = this.outputSetting.flow.configJson.timeStrategy.schedule.month || "";
          this.outputSetting.week = this.outputSetting.flow.configJson.timeStrategy.schedule.dayOfWeek || "";
          this.outputSetting.date = this.outputSetting.flow.configJson.timeStrategy.schedule.dayOfMonth || "";
          this.outputSetting.specificTime = this.outputSetting.flow.configJson.timeStrategy.schedule.timeOfDay || "";
        }
      }else{
        this.outputSetting.sourceTable = [];
        this.outputSetting.realSourceTable = [];
        this.outputSetting.theme = "";
        this.outputSetting.tableName = "";
        this.outputSetting.updateMethod = 1;
        this.outputSetting.updateCycle = "";
        this.outputSetting.month = "";
        this.outputSetting.week = "";
        this.outputSetting.date = "";
        this.outputSetting.specificTime = "";
      }
      this.$store.commit("changeOutputData", this.outputSetting);
      setTimeout(() =>{
        if(this.$refs.setting){
          this.$refs.setting.clearValidate();
        }
      },500);
    },
    async getRuleBasedUpdate(id){ //获取字段更新过滤数据
      this.getInputDatabaseTable();
      if(this.ruleUpdateSetting.flow.configJson){
        this.ruleUpdateSetting.tableData = this.ruleUpdateSetting.flow.configJson.rules.map(item => {
          let inputField = item.lookupPath.column;
          let bOn = false;
          if(this.ruleUpdateSetting.flow.inputColumnEntitiesJson && this.ruleUpdateSetting.flow.inputColumnEntitiesJson.length) {
            bOn = this.ruleUpdateSetting.flow.inputColumnEntitiesJson.some(item => item.column === inputField);
          }else {
            bOn = false;
          }
          return {
            id: Math.random(),
            ruleName: item.ruleName,
            inputField: bOn ? item.lookupPath.column : "",
            regExp: item.ruleRegex,
            replaceString: item.replacement,
            type: item.type,
            currentField: item.lookupPath,
            delete: item.delete,
            replaceRule: item.ruleId ? item.ruleId : ""
          }
        });
      }else{
        this.ruleUpdateSetting.tableData = [];
      }
      this.$store.commit("changeRuleUpdateData", this.ruleUpdateSetting);
      setTimeout(() => {
        if(this.$refs.setting){
          this.$refs.setting.clearValidate();
        }
      },500);
    },
    async getRuleFilterData(id){ //获取规则过滤数据
      this.getInputDatabaseTable();
      if(this.ruleFilterSetting.flow.configJson){
        this.ruleFilterSetting.tableData = this.ruleFilterSetting.flow.configJson.rules.map(item => {
          return {
          	id: Math.random(),
            tableField: item.lookupPath.uuid,
            ruleName: item.ruleName,
            reg: item.ruleRegex,
            isDelete: item.delete,
            currentField: item.lookupPath,
	          searchValue: '',
	          currentSelectTable: '',
	          selectFieldsVisible: false
          }
        });
        if(this.ruleFilterSetting.tableData && this.ruleFilterSetting.tableData.length) {
          this.ruleFilterSetting.tableData = this.ruleFilterSetting.tableData.filter (item => {
            let bOn = true;
            if(this.ruleFilterSetting.flow.inputColumnEntitiesJson && this.ruleFilterSetting.flow.inputColumnEntitiesJson.length) {
              bOn = this.ruleFilterSetting.flow.inputColumnEntitiesJson.some(flow => {
                return item.tableField === flow.uuid;
              });
            }else {
              bOn = false;
            }
            return bOn;
          })
        }
      }else{
        this.ruleFilterSetting.tableData = [];
      }
      this.$store.commit("changeRuleFilterData", this.ruleFilterSetting);
      setTimeout(() => {
        if(this.$refs.setting){
          this.$refs.setting.clearValidate();
        }
      },500);
    },
    getEnumData(){  //获取枚举映射
      this.getInputDatabaseTable();
      if(this.enumMappingSetting.flow && this.enumMappingSetting.flow.configJson){
        this.enumMappingSetting.name = this.enumMappingSetting.flow.configJson.column.column;
        let bOn = this.enumMappingSetting.flow.inputColumnEntitiesJson.some(item => item.column === this.enumMappingSetting.name );
        if(!bOn) {
          this.enumMappingSetting.name = '';
        }
        this.enumMappingSetting.tableData = this.enumMappingSetting.flow.configJson.simpleKeyValueLookup.mapping.map(item => {
          return {
            id: Math.random(),
            val: item.key,
            mapVal: item.value,
            delete: item.delete
          }
        });
      }else{
        this.enumMappingSetting.name = "";
        this.enumMappingSetting.tableData= [{
          id: Math.random(),
          val: "",
          mapVal: "",
          delete: false
        }];
      }
      this.$store.commit("changeEnumMappingData" ,this.enumMappingSetting);
      setTimeout(() => {
        if(this.$refs.setting){
          this.$refs.setting.clearValidate();
        }
      },500);
    },
    async getInputDatabaseTable(sum){ //获取表输入数据
      try {
        if(!this.inputId || this.inputId === ""){
          let inputObject = this.flowList.find(item => item.name.includes("InputDatabaseTable"));
          this.inputId = inputObject.flowId;
        }
        let url = "/processing-core/node/"+this.inputId;
        if(sum){
          url += "?outWay=true"
        }
        let {data, status, message} = await request.get(url, {}, {
          loading: true,
          loadingTitle: "获取流程配置中……"
        });
        if(status === 200){
          if(data.configJson){
            this.tableInputSetting.sourceTable = data.configJson.databaseConnectionPoolingService;
            this.tableInputSetting.tableData = data.configJson.columns.map(item => {
              item.name = item.column;
              return item;
            });
            this.tableInputSetting.tableName = data.configJson.tableName;
          }else{
            this.tableInputSetting.sourceTable = "";
            this.tableInputSetting.tableData = [];
            this.tableInputSetting.tableName = "";
          }
          this.$store.commit("changeInputData", this.tableInputSetting);
          setTimeout(() => {
            if(this.$refs.setting){
              this.$refs.setting.clearValidate();
            }
          },500);
        }else if(status === 204){
          this.$store.commit("changeInputData", this.tableInputSetting);
        }else{
          this.$message.warning(message);
        }
      }catch (e) {

      }
    },
    initComponent(noInit){ //初始化组件
      const that = this;
      $(".component-list .tree-node").not('.disabled').draggable({
        addClasses: false,
        scope: "plant",
        helper: "clone",
      });
      $("#flowBox").droppable({
        scope: "plant",
        drop: function (event, ui) {
          // 创建工厂模型到拖拽区
          event.preventDefault();
          let offset = ui.offset;
          let iLeft = offset.left - $("#flowBox").offset().left;
          let iTop = offset.top - $("#flowBox").offset().top;
          let data = JSON.parse($(ui.helper.context).attr("node-data"));
          let bOn = that.flowList.some(item => item.type === data.type);
          data.style= {
            left: iLeft,
            top: iTop
          }
          if(bOn && (data.type=== 0 || data.type === 2)){
            that.$message.warning("输入和输出节点一个流程分别各自只能有一个！");
            return;
          }
          that.addNewNode(data);
        }
      });
      /*$(window).on("click",function () {
        that.flowList.forEach(item => {
          if(item.menu){
            item.menu = 1;
          }
        })
      });*/
      if(!noInit){
        that.initFlowMap();
      }
    },
    async addNewNode(oData){ //添加流程
      try{
        let {data,status,message} = await request.post("/processing-core/node/addNode", {
          name: oData.label+ "_" + oData.name,
          templateId: oData.id,
          processingId: this.id,
          positionX: oData.style.left,
          positionY: oData.style.top,
          type: oData.type
        }, {loading:true, loadingTitle:"添加节点中……"});
        if(status === 200){
          let names = data.name.split("_");
          data = {
            ...data,
            flowId: data.id,
            eleId: 'flow'+data.id,
            label: names[0],
            panel: names[1],
            menu: 1,
            style: {
              left: data.positionX +"px",
              top: data.positionY + "px"
            }
          }
          let oldLength = this.flowList.length ? this.flowList.length : 0;
          this.flowList.push(data);
          let newLength = this.flowList.length ? this.flowList.length : 0;
          if(oldLength === 0 && newLength === 1){
            this.getFlowData();
          }
          setTimeout(() => {
            this.addPoint();
          },200);
        }else{
          this.$message.warning(message);
        }
      }catch (e) {

      }
    },
    closeSourcePortId(){ //关闭输出选择弹窗
      this.dialogVisibleTwo = false;

    },
    async addLineData(){ //创建连线数据
      try {
        let {data,message,status} = await request.post("/processing-core/link/createLink", this.formData, {
          loading: true,
          loadingTitle: "正在创建连线"
        });
        if(status === 200){
          this.currentLine = {
            ...this.currentLine,
            ...data
          }
          this.lineList.push(this.currentLine);
          this.savePositionNoTips();
          this.getFlowData();
        }else{
          this.$message.warning(message);
        }
      }catch (e) {
      }
    },
    async newAddName(){ //创建治理流程
      this.precessDialog = true;
      this.newStatus = false;
    },
    saveNewAdd(){ //确定保存按钮事件
      this.$refs.newPrecess.validate(async valid => {
        if(valid){
          try {
            let {data,status,message} = await request.post("/processing-core/processing/createProcessing",{name: this.precessFormData.name}, {
              loading: true,
              loadingTitle: "保存新建治理流程"
            });
            if(status === 200 && data){
              this.id = data.id;
              this.$message.success("新建治理流程成功");
              this.initComponent();
              this.newStatus = true;
              this.precessDialog = false;
            }else{
              this.$message.warning(message);
            }
          }catch (e) {

          }
        }else{
          this.$message.warning("请按规则完善字段");
        }
      });
    },
    cancelNewAdd(){ //取消新建按钮事件
      this.$refs.newPrecess.resetFields();
      if(!this.newStatus) {
        this.$emit("close-add");
      }
    },
    async initFlowMap(){ //初始化流程图
      const than = this;
      jsPlumb.ready(function () {
        than.flowMap = jsPlumb.getInstance({
          DragOptions: { cursor: 'pointer', zIndex: 2000 },
          PaintStyle: { stroke: 'green', strokeWidth: 4 },
          Endpoint: ["Dot", {radius: 8}],
          EndpointStyle : { fill : "red" }, //这个是控制连线终端那个小点的样式
          Connector: ["Bezier",{curviness:20}],
          connectorOverlays: [["Arrow", { width: 10, length: 10, location: 1 }]],
        });
        than.flowMap.setContainer("flowBox");
        jsPlumb.setContainer("flowBox");
        than.flowMap.bind('beforeDrop', function (info) {
          if(info.targetId === info.sourceId){
            return false;
          }else{
            let bOn = than.lineList.some(item => item.source === info.sourceId || item.target === info.targetId);
            if(bOn){
              than.$message.warning("已运行完成，不可连接新线");
              return false
            }else{
              if(!than.runEdit){
                than.$message.warning("流程不可编辑");
                return false;
              }
              let oSource = than.flowList.find(item => item.eleId === info.sourceId);
              let oTarget = than.flowList.find(item => item.eleId === info.targetId);
              than.currentLine = {
                target: info.targetId,
                source: info.sourceId
              };
              than.formData.processingId = than.id;
              than.formData.sourceNodeId = oSource.flowId;
              than.formData.destinationNodeId = oTarget.flowId;
              if(oTarget.inputPortJson && oTarget.inputPortJson.length){
                than.formData.destinationPortId = oTarget.inputPortJson[0].id;
              }else{
                than.$message.warning("没有目标点");
                return false;
              }
              //than.formData =
              if(oSource.outputPortJson){
                //let isOutput = oSource.outputPortJson.some(item => item.type.toUpperCase().startsWith("OUTPUT"));
                /*if(isOutput){
                  let source = oSource.outputPortJson.find(item => item.name.toUpperCase().startsWith("SUCCESS"));
                  if(source){
                    than.formData.sourcePortId = source.id;
                  }else{
                    than.$message.warning("没有成功匹配信息");
                    return false;
                  }


                }else{
                  than.formData.sourcePortId = oSource.outputPortJson[0].id;
                }*/
                than.sourcePortIdArray = oSource.outputPortJson;
                than.sourcePortIdArray = than.sourcePortIdArray.filter(item => !item.name.startsWith("Failure"));
                than.formData.sourcePortId = than.sourcePortIdArray[0].id;
                if(than.sourcePortIdArray.length > 1){
                  than.dialogVisibleTwo = true;
                }else{
                  than.addLineData();
                }
              }else{
                than.$message.warning("没有输出点");
                return false;
              }
              return true;
            }
          }
        });
        /*than.flowMap.bind("dblclick",(conn,originalEvent) =>{

        });*/
        than.flowMap.bind("beforeDetach",conn =>{
          if(than.runEdit && than.isEdit){
            than.currentLine = {
              target: conn.targetId,
              source: conn.sourceId
            };
            let line = than.lineList.find(item => {
              return item.target === conn.targetId || item.source ===conn.sourceId;
            });
            than.deleteLine(line.id);
            return true;
          }else{
            than.$message.warning("已运行完成，不可删除连线");
            return false;
          }
        });

        setTimeout(() =>{
          than.addPoint(true);
        },200);
      });

    },
    addPoint(first){
      if(this.isEdit){
        if(!first){
          let size = $(".flow-node").size();
          if(size >= 1){
            this.flowMap.draggable($('.flow-node').eq(size-1), {
              containment: 'flowBox'
            });
          }
        }else{
          //this.flowMap.draggable($('.flow-node')[0]);
          try {
            this.flowList.forEach(item => {
              this.flowMap.draggable(item.eleId, {
                containment: 'flowBox'
              });
            });
          }catch (e) {

          }
        }
      }
      this.flowList.forEach((item,index) => {
        if(item.type === 0){
          let option = {
            isSource: true,
            maxConnections: 1,
            pointStyle: {fill: "yellow"},
            endpointStyle: {fill: "red"},
            connectorOverlays: [["Arrow", { width: 10, length: 10, location: 1 }]]
          }
          this.flowMap.addEndpoint(item.eleId,{
            anchors: ["Bottom"],
          },option);
        }else if(item.type === 2){
          let option = {
            isTarget: true,
            maxConnections: 1,
            endpointStyle:  {fill: "yellow"},
            connectorOverlays: [["Arrow", { width: 10, length: 10, location: 1 }]]
          }
          this.flowMap.addEndpoint(item.eleId,{
            anchors: ["Top"],
          },option);
        }else{
          let option = {
            isTarget: true,
            endpointStyle: {fill: "yellow"},
            maxConnections: 1,
            connectorOverlays: [["Arrow", { width: 10, length: 10, location: 1 }]]
          }
          this.flowMap.addEndpoint(item.eleId,{
            anchors: [ "Top"],
          },option);
          option = {
            isSource: true,
            endpointStyle: {fill: "red"},
            maxConnections: 1,
            connectorOverlays: [["Arrow", { width: 10, length: 10, location: 1 }]]
          }
          this.flowMap.addEndpoint(item.eleId,{
            anchors: ["Bottom"],
          },option);
        }
      });
      if(this.lineList.length && first){
        this.createLine();
      }
    },
    async getFlowData(noInit){ //获取工作流数据
      try {
        let {data,status,message} = await request.get("/processing-core/processing/"+this.id, {}, {loading: true, loadingTitle: "获取工作流记录中……"});

        if(status === 200){

          let timeObject = data.schedule;
          this.allowApi = data.allowApi;
          this.allowDatabase = data.allowDatabase;
          if(data.running === true){
            this.statusLayout = true;
          }else{
            this.statusLayout = false;
          }
          this.flowList = data.nodes.map(item => {
            let names = item.name.split("_");
            return {
              ...item,
              flowId: item.id,
              eleId: 'flow'+item.id,
              label: names ?names[0] : "组件",
              panel: names[1],
              style: {
                left: item.positionX +"px",
                top: item.positionY + "px"
              },
              menu: 1
            }
          });
          this.flowList = this.flowList.map(item => {
            if(item.type === 2){
              if(item.configJson){
                item.configJson.timeStrategy = timeObject;
              }
            }
            return item;
          });
          this.lineList = data.links.map(item => {
            return {
              ...item,
              target: 'flow'+ item.destinationNodeId,
              source: 'flow' + item.sourceNodeId
            }
          });
          this.runEdit = data.editable;
          /*if(!noInit){
            setTimeout(() => {
              this.initComponent();
            },200);
          }*/
	        this.outputSetting.governmentMethod = data.processIncr;
	        if(data.processIncrColumn !== null) {
		        let processIncrColumn = JSON.parse(data.processIncrColumn);
		        this.outputSetting.governmentField = processIncrColumn.uuid;
	        }else {
		        this.outputSetting.governmentField = "";
	        }
	        this.$store.commit("changeOutputData", this.outputSetting);
        }else{
          this.$message.warning(message);
        }
      }catch (e) {

      }
    },
    createLine(){ //创建连接线
      if(this.lineList.length >= 1){
        this.lineList.forEach(item => {
          this.flowMap.connect({
            source: item.source,
            target: item.target,
            anchor: ["Bottom", "Top"],
            overlays: [ ['Arrow', { width: 12, length: 12, location: 1 }] ],
            /*point: ["Dot", {radius: 6}],
            pointStyle: {fill: "yellow"},
            endpoint: ["Dot", {radius: 6}],*/
            endpointStyle : [{fill:"red"}, {fill: "yellow"}],
          });
        })
      }
    },
    getLineData(){ //获取连接线数据
      this.lineList = [];
      for(let i=0; i<2; i++){
        let oData = {};
        if(i === 0){
          oData = {
            source: this.flowList[0].eleId,
            target: this.flowList[1].eleId
          }
        }else{
          oData = {
            source: this.flowList[1].eleId,
            target: this.flowList[2].eleId
          }
        }
        this.lineList.push(oData);
      }
    },
    saveNode(data){ //保存节点数据
      return JSON.stringify(data);
    },
    nodeAddEvent(node,data,event){

    },
    async getComponents(){ //获取组件数据
      try {
        let {data,message,status} = await request.get("/processing-core/template/getTemplateList", {
        }, {
          loading: true,
          loadingTitle: "获取流程组件数据中……"
        });
        if(status === 200){
          this.componentList = data.map(item => {
            item.label = item.nameChn;
            return item;
          });
          setTimeout(() => {
            this.initComponent();
          },100);
        }else{
          this.$message.warning(message);
        }
      }catch (e) {

      }
    },
    showRightMenu(data){ //显示右键菜单
      this.flowList.forEach(item => {
        if(item.id === data.id){
          item.menu = 2;
        }else{
          item.menu = 1;
        }
      });
    },
    menuListClick(){
    },
    async deleteLine(id){
      try {
        let {status,message} = await request.delete("/processing-core/link/"+id, {
          id: id
        },{loading: true});
        if(status === 200){
          this.lineList = this.lineList.filter(item => item.id !== id);
          this.savePositionNoTips();
          this.getFlowData();
        }else{
          this.$message.warning(message);
        }
      }catch (e) {

      }
    },
    async removeFlow(flow){ //删除工作流
      try {
        let {status,message} = await request.delete("/processing-core/node/"+ flow.flowId, {}, {
          loading:true,
          loadingTitle: "正在删除工作流节点……"
        });
        if(status === 200){
          this.flowMap.remove(flow.eleId);
          this.flowList = this.flowList.filter(item => item.flowId !== flow.flowId);
          this.lineList = this.lineList.filter(item => item.target !== flow.eleId && item.source !== flow.eleId);
          this.deleteVuex(flow);
          this.showPanel = false;
        }else{
          this.$message.warning(message);
        }

      }catch (e) {

      }
    },
    deleteVuex(flow){
      if(flow.panel === "InputDatabaseTable"){  //等于输入
        let newData = {
          sourceTable: "",
          processingId: "",
          tableName: "",
          tableData: []
        };
        this.$store.commit("changeInputData", newData);
      }else if(flow.panel === "PropertiesLookupBasedColumnReplace"){ //等于枚举映射
        let newData = {
          name: "",
          tableData: []
        }
        this.$store.commit("changeEnumMappingData", newData);
      }else if(flow.panel === "RuleBasedFiltering"){
        let newData = [
          {
            id: Math.random(),
            tableField: "",
            ruleName: "",
            reg: "",
            isDelete: false
          }
        ];
        this.$store.commit("changeRuleFilterData",newData);
      }else if(flow.panel === "RuleBasedUpdateColumn"){
        let newData = {
          flow: {},
          tableData: []
        }
        this.$store.commit("changeRuleUpdateData", newData);
      }else if(flow.panel === "OutputDatabase"){
        let newData = {
          theme: "",
          tableName: "",
          updateMethod: 1,
          specificTime: "",
          updateCycle: "",
          month: "",
          date: "",
          week: "",
          sourceTable: [],
          realSourceTable: [],
          flow: {
            configJson: {}
          }
        }
        this.$store.commit("changeOutputData", newData)
      }else if(flow.panel === "InputApi"){
        let newData = {
          flow: {
            configJson: {

            }
          },
          tableData: [],
          interfaceName: "",
        }
        this.$store.commit("changeApiInputData", newData);
      }else if(flow.panel === "OutputApi"){
        let newData = {
          flow: {
            configJson: {

            }
          },
          tableData: [],
          theme: "",
        }
        this.$store.commit("changeApiOutputData",newData );
      }else if(flow.panel === "MergeJoin"){
        let newData = {
          joinTableName: "",
          joinTableColumn: [],
          processingId: "",
          joinList: [
            {id: Math.random(),sourceTable: "", joinTable: "", delete: false}
          ],
          tableName: "",
          flow: {
            configJson: {}
          }
        }
        this.$store.commit("changeTableJoinData", newData);
      }else if(flow.panel === "DataComparison"){
        let newData = {
          diffTableName: "",
          diffTableColumn: [],
          relatedColumn: [
            {id: Math.random(),sourceTable: "", diffTable: "", delete: false}
          ],
          processingId: "",
          diffList: [
            {id: Math.random(),sourceTable: "", diffTable: "", delete: false}
          ],
          tableName: "",
          ruleName: "",
          flow: {
            configJson: {}
          }
        };
        this.$store.commit("changeTableDiffData", newData);
      }
    },
    getTime(row,col,val){ //格式化时间
      if(val){
        return moment(val).format("YYYY-MM-DD HH:mm:ss");
      }else{
        return "";
      }
    },
    async startRun(){ //开始测试执行运行
      try {
        let {status, message} = await request.put(`/processing-core/processing/${this.id}/start`, {}, {
          loading: true,
          loadingTitle: "启动流程中……"
        });
        if(status === 200){
          this.$message.success("流程启动成功");
          this.getFlowData();
        }else{
          this.$message.warning(message);
        }
      }catch (e) {

      }
    },
    async runResultMethod(){ //执行结果
      this.runBon = true;
      this.getResult();
    },
    async getResult(){//获取结果
      try {
        let {status,message,data,total} = await request.get("/processing-core/history/processing/"+this.id,{
          pageIndex: this.resultCurrent,
          pageSize: 10
        },{loading: true, loadingTitle: "正在获取历史执行记录数据中……"});
        if(status === 200){
          this.resultTotal = total ? total :0;
          this.runResult.tableData = data.map(item => {
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
          this.resultTotal = 0;
          this.runResult.tableData = [];
        }else{
          this.$message.warning(message);
        }
      }catch (e) {

      }
    },
    async showDataTrace(){
      this.dialogVisible = true;
      this.dialogType = "DataTrace";
      try {
        let {status,message,data} = await request.get("/processing-core/processing/"+this.id, {}, {loading: true, loadingTitle: "获取工作流记录中……"});
        if(status){
          this.dataTraceList = data.nodes.map(item => {
            return item.name.split("_")[0];
          });
        }else{
          this.$message.warning(message);
        }
      }catch (e) {

      }
    },
    async savePosition(){ //批量保存工作流位置
      try {
        let loading = {
          loading: true,
          loadingTitle: "保存流程位置信息中……"
        }
        if(this.flowList.length && this.flowList.length >= 1){
          let params = this.flowList.map(item => {
            return {
              id: item.flowId,
              positionX: $("#" +item.eleId).offset().left - $("#flowBox").offset().left,
              positionY: $("#" +item.eleId).offset().top - $("#flowBox").offset().top,
            }
          });
          let {message,status} = await request.post("/processing-core/node/updateNodePositions", {data:params},loading);
          if(status === 200){
            this.$message.success("保存成功");
          }else{
            this.$message.warning(message);
          }
        }else{
          this.$message.warning("没有流程节点，无法保存数据");
        }
      }catch (e) {

      }
    },
    async savePositionNoTips(){
      try {
        if(this.flowList.length && this.flowList.length >= 1){
          let params = this.flowList.map(item => {
            return {
              id: item.flowId,
              positionX: $("#" +item.eleId).offset().left - $("#flowBox").offset().left,
              positionY: $("#" +item.eleId).offset().top - $("#flowBox").offset().top,
            }
          });
          let {message,status} = await request.post("/processing-core/node/updateNodePositions", {data:params});
          if(status === 200){
          }else{
            this.$message.warning(message);
          }
        }else{
          this.$message.warning("没有流程节点，无法保存数据");
        }
      }catch (e) {

      }
    },
    getDisabled(item){ //判断是否可以拖拽
      if(item.allowApi===true && this.allowApi === false){
        return {
          "disabled" : true
        }
      }
      if(item.allowDatabase === true && this.allowDatabase === false){
        return {
          "disabled" : true
        }
      }
      if(!this.isEdit){
        return {
          "disabled" : true
        }
      }
    },
    async reName(flow){ //重命名组件
      flow.menu = false;
      try {
        let result = await this.$prompt("请输入要修改的名称","重命名",{
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          inputPattern: /^[^\s]{1,50}$/,
          inputErrorMessage: "名称不能有空格,且长度不能超出50的长度。",
          inputValue: flow.label
        });
        if(result.value){
          let {status, message} = await request.put("/processing-core/node/updateNodeName", {
            id: flow.id,
            processingId: flow.processingId,
            name: result.value+ "_" +flow.panel
          },{loading: true, loadingTitle: "保存名称数据中……"});
          if(status === 200){
            flow.label = result.value;
            this.$message.success("名称修改成功");
          }else{
            this.$message.warning(message);
          }
        }
      }catch (e) {

      }
    },
    startEdit(){
      this.statusLayout = false;
    },
    panelChangeSize() {
      const vm = this;
      $(".government-wrap").delegate(".setting-panel", "mouseover mousemove", function(ev){
        let iLeft = $(this).offset().left;
        let iPageX = ev.pageX;
        if(iPageX - iLeft >= 1 && iPageX - iLeft <= 20) {
          vm.isMove = true;
        }else {
          vm.isMove = false;
        }
      });
      $(".government-wrap").delegate(".setting-panel", "mousedown.size", function (ev) {
        if(vm.$store.state.isFullScreen) {
          return;
        }

        let iMax = $(this).offsetParent().width();
        this.style.left = this.offsetLeft + "px";
        let disX = ev.clientX - $(this).offset().left;
        let oldX = ev.clientX;
        if(disX <= 20 && disX > 0) {
          ev.stopPropagation();
          ev.preventDefault();
        }
        $(document).on("mousemove.size", function (ev) {
          if(disX <= 20) {
            let iLeft = $(".setting-panel").offset().left - $(".setting-panel").offsetParent().offset().left;
            let iWidth = $(".setting-panel").width() - (ev.clientX - oldX);
            let currentLeft = iLeft + (ev.clientX - oldX);
            if(iWidth >= iMax) {
              iWidth = iMax
            }else if(iWidth <= 400){
              iWidth = 400;
            }
            if(currentLeft <= 0) {
              currentLeft = 0;
            } else if(currentLeft >= iMax - 400) {
              currentLeft = iMax - 400;
            }
            $(".setting-panel").css("left", currentLeft);
            $(".setting-panel").width(iWidth);
            oldX = ev.clientX;
          }
        });
        $(document).on("mouseup.size", function () {
          $(document).off("mousemove.size");
          $(document).off("mouseup.size");
        });

      });
    }
  }
}
</script>

<style scoped lang="less">
  .el-input{
    width: 250px;
  }
  .panel-layout{
	  height: 100%;
	  width: 50%;
	  position: absolute;
	  right: 0;
	  top: 0;
	  background: rgba(0,0,0,.7);
	  z-index: 9999;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  .tips {
		  color: #fff;
		  transform: rotate(-40deg);
		  font-size: 30px;
	  }
	  .el-button {
		  position: absolute;
		  left: 10px;
		  top: 5px;
	  }
  }
  .content-box{
    .government-wrap{
      display: flex;
      .left{
        width: auto;
        .tree-node{
          cursor: move;
          p{
            background: #27CA8E;
            color: #fff;
          }
          &.disabled{
            cursor: no-drop;
            p{
              background: #ccc;
              color: #999;
            }
          }
          .tree-box{
            padding-top: 20px;
          }
        }
      }
      .right{
        .mark-layout{
          position: absolute;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.7);
          left: 0;
          top: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          .tips{
            color: #27CA8E;
            padding-bottom: 10px;
            &.error{
              color: #F4AB37;
            }
          }
        }
        position: relative;
        margin-left: 10px;
        flex: 1 1 auto;
        height: 100%;
        background: #2C3C4C;
        .header{
          display: flex;
          height: 40px;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          h3{
            color: #fff;
          }
        }
        #flowBox{
          overflow: hidden;
          min-height: 550px;
          position: relative;
          .flow-node{
            border-radius: 20px;
            width: 150px;
            height: 30px;
            text-align: center;
            line-height: 30px;
            color: #5C9CEC;
            border: 1px solid #5C9CEC;
            position: absolute;
            .menu-list{
              position: absolute;
              border-radius: 6px;
              width: 120px;
              left: 100px;
              padding: 10px 0;
              top: 15px;
              background: #fff;
              z-index: 99999;

            }
            .success{
              position: absolute;
              right: 5px;
              color: #27CA8E;
              top: 0;
              font-size: 14px;
            }
            .error{
              position: absolute;
              right: 5px;
              color: #F4AB37;
              top: 0;
              font-size: 14px;
            }
          }
        }
        .run-result{
          position: absolute;
          width: 100%;
          left: 0;
          bottom: 0;
          background: #fff;
          height: 200px;
          .header{
            display: flex;
            justify-content: space-between;
            padding: 10px 20px;
          }
        }
      }
    }
  }
  .red-line{
    background: ;
    color: red;
  }
  .run-enter{
    transform: translateY(100%);
    opacity: 0;
  }
  .run-enter-to{
    transform: translateY(0);
    opacity: 1;
  }
  .run-enter-active{
    transition: 0.7s;
  }
  .run-leave{
    opacity: 1;
    transform: translateY(0);
  }
  .run-leave-to{
    opacity: 0;
    transform: translateY(100%);
  }
  .run-leave-active{
    transition: 0.5s;
  }
</style>
