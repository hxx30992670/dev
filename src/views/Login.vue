<template>
  <div class="login-wrap"
   v-loading="loading"
   :element-loading-text="loadingTitle"
   element-loading-spinner="el-icon-loading"
   element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <div class="login-box">
      <h2 class="title">跨部门大数据应用平台</h2>
      <div class="form-wrap">
        <el-form :rules="rules" ref="formBox" :model="formData">
          <el-form-item prop="userName" size="large">
            <div class="input-box">
              <el-input size="large" class="login-input" placeholder="请输入用户名" v-model="formData.userName" ref="userName" @keyup.native.enter="userNameEnter">
                <i slot="prefix" class="iconfont iconloginUser"></i>
              </el-input>
            </div>
          </el-form-item>
          <el-form-item prop="password" size="large">
            <div class="input-box">
              <el-input size="large" type="password" class="login-input" placeholder="请输入密码" v-model="formData.password" ref="password" @keyup.native.enter="passwordEnter">
                <i slot="prefix" class="iconfont iconpassword"></i>
              </el-input>
            </div>
          </el-form-item>
          <el-form-item prop="code" size="large">
            <div class="input-box">
              <div class="code-box">
                <el-input size="large" class="login-input"  placeholder="请输入验证码" v-model="formData.code" style="width: 70%" ref="code" @keyup.native.enter="loginSubmit"></el-input>
                <img :src="codeUrl" alt="" @click="getCode">
              </div>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button class="login-btn" size="large" @click="loginSubmitBak">登陆</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import LocalSave from "../libs/LocalSave.js";
import request from "../libs/request.js";
import {mapState} from "vuex";
export default {
  name: "Login",
  computed: {
    ...mapState(["loading", "loadingTitle"])
  },
  data(){
    return {
      codeUrl: "",
      cToken: "",
      formData: {
        userName: "",
        password: "",
        code: ""
      },
      rules: {
        userName: [
          {required: true, message: "用户名不能为空", trigger: "blur"}
        ],
        password: [
          {required: true, message: "密码不能为空", trigger: "blur"}
        ],
        code: [
          {required: true, message: "验证码不能为空", trigger: "blur"}
        ]
      }
    }
  },
  created(){
    this.getCode();
  },
  methods: {
    userNameEnter(){
      if(this.$refs.password){
        this.$refs.password.focus();
      }
    },
    passwordEnter(){
      if(this.$refs.code){
        this.$refs.code.focus();
      }
    },
    async loginSubmit(){ //提交登陆
      try {
        let result = await request.post("/usergroup/login/userLogin",{
          code: this.formData.code,
          ctoken: this.cToken,
          name: this.formData.userName,
          password: this.formData.password
        }, {loading: true, loadingTitle: "登陆中……"});
        if(result.status === 200){
          LocalSave.saveSession("authority",result.data);
          if(result.data.mt.startsWith("data_admin")){
            this.$router.push({
              path: "/data-manager"
            });
            console.log("成功");
          }else if(result.data.mt.startsWith("platform_admin") || result.data.mt.startsWith('org_admin')){
            this.$router.push({
              path: "/platform-manager",
            })
          }else if(result.data.mt.startsWith("org_admin")) {
            this.$router.push({
              path: "/platform-manager/user-manager"
            })
          }else if(result.data.mt.startsWith("resource_user")){
            this.$router.push({
              path: "/resource-service",
            })
          }
        }else{
          this.$message.warning(result.message);
          this.getCode();
        }
      }catch (e) {

      }
    },
    loginSubmitBak(){
      request.post("/usergroup/login/userLogin",{
        code: this.formData.code,
        ctoken: this.cToken,
        name: this.formData.userName,
        password: this.formData.password
      }, {loading: true, loadingTitle: "登陆中……"})
        .then(result => {
          if(result.status === 200){
            LocalSave.saveSession("authority",result.data);
            if(result.data.mt.startsWith("data_admin")){
              this.$router.push({
                path: "/data-manager"
              });
              console.log("成功");
            }else if(result.data.mt.startsWith("platform_admin")){
              this.$router.push({
                path: "/platform-manager",
              })
            }else if(result.data.mt.startsWith("resource_user")){
              this.$router.push({
                path: "/resource-service",
              })
            }else if(result.data.mt.startsWith("org_admin")) {
              this.$router.push({
                path: "/platform-manager/user-manager"
              })
            }
          }else{
            this.$message.warning(result.message);
            this.getCode();
          }
        });
    },
    async getCode(){
      try {
        let result = await request.post("/usergroup/login/verificationCode");
          if (result.status === 200) {
              this.codeUrl = result.img;
              this.cToken = result.token;
          } else {
            this.$message.warning(result.message);
          }
      }catch (e) {}
    }
  }
}
</script>

<style lang="less">
  .login-wrap{
    background: #2C3C4C;
    width: 100%;
    height: 100%;
    position: relative;
    .login-box{
      width: 400px;
      height: 500px;
      position: absolute;
      left: 50%;
      margin-left: -200px;
      top: 50%;
      margin-top: -250px;
      border-radius: 8px;
      background: #fff;
      box-sizing: border-box;
      padding: 40px 25px;
      .title{
        text-align: center;
        font-size: 28px;
      }
      .form-wrap{
        padding: 40px 10px 0 10px;
        .input-box{
          padding-bottom: 20px;
          .code-box{
            display: flex;
            img{
              width: 28%;
              margin-left: 5px;
            }
          }
          .el-input{
            i{
              font-size: 24px;
              position: relative;
              top: 4px;
            }
          }
          .login-input{
            input{
              height: 50px !important;
              font-size: 16px;
            }
          }
        }
        .login-btn{
          width: 100%;
          background: #2C3C4C;
          color: #fff;
          height: 50px;
        }
      }
    }
  }
</style>
