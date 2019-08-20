<template>
  <div class="setting-panel">
    <!--<div class="setting-header">
      <el-button type="text" @click="closePanel">关闭</el-button>
      <p>表输出</p>
      <el-button type="text" @click="saveOutput" :disabled="!isEdit">保存</el-button>
    </div>-->
    <CommonHeader
      @close-panel="closePanel"
      @save-setting="saveOutput"
      :is-edit="isEdit"
      title="表输出"
    />
    <div class="setting-body">
      <el-form :model="formData" :rules="rules" ref="formBox" label-width="110px" label-position="right">
        <el-form-item label="目的库主题：" prop="theme">
          <el-select v-model="formData.theme" :disabled="!isEdit || !runEdit ">
            <el-option v-for="item in themeList" :label="item.topicName" :value="item.id" :key="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="目的表名称：" prop="tableName">
          <el-input v-model="formData.tableName" :disabled="!isEdit || !runEdit" placeholder="请输入" ></el-input>
        </el-form-item>
        <el-form-item label="治理方式：" prop="updateMethod">
          <el-select v-model="formData.updateMethod" :disabled="!isEdit">
            <el-option label="手动" :value="1"></el-option>
            <el-option label="自动" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="治理周期：" prop="updateCycle" v-if="formData.updateMethod === 2">
          <el-select v-model="formData.updateCycle" :disabled="!isEdit">
            <el-option label="按天" :value="4"></el-option>
            <el-option label="按周" :value="3"></el-option>
            <el-option label="按月" :value="2"></el-option>
            <el-option label="按年" :value="1"></el-option>
          </el-select>
        </el-form-item>
        <template v-if="formData.updateCycle === 1 && formData.updateMethod === 2">
          <el-form-item label="每年：" prop="month">
            <el-select v-model="formData.month" :disabled="!isEdit">
              <el-option v-for="item in getMonthDay.month" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="每月：" prop="date">
            <el-select v-model="formData.date" :disabled="!isEdit">
              <el-option v-for="item in getDate" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
        </template>
        <template v-if="formData.updateCycle === 2 && formData.updateMethod === 2">
          <el-form-item label="每月：" prop="date">
            <el-select v-model="formData.date" :disabled="!isEdit">
              <el-option v-for="item in getMonthDay.date" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
        </template>
        <template v-if="formData.updateCycle === 3 && formData.updateMethod === 2">
          <el-form-item label="每周：" prop="week">
            <el-select v-model="formData.week" :disabled="!isEdit">
              <el-option label="一" :value="2"></el-option>
              <el-option label="二" :value="3"></el-option>
              <el-option label="三" :value="4"></el-option>
              <el-option label="四" :value="5"></el-option>
              <el-option label="五" :value="6"></el-option>
              <el-option label="六" :value="7"></el-option>
              <el-option label="日" :value="1"></el-option>
            </el-select>
          </el-form-item>
        </template>
        <el-form-item label="具体时间：" prop="specificTime" v-if="formData.updateMethod === 2">
          <el-time-picker type="time" v-model="formData.specificTime"
                          style="width: 40%" :disabled="!isEdit"></el-time-picker>
        </el-form-item>
        <el-form-item label="源表字段：" v-if="formData.flow.inputColumnEntitiesJson && formData.flow.inputColumnEntitiesJson.length">
          <div slot="label">
            <span style="color: red">*</span>
            源表字段：
          </div>
        </el-form-item>
        <el-table :data="getSelectColumn" stripe border header-cell-class-name="th-style" style="width: 100%;" @selection-change="handleSelectionChange" ref="sourceTable" max-height="300" v-if="formData.flow.inputColumnEntitiesJson && formData.flow.inputColumnEntitiesJson.length">
          <el-table-column type="selection" label="全选" :selectable="isSelection"></el-table-column>
          <el-table-column label="名称" prop="name"></el-table-column>
          <el-table-column label="数据源" prop="dataName"></el-table-column>
          <el-table-column label="类型" prop="type"></el-table-column>
          <el-table-column label="长度" prop="length"></el-table-column>
          <el-table-column label="说明" prop="comment"></el-table-column>
        </el-table>
        <div class="btn-box" style="padding-top: 10px; padding-bottom: 30px">
          <el-button style="width: 100%" type="primary" @click="addTargetTable" :disabled="!isEdit || !runEdit">+添加到目的表</el-button>
        </div>
        <el-form-item label="目的表字段：">
          <div slot="label">
            <span style="color: red">*</span>
            目的表字段：
          </div>
        </el-form-item>
        <div class="table-wrap" id="output-table">
          <div class="custom-table" style="width: 100%">
            <table cellspacing="0" cellpadding="0" border="0">
              <thead>
              <th><span class="red">*</span>名称</th>
              <th width="80px">数据源</th>
              <th><span class="red">*</span>类型</th>
              <th width="70px"><span class="red">*</span>长度</th>
              <th><span class="red">*</span>说明</th>
              <th width="40px">操作</th>
              </thead>
              <tbody>
              <tr v-for="(item,index) in formData.realSourceTable" :key="item.id">
                <td>
                  <el-form-item :prop="`realSourceTable.${index}.name`" :rules="sourceTableRule.name" style="" :inline-message="true">
                    <el-input v-model="item.name" placeholder="请输入" v-if="isEdit && runEdit"></el-input>
                    <p v-else>{{item.name}}</p>
                  </el-form-item>
                </td>
                <td>
                  <p class="dataName">{{item.dataName}}</p>
                </td>
                <td>
                  <el-select v-model="item.type" @change="selectType(item)" placeholder="请选择" v-if="isEdit && runEdit">
                    <el-option v-for="type in typeList" :key="type.value" :label="type.label" :value="type.value"></el-option>
                  </el-select>
                  <p v-else>{{item.type}}</p>
                </td>
                <td>
                  <el-form-item v-if="judgeType(item.type)" :prop="`realSourceTable.${index}.length`" :rules="sourceTableRule.length" style="" :inline-message="true">
                    <el-input  v-model="item.length" :placeholder="judegTipText(item.type)" v-if="isEdit && runEdit"></el-input>
                    <p v-else>{{item.length}}</p>
                  </el-form-item>
                  <!--<p v-else>{{scope.row.length}}</p>-->
                  <p v-else>-</p>
                </td>
                <td>
                  <el-form-item :prop="`realSourceTable.${index}.comment`" :rules="sourceTableRule.comment" :inline-message="true">
                    <el-input v-model="item.comment" placeholder="请输入" v-if="isEdit && runEdit"></el-input>
                    <p v-else>{{item.comment}}</p>
                  </el-form-item>
                </td>
                <td>
                  <el-button type="text" @click="deleteTarget(item)">删除</el-button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
	      <el-form-item label="治理方式：" prop="governmentMethod">
					<el-select
						v-model="formData.governmentMethod"
						:disabled="!isEdit"
					>
						<el-option label="全量治理" :value="false"></el-option>
						<el-option label="增量治理" :value="true"></el-option>
					</el-select>
	      </el-form-item>
	      <el-form-item label="治理字段：" prop="governmentField" v-if="formData.governmentMethod">
					<el-select
						v-model="formData.governmentField"
						:disabled="!isEdit"
					>
						<el-option :label="item.column" :value="item.uuid" v-for="item in inputData.tableData"></el-option>
					</el-select>
	      </el-form-item>
	      <el-form-item label="主键：" prop="primaryKey">
					<el-select
						v-model="formData.primaryKey"
						:disabled="!isEdit"
					>
						<el-option :label="item.column" :value="item.uuid" v-for="item in formData.flow.inputColumnEntitiesJson"></el-option>
					</el-select>
	      </el-form-item>
	      <!--<el-form-item label="索引：">
		      <div>
			      <el-table :data="formData.indexes" :show-header="false">
				      <el-table-column>
					      <template slot-scope="scope">
					      <el-select
					        v-model="scope.row.name"
					        style="width: 100%"
					      >
									<el-option v-for="item in formData.flow.inputColumnEntitiesJson" :label="item.column" :value="item.uuid"></el-option>
					      </el-select>
					      </template>
				      </el-table-column>
				      <el-table-column width="100px">
					      <template slot-scope="scope">
					        <el-button type="text">新增</el-button>
					        <el-button type="text">删除</el-button>
					      </template>
				      </el-table-column>
			      </el-table>
		      </div>
	      </el-form-item>-->
      </el-form>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";
import request from "@/libs/request";
import CommonHeader from "./CommonHeader";
export default {
  name: "OutPut",
  props:{
    runEdit: Boolean,
    default: true,
  },
  watch: {
    'formData.sourceTable': {
      deep: true,
      handler(val){
        console.log(val);
        this.formData.realSourceTable = val.filter(item => !item.delete);
      }
    }
  },
  components: {
    CommonHeader
  },
  computed: {
    ...mapState({
      formData: state => state.outputSetting,
      inputData: state => state.tableInputSetting,
      joinData: state => state.tableJoinData,
      diffData: state => state.tableDiffData,
      isEdit: state => state.isEdit,
      getSelectColumn(){
        if(this.formData.flow.inputColumnEntitiesJson && this.formData.flow.inputColumnEntitiesJson.length) {
          let inputColumn = this.formData.flow.inputColumnEntitiesJson.map(item =>{
            item.name = item.column;
            return item;
          });
          return  [...inputColumn];
        }else {
          return [];
        }
      }
    }),
    getMonthDay(){
      let month = [];
      let date = [];
      for(let i=0; i<12; i++){
        month.push({
          label: (i+1) + "月",
          value: (i+1)
        });
      }
      for(let i=1; i<=31; i++){
        date.push({
          label: i+"日",
          value: i
        });
      }
      return {
        month,
        date
      };
    },
    getDate(){
      let date = [];
      if(this.formData.month === 1 || this.formData.month === 3 || this.formData.month === 5 || this.formData.month === 7 ||this.formData.month === 8 || this.formData.month === 10 || this.formData.month === 12){
        for(let i=1; i<=31; i++){
          date.push({
            label: i+"日",
            value: i
          });
        }
      }else if(this.formData.month === 4 || this.formData.month === 6 || this.formData.month === 9 || this.formData.month === 11){
        for(let i=1; i<=30; i++){
          date.push({
            label: i+"日",
            value: i
          });
        }
      }else if(this.formData.month === 2){
        for(let i=1; i<=28; i++){
          date.push({
            label: i+"日",
            value: i
          });
        }
      }
      return date;
    }
  },
  data(){
    const validLength = (rule,value,callback) => {
      if(Number(value) >= 0 && Number(value) <= 5000){
        callback();
      }else{
        callback(new Error("长度必须小于5000"));
      }
    };
    const repeatTableName = async(rule, value,callBack) => {
      let {status} = await request.get("/processing-core/output/resultTableNameExists",{name:value,processingId:this.formData.processingId,});
      if(status === 204){
        callBack();
      }else{
        callBack(new Error("该目的表名称已经存在"));
      }
    };
    const validNameRepeat = (rule,value,callBack) => {
      let bOn = 0;
      this.formData.realSourceTable.forEach(item => {
        if(item.name === value){
          bOn+=1;
        }
      });
      if(bOn > 1){
        callBack(new Error("有重复的名称，请修改名称"));
      }else{
        callBack();
      }
    };
    return {
      typeList: [
        {label: "int", value: "INT"},
        {label: "tinyint", value: "TINYINT"},
        {label: "smallint", value: "SMALLINT"},
        {label: "mediumint", value: "MEDIUMINT"},
        {label: "bigint", value: "BIGINT"},
        {label: "year", value: "YEAR"},
        {label: "float", value: "FLOAT"},
        {label: "double", value: "DOUBLE"},
        {label: "tinytext", value: "TINYTEXT"},
        {label: "text", value: "TEXT"},
        {label: "mediumtext", value: "MEDIUMTEXT"},
        {label: "longtext", value: "LONGTEXT"},
        {label: "date", value: "DATE"},
        {label: "datetime", value: "DATETIME"},
        {label: "timestamp", value: "TIMESTAMP"},
        {label: "time", value: "TIME"},
        {label: "tinyblob", value: "TINYBLOB"},
        {label: "mediumblob", value: "MEDIUMBLOB"},
        {label: "blob", value: "BLOB"},
        {label: "longblob", value: "LONGBLOB"},
        {label: "varbinary", value: "VARBINARY", set: true},
        {label: "decimal", value: "DECIMAL", set: true},
        {label: "varchar", value: "VARCHAR", set: true},
        {label: "char", value: "CHAR", set: true}
      ],
      selectedList: [],
      rules: {
        theme: [
          {required: true, message: "目的库不能为空", trigger: "change"}
        ],
        tableName: [
          {required: true, message: "目的表名称不能为空", trigger: "blur"},
          {pattern: /^[a-zA-Z][a-zA-Z_0-9]*$/g,message: "目的表名称必须是字母开头，其后只能输入字母、数字、下划线", trigger:"blur"},
          {max: 50, message: "表名称长度不能超过50", trigger: "blur"},
          {validator: repeatTableName, trigger: "blur"}
        ],
        updateMethod: [
          {required: true, message: "更新方式不能为空", trigger: "change"}
        ],
        specificTime: [
          {required: true, message: "具体时间不能为空", trigger: "change"}
        ],
        updateCycle: [
          {required: true, message: "更新周期不能为空", trigger: "change"}
        ],
        month: [
          {required: true, message: "必须选择每年的哪个月", trigger: "change"}
        ],
        date: [
          {required: true, message: "必须选择每月的哪一天", trigger: "change"}
        ],
        week: [
          {required: true, message: "必须选择每周的哪一天", trigger: "change"}
        ],
	      governmentMethod: [
		      {required: true, trigger: "change", message: "治理方式不能为空"}
	      ],
	      governmentField: [
		      {required: true, trigger: "change", message: "治理字段不能为空"}
	      ],
	      primaryKey: [
		      {required: true, trigger: "change", message: "主键不能为空"}
	      ]

      },
      sourceTableRule: {
        name: [
          {required: true, message: "名称不能为空", trigger: "blur"},
          {pattern: /^[a-zA-Z_]+$/, message: "名称必须为英文或者英文加下划线", trigger: "blur"},
          {max: 20, message: "名称长度不能超过20", trigger: "blur"},
          {validator: validNameRepeat, trigger: "blur"}
        ],
        length: [
          {required: true, message: "长度不能为空", trigger: "blur"},
          {validator: validLength, trigger: "blur"}
        ],
        comment: [
          {required: true, message: "说明不能为空", trigger: "blur"},
          {pattern: /^[^\s]+$/, message: "说明不能包含空格", trigger: "blur"},
          {max: 50, message: "说明长度不能超过50", trigger: "blur"}
        ]
      },
      themeList: [],
      sourceTable: []
    }
  },
  created(){
    this.getDataList();
  },
  activated(){
    this.clearValidate();
  },
  mounted(){
  },
  methods: {
    clearValidate(){ //清除验证
      if(this.$refs.formBox){
        this.$refs.formBox.clearValidate();
      }
    },
    isSelection(){ //判断是否可选择
      return this.isEdit && this.runEdit;
    },
    async getDataList(){ //获取主题列表
      try{
        let {status ,data , message} = await request.get("/serviceitem/serviceTopic/getTopicList", {}, {
          loading: true,
          loadingTitle: "正在获取目的库主题列表……"
        });
        if(status === 200 || status === 204){
          this.themeList = data;
        }else{
          this.$message.warning(message);
        }
      }catch (e) {

      }
    },
    async getThemeList(){ // 获取主题列表
      try {
        let {data,message,status} = request.get("/serviceitem/serviceTopic/getTopicList", {}, {
          loading: true,
          loadingTitle: "获取主题列表中……"
        });
        if(status === 200){
        }else{
          this.$message.warning(message);
        }
      }catch (e) {

      }
    },
    closePanel(){ //关闭面板
      this.$emit("close-panel");
      this.$refs.formBox.resetFields();
    },
    handleSelectionChange(val){ //选择列表
      this.selectedList = val;
    },
    addTargetTable(){ //添加到目的表
      if(this.selectedList.length > 0){
        let newArr = [];
        this.selectedList.forEach(item => {
          let bOn = this.formData.sourceTable.some(source => item.name === source.originName && source.delete === false);
          if(!bOn){
            let oData = {
              id: Math.random(),
              ...item,
              originName: item.name,
              dataName: item.dataName,
              setLength: item.length ? item.length :"" ,
              delete: false
            }
            newArr.push(oData);
          }
        });
        this.formData.sourceTable = [...this.formData.sourceTable, ...newArr];
        this.$store.commit("changeOutputData", this.formData);
      }else{
        this.formData.sourceTable = this.formData.sourceTable.map(item => {
          item.delete = true;
          return item;
        });
      }
    },
    selectType(row){
      /*if(row.orginType === row.type){
        row.length = row.originLength;
      }else{
        row.length = "-";
      }*/
    },
    deleteTarget(row){ //删除目标数据
      this.formData.sourceTable = this.formData.sourceTable.map(item => {
        if(item.column === row.column && item.uuid === row.uuid){
          item.delete = true;
        }
        return item;
      });
      this.$store.commit("changeOutputData", this.formData);
    },
    judgeType(val){
      let type = this.typeList.find(item => item.value === val.toUpperCase());
      if(type){
        if(type.set){
          return true
        }else{
          return false;
        }
      }else{
        return false;
      }
    },
    judegTipText(val){
      if(val === "DECIMAL"){
        return "请输入小于10的小数";
      }else{
        return "请输入长度";
      }
    },
    saveOutput(){
      if(this.runEdit){
        //this.$refs.formBox.clearValidate();
        this.saveSetting();
      }else{
        this.saveTimeStrategy();
      }
    },
    async saveSetting(){
      try {
        this.$refs.formBox.validate(async valid => {
          if(valid){
            if(!this.formData.sourceTable.length){
              this.$message.warning("目的表不能为空");
              return;
            }
            let currentTheme = this.themeList.find(item => item.id === this.formData.theme);
            let columnMappingList = this.formData.sourceTable.map(source => {
              this.formData.realSourceTable.forEach(real => {
                if(real.id === source.id){
                  source = real;
                }
              });
              return source;
            });
            let primaryKeyItem = this.formData.flow.inputColumnEntitiesJson.find(item => item.uuid === this.formData.primaryKey);
            let params = {
              id: this.formData.flow.flowId,
              name: this.formData.flow.name,
              positionX: 0,
              positionY: 0,
              processingId:this.formData.processingId,
              properties: {
                columnMappingList: columnMappingList.map(item => {
                  return {
                    comment: item.comment,
                    delete: item.delete,
                    length: item.length,
                    name: item.originName,
                    rename: item.name,
                    type: item.type,
                    uuid: item.uuid,
                    sourceId: item.sourceId,
                    dataName: item.dataName
                  }
                }),
                databaseName: currentTheme.database,
                databaseConnectionPoolingService: currentTheme.controllerServiceId,
                tableName: this.formData.tableName,
                topicId: this.formData.theme,
	              primaryKeys: [
		              primaryKeyItem
	              ]
              },
              templateId: this.formData.flow.templateId
            }
            if(this.formData.flow.configJson && this.formData.flow.configJson.avroReaderId){
              params.properties.avroReaderId = this.formData.flow.configJson.avroReaderId;
            }
            let {status, message, data} = await request.put("/processing-core/node/updateOutputNodeConfig", params, {
              loading: true,
              loadingTitle: "正在保存输出配置中……"
            });
            let governmentField = this.inputData.tableData.find(item => item.uuid === this.formData.governmentField);
            let goverParams = {
            	id: this.formData.processingId,
	            processIncr: this.formData.governmentMethod,
	            processIncrColumn: governmentField
            };
            let governmentMethod = await request.put("/processing-core/processing/updateProcessingLoadMethod", goverParams);
            if(status === 200 && governmentMethod.status === 200){
              /*if(this.formData.updateMethod === 2){

              }*/
              await this.saveTimeStrategy();
              //this.$message.success("保存成功");
              this.$emit("close-panel",data);
            }else{
              this.$message.warning(message);
            }
          }else{
            this.$message.warning("请按规范完善必填字段");
          }
        })
      }catch (e) {

      }
    },
    async saveTimeStrategy(){
      this.$refs.formBox.validate(async valid => {
        if(valid){
          try {
            let updateCycle = "";
            if(this.formData.updateCycle === 1){
              updateCycle = "YEAR";
            }else if(this.formData.updateCycle === 2){
              updateCycle = "MONTH";
            }else if(this.formData.updateCycle === 3){
              updateCycle = "WEEK";
            }else if(this.formData.updateCycle === 4){
              updateCycle = "DAY";
            }
            let params = {
              id: this.formData.processingId,
              schedule: {
                "dayOfMonth": this.formData.date,
                "dayOfWeek": this.formData.week,
                "month": this.formData.month,
                "strategy": updateCycle,
                "timeOfDay": this.formData.specificTime,
              },
              "schedulingStrategy": this.formData.updateMethod === 1 ? "MANUAL" : "CRON_DRIVEN"
            }
            let {message,status} = await request.put("/processing-core/processing/updateProcessingSchedule",params, {
              loading: true,
              loadingTitle: "保存运行策略中……"
            });
            if(status === 200){
              this.$message.success("保存配置成功");
              this.$emit("close-panel");
            }else{
              this.$message.warning(message);
            }
          }catch (e) {

          }
        }else{
          this.$message.warning("请完善时间策略选择");
        }
      })
    },
    isSelected(row, index){
      if(this.formData.flow.isValid){
        return false;
      }else{
        return true;
      }
    }
  }
}
</script>

<style >
  #output-table .el-form-item{
    margin: 0;
  }
  #output-table .el-form-item__content {
    margin: 0 !important;
  }
  .custom-table .dataName{
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
.table-wrap {
	padding-bottom: 20px;
}
</style>
