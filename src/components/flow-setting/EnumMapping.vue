<template>
  <div class="setting-panel">
    <!--<div class="setting-header">
      <el-button type="text" @click="closePanel">关闭</el-button>
      <p>枚举映射</p>
      <el-button type="text" @click="saveSetting" :disabled="!isEdit">保存</el-button>
    </div>-->
    <CommonHeader
      @close-panel="closePanel"
      @save-setting="saveSetting"
      :is-edit="isEdit"
      title="枚举映射"
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
        <el-form-item label="选择表字段：" prop="name">
          <!--<el-select v-model="formData.name" placeholder="请选择" :disabled="!isEdit || !runEdit">
            <el-option v-for="item in formData.flow.inputColumnEntitiesJson" :label="item.column" :value="item.column" ></el-option>
          </el-select>-->
          <el-button
            type="primary"
            :disabled="!isEdit || !runEdit"
            style="width: 80%"
            @click="openSelectField"
          >{{getTableField}}</el-button>
        </el-form-item>
        <div id="output-table">
          <div class="custom-table" style="width: 100%">
            <table cellspacing="0" cellpadding="0" border="0">
              <thead>
                <th>
                  <span class="red">*</span>
                  原值
                </th>
                <th>
                  <span class="red">*</span>
                  映射值
                </th>
                <th>操作</th>
              </thead>
              <tbody>
                <tr v-for="(item,index) in getTable" :key="item.id">
                  <td>
                    <el-form-item
                      :prop="`tableData.${index}.val`"
                      :rules="rules.val"
                      :inline-message="true"
                    >
                      <el-input
                        v-model="item.val"
                        placeholder="请输入"
                        maxlength="100"
                        v-if="isEdit && runEdit"
                      ></el-input>
                      <p v-else>{{item.val}}</p>
                    </el-form-item>
                  </td>
                  <td>
                    <el-form-item
                      :prop="`tableData.${index}.mapVal`"
                      :rules="rules.mapVal"
                      :inline-message="true"
                    >
                      <el-input
                        v-model="item.mapVal"
                        placeholder="请输入"
                        maxlength="100"
                        v-if="isEdit && runEdit"
                      ></el-input>
                      <p v-else>{{item.mapVal}}</p>
                    </el-form-item>
                  </td>
                  <td v-if="isEdit && runEdit">
                    <el-button type="text" @click="addRow">添加</el-button>
                    <el-button type="text" @click="removeRow(item)">删除</el-button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!--之前的table组件-->
          <!--<el-table :data="getTable" stripe border header-cell-class-name="th-style" style="width: 100%;" max-height="300">
            <el-table-column label="原值" prop="val">
              <template slot="header">
                <span class="must" style="color: red; margin-right: 4px;">*</span>
                <label>原值</label>
              </template>
              <template slot-scope="scope">
                <el-form-item :prop="`tableData.${scope.$index}.val`" :rules="rules.val" :inline-message="true">
                  <el-input v-model="scope.row.val" placeholder="请输入" maxlength="100" v-if="isEdit && runEdit"></el-input>
                  <p v-else>{{scope.row.val}}</p>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="映射值" prop="mapVal">
              <template slot="header">
                <span class="must" style="color: red; margin-right: 4px;">*</span>
                <label>映射值</label>
              </template>
              <template slot-scope="scope">
                <el-form-item :prop="`tableData.${scope.$index}.mapVal`" :rules="rules.mapVal" :inline-message="true">
                  <el-input v-model="scope.row.mapVal" placeholder="请输入" maxlength="100" v-if="isEdit && runEdit"></el-input>
                  <p v-else>{{scope.row.mapVal}}</p>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" v-if="isEdit && runEdit">
              <template slot-scope="scope">
                <el-button type="text" @click="addRow">添加</el-button>
                <el-button type="text" @click="removeRow(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>-->
        </div>
      </el-form>
    </div>
    <el-dialog
      :visible.sync="fieldSelectVisible"
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
            v-model="fieldSelectSearch"
            placeholder="请输入搜索内容"
            prefix-icon="el-icon-search"
            clearable
          >
            <!--<el-button slot="append" type="success" v-on:click="getSearchData">搜索</el-button>-->
          </el-input>
        </div>
        <el-table
          :data="getSelectField"
          stripe
          border
          header-cell-class-name="th-style"
          ref="tableSelect"
          max-height="300"
        >
          <!--<el-table-column type="selection" width="55"></el-table-column>-->
          <el-table-column label="选择" width="50">
            <template slot-scope="scope">
              <el-radio v-model="currentSelectField" :label="scope.row.column">&nbsp;</el-radio>
            </template>
          </el-table-column>
          <el-table-column label="名称" prop="column"></el-table-column>
          <el-table-column label="类型" prop="columnType"></el-table-column>
          <el-table-column label="说明" prop="comment"></el-table-column>
        </el-table>
      </div>
      <div class="submit-box">
        <el-button type="primary" @click="saveSelectTable">确定</el-button>
        <el-button @click="closeSelectTable">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from "vuex";
import request from "@/libs/request";
import CommonHeader from "./CommonHeader";
export default {
  name: "EnumMapping",
  props: {
    runEdit: Boolean,
    default: true
  },
  components: {
    CommonHeader
  },
  computed: {
    ...mapState({
      formData: state => state.enumMappingSetting,
      inputData: state => state.tableInputSetting,
      isEdit: state => state.isEdit
    }),
    getTableField() {
      if (this.formData.name) {
        return this.formData.name;
      } else {
        return "选择";
      }
    },
    getTable() {
      return this.formData.tableData.filter(item => item.delete === false);
    },
    getSelectField() {
      if (
        this.formData.flow.inputColumnEntitiesJson &&
        this.formData.flow.inputColumnEntitiesJson.length
      ) {
        return this.formData.flow.inputColumnEntitiesJson.filter(item =>
          item.column.includes(this.fieldSelectSearch)
        );
      } else {
        return [];
      }
    }
  },
  created() {
    if (!this.formData.tableData.length) {
      this.addRow();
    }
  },
  activated() {
    this.clearValidate();
  },
  data() {
    return {
      fieldSelectVisible: false,
      fieldSelectSearch: "",
      currentSelectField: "",
      rules: {
        name: [
          { required: true, message: "表字段不能为空", trigger: "change" }
        ],
        val: [
          { required: true, message: "原值不能为空", trigger: "blur" },
          { max: 100, message: "原值长度不能超过100", trigger: "blur" }
        ],
        mapVal: [
          { required: true, message: "映射值不能为空", trigger: "blur" },
          { max: 100, message: "映射值长度不能超过100", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    //保存选择字段
    saveSelectTable() {
      if (this.currentSelectField === "") {
        this.$message.warning("请先选择表字段");
        return;
      }
      this.formData.name = this.currentSelectField;
      this.fieldSelectSearch = "";
      this.fieldSelectVisible = false;
    },
    //关闭选择字段
    closeSelectTable() {
      this.currentSelectField = "";
      this.fieldSelectSearch = "";
      this.fieldSelectVisible = false;
    },
    //打开选择字段
    openSelectField() {
      this.currentSelectField = this.formData.name;
      this.fieldSelectVisible = true;
    },
    clearValidate() {
      //清除验证
      if (this.$refs.formBox) {
        this.$refs.formBox.clearValidate();
      }
    },
    closePanel() {
      //关闭面板
      this.$emit("close-panel");
      this.$refs.formBox.resetFields();
    },
    addRow() {
      //添加一行
      this.formData.tableData.push({
        id: Math.random(),
        val: "",
        mapVal: "",
        delete: false
      });
    },
    removeRow(row) {
      //删除当前行
      let tableData = this.formData.tableData.filter(
        item => item.delete === false
      );
      if (tableData.length > 1) {
        this.formData.tableData = this.formData.tableData.map(item => {
          if (item.id === row.id) {
            item.delete = true;
          }
          return item;
        });
      } else {
        this.$message.warning("最少保留一条数据");
      }
    },
    async saveSetting() {
      //保存配置
      try {
        const formBox = this.$refs.formBox;
        let column = this.formData.flow.inputColumnEntitiesJson.find(
          item => item.column === this.formData.name
        );
        formBox.validate(async valid => {
          if (valid) {
            let params = {
              id: this.formData.flow.flowId,
              name: this.formData.flow.name,
              positionX: 0,
              positionY: 0,
              processingId: this.formData.processingId,
              properties: {
                simpleKeyValueLookup: {
                  id: null,
                  mapping: this.formData.tableData.map(item => {
                    return {
                      key: item.val,
                      value: item.mapVal,
                      delete: item.delete
                    };
                  })
                },
                column: column,
                recordReaderId: this.formData.flow.configJson
                  ? this.formData.flow.configJson.recordReaderId
                  : null,
                recordWriterId: this.formData.flow.configJson
                  ? this.formData.flow.configJson.recordWriterId
                  : null
              },
              templateId: this.formData.flow.templateId
            };
            if (
              this.formData.flow.configJson &&
              this.formData.flow.configJson.simpleKeyValueLookup
            ) {
              params.properties.simpleKeyValueLookup.id = this.formData.flow.configJson.simpleKeyValueLookup.id;
            }
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
          } else {
            this.$message.warning("请按规则完善所有必填字段");
          }
        });
      } catch (e) {}
    }
  }
};
</script>

<style>
#output-table .el-form-item {
  margin: 0;
}
#output-table .el-form-item__content {
  margin: 0 !important;
}
</style>
