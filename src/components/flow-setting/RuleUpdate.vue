<template>
  <div class="setting-panel">
    <!--<div class="setting-header">
      <el-button type="text" @click="closePanel">关闭</el-button>
      <p>字段更新</p>
      <el-button type="text" @click="saveSetting" :disabled="!isEdit">保存</el-button>
    </div>-->
    <CommonHeader
      @close-panel="closePanel"
      @save-setting="saveSetting"
      :is-edit="isEdit"
      title="字段更新"
    />
    <div class="setting-body">
      <el-table
        :data="tableData"
        stripe
        border
        header-cell-class-name="th-style"
        style="width: 100%;"
        max-height="300"
      >
        <el-table-column prop="inputField" width="80" label="源字段"></el-table-column>
        <el-table-column prop="ruleName" width="100" label="规则名称"></el-table-column>
        <el-table-column prop="replaceRule" label="替换规则" class-name="view-col" :formatter="getRule"></el-table-column>
        <el-table-column width="100" label="操作" v-if="isEdit && runEdit">
          <template slot-scope="scope">
            <el-button type="text" @click="editRule(scope.row)">编辑</el-button>
            <el-button type="text" @click="deleteRule(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="btn-box" style="text-align: center; padding-top: 20px;">
        <el-button type="primary" @click="addRule" :disabled="!isEdit || !runEdit">添加规则</el-button>
      </div>
    </div>
    <el-dialog
      :visible.sync="dialogVisible"
      width="30%"
      title="规则定义"
      custom-class="dialog-box"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      append-to-body
    >
      <el-form
        :model="editData"
        :rules="rules"
        ref="formBox"
        label-width="130px"
        label-position="right"
      >
        <el-form-item label="规则名称：" prop="ruleName">
          <el-input v-model="editData.ruleName" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item label="输入流字段：" prop="inputField">
          <el-select v-model="editData.inputField" placeholder="请选择" @change="selectField">
            <!--<el-option :label="item.name" :value="item.column" v-for="item in inputData.tableData"></el-option>-->
            <el-option
              :label="item.column"
              v-for="item in formData.flow.inputColumnEntitiesJson"
              :value="item.column"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="替换规则：" prop="replaceRule">
          <el-select v-model="editData.replaceRule" @change="replaceChange" placeholder="请选择">
            <el-option v-for="item in ruleList" :label="item.name" :value="item.id" :key="item.id"></el-option>
            <el-option label="字符串替换" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <template v-if="isReg">
          <el-form-item label="正则表达式：" prop="regExp">
            <el-input v-model="editData.regExp" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="替换成字符串：" prop="replaceString">
            <el-input v-model="editData.replaceString" placeholder="请输入"></el-input>
          </el-form-item>
          <!--<el-form-item label="整个单词匹配：">
            <el-checkbox v-model="editData.allMatch"></el-checkbox>
          </el-form-item>
          <el-form-item label="大小写敏感：">
            <el-checkbox v-model="editData.caseWrite"></el-checkbox>
          </el-form-item>-->
        </template>
        <el-form-item label="脱敏预览：" v-if="editData.replaceRule">
          <p>{{getRuleView}}</p>
        </el-form-item>
      </el-form>
      <div class="submit-box">
        <el-button type="primary" @click="addRuleTable">保存</el-button>
        <el-button @click="dialogVisible = false;">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from "vuex";
import request from "@/libs/request";
import CommonHeader from "./CommonHeader";
export default {
  name: "RuleUpdate",
  props: {
    runEdit: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    dialogVisible(val) {
      if (val === false) {
        this.editData = {
          inputField: "",
          replaceRule: "",
          view: "",
          regExp: "",
          replaceString: ""
        };
        this.$refs.formBox.resetFields();
      }
    }
  },
  components: {
    CommonHeader
  },
  computed: {
    ...mapState({
      formData: state => state.ruleUpdateSetting,
      inputData: state => state.tableInputSetting,
      isEdit: state => state.isEdit,
      getRuleView() {
        let selected = this.ruleList.find(
          item => item.id === this.editData.replaceRule
        );
        if (selected) {
          return selected.description;
        }
      }
    }),
    isReg() {
      if (this.editData.replaceRule === 0) {
        return true;
      } else {
        return false;
      }
    },
    tableData() {
      return this.formData.tableData.filter(item => item.delete === false);
    }
  },
  created() {
    this.getRuleList();
  },
  activated() {
    this.clearValidate();
  },
  data() {
    return {
      ruleList: [],
      editStatus: false,
      dialogVisible: false,
      editData: {
        ruleName: "",
        inputField: "",
        replaceRule: "",
        view: "",
        regExp: "",
        replaceString: "",
        currentField: {}
      },
      rules: {
        ruleName: [
          { required: true, message: "规则名称不能为空", trigger: "blur" },
          { max: 10, message: "规则名称长度不能超越10", trigger: "blur" }
        ],
        inputField: [
          { required: true, message: "输入流字段不能为空", trigger: "change" }
        ],
        replaceRule: [
          { required: true, message: "替换规则不能为空", trigger: "change" }
        ],
        regExp: [
          { required: true, message: "正则表达式不能为空", trigger: "blur" }
        ],
        replaceString: [
          { required: true, message: "替换成字符串不能为空", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    selectField(val) {
      //选择字段
      this.editData.currentField = this.inputData.tableData.find(
        item => item.column === val
      );
    },
    clearValidate() {
      //清除验证
      if (this.$refs.formBox) {
        this.$refs.formBox.clearValidate();
      }
    },
    async getRuleList() {
      // 获取脱敏规则
      try {
        let { status, data, message } = await request.get(
          "/processing-core/template/getTemplateRuleList",
          {},
          {
            loading: true,
            loadingTitle: "获取脱敏规则数据中……"
          }
        );
        if (status === 200) {
          this.ruleList = data;
        } else {
          this.$message.warning(message);
        }
      } catch (e) {}
    },
    addRule() {
      //添加规则
      this.dialogVisible = true;
      this.editStatus = false;
    },
    editRule(row) {
      //编辑规则
      this.editData = {
        ...row
      };
      this.editStatus = true;
      this.dialogVisible = true;
    },
    closePanel() {
      this.$emit("close-panel");
      if (this.$refs.formBox) this.$refs.formBox.resetFields();
    },
    replaceChange(val) {
      if (val) {
        let selected = this.ruleList.find(item => item.id === val);
        this.editData.view = selected.description;
        this.editData.regExp = selected.regex;
        this.editData.replaceString = selected.replacement;
      }
    },
    addRuleTable() {
      //添加到表格
      this.$refs.formBox.validate(valid => {
        if (valid) {
          if (this.editStatus) {
            this.formData.tableData = this.formData.tableData.map(item => {
              if (item.id === this.editData.id) {
                item = {
                  ...this.editData
                };
              }
              return item;
            });
          } else {
            let currentField = this.inputData.tableData.find(
              item => item.name === this.editData.inputField
            );
            let oData = {
              ...this.editData,
              type: currentField.type,
              delete: false,
              id: Math.random()
            };
            this.formData.tableData.push(oData);
          }
          this.$store.commit("changeRuleUpdateData", this.formData);
          this.dialogVisible = false;
        } else {
          this.$message.warning("请完善必填字段");
        }
      });
    },
    async saveSetting() {
      //保存配置
      try {
        let params = {
          id: this.formData.flow.flowId,
          name: this.formData.flow.name,
          positionX: 0,
          positionY: 0,
          processingId: this.formData.processingId,
          properties: {
            rules: this.formData.tableData.map(item => {
              let oData = {
                type: item.type,
                ruleName: item.ruleName,
                lookupPath: item.currentField,
                delete: item.delete,
                ruleRegex: item.regExp,
                replacement: item.replaceString
              };
              if (item.replaceRule !== 0) {
                oData.ruleId = item.replaceRule;
              }
              return oData;
            }),
            columns: this.inputData.tableData
          },
          templateId: this.formData.flow.templateId
        };
        let { status, message, data } = await request.put(
          "/processing-core/node/updateNodeConfig",
          params,
          {
            loading: true,
            loadingTitle: "正在保存配置中……"
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
    deleteRule(row) {
      //删除规则
      this.formData.tableData = this.formData.tableData.map(item => {
        if (item.ruleName === row.ruleName) {
          item.delete = true;
        }
        return item;
      });
      this.$store.commit("changeRuleUpdateData", this.formData);
    },
    getRule(row, col, val) {
      if (this.ruleList.length) {
        if (val) {
          let type = this.ruleList.find(item => item.id === val);
          return type.name;
        } else {
          return "字符串替换";
        }
      }
    }
  }
};
</script>

<style>
.view-col {
  font-size: 10px;
}
</style>
