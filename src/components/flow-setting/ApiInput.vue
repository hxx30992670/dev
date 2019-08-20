<template>
  <div class="setting-panel">
    <CommonHeader
      @close-panel="closePanel"
      @save-setting="saveSetting"
      :is-edit="isEdit"
      title="接口输入"
    />
    <div class="setting-body">
      <el-form
        :rules="rules"
        :model="formData"
        ref="formBox"
        label-position="right"
        label-width="100px"
        size="small"
      >
        <el-form-item label="选择接口：" prop="interfaceName">
          <el-select v-model="formData.interfaceName" :disabled="!isEdit || !runEdit">
            <el-option :label="item.name" :value="item.id" v-for="item in tableData"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import request from "@/libs/request";
import CommonHeader from "./CommonHeader";
export default {
  name: "ApiInput",
  props: {
    runEdit: Boolean,
    default: true
  },
  components: {
    CommonHeader
  },
  computed: {
    ...mapState({
      formData: state => state.apiInputData,
      isEdit: state => state.isEdit
    })
  },
  data() {
    return {
      rules: {
        interfaceName: [
          { required: true, message: "接口不能为空", trigger: "change" }
        ]
      },
      tableData: []
    };
  },
  created() {
    this.getInterfaceList();
  },
  activated() {
    this.clearValidate();
  },
  methods: {
    clearValidate() {
      //清除验证
      if (this.$refs.formBox) {
        this.$refs.formBox.clearValidate();
      }
    },
    async getInterfaceList() {
      //获取输入接口列表数据
      try {
        let { status, message, data } = await request.get(
          "/processing-core/source/getApiSourceList",
          {},
          {
            loading: true,
            loadingTitle: "获取接口选择列表数据中……"
          }
        );
        if (status === 200 || status === 204) {
          if (data) {
            this.tableData = data;
          } else {
            this.tableData = [];
          }
        } else {
          this.$message.warning(message);
        }
      } catch (e) {}
    },
    async saveSetting() {
      //保存面板配置
      try {
        let dataBase = this.tableData.find(
          item => item.id === this.formData.interfaceName
        );
        let params = {
          id: this.formData.flow.flowId,
          name: this.formData.flow.name,
          positionX: 0,
          positionY: 0,
          processingId: this.formData.processingId,
          properties: {
            id: this.formData.interfaceName,
            dataName: dataBase.name
          },
          templateId: this.formData.flow.templateId
        };
        let { status, message, data } = await request.put(
          "/processing-core/node/updateNodeConfig",
          params,
          {
            loading: true,
            loadingTitle: "保存接口输入配置中……"
          }
        );
        if (status === 200) {
          this.$message.success("保存成功");
          this.$emit("close-panel", data);
        } else {
          this.$message.warning(message);
        }
      } catch (e) {}
    },
    closePanel() {
      //关闭面板
      this.$emit("close-panel");
      this.$refs.formBox.resetFields();
    }
  }
};
</script>

<style scoped>
</style>
