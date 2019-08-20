<template>
  <div>
    <el-form
      :model="catalogData"
      :rules="rules"
      label-position="right"
      label-width="140px"
      ref="formBox"
    >
      <el-form-item label="所属目录：" prop="masterDir">
        <div class="form-row">
          <el-select v-model="catalogData.masterDir" placeholder="请选择">
            <el-option
              v-for="item in rootdiroptions"
              :key="item.id"
              :label="item.name"
              v-bind:value="item.id"
            ></el-option>
          </el-select>

          <p class="tips">
            *找不到目录，请先
            <a href="javascript:;" @click="createRootDir">创建</a>
          </p>
        </div>
      </el-form-item>
      <el-form-item label="子目录名称：" prop="name">
        <el-input
          v-model="catalogData.name"
          placeholder="请输入"
          style="width: 90%"
          :disabled="catalogData.masterDir === ''"
        ></el-input>
      </el-form-item>
      <el-form-item label="数据类型：" prop="dataType">
        <el-select v-model="catalogData.dataType" v-on:change="changeDataType()">
          <el-option label="文件" :value="1"></el-option>
          <el-option label="接口" :value="2"></el-option>
          <el-option label="库表" :value="3"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="数据格式：" prop="dataFormat">
        <el-select
          v-if="catalogData.dataType ===''"
          disabled
          placeholder="请先选择数据格式"
          v-model="catalogData.dataFormat"
        ></el-select>
        <el-select
          v-if="catalogData.dataType === 1"
          placeholder="请选择"
          v-model="catalogData.dataFormat"
        >
          <el-option label="Csv" value="Csv"></el-option>
          <el-option label="Excel" value="Excel"></el-option>
        </el-select>
        <el-select
          v-if="catalogData.dataType === 2"
          placeholder="请选择"
          v-model="catalogData.dataFormat"
        >
          <el-option label="json" value="Json"></el-option>
          <el-option label="xml" value="Xml"></el-option>
        </el-select>
        <el-select
          v-if="catalogData.dataType === 3"
          placeholder="请选择"
          v-model="catalogData.dataFormat"
        >
          <el-option label="oracle" value="Oracle"></el-option>
          <el-option label="mysql" value="Mysql"></el-option>
          <el-option label="PostgreSQL" value="PostgreSQL"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="共享权限：" prop="sharePermission">
        <el-radio v-model="catalogData.sharePermission" :label="1">申请使用</el-radio>
        <el-radio v-model="catalogData.sharePermission" :label="2">无需申请</el-radio>
      </el-form-item>
      <el-form-item label="开放权限：" prop="openPermission">
        <el-radio v-model="catalogData.openPermission" :label="1">有条件开放</el-radio>
        <el-radio v-model="catalogData.openPermission" :label="2">无条件开放</el-radio>
      </el-form-item>
      <div class="submit-box">
        <el-button type="primary" @click="submitSave()">保存</el-button>
        <el-button @click="closeCatalog">取消</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import request from "@/libs/request";

export default {
  name: "CatalogEdit",
  props: {
    catalogData: {
      type: Object
    },
    rootdiroptions: {
      type: Array,
      required: true
    },
    dialogType: {
      type: String,
      default: "new"
    }
  },
  data() {
    const repeatName = async (rule, value, callBack) => {
      let { status } = await request.post(
        "/collection/info/DirectorySub/selectByName",
        {
          name: value,
          rootId: this.catalogData.masterDir
        }
      );
      if (status === 200) {
        callBack();
      } else {
        callBack(new Error("目录名已存在"));
      }
    };
    return {
      // rootDirOptions: [],
      rules: {
        //验证规则
        masterDir: [
          { required: true, message: "所属目录不能为空", trigger: "change" }
        ],
        name: [
          { required: true, message: "子目录名称不能为空", trigger: "blur" },
          { max: 50, message: "子目录名称长度不能超过50", trigger: "blur" },
          {
            pattern: /^[^\s]+$/,
            message: "子目录名称不能包含空格",
            trigger: "blur"
          },
          { validator: repeatName, trigger: "blur" }
        ],
        dataFormat: [
          { required: true, message: "数据格式不能为空", trigger: "change" }
        ],
        dataType: [
          { required: true, message: "数据类型不能为空", trigger: "change" }
        ],
        sharePermission: [
          { required: true, message: "共享权限不能为空", trigger: "change" }
        ],
        openPermission: [
          { required: true, message: "开放权限不能为空", trigger: "change" }
        ]
      }
    };
  },
  created() {
    // this.getRootDir();
  },
  methods: {
    clearFields() {
      this.$refs.formBox.resetFields();
    },
    closeCatalog() {
      //关闭弹窗
      this.$refs.formBox.resetFields();
      this.$emit("close-catalog");
    },
    submitSave() {
      //保存按钮
      if (this.dialogType === "new") {
        this.addNew();
      } else {
        this.editNew();
      }
    },
    createRootDir() {
      //创建根目录
      this.$emit("add-masterdir");
    },
    // //获取根目录和id
    // async getRootDir() {
    //     let oData = await request.post("/collection/info/DirectoryRoot/listAllRootDirectory", {loading: true});
    //     if (oData.status === 200) {
    //         this.rootDirOptions = oData.data;
    //     } else if (oData.status === 204) {
    //         this.rootDirOptions = null;
    //     } else {
    //         this.$message.warning(oData.message);
    //     }
    // },
    changeDataType() {
      this.catalogData.dataFormat = "";
    },
    async addNew() {
      //新增子目录
      const formBox = this.$refs.formBox;
      formBox.validate(async valid => {
        if (valid) {
          var params = {
            dataFormat: this.catalogData.dataFormat,
            dataType: parseInt(this.catalogData.dataType),
            name: this.catalogData.name,
            rootId: this.catalogData.masterDir,
            shareOpenType: parseInt(this.catalogData.openPermission),
            shareType: parseInt(this.catalogData.sharePermission)
          };
          let oData = await request.post(
            "/collection/info/DirectorySub/createSubdirectory",
            params,
            { loading: true }
          );
          if (oData.status === 200) {
            this.$message.success("新增数据子目录成功！");
            this.$refs.formBox.resetFields();
            this.$emit("close-catalog");
          } else {
            this.$message.warning(oData.message);
          }
        }
      });
    },
    async editNew() {
      //编辑子目录
      var params = {
        dataFormat: this.catalogData.dataFormat, //数据类型表，联合data_format的值
        dataType: parseInt(this.catalogData.dataType), //文件类型：1=文件，2=接口，3=库表
        name: this.catalogData.name, //子目录名称
        rootId: this.catalogData.masterDir, //根目录名称
        shareOpenType: parseInt(this.catalogData.openPermission), //1=有条件开放0=无条件开放
        shareType: parseInt(this.catalogData.sharePermission), //1=申请使用0=无需申请
        id: this.catalogData.id //子目录ID
      };
      let oData = await request.post(
        "/collection/info/DirectorySub/update",
        params,
        { loading: true }
      );
      if (oData.status === 200) {
        this.$message.success("编辑数据子目录成功！");
        this.$refs.formBox.resetFields();
        this.$emit("close-catalog");
      } else {
        this.$message.warning(oData.message);
      }
    }
  }
};
</script>

<style scoped lang="less">
.form-row {
  display: flex;
  align-items: center;

  .tips {
    margin-left: 20px;

    a {
      color: #ffaa72;
      display: inline-block;
    }
  }
}
</style>
