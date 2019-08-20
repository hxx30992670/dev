<template>
  <div class="container">
    <el-form :rules="rules" label-position="right" label-width="180px" size="small" :model="formData" ref="formBox">
      <el-form-item
        label="请选择服务所属主题："
        prop="topic"
      >
        <el-select
          v-model="formData.topic"
        >
          <el-option 
            v-for="item in themeList"
            :label="item.topicName"
            :value='item.id'
            :key="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="服务名称："
        prop="name"
      >
        <el-input v-model="formData.name" style="width:90%"></el-input>
      </el-form-item>
    </el-form>
    <div class="submit-box">
      <el-button
        type='primary'
        @click="saveService"
      >确定</el-button>
      <el-button
        type='info'
        @click="closeService"
      >取消</el-button>
    </div>
  </div>
</template>

<script>
import request from "@/libs/request";
export default {
  name: "ServiceCreate",
  props: {
    currentData: Object
  },
  data() {
    const validName = async (rule,value,callBack) => {
      try{
        const {status, message} = await request.post('/serviceitem/verification/serviceName', {serviceName: value});
        if(status === 200) {
          callBack();
        }else {
          callBack(new Error(message));
        }
      }catch(e) {
        this.$message.error(e);
        callBack(new Error('验证出错'));
      }
    }
    return {
      rules: {
        topic: [
          { required: true, message: "所属主题不能为空", trigger: "change" }
        ],
        name: [
          { required: true, message: "服务名称不能为空", trigger: "blur" },
          {max: 50, message: '服务名称长度不可超过50', trigger: 'blur'},
          {validator: validName, trigger: 'blur'}
        ]
      },
      formData: {
        name: '',
        topic: ''
      },
      themeList: []
    };
  },
  created() {
    this.getThemeList();
  },
  
  methods: {
    //获取服务列表
    async getThemeList(){ //获取主题列表
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
    async saveService() {
      try{
        let formBox = this.$refs.formBox;
        formBox.validate(async valid => {
          if(valid) {
            const params = {
              dataId: this.currentData.id,
              serviceName: this.formData.name,
              topicId: this.formData.topic
            }
            const {status, message} = await request.post('/collection/info/ServiceController/createService', params, {loading: true, loadingTitle: '正在生成服务项……'});
            if(status === 200) {
              this.$message.success('生成服务项成功');
              this.closeService();
            }else {
              this.$message.warning(message);
            }
          }else {
            this.$message.warning("请按规则完善必填字段");
          }
        });
      }catch(e) {
        this.$message.error(e);
      }
    },
    closeService() {
      this.$emit("close-service");
    }
  }
};
</script>
<style lang='less' scoped>
.submit-box {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0 0 !important; 
}
</style>