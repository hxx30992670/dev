<template>
  <div>
    <el-form :model="tableSyncData" :rules="rules" ref="formBox" label-position="right" label-width="140px">
      <el-form-item label="源数据库：">
        <el-input v-model="tableSyncData.sourceData" readonly disabled style="width: 90%"></el-input>
      </el-form-item>
      <el-form-item label="源表：">
        <el-input v-model="tableSyncData.sourceTable" readonly disabled style="width: 90%"></el-input>
      </el-form-item>
      <el-form-item label="同步策略：" prop="syncType">
        <el-select v-model="tableSyncData.syncType" style="width: 40%">
          <el-option label="手动" :value="1"></el-option>
          <el-option label="自动" :value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="同步周期：" prop="syncStrategy" v-if="tableSyncData.syncType === 2">
        <el-select v-model="tableSyncData.syncStrategy" style="width: 40%">
          <el-option label="按天" :value="4"></el-option>
          <el-option label="按周" :value="3"></el-option>
          <el-option label="按月" :value="2"></el-option>
          <el-option label="按年" :value="1"></el-option>
        </el-select>
      </el-form-item>
      <!--按天-->
      <template v-if="tableSyncData.syncStrategy === 4 && tableSyncData.syncType === 2">
        <el-form-item label="具体时间" prop="specificTime">
          <el-time-picker type="time" v-model="tableSyncData.specificTime"
                          style="width: 40%" value-format="HH:mm:ss"></el-time-picker>
        </el-form-item>
      </template>
      <!--按周-->
      <template v-else-if="tableSyncData.syncStrategy === 3 && tableSyncData.syncType === 2">
        <el-form-item label="每周" prop="oneWeek">
          <el-select v-model="tableSyncData.oneWeek" style="width: 40%">
            <el-option label="一" value="1"></el-option>
            <el-option label="二" value="2"></el-option>
            <el-option label="三" value="3"></el-option>
            <el-option label="四" value="4"></el-option>
            <el-option label="五" value="5"></el-option>
            <el-option label="六" value="6"></el-option>
            <el-option label="日" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="具体时间" prop="specificTime">
          <el-time-picker type="time" v-model="tableSyncData.specificTime"
                          style="width: 40%" value-format="HH:mm:ss"></el-time-picker>
        </el-form-item>
      </template>
      <!--按月-->
      <template v-else-if="tableSyncData.syncStrategy === 2 && tableSyncData.syncType === 2">
        <el-form-item label="每月：" prop="oneMonth">
          <div class="week-select">
            <el-select v-model="tableSyncData.oneMonth" style="width: 40%">
              <el-option v-for="day in oneMonthDay" :label="day" :value="day"></el-option>
            </el-select>
            <p class="mark">日</p>
          </div>
        </el-form-item>
        <el-form-item label="具体时间" prop="specificTime">
          <el-time-picker type="time" v-model="tableSyncData.specificTime"
                          style="width: 40%" value-format="HH:mm:ss"></el-time-picker>
        </el-form-item>
      </template>
      <!--按年-->
      <template v-else-if="tableSyncData.syncStrategy === 1 && tableSyncData.syncType === 2">
        <el-form-item label="每年：" prop="oneYear">
          <div class="week-select">
            <el-select v-model="tableSyncData.oneYear" style="width: 40%">
              <el-option v-for="month in oneYearMonth" :label="month" :value="month"></el-option>
            </el-select>
            <p class="mark">月</p>
          </div>
        </el-form-item>
        <el-form-item label="每月：" prop="oneMonth">
          <div class="week-select">
            <el-select v-model="tableSyncData.oneMonth" style="width: 40%">
              <el-option v-for="day in oneMonthDay" :label="day" :value="day"></el-option>
            </el-select>
            <p class="mark">日</p>
          </div>
        </el-form-item>
        <el-form-item label="具体时间" prop="specificTime">
          <el-time-picker type="time" v-model="tableSyncData.specificTime"
                          style="width: 40%" value-format="HH:mm:ss"></el-time-picker>
        </el-form-item>
      </template>

      <el-form-item label="同步类型：" prop="syncType">
        <el-radio v-model="tableSyncData.saveType" :label="2">增量同步</el-radio>
        <el-radio v-model="tableSyncData.saveType" :label="1">全量同步</el-radio>
      </el-form-item>
      <el-form-item label="选择时间戳:" v-if="tableSyncData.saveType === 2" prop="timeStamp">
        <el-select v-model="tableSyncData.timeStamp" style="width: 40%">
          <el-option v-for="item in tableSyncData.timestampArr" :label="item.name" :value="item.nameEng"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="同步名称：" prop="syncName">
        <el-input v-model="tableSyncData.syncName" readonly disabled style="width: 90%"></el-input>
      </el-form-item>
      <el-form-item label="数据名称：" prop="dataName">
        <el-input v-model="tableSyncData.dataName" readonly disabled style="width: 90%"></el-input>
      </el-form-item>
      <el-form-item label="数据描述：" prop="dataDescription">
        <el-input v-model="tableSyncData.dataDescription" style="width: 90%"></el-input>
      </el-form-item>
      <el-form-item label="数据用途：" prop="dataUse">
        <el-input v-model="tableSyncData.dataUse" style="width: 90%"></el-input>
      </el-form-item>
      <el-form-item label="所属系统：" prop="dataSource">
        <el-input v-model="tableSyncData.dataSource" style="width: 90%"></el-input>
      </el-form-item>
      <div class="submit-box">
        <el-button type="primary" @click="saveEdit">保存</el-button>
        <el-button @click="closeEdit">取消</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import request from "@/libs/request";

export default {
  name: "EditTableSync",
  props: {
    tableSyncData: {
      type: Object
    }
  },
  data() {
    return {
      // 验证规则
      timestampArr: [], //时间戳列表
      formData: {
        sourceData: "",
        sourceTable: "",
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
      },
      rules: {
        timeStamp: [
          {required: true, message: "时间戳不能为空", trigger: "change"}
        ],
        syncStrategy: [
          {required: true, message: "同步周期不能为空", trigger: "change"}
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
        syncType: [
          {required: true, message: "同步类型不能为空", trigger: "change"}
        ],
        dataDescription: [
          {required: true, message: "数据描述不能为空", trigger: "blur"},
          {max: 200, message: "数据描述不能超过200", trigger: "blur"}
        ],
        dataUse: [
          {required: true, message: "数据用途不能为空", trigger: "blur"},
          {max: 200, message: "数据用途不能超过200", trigger: "blur"}
        ],
        dataSource: [
          {required: true, message: "数据用途不能为空", trigger: "blur"},
          {max: 200, message: "数据用途不能超过200", trigger: "blur"}
        ],
        syncName: [
          {required: true, message: "同步名称不能为空", trigger: "blur"},
        ],
        dataName: [
          {required: true, message: "数据名称不能为空", trigger: "blur"},
        ]
      },
      oneMonthDay: [], //每月天数
      oneYearMonth: [], //每年月数
    }
  },
  created() {
    this.getMonthDay();
  },
  methods: {
    async getDetailsData(){ //获取详情数据
      try {
        this.$refs.formBox.validate(async valid => {
          if(!valid){
            this.$message.warning("请完善字段");
          }
        })
        let {data,message,status} = await request.post(this.tableSyncData.url,{id: this.tableSyncData.id},{loading: true, loadingTitle:"获取数据详细信息"});
        if(status === 200){
          this.formData = {
            id: data.dbSyncAndSourceEntity.id,
            dataId: data.dbSyncAndSourceEntity.dataId,
            sourceData: data.dbSyncAndSourceEntity.dbSourceEntity.name,
            sourceTable: data.dbSyncAndSourceEntity.sourceTable,
            syncType: data.dbSyncAndSourceEntity.type,
            syncStrategy: data.dbSyncAndSourceEntity.syncUnit,
            specificTime: data.dbSyncAndSourceEntity.time,
            oneWeek: data.dbSyncAndSourceEntity.week,
            oneMonth: data.dbSyncAndSourceEntity.month,
            saveType: data.dbSyncAndSourceEntity.syncType,
            syncName: data.dbSyncAndSourceEntity.syncName,
            dataName: data.dataEntity.name,
            description: data.dataEntity.dataDescription,
            dataUse: data.dataEntity.purpose,
            dataSource: data.dataEntity.dataSource
          }
          this.timestampArr = data.directoryMetaEntityList.filter(item => {
            return item.dataType.toUpperCase() === "DATE"
          });
        }else{
          this.$message.warning(message);
        }
      }catch (e) {

      }
    },
    clearContent(){
      if(this.$refs.formBox){
        this.$refs.formBox.resetFields();
        this.$refs.formBox.clearValidate();
      }
    },
    getMonthDay() { //获取每月天数，及一年月数
      for (let i = 1; i <= 31; i++) {
        this.oneMonthDay.push(i);
        if (i <= 12) {
          this.oneYearMonth.push(i);
        }
      }
    },
    closeEdit() { //关闭编辑窗口
      this.$emit("close-new-add");
    },
    //保存编辑
    async saveEdit() {
      try{
        this.$refs.formBox.validate(async valid => {
          if(valid){
            let params = {
              id: this.tableSyncData.id,
              dataId: this.tableSyncData.dataId,
              dataSource: this.tableSyncData.dataSource,
              day: this.tableSyncData.oneMonth,
              description: this.tableSyncData.dataDescription,
              hour: this.tableSyncData.specificTime,
              month: this.tableSyncData.oneYear,
              purpose: this.tableSyncData.dataUse,
              syncType: this.tableSyncData.saveType,
              syncUnit: this.tableSyncData.syncStrategy,
              timestampColumn: this.tableSyncData.timeStamp,
              week: this.tableSyncData.oneWeek,
              type: this.tableSyncData.syncType
            }
            let {message,status} = await request.post("/collection/info/DbSync/update", params, {
              loading: true,
              loadingTitle: "修改同步任务中……"
            });
            if(status === 200){
              this.$message.success("修改成功");
              this.closeEdit();
              //this.resetFormValue();
            }else{
              this.$message.warning(message);
            }
          }else{
            this.$message.warning("请完善字段");
          }
        });

      }catch (e) {

      }
    },
    resetFormValue(){
      this.formData = {
        sourceData: "",
        sourceTable: "",
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
      }
    }
  }
}
</script>

<style scoped lang="less">
  .el-form {
    .week-select {
      display: flex;
      align-items: center;

      .mark {
        margin-left: 15px;
      }
    }

    .submit-box {
      padding-left: 140px;
      padding-top: 20px;

      .cancel-btn {
        background: #ccc;
        color: #fff;
      }
    }
  }
</style>
