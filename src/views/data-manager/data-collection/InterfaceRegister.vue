<template>
  <div>
    <el-tabs type="card" v-model="activeTab" class="custom-tab">
      <el-tab-pane label="接口注册" name="file">
        <div class="content-box">
          <el-form :model="formData" :rules="rules" label-width="140px" label-position="right" ref="formBox">
            <el-form-item label="所属目录：" prop="catalogName">
              <div class="form-row">
                <el-cascader
                  :options="catalogList"
                  :props="defaultOption"
                  v-model="formData.catalogName"
                  :show-all-levels="false">
                </el-cascader>
                <p style="color: #999; display: flex; margin-left: 20px;">
                  *无关联目录，请先
                  <router-link tag="span" style="cursor: pointer" class="tips"
                               :to="{path:'/data-manager/dir-manager',query: {add:true}}">
                    创建目录！
                    <el-tooltip placement="top">
                      <div slot="content">
                        1、数据只能关联在已发布通过审核的子目录下。
                        <br/>
                        2、一个子目录只能添加一个数据。
                      </div>
                      <i class="el-icon-warning" style="margin-left: 4px; color: #2F91D8"></i>
                    </el-tooltip>
                  </router-link>
                </p>
              </div>
            </el-form-item>
            <el-form-item label="数据名称：" prop="dataName">
              <el-input v-model="formData.dataName" style="width: 70%" placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item label="数据描述：" prop="dataDescription">
              <el-input v-model="formData.dataDescription" style="width: 70%" placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item label="数据用途：" prop="dataUse">
              <el-input v-model="formData.dataUse" style="width: 70%" placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item label="所属系统：" prop="dataSource">
              <el-input v-model="formData.dataSource" style="width: 70%" placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item label="接口地址：" prop="interfaceAddress">
              <el-input v-model="formData.interfaceAddress" style="width: 70%" placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item label="返回格式：" prop="responseFormat">
              <el-select v-model="formData.responseFormat" placeholder="请选择">
                <el-option label="JSON" :value="1"></el-option>
                <el-option label="XML" :value="2"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="请求方式：" prop="requestMethod">
              <el-select v-model="formData.requestMethod" placeholder="请选择">
                <el-option label="GET" :value="1"></el-option>
                <el-option label="POST" :value="2"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="请求参数说明：">
              <div class="custom-table" style="width: 70%">
                <table cellspacing="0" cellpadding="0" border="0" >
                  <thead>
                  <th>
                    <span class="red">*</span>
                    名称
                  </th>
                  <th>
                    <span class="red">*</span>
                    是否必填
                  </th>
                  <th>
                    <span class="red">*</span>
                    类型
                  </th>
                  <th>
                    <span class="red">*</span>
                    说明
                  </th>
                  <th width="80px">操作</th>
                  </thead>
                  <tbody>
                  <tr v-for="(item,index) in formData.requestRemark" :key="item.id">
                    <td>
                      <el-form-item :prop="`requestRemark.${index}.name`" :rules="requestRules.name"
                                    :inline-message="true" style="margin: 0;">
                        <el-input v-model="item.name"  autocomplete="on" auto-complete="on" name="name" :trigger-on-focus="false" placeholder="请输入"></el-input>
                      </el-form-item>
                    </td>
                    <td>
                      <el-select v-model="item.must" placeholder="请选择">
                        <el-option label="是" :value="1"></el-option>
                        <el-option label="否" :value="0"></el-option>
                      </el-select>
                    </td>
                    <td>
                      <el-select v-model="item.type" placeholder="请选择">
                        <el-option label="Bigint" :value="1"></el-option>
                        <el-option label="Varchar" :value="2"></el-option>
                        <el-option label="Double" :value="3"></el-option>
                        <el-option label="Datetime" :value="4"></el-option>
                        <el-option label="Array" :value="5"></el-option>
                        <el-option label="Object" :value="6"></el-option>
                      </el-select>
                    </td>
                    <td>
                      <el-form-item :prop="`requestRemark.${index}.desc`" :rules="requestRules.desc"
                                    :inline-message="true" style="margin: 0;">
                        <el-input v-model="item.desc" placeholder="请输入"></el-input>
                      </el-form-item>
                    </td>
                    <td>
                      <el-button type="text" @click="addRequestRow">增加</el-button>
                      <el-button type="text" @click="removeRequestRow(item)">删除</el-button>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </el-form-item>
            <el-form-item label="返回参数说明：">
              <div class="custom-table" style="width: 70%">
                <table class="custom-table" cellspacing="0" cellpadding="0" border="0">
                  <thead>
                  <th><span class="red">*</span>中文名称</th>
                  <th><span class="red">*</span>英文名称</th>
                  <th><span class="red">*</span>类型</th>
                  <th><span class="red">*</span>说明</th>
                  <th width="80px">操作</th>
                  </thead>
                  <tbody>
                  <tr v-for="(item,index) in formData.metaInsertParam" :key="item.id">
                    <td>
                      <el-form-item :prop="`metaInsertParam.${index}.name`" :rules="metaInsertParam.name"
                                    :inline-message="true" style="margin: 0;">
                        <el-input v-model="item.name" placeholder="请输入"></el-input>
                      </el-form-item>
                    </td>
                    <td>
                      <el-form-item :prop="`metaInsertParam.${index}.nameEng`" :rules="metaInsertParam.nameEng"
                                    :inline-message="true" style="margin: 0;">
                        <el-input v-model="item.nameEng" placeholder="请输入"></el-input>
                      </el-form-item>
                    </td>
                    <td>
                      <el-select v-model="item.type" placeholder="请选择">
                        <el-option label="Bigint" :value="1"></el-option>
                        <el-option label="Varchar" :value="2"></el-option>
                        <el-option label="Double" :value="3"></el-option>
                        <el-option label="Datetime" :value="4"></el-option>
                        <el-option label="Array" :value="5"></el-option>
                        <el-option label="Object" :value="6"></el-option>
                      </el-select>
                    </td>
                    <td>
                      <el-form-item :prop="`metaInsertParam.${index}.description`"
                                    :rules="metaInsertParam.description" :inline-message="true" style="margin: 0;">
                        <el-input v-model="item.description" placeholder="请输入"></el-input>
                      </el-form-item>
                    </td>
                    <td>
                      <el-button type="text" @click="addResponseRow">增加</el-button>
                      <el-button type="text" @click="removeResponseRow(item)">删除</el-button>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </el-form-item>
            <el-form-item label="错误码说明：">
              <div class="custom-table" style="width: 70%">
                <table cellspacing="0" cellpadding="0" border="0">
                  <thead>
                  <th><span class="red">*</span>名称</th>
                  <th><span class="red">*</span>说明</th>
                  <th width="80px">操作</th>
                  </thead>
                  <tbody>
                  <tr v-for="(item,index) in formData.errCodeRemark" :key="item.id">
                    <td>
                      <el-form-item :prop="`errCodeRemark.${index}.name`" :rules="errCodeRemark.name"
                                    :inline-message="true" style="margin: 0;">
                        <el-input v-model="item.name" placeholder="请输入"></el-input>
                      </el-form-item>
                    </td>
                    <td>
                      <el-form-item :prop="`errCodeRemark.${index}.desc`" :rules="errCodeRemark.desc"
                                    :inline-message="true" style="margin: 0;">
                        <el-input v-model="item.desc" placeholder="请输入"></el-input>
                      </el-form-item>
                    </td>
                    <td>
                      <el-button type="text" @click="addErrorRow">增加</el-button>
                      <el-button type="text" @click="removeErrorRow(item)">删除</el-button>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </el-form-item>
            <el-form-item label="调用示例：" prop="callExample" >
              <el-input type="textarea" rows="6" v-model="formData.callExample" placeholder="请输入" style="width: 70%"></el-input>
            </el-form-item>
            <el-form-item label="返回示例：" v-if="formData.interfacePass">
              <el-input type="textarea" rows="6" v-model="formData.resultExample" readonly style="width: 70%"></el-input>
            </el-form-item>
            <div class="submit-box">
              <el-button @click="testInterface">验证</el-button>
              <span style="margin-left: 20px; color: #27CA8E;" v-if="formData.interfacePass === 1"><i
                class="el-icon-success"></i>成功</span>
              <span style="margin-left: 20px; color: #F56C86;" v-else-if="formData.interfacePass === 2"><i
                class="el-icon-warning"></i>失败</span>
              <span v-else style="color: red; margin-left: 20px">*接口注册需验证通过才可提交</span>
            </div>
            <div class="submit-box">
              <el-button type="primary" :disabled="formData.interfacePass !== 1" @click="saveInterface">提交</el-button>
              <!--<el-button class="cancel-btn">取消</el-button>-->
            </div>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  import request from "@/libs/request";

  export default {
    name: "InterfaceRegister",
    data() {
      const repeatName = async (rule,value,callBack) => {
        let {status} = await request.post("/collection/info/Data/selectDataByName", {name: value});
        if(status === 200){
          callBack();
        }else{
          callBack(new Error("数据名称已存在"));
        }
      }
      return {
        defaultOption: {
          value: "id",
          label: "name",
          children: "childNode"
        },
        activeTab: "file",
        formData: {
          dataName: "", //数据名称
          catalogName: [], //所属目录
          dataDescription: "", //数据描述
          dataUse: "", //数据用途
          dataSource: "", //数据来源
          interfaceAddress: "", //接口地址
          responseFormat: "", //返回格式
          requestMethod: "", //请求方式
          requestRemark: [ //请求参数说明
            {id: Math.random(), name: "", must: 1, type: 1, desc: ""}
          ],
          metaInsertParam: [ //返回参数说明
            {id: Math.random(), name: "", nameEng: "", type: 1, description: "", length: 5000, rootId: "", subId: ""}
          ],
          errCodeRemark: [  //错误码说明
            {id: Math.random(), name: "", desc: ""}
          ],
          callExample: "",  //调用示例
          resultExample: "", //返回示例
          interfacePass: 0
        },
        catalogList: [], //目录列表
        validateRule: {
          name: {
            reg: /^[a-zA-Z_]{1,50}$/,
            message: "参数名称必须是长度1至50的英文字符"
          },
          desc: {
            reg: /^[^\s]+$/,
            message: "参数说明为必填项"
          }
        },
        rules: {
          catalogName: [
            {required: true, message: "所属目录不能为空", trigger: "change", type: "array"}
          ],
          dataName: [
            {required: true, message: "数据名称不能为空", trigger: "blur",},
            {max: 50, message: "数据名称长度不能超过50", trigger: "blur"},
            {validator: repeatName, trigger: "blur"}

          ],
          dataDescription: [
            {required: true, message: "数据描述不能为空", trigger: "blur",},
            {max: 100, message: "数据描述长度不能超过100", trigger: "blur"}
          ],
          dataUse: [
            {required: true, message: "数据用途不能为空", trigger: "blur",},
            {max: 100, message: "数据用途长度不能超过100", trigger: "blur"}
          ],
          dataSource: [
            {required: true, message: "数据来源不能为空", trigger: "blur",},
            {max: 100, message: "数据来源长度不能超过100", trigger: "blur"}
          ],
          interfaceAddress: [
            {required: true, message: "接口地址不能为空", trigger: "blur",},
            {max: 100, message: "接口地址长度不能超过100", trigger: "blur"}
          ],
          responseFormat: [
            {required: true, message: "请求格式不能为空", trigger: "change",}
          ],
          requestMethod: [
            {required: true, message: "请求方式不能为空", trigger: "change",}
          ],
          callExample: [
            {required: true, message: "调用示例不能为空", trigger: "blur"}
          ],
        },
        requestRules: {
          name: [
            {required: true, message: "名称不能为空", trigger: "blur"},
            {pattern: /^[a-zA-Z_0-9]+$/, message: "名称必须为英文字母或者英文字母加下划线或者数字", trigger: "blur"},
            {max: 64, message: "名称长度不能超过64", trigger: "blur"}
          ],
          desc: [
            {required: true, message: "说明不能为空", trigger: "blur"},
            {pattern: /^[^\s]+$/, message: "说明不能包含空格", trigger: "blur"},
            {max: 100, message: "说明长度不能超过100", trigger: "blur"}
          ]
        },
        metaInsertParam: {
          name: [
            {required: true, message: "中文名称不能为空", trigger: "blur"},
            {pattern: /^[^\s]+$/, message: "中文名称不能包含空格", trigger: "blur"},
            {max: 64, message: "中文名称长度不能超过64", trigger: "blur"}
          ],
          nameEng: [
            {required: true, message: "英文名称不能为空", trigger: "blur"},
            {pattern: /^[a-zA-Z_0-9]+$/, message: "英文名称必须是英文字母或者英文字母加下划线或者数字", trigger: "blur"},
            {max: 64, message: "英文名称长度不能超过64", trigger: "blur"}
          ],
          description: [
            {required: true, message: "说明名称不能为空", trigger: "blur"},
            {pattern: /^[^\s]+$/, message: "说明不能包含空格", trigger: "blur"},
            {max: 100, message: "说明长度不能超过100", trigger: "blur"}
          ]
        },
        errCodeRemark: {
          name: [
            {required: true, message: "名称不能为空", trigger: "blur"},
            {pattern: /^[a-zA-Z0-9]+$/, message: "名称只能是英文或数字", trigger: "blur"},
            {max: 64, message: "名称长度不能超过64", trigger: "blur"}
          ],
          desc: [
            {required: true, message: "说明名称不能为空", trigger: "blur"},
            {pattern: /^[^\s]+$/, message: "说明不能包含空格", trigger: "blur"},
            {max: 100, message: "说明长度不能超过100", trigger: "blur"}
          ]
        }
      }
    },
    created() {
      this.getCatalogList();
    },
    methods: {
      async getCatalogList() { //获取目录列表数据
        try {
          let result = await request.post("/collection/info/DirectoryRoot/listRootAndSupDirectory", {}, {
            loading: true,
            loadingTitle: "获取目录信息"
          });
          if (result.status === 200) {
            this.catalogList = result.data;
          } else if (result.status === 204) {
            this.catalogList = [];
          } else {
            this.$message.warning(result.message);
          }
        } catch (e) {

        }
      },
      addRequestRow() {
        this.formData.requestRemark.push({id: Math.random(), name: "", must: 1, type: 1, desc: ""});
      },
      removeRequestRow(row) {
        if (this.formData.requestRemark.length > 1) {
          this.formData.requestRemark = this.formData.requestRemark.filter(item => item.id !== row.id);
        } else {
          this.$message.warning("请求参数说明至少需要一个");
        }
      },
      addResponseRow() { //增加一行返回参数说明
        this.formData.metaInsertParam.push({
          id: Math.random(),
          name: "",
          nameEng: "",
          type: 1,
          description: "",
          length: 5000,
          rootId: this.formData.catalogName[0],
          subId: this.formData.catalogName[1]
        });
      },
      removeResponseRow(row) { //删除返回参数说明当前行
        if (this.formData.metaInsertParam.length > 1) {
          this.formData.metaInsertParam = this.formData.metaInsertParam.filter(item => item.id !== row.id);
        } else {
          this.$message.warning("返回参数说明至少需要一个");
        }
      },
      addErrorRow() { //增加错误码说明
        this.formData.errCodeRemark.push({id: Math.random(), name: "", desc: ""});
      },
      removeErrorRow(row) { //删除错误码说明当前行
        if (this.formData.errCodeRemark.length > 1) {
          this.formData.errCodeRemark = this.formData.errCodeRemark.filter(item => item.id !== row.id);
        } else {
          this.$message.warning("错误码说明至少需要一个");
        }
      },
      async testInterface() { //接口测试
        try {
          this.$refs.formBox.validate(async valid => {
            if (valid) {
              let params = {
                method: this.formData.requestMethod,
                param: this.formData.callExample,
                paramType: this.formData.responseFormat,
                url: this.formData.interfaceAddress
              };
              let {message, status, data} = await request.post("/collection/info/validateOnlineController/OnlineValidateInterface", params, {
                loading: true,
                loadingTitle: "接口正在测试中……"
              });
              if (status === 200) {
                if (data.status === 200) {
                  this.$message.success("接口调用成功");
                  this.formData.interfacePass = 1;
                } else {
                  this.formData.interfacePass = 2;
                }
                this.formData.resultExample = data.result;
              } else {
                this.$message.warning(message);
              }
            } else {
              this.$message.warning("请按规则填写必填字段");
            }
          })
        } catch (e) {

        }
      },
      saveInterface() { //保存接口
        this.$refs.formBox.validate(async valid => {
          if (valid) {
            for (var i = 0; i < this.formData.metaInsertParam.length; i++) {
              this.formData.metaInsertParam[i].rootId = this.formData.catalogName[0];
              this.formData.metaInsertParam[i].subId = this.formData.catalogName[1];
            }
            let params = {
              address: this.formData.interfaceAddress,
              dataName: this.formData.dataName,
              dataSource: this.formData.dataSource,
              description: this.formData.dataDescription,
              errorCode: JSON.stringify(this.formData.errCodeRemark),
              purpose: this.formData.dataUse,
              requestMode: this.formData.requestMethod,
              requsetDemo: this.formData.callExample,
              requsetParam: JSON.stringify(this.formData.requestRemark),
              responseParam: JSON.stringify(this.formData.metaInsertParam),
              responseDemo: this.formData.resultExample,
              metaInsertParam: this.formData.metaInsertParam,
              responseType: this.formData.responseFormat,
              rootId: this.formData.catalogName[0],
              subId: this.formData.catalogName[1]
            }
            let result = await request.post("/collection/info/DataApi/insert", params, {
              loading: true,
              loadingTitle: "接口保存中……"
            });
            if (result.status === 200) {
              this.$message.success("接口注册成功");
              this.$router.push("/data-manager/data-list");
              /*this.formData.interfacePass = 0;
              this.$refs.formBox.resetFields();
              this.formData.requestRemark = [];
              this.formData.metaInsertParam = [];
              this.formData.errCodeRemark = [];
              this.addErrorRow();
              this.addRequestRow();
              this.addResponseRow();*/
            } else {
              this.$message.warning(result.message);
            }
          }
        });
      }
    }
  }
</script>

<style scoped>

</style>
