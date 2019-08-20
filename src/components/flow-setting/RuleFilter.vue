<template>
  <div class="setting-panel">
    <!--<div class="setting-header">
      <el-button type="text" @click="closePanel">关闭</el-button>
      <p>规则过滤</p>
      <el-button type="text" @click="saveSetting" :disabled="!isEdit">保存</el-button>
    </div>-->
    <CommonHeader
      @close-panel="closePanel"
      @save-setting="saveSetting"
      :is-edit="isEdit"
      title="规则过滤"
    />
    <div class="setting-body">
      <div class="form-box" v-for="item in formData.tableData" :key="item.id" v-if="!item.isDelete">
        <div style="display: flex; justify-content: flex-end" v-if="isEdit && runEdit">
          <el-button
            icon="el-icon-close"
            circle
            type="warning"
            @click="removeData(item)"
            size="small"
          ></el-button>
        </div>
        <el-form
          :rules="rules"
          :model="item"
          ref="formBox"
          label-position="right"
          label-width="100px"
          size="small"
        >
          <el-form-item label="选择表字段：" prop="tableField">
            <!--<el-select v-model="item.tableField" @change="changeField(item)" placeholder="请选择" :disabled="!isEdit || !runEdit">
              <el-option v-for="item in formData.flow.inputColumnEntitiesJson" :label="item.column" :value="item.uuid" ></el-option>
            </el-select>-->
            <el-button
              :disabled="!isEdit || !runEdit"
              style="width: 80%"
              type="primary"
              @click="openSelectField(item)"
            >{{item.tableField ? getFieldName(item.tableField) : '选择'}}</el-button>
          </el-form-item>
          <el-form-item label="规则名称：" prop="ruleName">
            <el-input v-model="item.ruleName" placeholder="请输入" :disabled="!isEdit || !runEdit"></el-input>
          </el-form-item>
          <el-form-item label="正则表达式：" prop="reg">
            <el-input v-model="item.reg" placeholder="请输入" :disabled="!isEdit || !runEdit"></el-input>
          </el-form-item>
        </el-form>
        <el-dialog
          :visible.sync="item.selectFieldsVisible"
          width="45%"
          title="选择源表"
          custom-class="dialog-box"
          :close-on-click-modal="false"
          :close-on-press-escape="false"
          :show-close="false"
          :append-to-body="true"
        >
          <div class="table-wrap">
            <div class="search-box" style="width: 50%; padding-bottom: 15px;">
              <el-input
                v-model="searchField"
                placeholder="请输入搜索内容"
                prefix-icon="el-icon-search"
                clearable
              >
                <!--<el-button slot="append" type="success" v-on:click="getSearchData">搜索</el-button>-->
              </el-input>
            </div>
            <el-table
              :data="getFields"
              stripe
              border
              header-cell-class-name="th-style"
              ref="tableSelect"
              max-height="300"
            >
              <!--<el-table-column type="selection" width="55"></el-table-column>-->
              <el-table-column label="选择" width="50">
                <template slot-scope="scope">
                  <el-radio v-model="item.currentSelectTable" :label="scope.row.uuid">&nbsp;</el-radio>
                </template>
              </el-table-column>
              <el-table-column label="名称" prop="column"></el-table-column>
              <el-table-column label="类型" prop="columnType"></el-table-column>
              <el-table-column label="说明" prop="comment"></el-table-column>
            </el-table>
          </div>
          <div class="submit-box">
            <el-button type="primary" @click="saveSelectTable(item)">确定</el-button>
            <el-button @click="closeSelectTable(item)">取消</el-button>
          </div>
        </el-dialog>
      </div>
      <div class="btn-box">
        <el-button type="primary" @click="addRule" :disabled="!isEdit || !runEdit">添加规则</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import request from "@/libs/request";
import CommonHeader from "./CommonHeader";
import moment from "moment";
export default {
  name: "RuleFilter",
  props: {
    runEdit: Boolean,
    default: true
  },
  computed: {
    ...mapState({
      formData: state => state.ruleFilterSetting,
      inputData: state => state.tableInputSetting,
      isEdit: state => state.isEdit
    }),
    getFields() {
      //console.log(this.formData.flow.inputColumnEntitiesJson);
      if (
        this.formData.flow.inputColumnEntitiesJson &&
        this.formData.flow.inputColumnEntitiesJson.length
      ) {
        return this.formData.flow.inputColumnEntitiesJson.filter(item =>
          item.column.includes(this.searchField)
        );
      } else {
        return [];
      }
    }
  },
  components: {
    CommonHeader
  },
  data() {
    return {
      searchField: "",
      rules: {
        tableField: [
          { required: true, message: "表字段不能为空", trigger: "change" }
        ],
        ruleName: [
          { required: true, message: "规则名称不能为空", trigger: "blur" },
          { max: 50, message: "规则名称长度不能超越50", trigger: "blur" }
        ],
        reg: [
          { required: true, message: "正则表达式不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    if (this.formData.tableData.length === 0) {
      //this.addRule();
    }
  },
  activated() {
    this.clearValidate();
  },
  methods: {
    //获取选择的字段名称
    getFieldName(uuid) {
      if (uuid) {
        const field = this.formData.flow.inputColumnEntitiesJson.find(
          item => item.uuid === uuid
        );
        return field.column;
      } else {
        return "选择";
      }
    },
    //格式化时间
    getTime(row, col, val) {
      return moment(val).format("YYYY-MM-DD HH:mm:ss");
    },
    //保存选择字段
    saveSelectTable(item) {
      if (item.currentSelectTable === "") {
        this.$message.warning("请先选择表字段");
        return;
      }
      item.tableField = item.currentSelectTable;
      this.searchField = "";
      this.changeField(item);
      item.selectFieldsVisible = false;
    },
    //关闭选择字段
    closeSelectTable(item) {
      item.currentSelectTable = "";
      this.searchField = "";
      item.selectFieldsVisible = false;
    },
    //打开选择字段
    openSelectField(item) {
      item.currentSelectTable = item.tableField;
      item.selectFieldsVisible = true;
    },
    clearValidate() {
      //清除验证
      if (this.$refs.formBox) {
        this.formData.tableData.forEach((item, i) => {
          this.$refs.formBox[i].clearValidate();
        });
      }
    },
    changeField(val) {
      val.currentField = this.formData.flow.inputColumnEntitiesJson.find(
        item => item.uuid === val.tableField
      );
    },
    closePanel() {
      this.$emit("close-panel");
    },
    removeData(row) {
      //删除规则
      let remove = this.formData.tableData.filter(
        item => item.isDelete === false
      );
      if (remove.length > 1) {
        this.formData.tableData.forEach(item => {
          if (item.id === row.id) {
            item.isDelete = true;
          }
        });
        this.$store.commit("changeRuleFilterData", this.formData);
      } else {
        this.$message.warning("最少保留一条数据");
      }
    },
    addRule() {
      //新建规则
      this.formData.tableData.push({
        id: Math.random(),
        tableField: "",
        ruleName: "",
        reg: "",
        isDelete: false,
        selectFieldsVisible: false,
        searchValue: "",
        currentSelectTable: ""
      });
      this.$store.commit("changeRuleFilterData", this.formData);
    },
    async saveSetting() {
      let bOn = true;
      await this.formData.tableData.forEach((item, i) => {
        if (!item.isDelete) {
          this.$refs["formBox"][i].validate(valid => {
            if (!valid) {
              bOn = false;
            }
          });
        }
      });
      if (bOn) {
        try {
          let params = {
            id: this.formData.flow.flowId,
            name: this.formData.flow.name,
            positionX: 0,
            positionY: 0,
            processingId: this.formData.processingId,
            properties: {
              rules: this.formData.tableData.map(item => {
                return {
                  ruleName: item.ruleName,
                  lookupPath: item.currentField ? item.currentField : {},
                  ruleRegex: item.reg,
                  delete: item.isDelete
                };
              })
            },
            templateId: this.formData.flow.templateId
          };
          let { data, status, message } = await request.put(
            "/processing-core/node/updateNodeConfig",
            params,
            {
              loading: true,
              loadingTitle: "保存配置中……"
            }
          );
          if (status === 200) {
            this.$message.success("保存配置成功");
            this.$emit("close-panel", data);
          } else {
            this.$message.warning(message);
          }
        } catch (e) {}
      } else {
        this.$message.warning("请完善必填字段");
      }
    }
  }
};
</script>

<style scoped lang="less">
.form-box {
  position: relative;
  padding: 10px;
  border: 1px solid #999;
  border-radius: 6px;
  margin-bottom: 20px;
  .close-btn {
    position: absolute;
    right: 10px;
    top: 10px;
  }
}
.btn-box {
  text-align: center;
}
</style>
