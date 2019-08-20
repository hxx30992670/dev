<template>
<!--内容区域-->
<div class="content-wrap">
  <el-tabs type="card" v-model="activeTab" class="custom-tab">
    <el-tab-pane label="主题配置" name="file">
      <div class="content-box">
        <div>
          <el-button class="button-tag" @click="addTopic()">
            + 新增主题
          </el-button>
        </div>

        <el-tag :key="(tag.id)" size="large" v-for="tag in topicTagsForm" closable
                :disable-transitions="false" @close="handleClose(tag)" v-if="tag.num==0">
          {{tag.topicName}}({{tag.num}})
        </el-tag>
        <el-tag type="info" :key="(tag.id)" size="large" v-for="tag in topicTagsForm" v-if="tag.num>0">
          {{tag.topicName}}({{tag.num}})
        </el-tag>

        <!--<el-input v-if="inputVisible" class="input-new-tag" ref="saveTagInput"-->
        <!--v-model="topicTagsForm.topicName" @keyup.enter.native="handleInputConfirm"-->
        <!--@blur="handleInputConfirm"></el-input>-->
        <!--<el-button v-else class="button-tag" @click="showInput">+ 新增主题</el-button>-->

        <el-dialog title="新增主题" :visible.sync="addVisible" custom-class="dialog-box">
          <el-form :model="addForm" :rules="rules" ref="addForm" label-width="100px"
                   class="demo-ruleForm">
            <el-form-item label="新增主题名" prop="topicName">
              <el-input v-model="addForm.topicName" placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm('addForm',addForm)">保 存
              </el-button>
              <el-button @click="addVisible = false,cancelForm('addForm')">取 消</el-button>
            </el-form-item>
          </el-form>
        </el-dialog>
      </div>
    </el-tab-pane>
  </el-tabs>
</div>
</template>

<script>
import request from "@/libs/request";

export default {
  name: "ThemeSetting",
  data() {
    const repeatTopicName = async (rule, value, callBack) => {
      let {status} = await request.post("/serviceitem/serviceTopic/judgeTopic", {topicName: value});
      if (status === 200) {
        callBack();
      } else {
        callBack(new Error("主题已存在"));
      }
    };
    return {
      breadcrumbList: [],
      activeTab: "file",
      topicTagsForm: [],
      inputVisible: false,
      addVisible: false,
      inputValue: '',
      addForm: {
        topicName: ''
      },
      rules: {
        topicName: [
          {required: true, message: '请输入主题名称', trigger: 'blur'},
          {min: 1, max: 10, message: '长度不低于 1 不大于 10 个字符', trigger: 'blur'},
          {validator: repeatTopicName, trigger: "blur"}
        ]
      }
    }
  },
  created() {
    this.createBreadCrumb();
    this.getTopic();
  },
  methods: {
    createBreadCrumb() {
      let navList = this.$route.meta.nav;
      this.breadcrumbList = navList;
    },

    // async handleClose(tag) { //删除主题
    //     let oData = await request.post("/serviceitem/serviceTopic/deleteTopic", {id: tag.id}, {loading: true});
    //     if (oData.status === 200) {
    //         this.$message.success("删除主题成功！");
    //         this.getTopic();
    //     } else {
    //         this.$message.warning(oData.message);
    //     }
    // },
    async handleClose(tag) {
      this.$confirm('确定删除主题：' + tag.topicName + '?', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request.post("/serviceitem/serviceTopic/deleteTopic", {id: tag.id}, {loading: true})
          .then(oData => {
            if (oData.status === 200) {
              this.$message.success("删除主题成功！");
              this.getTopic();
            } else {
              this.$message.warning(oData.message);
            }
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消此操作！',
        });
      });
    },
    addTopic() {
      setTimeout(() => {
        this.$refs.addForm.resetFields();
      }, 1);
      this.addVisible = true;
    },
    async submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          //判断主题名是否重复
          var topicName = this.addForm.topicName;
          // request.post("/serviceitem/serviceTopic/judgeTopic", {topicName: topicName}, {loading: true})
          //     .then(res => {
          //         if (res.status === 200) { //主题不重复
          request.post("/serviceitem/serviceTopic/saveTopic", {topicName: topicName}, {loading: true})
            .then(oData => {
              if (oData.status === 200) {
                this.$message.success("新增主题成功！");
                this.$refs[formName].resetFields();
                this.addVisible = false;
                this.getTopic();
              } else {
                this.$message.warning(oData.message);
              }
            });
          // } else if (res.status === 204) {   //主题重复
          //     this.$message.error("该主题名已存在！");
          // } else {
          //     this.$message.warning(res.message);
          // }
          // })
        } else {
          this.$message.error('表单校验未通过！');
          // this.$refs[formName].resetFields();
        }
      })
    },
    cancelForm(formName) {
      this.$message({
        type: 'info',
        message: '取消输入'
      });
      this.$refs[formName].resetFields();
    },
    async getTopic() { //获取主题
      let oData = await request.get("/serviceitem/serviceTopic/getTopicList", {loading: true});

      if (oData.status === 200) {
        this.topicTagsForm = oData.data;
      } else if (oData.status === 204) {
        this.topicTagsForm = null;
      } else {
        this.$message.warning(oData.message);
      }
    },
    // async handleInputConfirm() { //新增主题
    //     if (this.topicTagsForm.topicName == null || this.topicTagsForm.topicName == "" || this.topicTagsForm.topicName == undefined) {
    //         this.inputVisible = false;
    //     } else {
    //         //判断主题名是否重复
    //         var topicName = this.topicTagsForm.topicName;
    //         let res = await request.post("/serviceitem/serviceTopic/judgeTopic", {topicName: topicName}, {loading: true});
    //
    //         if (res.status === 200) {   //主题不重复
    //             let oData = await request.post("/serviceitem/serviceTopic/saveTopic", {topicName: topicName}, {loading: true});
    //             if (oData.status === 200) {
    //                 this.inputVisible = false;
    //                 this.topicTagsForm.topicName = '';
    //                 this.$message.success("新增主题成功！");
    //                 this.getTopic();
    //             } else {
    //                 this.$message.warning(oData.message);
    //             }
    //         } else if (res.status === 204) {   //主题重复
    //             this.$message.error("该主题名已存在！");
    //         } else {
    //             this.$message.warning(res.message);
    //         }
    //     }
    // }
    // showInput() {
    //     this.inputVisible = true;
    //     this.$nextTick(_ => {
    //         this.$refs.saveTagInput.$refs.input.focus();
    //     });
    // },
  }
}
</script>

<style scoped>
  .el-tag {
    margin-right: 10px;
    margin-top: 10px;
  }

  .button-tag {
    margin-right: 10px;
    margin-top: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
    background: #4887ED;
    color: #fff;
    border:none;
    margin-bottom: 10px;
  }

  .input-new-tag {
    width: 90px;
    margin-right: 10px;
    vertical-align: bottom;
  }
</style>