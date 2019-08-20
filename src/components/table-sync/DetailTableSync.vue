<template>
  <div>
    <el-form :model="tableSyncData" label-width="180px" label-position="right">
      <el-form-item label="源数据库：">
        <el-input v-model="tableSyncData.name" readonly style="width: 90%"></el-input>
      </el-form-item>
      <el-form-item label="源表：">
        <el-input v-model="tableSyncData.sourceTable" readonly style="width: 90%"></el-input>
      </el-form-item>
      <el-form-item label="同步策略：">
        <el-input v-model="tableSyncData.syncStrategy" readonly style="width: 90%"></el-input>
      </el-form-item>
      <el-form-item label="同步类型：">
        <el-input v-model="tableSyncData.syncType === 1?'全量同步':'增量同步'" readonly style="width: 90%">
        </el-input>
      </el-form-item>
      <el-form-item label="选择时间戳字段：" v-if="tableSyncData.saveType === 2">
        <el-input v-model="tableSyncData.timestampColumn" readonly style="width: 90%"></el-input>
      </el-form-item>
      <el-form-item label="同步名称：">
        <el-input v-model="tableSyncData.syncName" readonly style="width: 90%"></el-input>
      </el-form-item>
      <el-form-item label="数据名称：">
        <el-input v-model="tableSyncData.dataName" readonly style="width: 90%"></el-input>
      </el-form-item>
      <el-form-item label="数据描述：">
        <el-input v-model="tableSyncData.description" readonly style="width: 90%"></el-input>
      </el-form-item>
      <el-form-item label="数据用途：">
        <el-input v-model="tableSyncData.purpose" readonly style="width: 90%"></el-input>
      </el-form-item>
      <el-form-item label="所属系统：">
        <el-input v-model="tableSyncData.dataSource" readonly style="width: 90%"></el-input>
      </el-form-item>
      <!--<el-form-item label="当前状态：">-->
      <!--<el-input v-model="tableSyncData.currentStatus" readonly style="width: 70%"></el-input>-->
      <!--</el-form-item>-->
      <!--<el-form-item label="成功/失败/手动停止次数：">-->
      <!--<el-input v-model="tableSyncData.sumNum" readonly style="width: 70%"></el-input>-->
      <!--</el-form-item>-->
      <!--<el-form-item label="最后一次执行时间：">-->
      <!--<el-input v-model="tableSyncData.lastTime" readonly style="width: 70%"></el-input>-->
      <!--</el-form-item>-->
      <!--<el-form-item label="历史执行：">-->
      <!--<el-button type="text" @click="showHistory(tableSyncData)">查看</el-button>-->
      <!--</el-form-item>-->
      <div class="submit-box" style="padding: 0">
        <el-button type="primary" @click="closeDetail">关闭</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "DetailTableSync",
  props: {
    tableSyncData: {
      type: Object
    }
  },
  methods: {
    // showHistory(row){  //查看历史执行
    //   this.$emit("open-history", row);
    // },
    closeDetail() { //关闭详情
      this.$emit("close-new-add");
    },
    created() {
      console.log(this.tableSyncData);
    },
  }
}
</script>

<style scoped lang="less">
  .submit-box {
    padding-top: 20px;
    text-align: center;
  }
</style>
