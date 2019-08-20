<template>
  <div>
    <div class="step-bar">
      <el-steps :active="steps" simple>
        <el-step title="1、配置源数据库" icon="el-icon-setting"></el-step>
        <el-step title="2、配置同步策略" icon="el-icon-setting"></el-step>
        <el-step title="3、配置数据信息" icon="el-icon-setting"></el-step>
      </el-steps>
    </div>
    <div class="form-wrap">
      <el-form :model="formData" label-position="right" label-width="120px" ref="formBox" :rules="rules">
        <div v-show="steps === 1">
          <el-form-item label="所属目录：" prop="beLongCatalog" >
            <div class="form-row">
              <el-cascader
                  :options="catalogList"
                  v-model="formData.beLongCatalog"
                  :show-all-levels="false"
                  :props="defaultProps"
                  style="width: 40%">
              </el-cascader>
              <p style="color: #999; display: flex; margin-left: 20px;">
                *无关联目录，请先
                <router-link tag="span" style="cursor: pointer" class="tips"
                             :to="{path:'/data-manager/dir-manager',query: {add:true}}">
                  创建目录！
                  <el-tooltip placement="top">
                    <div slot="content">
                      1、数据只能关联在已发布通过审核的子目录下。
                      <br/>
                      2、一个子目录只能添加一个数据。
                    </div>
                    <i class="el-icon-warning" style="margin-left: 4px; color: #2F91D8"></i>
                  </el-tooltip>
                </router-link>
              </p>
            </div>
          </el-form-item>
          <el-form-item label="源数据库：" prop="sourceData">
            <div class="form-row">
              <el-select v-model="formData.sourceData" style="width: 40%" @change="getResTableList">
                <el-option
                    v-for="item in sourceDataOptions"
                    :key="item.id"
                    :label="item.name"
                    v-bind:value="item.id">
                </el-option>
              </el-select>
              <div style="color: #999; display: flex; margin-left: 20px;">
                *找不到源数据库，请到数据源管理进行
                <p class="tips" @click="jumpDataSource" style="margin: 0;">创建</p>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="源表：" prop="sourceTable">
            <el-select v-model="formData.sourceTable" style="width: 40%" :disabled="!formData.sourceData" @change="selectTableHandler">
              <el-option
                  v-for="item in sourceTableOptions"
                  :key="item.id"
                  :label="item.tableName"
                  v-bind:value="item.tableName">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="信息项：" v-if="formData.fileCatalog && formData.fileCatalog.length" >
            <div class="custom-table" style="width: 100%">
              <table cellspacing="0" cellpadding="0" border="0"  >
                <thead>
                <th>
                  <span class="red">*</span>
                  中文名称
                </th>
                <th>
                  <span class="red">*</span>
                  英文名称
                </th>
                <th>
                  <span class="red">*</span>
                  类型
                </th>
                <th width="80px"><span class="red">*</span>长度</th>
                <th>
                  <span class="red">*</span>
                  说明
                </th>
                </thead>
                <tbody>
                <tr v-for="(item,index) in formData.fileCatalog" :key="item.id">
                  <td>
                    <el-form-item :prop="`fileCatalog.${index}.name`" :rules="fileCatalog.name"
                                  :inline-message="true" style="margin: 0;">
                      <el-input v-model="item.name"  autocomplete="on" auto-complete="on" name="name" :trigger-on-focus="false" placeholder="请输入"></el-input>
                    </el-form-item>
                  </td>
                  <td>
                    <p>{{item.nameEng}}</p>
                  </td>
                  <td>
                    <p>{{item.dataType}}</p>
                  </td>
                  <td>
                  <span v-if="item.length === 0">-</span>
                    <span v-else>{{item.length}}</span>
                  </td>
                  <td>
                    <el-form-item :prop="`fileCatalog.${index}.description`" :rules="fileCatalog.description" :inline-message="true" style="margin: 0;">
                      <el-input v-model="item.description" placeholder="请输入"></el-input>
                    </el-form-item>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </el-form-item>
        </div>
        <div v-show="steps === 2">
          <el-form-item label="同步策略：">
            <el-select v-model="formData.type" style="width: 40%">
              <el-option label="手动" :value="1"></el-option>
              <el-option label="自动" :value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="同步周期：" v-if="formData.type === 2">
            <el-select v-model="formData.syncUnit" placeholder="请选择">
              <el-option label="按天" :value="4"></el-option>
              <el-option label="按周" :value="3"></el-option>
              <el-option label="按月" :value="2"></el-option>
              <el-option label="按年" :value="1"></el-option>
            </el-select>
          </el-form-item>
          <!--按天-->
          <template v-if="formData.syncUnit === 4 && formData.type === 2">
            <el-form-item label="具体时间" prop="specificTime">
              <el-time-picker type="time" v-model="formData.specificTime"
                              style="width: 40%" value-format="HH:mm:ss" placeholder="请选择"></el-time-picker>
            </el-form-item>
          </template>
          <!--按周-->
          <template v-else-if="formData.syncUnit === 3 && formData.type === 2">
            <el-form-item label="每周" prop="oneWeek">
              <el-select v-model="formData.oneWeek" style="width: 40%">
                <el-option label="一" :value="0"></el-option>
                <el-option label="二" :value="1"></el-option>
                <el-option label="三" :value="2"></el-option>
                <el-option label="四" :value="3"></el-option>
                <el-option label="五" :value="4"></el-option>
                <el-option label="六" :value="5"></el-option>
                <el-option label="日" :value="6"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="具体时间" prop="specificTime">
              <el-time-picker type="time" v-model="formData.specificTime"
                              style="width: 40%" value-format="HH:mm:ss" placeholder="请选择"></el-time-picker>
            </el-form-item>
          </template>
          <!--按月-->
          <template v-else-if="formData.syncUnit === 2 && formData.type === 2">
            <el-form-item label="每月：" prop="oneMonth">
              <div class="week-select">
                <el-select v-model="formData.oneMonth" style="width: 40%">
                  <el-option v-for="day in oneMonthDay" :label="day" :value="day"></el-option>
                </el-select>
                <p class="mark">日</p>
              </div>
            </el-form-item>
            <el-form-item label="具体时间" prop="specificTime">
              <el-time-picker type="time" v-model="formData.specificTime"
                              style="width: 40%" value-format="HH:mm:ss" placeholder="请选择"></el-time-picker>
            </el-form-item>
          </template>
          <!--按年-->
          <template v-else-if="formData.syncUnit === 1 && formData.type === 2">
            <el-form-item label="每年：" prop="oneYear">
              <div class="week-select">
                <el-select v-model="formData.oneYear" style="width: 40%">
                  <el-option v-for="month in oneYearMonth" :label="month" :value="month"></el-option>
                </el-select>
                <p class="mark">月</p>
              </div>
            </el-form-item>
            <el-form-item label="每月：" prop="oneMonth">
              <div class="week-select">
                <el-select v-model="formData.oneMonth" style="width: 40%">
                  <el-option v-for="day in oneMonthDay" :label="day" :value="day"></el-option>
                </el-select>
                <p class="mark">日</p>
              </div>
            </el-form-item>
            <el-form-item label="具体时间" prop="specificTime">
              <el-time-picker type="time" v-model="formData.specificTime"
                              style="width: 40%" value-format="HH:mm:ss" placeholder="请选择"></el-time-picker>
            </el-form-item>
          </template>
          <el-form-item label="同步类型：">
            <el-radio v-model="formData.syncType" :label="2">增量同步</el-radio>
            <el-radio v-model="formData.syncType" :label="1">全量同步</el-radio>
          </el-form-item>
          <el-form-item label="选择时间戳：" prop="timeStamp" v-if="formData.syncType === 2">
            <el-select v-model="formData.timeStamp" style="width: 40%" placeholder="请选择">
              <el-option :label="item.name" :value="item.nameEng" v-for="item in getTimeStampList"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="同步名称：" prop="syncName">
            <el-input v-model="formData.syncName" style="width: 70%" placeholder="请输入"></el-input>
          </el-form-item>
        </div>

        <div v-show="steps === 3">
          <el-form-item label="数据名称：" prop="nameData">
            <el-input v-model="formData.nameData" style="width: 70%" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="数据描述：" prop="dataDescription" >
            <el-input type="textarea" v-model="formData.dataDescription" style="width: 70%" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="数据用途：" prop="dataUsage" >
            <el-input type="textarea" v-model="formData.dataUsage" style="width: 70%" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="所属系统："  prop="dataSource">
            <div class="form-row">
              <el-input type="textarea" v-model="formData.dataSource" style="width: 70%" placeholder="请输入"></el-input>
            </div>
          </el-form-item>
        </div>
        <div class="submit-box">
          <el-button type="primary" v-if="steps > 1" @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="nextStep">{{getButtonTitle}}</el-button>
          <el-button class="cancel-btn" @click="closeNewAdd">取消</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";
import request from "@/libs/request";

export default {
  name: "AddTableSync",
  props: {
    tableSyncData: {
      type: Object
    },
  },
  computed: {
   /* ...mapState(["catalogList"]),*/
    ...mapState({
      catalogList: state => state.catalogList,
      sourceDataOptions: state => state.sourceDataList
    }),
    getButtonTitle() {
      if (this.steps === 3) {
        return "保存";
      } else {
        return "下一步";
      }
    },
    getTimeStampList(){
      return this.formData.fileCatalog.filter(item => {
        let type = item.type.toString();
        return type.startsWith("4");
      })
    }
  },
  data() {
    const repeatSyncName = async(rule,value,callBack) => {
      let {status} = await request.post("/collection/info/DbSync/selectByName", {syncName: value});
      if(status === 200){
        callBack();
      }else{
        callBack(new Error("同步名称已存在"));
      }
    };
    const repeatDataName = async(rule, value, callBack) => {
      let {status} = await request.post("/collection/info/Data/selectDataByName", {name: value});
      if(status === 200){
        callBack();
      }else{
        callBack(new Error("数据名称已存在"));
      }
    }
    return {
      defaultProps: { //目录Key值配置
        value: "id",
        label: "name",
        children: "childNode"
      },
      steps: 1,
      children: [],//子目录数据
      sourceTableOptions: [],//源表
      formData: {
        beLongCatalog: [],  //所选目录
        sourceData: "", //源数据库
        sourceTable: "", //源数据表
        fileCatalog: [], //源数据表解析出来的数据列表
        specificTime: "",
        type: 1,
        syncUnit: 4,
        oneWeek: 1,
        oneMonth: 1,
        oneYear: 1,
        syncType: 1,
        timeStamp: "",
        syncName: "",
        nameData: "",
        dataDescription: "",
        dataUsage: "",
        dataSource: ""
      },
      rules: { // 验证规则
        beLongCatalog: [
          {required: true, message: "所属目录不能为空", trigger: "change"}
        ],
        sourceData: [
          {required: true, message: "源数据库不能为空", trigger: "change"}
        ],
        sourceTable: [
          {required: true, message: "源数据表不能为空", trigger: "change"}
        ],
        fileCatalog: [
          {required: true, message: "信息项最少保留一条记录", trigger: "blur"},
        ],
        specificTime: [
          {required: true, message: "具体时间不能为空", trigger: "change"}
        ],
        oneWeek: [
          {required: true, message: "请设定每周哪天进行更新", trigger: "change"}
        ],
        oneMonth: [
          {required: true, message: "请设定每月哪天进行更新", trigger: "change"}
        ],
        oneYear: [
          {required: true, message: "请设定每年哪月进行更新", trigger: "change"}
        ],
        timeStamp: [
          {required: true, message: "时间戳不能为空", trigger: "change"},
        ],
        syncName: [
          {required: true, message: "同步名称不能为空", trigger: "blur"},
          {max: 50, message: "同步名称长度不能超过50",trigger: "blur"},
          {validator: repeatSyncName, trigger: "blur"}
        ],
        dataDescription: [
          {required: true, message: "数据描述不能为空", trigger: "blur"},
          {max: 100, message: "数据描述长度不能超过100", trigger: "blur"}
        ],
        dataUsage: [
          {required: true, message: "数据用途不能为空", trigger: "blur"},
          {max: 100, message: "数据用途长度不能超过100", trigger: "blur"}
        ],
        dataSource: [
          {required: true, message: "数据来源不能为空", trigger: "blur"},
          {max: 100, message: "数据来源长度不能超过50",trigger: "blur"}
        ],
        nameData:[
          {required: true, message: "数据名称不能为空", trigger: "blur"},
          {max: 50, message: "数据名称长度不能超过50",trigger: "blur"},
          {validator: repeatDataName, trigger: "blur"}
        ],
      },
      fileCatalog: {
        name: [
          {required: true, message: "中文名称不能为空", trigger: "blur"},
          {pattern: /^[^\s]+$/, message: "中文名称不能包含空格", trigger: "blur"},
          {max: 64, message: "中文名称长度不能超过64", trigger: "blur"}
        ],
        nameEng: [
          {required: true, message: "英文名称不能为空", trigger: "blur"},
          /*{pattern: /^[a-zA-Z_0-9]+$/, messag


          e: "英文名称不能必须是英文或者英文加下划线或者数字", trigger: "blur"},*/
          {max: 64, message: "英文名称长度不能超过64", trigger: "blur"}
        ],
        description: [
          {required: true, message: "说明名称不能为空", trigger: "blur"},
          {pattern: /^[^\s]+$/, message: "说明不能包含空格", trigger: "blur"},
          {max: 100, message: "说明长度不能超过100", trigger: "blur"}
        ]
      },
      oneMonthDay: [], //每月天数列表
      oneYearMonth: [], //每年月份
    }
  },
  created() {
    this.getMonthDay();
    //this.getDataResList();
  },
  methods: {
    //下一步按钮事件
    async nextStep(){
      const formBox = this.$refs.formBox;
      let bOn = true;
      if(this.steps === 1){
        await formBox.validateField(["beLongCatalog", "sourceData", "sourceTable",], error => {
          if(error){
            bOn = false;
          }
        });
        await this.formData.fileCatalog.forEach(async (item,index) => {
          await formBox.validateField([`fileCatalog.${index}.name`,`fileCatalog.${index}.nameEng`,`fileCatalog.${index}.description` ], error => {
            if(error){
              bOn = false;
            }
          });
        })
      }
      else if(this.steps === 2){
        await formBox.validateField(["specificTime", "oneWeek", "oneMonth", "oneYear", "timeStamp", "syncName"],error => {
          if(error){
            bOn = false
          }
        });
      }
      else if(this.steps === 3){
        await formBox.validateField(["nameData","dataDescription", "dataUsage", "dataSource"], error => {
          if(error){
            bOn = false;
          }
        });
      }
      if(bOn){
        if(this.steps < 3){
          if(this.steps === 2){
            console.log(1111);
            await formBox.validateField("syncName", error => {
              if(!error){
                this.steps += 1;
              }
            })
          }else{
            this.steps += 1;
          }
        }else{
          let params = {
            rootId: this.formData.beLongCatalog[0],
            subId: this.formData.beLongCatalog[1],
            dbSourceId: this.formData.sourceData,
            sourceTable: this.formData.sourceTable,
            hour: this.formData.specificTime,
            week: this.formData.oneWeek,
            day: this.formData.oneMonth,
            type: this.formData.type,
            syncUnit: this.formData.syncUnit,
            month:this.formData.oneYear,
            syncType: this.formData.syncType,
            timestampColumn: this.formData.timeStamp,
            syncName: this.formData.syncName,
            dataName: this.formData.nameData,
            purpose: this.formData.dataUsage,
            dataSource: this.formData.dataSource,
            description: this.formData.dataDescription,
          }
          params.metaInsertParam = this.formData.fileCatalog.map(item => {
            return {
              rootId: this.formData.beLongCatalog[0],
              subId: this.formData.beLongCatalog[1],
              description: item.description,
              nameEng: item.nameEng,
              length: item.length,
              type: item.type,
              name: item.name,
              dataType:item.dataType,
            }
          });
          let result = await request.post("/collection/info/DbSync/createSync", params, {
            loading: true,
            loadingTitle: "创建同步任务中……"
          });
          if(result.status === 200){
            this.$message.success("创建成功");
            this.closeNewAdd();
          }else{
            this.$message.warning(result.message);
          }
        }
      }else{
        this.$message.warning("请按规则完善必填字段");
      }
    },
    async nextStep2() {
      const formBox = this.$refs.formBox;

      formBox.validate(async valid => {
        if(valid){
          if(this.steps === 3){
            formBox.validateField("dataNames",error => {
            });
          }
          //formBox.clearValidate();
          if(this.steps < 3){
            this.steps += 1;
          }else{
            let params = {
              rootId: this.formData.beLongCatalog[0],
              subId: this.formData.beLongCatalog[1],
              dbSourceId: this.formData.sourceData,
              sourceTable: this.formData.sourceTable,
              type: this.formData.type,
              syncUnit: this.formData.unit,
              hour: this.formData.specificTime,
              week: this.formData.oneWeek,
              day: this.formData.oneMonth,
              month:this.formData.oneYear,
              syncType: this.formData.syncType,
              timestampColumn: this.formData.timeStamp,
              syncName: this.formData.syncName,
              dataName: this.formData.dataName,
              purpose: this.formData.dataUsage,
              dataSource: this.formData.dataSource,
              description: this.formData.dataDescription,
            }
            params.metaInsertParam = this.formData.fileCatalog.map(item => {
              return {
                rootId: this.formData.beLongCatalog[0],
                subId: this.formData.beLongCatalog[1],
                description: item.remark,
                length: item.length,
                type: item.type,
                name: item.name
              }
            });
            if(this.formData.syncStrategy === 0){
              params.type = 1;
            }else{
              params.type = 2;
              params.syncUnit = this.formData.syncStrategy;
            }
            let result = await request.post("/collection/info/DbSync/createSync", params, {
              loading: true,
              loadingTitle: "创建同步任务中……"
            });
            if(result.status === 200){
              this.$message.success("创建成功");
              this.closeNewAdd();
            }else{
              this.$message.warning(result.message);
            }
          }
        }else{
          this.$message.warning("请完善字段");
        }
      })
    },
    //上一步按钮事件
    prevStep() {
      let formBox = this.$refs.formBox;
      if (this.steps > 1) {
        this.steps--;
        formBox.clearValidate();
      }
    },
    // 获取每月天数
    getMonthDay() {
      for (let i = 1; i <= 31; i++) {
        this.oneMonthDay.push(i);
        if (i <= 12) {
          this.oneYearMonth.push(i);
        }
      }
    },
    // 初始化步骤
    resetStep() {
      this.steps = 1;
    },
    //关闭弹窗
    closeNewAdd() {
      this.$emit("close-new-add");
    },
    //清除表单内容
    clearContent(){
      const formBox = this.$refs.formBox;
      formBox.resetFields();
      this.formData = {
        beLongCatalog: [],  //所选目录
        sourceData: "", //源数据库
        sourceTable: "", //源数据表
        fileCatalog: [],//源数据表解析出来的数据列表
        syncStrategy: 0,
        specificTime: "",
        oneWeek: 1,
        oneMonth: 1,
        oneYear: 1,
        syncType: 1,
        timeStamp: "",
        syncName: "",
        dataName: "",
        dataDescription: "",
        dataUsage: "",
        dataSource: "",
        description:""
      }
    },
    //获取所属目录
    async getcatalogList() {
      try {
        let result = await request.post('/collection/info/DirectoryRoot/listRootAndSupDirectory', {}, {loading: true, loadingTitle: "获取目录信息"});
        if(result.status === 200){
          this.catalogList = result.data;
        }else if(result.status === 204){
          this.catalogList = [];
        }else{
          this.$message.warning(result.message);
        }
      }catch (e) {

      }
    },
    //获取数据源
    async getDataResList() {
      try {
        let result = await request.post('/collection/info/DbSource/getAllDbsource', {}, {
          loading: true,
          loadingTitle: "获取数据源数据"
        });
        if(result.status === 200){
          this.sourceDataOptions = result.data;
        }else if(result.status === 204){
          this.sourceDataOptions = [];
        }else{
          this.$message.warning(result.message);
        }
      }catch (e) {

      }
    },
    //获取源表
    async getResTableList() {
      let params = {
        dataSourceId: this.formData.sourceData
      };
      try {
        let result = await request.post('/collection/data/database/getTables', params, {loading:true, loadingTitle: "获取源表数据中……"});
        if(result.status === 200){
          this.sourceTableOptions = result.data;
          this.formData.sourceTable = "";
          this.formData.fileCatalog = [];
        }else if(result.stats === 204){
          this.sourceTableOptions = [];
          this.formData.sourceTable = "";
          this.formData.fileCatalog = [];
        }else{
	        this.formData.fileCatalog = [];
          this.$message.warning(result.message);
        }
      }catch (e) {

      }
    },
    async selectTableHandler(){
      try {
        let result = await request.post("/collection/data/database/getColumns", {
          dataSourceId: this.formData.sourceData,
          tableName: this.formData.sourceTable
        }, {
          loading: true,
          loadingTitle: "获取表字段中"
        });
        if(result.status === 200){
          this.formData.fileCatalog = result.data.map(item => {
            return {
              id: Math.random(),
              name: item.name ? item.name : "",
              nameEng: item.nameEng ? item.nameEng : "",
              description: item.description ?item.description : "" ,
              type: item.type,
              dataType: item.dataType,
              length: item.length
            }
          })
        }else if(result.status === 204){
          this.formData.fileCatalog = [];
        }else{
          this.$message.warning(result.message);
        }
      }catch (e) {

      }
    },
    jumpDataSource(){ //点击提示，跳转到数据源管理
      this.$emit("jump-data");
    }
  }
}
</script>

<style scoped lang="less">
  .week-select {
    display: flex;
    align-items: center;

    .mark {
      margin-left: 10px;
    }
  }
</style>
