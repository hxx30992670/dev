<template>
  <div>
    <el-form :model="formData" :rules="rules" ref="formBox" label-position="right" label-width="140px">
      <el-form-item label="数据源名称：" :prop="dialogType ? 'name' : ''">
        <el-input v-model="formData.name" :readonly="!dialogType" placeholder="请输入" style="width: 90%"></el-input>
      </el-form-item>
      <el-form-item label="数据源类型：" :prop="dialogType ? 'dbType' : ''">
        <el-select v-model="formData.dbType" @change="getProv" :disabled="!dialogType">
          <el-option label="mysql" :value="1"></el-option>
          <el-option label="oracle" :value="2"></el-option>
          <el-option label="postgres" :value="3"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="服务器地址：" :prop="dialogType ? 'host' : ''">
        <el-input v-model="formData.host" :readonly="!dialogType" placeholder="请输入" style="width: 90%"></el-input>
      </el-form-item>
      <el-form-item label="端口：" :prop="dialogType ? 'port' : ''">
        <el-input v-model="formData.port" :readonly="!dialogType" placeholder="请输入" style="width: 90%"></el-input>
      </el-form-item>
      <el-form-item label="数据库名称：" :prop="dialogType ? 'databaseName' : ''">
        <el-input v-model="formData.databaseName" :readonly="!dialogType" placeholder="请输入"
                  style="width: 90%"></el-input>
      </el-form-item>
      <el-form-item label="用户名：" :prop="dialogType ? 'account' : ''">
        <el-input v-model="formData.account" :readonly="!dialogType" placeholder="请输入" style="width: 90%"></el-input>
      </el-form-item>
      <el-form-item label="密码：" :prop="dialogType ? 'password' : ''">
        <el-input v-model="formData.password" :readonly="!dialogType"
                  type="password" placeholder="请输入" style="width: 90%"></el-input>
      </el-form-item>
      <el-form-item label="版本号：" :prop="dialogType ? 'dbVersion' : ''">
        <el-select v-model="formData.dbVersion" :disabled="!dialogType" placeholder="请先选择数据源类型">
          <el-option
              v-for="items in tempVersion"
              :label="items.version"
              :value="items.version"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="数据库模式：" v-if="formData.dbType === 3">
        <el-input v-model="formData.schemaName" placeholder="请输入" style="width: 90%"></el-input>
      </el-form-item>
      <el-form-item>
        <div class="function-box" v-if="dialogType">
          <div class="item">
            <el-button v-on:click="validation">验证</el-button>
            <span class="success" v-show="validationSuccess"><i class="el-icon-success"></i>成功</span>
            <span class="error" v-show="validationEro"><i class="el-icon-success"></i>失败</span>
          </div>
          <div class="item" style="padding-right: 10%;">
            <span class="tips">*数据验证通过后才可保存</span>
            <el-button :disabled="openIsDisabled" type="primary" @click="saveNewAdd">保存</el-button>
          </div>
        </div>
      </el-form-item>
      <!--<div class="submit-box">-->
      <!--<el-button type="primary" @click="closeNewAdd">关闭</el-button>-->
      <!--</div>-->
    </el-form>
  </div>
</template>

<script>
import request from "@/libs/request";

export default {
  name: "DataSource",
  props: {
    dialogType: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      required: true
    }
  },
  data() {
    const repeatName = async(rule,value,callBack) => {
      let {status} = await request.post("/collection/info/DbSource/selectByName", {dbSourceName: value});
      if(status === 200){
        callBack();
      }else{
        callBack(new Error("数据源名称已存在"));
      }
    }
    return {
      versionOption: [],
      tempVersion: [],
      dataSchemaShow: false,
      openIsDisabled: true,
      validationSuccess: false,
      validationEro: false,
      rules: {
        name: [
          {required: true, message: "数据源名称不能为空", trigger: 'blur'},
          {max: 50, message: "数据源名称长度不能超过50", trigger: "blur"},
          {validator:repeatName, trigger: "blur"}
        ],
        dbType: [
          {required: true, message: "数据源类型不能为空", trigger: 'change'},
        ],
        host: [
          {required: true, message: "服务器地址不能为空", trigger: 'blur'},
          {max: 100, message: "服务器地址长度不能超过100", trigger: "blur"}
        ],
        port: [
          {required: true, message: "端口不能为空", trigger: 'blur'},
          {max: 5, message: "端口不能超过5位数", trigger: 'blur'},
        ],
        databaseName: [
          {required: true, message: "数据库名称不能为空", trigger: 'blur'},
          {max: 50, message: "数据库名称长度不能超过50", trigger: 'blur'}
        ],
        account: [
          {required: true, message: "用户名不能为空", trigger: 'blur'},
          {max: 20, message: "用户名长度不能超过20", trigger: 'blur'}
        ],
        password: [
          {required: true, message: "密码不能为空", trigger: 'blur'},
          {max: 20, message: "密码长度不能超过20", trigger: 'blur'}
        ],
        dbVersion: [
          {required: true, message: "版本号不能为空", trigger: 'change'},
        ],
        schemaName: [
          {required: true, message: "数据库模式不能为空", trigger: 'change'},
          {max: 100, message: "数据库模式长度不能超过100", trigger: 'blur'}
        ]
      }
    }
  },
  created() {
    this.onSelectedTopic();
    console.log(this.formData);
    //this.getProv();
  },
  methods: {
    //关闭新建数据源弹窗
    // closeNewAdd() {
    //     this.formData.name = "";
    //     this.formData.dbType = "";
    //     this.formData.host = "";
    //     this.formData.port = "";
    //     this.formData.databaseName = "";
    //     this.formData.account = "";
    //     this.formData.password = "";
    //     this.formData.dbVersion = "";
    //     this.formData.schemaName = "";
    //     this.$emit("close-dialog");
    // },
    //获取全部版本号
    onSelectedTopic() {
      let params = {
        "databaseType": ""
      };
      request.post('/collection/info/DbSource/selectDatabaseVersion', params, {loading: true})
        .then(res => {
          if (res.status === 200 || res.status === 204) {
            this.versionOption = res.data;
          } else {
            this.message.error(res.message);
          }
        })
    },
    //验证数据库信息
    validation() {
      let params = {
        "dbType": this.formData.dbType,
        "host": this.formData.host,
        "port": parseInt(this.formData.port),
        "databaseName": this.formData.databaseName,
        "user": this.formData.account,
        "pwd": this.formData.password,
        "version": this.formData.dbVersion,
        "schemaName": this.formData.schemaName
      };
      request.post('/collection/data/database/testConnection', params, {loading: true, loadingTitle: "验证中"})
        .then(res => {
          // console.log(params);
          if (res.status === 200) {
            this.validationSuccess = true;
            this.validationEro = false;
            this.openIsDisabled = false;
            this.$message.success("验证成功");
          } else {
            this.validationSuccess = false;
            this.validationEro = true;
            this.$message.warning("验证失败");
          }
        })
    },
    //根据类型判断版本号显示
    getProv() {

      this.tempVersion = this.versionOption.filter(item => item.dbType === this.formData.dbType);
      this.formData.dbVersion = this.tempVersion[0].version;
    },
    closeNewAdd() {
      this.$emit("close-dialog");
    },
    //保存新建数据源弹框
    saveNewAdd() {
      let params = {
        "name": this.formData.name,
        "dbType": this.formData.dbType,
        "host": this.formData.host,
        "port": parseInt(this.formData.port),
        "databaseName": this.formData.databaseName,
        "account": this.formData.account,
        "password": this.formData.password,
        "dbVersion": this.formData.dbVersion,
        "schemaName": this.formData.schemaName
      };
      request.post('/collection/info/DbSource/insert', params, {loading: true, loadingTitle: "保存中"})
        .then(res => {
          if (res.status === 200) {
            this.$message({
              message: '保存成功',
              type: 'success'
            });
            this.closeNewAdd();
            this.validationSuccess = false;
            this.validationEro = false;
            this.formData.name = "";
            this.formData.dbType = "";
            this.formData.host = "";
            this.formData.port = "";
            this.formData.databaseName = "";
            this.formData.account = "";
            this.formData.password = "";
            this.formData.dbVersion = "";
            this.formData.schemaName = "";
          } else {
            this.message.error(res.message);
          }
        })
    },
    clearValidate() {
      this.$refs.formBox.resetFields();
      this.$refs.formBox.clearValidate();
    },
  }
}
</script>

<style scoped lang="less">
  .function-box {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .item {
      display: flex;
      align-items: center;

      .tips {
        margin-right: 20px;
        color: red;
      }

      span {
        margin-left: 20px;

        &.success {
          color: #27CA8E;
        }

        &.error {
          color: #F4AB37;
        }
      }
    }
  }

  .submit-box {
    padding-right: 20px;
    text-align: center;
  }
</style>
