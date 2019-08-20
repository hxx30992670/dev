<template>
  <div class="setting-panel">
    <div class="setting-header">
      <el-button type="text" @click="closePanel">关闭</el-button>
      <p>表整合</p>
      <el-button type="text" @click="saveSetting" :disabled="!isEdit">保存</el-button>
    </div>
    <div class="setting-body">
      <el-form :rules="rules" :model="formData" ref="formBox" label-position="right" label-width="100px" size="small">
        <el-form-item label="整合表：" prop="joinTableName">
          <el-select v-model="formData.joinTableName">
            <el-option :value="item.id" :label="item.name" v-for="item in sourceList" :key="item.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  import {mapState} from "vuex";
  import request from "@/libs/request";
  export default {
    name: "TableJoin",
    props: {
      runEdit: {
        type: Boolean,
        default: true
      }
    },
    computed: {
      ...mapState({
        formData: state => state.tableJoinData,
        inputTableData: state => state.tableInputSetting,
        isEdit: state => state.isEdit
      })
    },
    data(){
      return {
        rules: {
          joinTableName: [
            {required: true, message: "整合表不能为空", trigger: "change"}
          ]
        },
        sourceList: []
      }
    },
    activated(){

    },
    methods: {
      async getTableList(){ //获取表数据
        try {
          await request.post
        }catch (e) {

        }
      },
      clearValidate(){
        if(this.$refs.formBox){
          this.$refs.formBox.clearValidate();
        }
      },
      closePanel(){
        this.$emit("close-panel");
      },
      saveSetting(){

      }
    }
  }
</script>

<style scoped>

</style>