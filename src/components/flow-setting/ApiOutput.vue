<template>
  <div class="setting-panel">
    <!--<div class="setting-header">
      <el-button type="text" @click="closePanel">关闭</el-button>
      <p>接口输出</p>
      <el-button type="text" @click="saveSetting" :disabled="!isEdit">保存</el-button>
    </div>-->
    <CommonHeader
      @close-panel="closePanel"
      @save-setting="saveSetting"
      :is-edit="isEdit"
      title="接口输出"
    />
    <div class="setting-body">
      <el-form :rules="rules" :model="formData" ref="formBox" label-position="right" label-width="120px" size="small">
        <el-form-item label="选择接口主题：" prop="theme">
          <el-select v-model="formData.theme" :disabled="!isEdit || !runEdit">
            <el-option :label="item.topicName" :value="item.id" v-for="item in tableData"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import request from "@/libs/request";
import {mapState} from "vuex";
import CommonHeader from "./CommonHeader"
export default {
  name: "ApiOutput",
  props:{
    runEdit: Boolean,
    default: true,
  },
  components: {
    CommonHeader
  },
  computed: {
    ...mapState({
      formData: state => state.apiOutputData,
      isEdit: state => state.isEdit
    })
  },
  data(){
    return {
      rules: {
        theme: [
          {required: true, message: "主题不能为空", trigger: "change"}
        ]
      },
      tableData: [],
    }
  },
  created(){
    this.getThemeList();
  },
  activated(){
    this.clearValidate();
  },
  methods: {
    clearValidate(){ //清除验证
      if(this.$refs.formBox){
        this.$refs.formBox.clearValidate();
      }
    },
    async saveSetting(){ //保存面板配置
      try {
        let params = {
          id: this.formData.flow.flowId,
          name: this.formData.flow.name,
          positionX: 0,
          positionY: 0,
          processingId:this.formData.processingId,
          properties: {
            topicId: this.formData.theme
          },
          templateId: this.formData.flow.templateId
        }
        let {status, message, data} = await request.put("/processing-core/node/updateApiOutputNodeConfig",params, {
          loading: true,
          loadingTitle: "保存接口输出配置中……"
        });
        if(status === 200){
          this.$message.success("保存成功");
          this.$emit("close-panel",data);
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
    async getThemeList(){ // 获取主题列表
      try {
        let {data,message,status} = await request.get("/serviceitem/serviceTopic/getTopicList", {}, {
          loading: true,
          loadingTitle: "获取主题列表中……"
        });
        if(status === 200 || status === 204){
          this.tableData = data;
        }else{
          this.$message.warning(message);
        }
      }catch (e) {

      }
    },
  }
}
</script>

<style scoped>

</style>
