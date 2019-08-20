<template>
  <div class="content-wrap">
    <el-tabs type="card" v-model="activeTab" class="custom-tab">
      <el-tab-pane label="用户管理" name="file">
        <div class="content-box">
          <div class="search-box">
            <div class="left">
              <!--<el-select v-model="searchValue.status" placeholder="全部用户类型">-->
              <!--<el-option label="全部用户类型" :value="0"></el-option>-->
              <!--<el-option label="数据管理员" :value="1"></el-option>-->
              <!--<el-option label="资源用户" :value="2"></el-option>-->
              <!--</el-select>-->
              <el-select
                v-model="searchValue.status"
                placeholder="请选择用户类型"
                clearable
                v-on:change="onSelect()"
              >
                <el-option
                  v-if="!authority.mt.startsWith('org_admin')"
                  label="平台管理员"
                  v-bind:value="0"
                ></el-option>
                <el-option label="数据管理员" v-bind:value="1"></el-option>
                <el-option label="资源用户" v-bind:value="2"></el-option>
                <el-option label="组织管理员" v-bind:value="3"></el-option>
              </el-select>
              <el-input
                v-model="searchValue.text"
                placeholder="请输入用户名"
                maxlength="10"
                prefix-icon="el-icon-search"
              >
                <el-button slot="append" type="success" maxlength="20" v-on:click="onSelect()">搜索</el-button>
              </el-input>
              <p class="search-result" v-model="totalNum">找到相关搜索结果 {{totalNum}} 条</p>
            </div>
            <div class="right">
              <el-button type="primary" @click="addBtn()" title="新增">
                <i class="iconfont3 icon-add"></i>
              </el-button>
              <!--<el-button type="danger" @click="removeTableData()">删除</el-button>-->
              <el-button type="info" @click="refreshData()" title="刷新">
                <i class="iconfont3 icon-shuaxin"></i>
              </el-button>
              <el-button type="success" @click="startTableData()" title="启用">
                <i class="iconfont3 icon-play"></i>
              </el-button>
              <el-button type="warning" @click="stopTableData()" title="停用">
                <i class="iconfont3 icon-tingzhi"></i>
              </el-button>
            </div>
          </div>
          <div class="table-wrap">
            <el-table
              :data="tableData"
              stripe
              border
              header-cell-class-name="th-style"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="55"></el-table-column>
              <el-table-column label="用户名" prop="account" :show-overflow-tooltip="true"></el-table-column>
              <el-table-column
                v-if="!authority.mt.startsWith('org_admin')"
                label="所属组织"
                prop="userOrg"
                :show-overflow-tooltip="true"
              ></el-table-column>
              <el-table-column label="创建时间" prop="createTime" :formatter="getTime" width="180"></el-table-column>
              <el-table-column label="用户类型" prop="role" :show-overflow-tooltip="true">
                <template slot-scope="scope">
                  <span v-if="scope.row.role == 'platform_admin'">平台管理员</span>
                  <span v-if="scope.row.role == 'resource_user'">资源用户</span>
                  <span v-if="scope.row.role == 'data_admin'">数据管理者</span>
                  <span v-if="scope.row.role == 'org_admin'">组织管理员</span>
                </template>
              </el-table-column>
              <el-table-column label="真实姓名" prop="name" width="130"></el-table-column>
              <el-table-column label="手机号" prop="phone" width="130"></el-table-column>
              <el-table-column label="备注" prop="remark" :show-overflow-tooltip="true"></el-table-column>
              <el-table-column label="状态" prop="status" width="100">
                <template slot-scope="scope">
                  <span v-if="scope.row.status == 1">已停用</span>
                  <span v-if="scope.row.status == 0">使用中</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="160">
                <template slot-scope="scope">
                  <div>
                    <el-button
                      type="text"
                      @click="editBtn(scope.row)"
                      class="iconfont3 icon-bianji"
                      title="编辑"
                    ></el-button>
                    <el-button type="text">
                      <span
                        v-if="scope.row.status == 1"
                        @click="startBtn(scope.row)"
                        style="color:#27CA8E"
                        class="iconfont3 icon-play"
                        title="启用"
                      ></span>
                      <span
                        v-if="scope.row.status == 0"
                        @click="stopBtn(scope.row)"
                        style="color:#F56C86"
                        class="iconfont3 icon-tingzhi"
                        title="停用"
                      ></span>
                    </el-button>
                    <el-button
                      type="text"
                      @click="removeBtn(scope.row)"
                      style="color:#F56C86"
                      class="iconfont3 icon-shanchu"
                      title="删除"
                    ></el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <!--分页-->
          <div class="page-wrap">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-size="pageSize"
              layout="total, prev, pager, next, jumper"
              :total="totalNum"
            ></el-pagination>
          </div>
          <!--新增弹窗-->
          <el-dialog title="新增" :visible.sync="addVisible" custom-class="dialog-box">
            <el-form
              :model="addForm"
              status-icon
              :rules="addRules"
              ref="addForm"
              label-width="100px"
              class="demo-ruleForm"
            >
              <el-form-item v-if="!authority.mt.startsWith('org_admin')" label="所属组织" prop="nodeId">
                <el-cascader
                  v-model="addForm.nodeId"
                  :options="catalogList"
                  :show-all-levels="false"
                  :props="defaultOption"
                  @change="handleItemChange"
                ></el-cascader>
              </el-form-item>
              <el-form-item label="用户类型" prop="type">
                <el-select v-model="addForm.type" placeholder="选择用户类型">
                  <el-option label="数据管理员" :value="1"></el-option>
                  <el-option label="资源用户" :value="2"></el-option>
                  <el-option v-if="!authority.mt.startsWith('org_admin')" label="组织管理员" :value="3"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="用户名" prop="account">
                <el-input v-model="addForm.account" placeholder="请输入"></el-input>
              </el-form-item>

              <el-form-item v-if="passVisible" label="用户密码" prop="password">
                <el-input
                  type="password"
                  v-model="addForm.password"
                  placeholder="请输入"
                  autocomplete="off"
                >
                  <i
                    slot="suffix"
                    title="显示密码"
                    @click="changePass('show')"
                    style="cursor:pointer;"
                    class="iconfont iconshowPassword"
                  ></i>
                </el-input>
              </el-form-item>
              <el-form-item v-else label="用户密码" prop="password">
                <el-input
                  type="text"
                  v-model="addForm.password"
                  placeholder="请输入"
                  autocomplete="off"
                >
                  <i
                    slot="suffix"
                    title="隐藏密码"
                    @click="changePass('hide')"
                    style="cursor:pointer;"
                    class="iconfont iconhidePassword"
                  ></i>
                </el-input>
              </el-form-item>

              <el-form-item v-if="checkPassVisible" label="确认密码" prop="checkPass">
                <el-input
                  type="password"
                  v-model="addForm.checkPass"
                  placeholder="请输入"
                  autocomplete="off"
                >
                  <i
                    slot="suffix"
                    title="显示密码"
                    @click="changeCheckPass('show')"
                    style="cursor:pointer;"
                    class="iconfont iconshowPassword"
                  ></i>
                </el-input>
              </el-form-item>
              <el-form-item v-else label="确认密码" prop="checkPass">
                <el-input
                  type="text"
                  v-model="addForm.checkPass"
                  placeholder="请输入"
                  autocomplete="off"
                >
                  <i
                    slot="suffix"
                    title="隐藏密码"
                    @click="changeCheckPass('hide')"
                    style="cursor:pointer;"
                    class="iconfont iconhidePassword"
                  ></i>
                </el-input>
              </el-form-item>
              <el-form-item label="真实姓名" prop="name">
                <el-input v-model="addForm.name" placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="addForm.phone" placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item label="备注" prop="remark">
                <el-input type="textarea" v-model="addForm.remark" :rows="2" placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button
                  v-if="!authority.mt.startsWith('org_admin')"
                  type="primary"
                  @click="addSave('addForm')"
                >保 存</el-button>
                <el-button
                  v-if="authority.mt.startsWith('org_admin')"
                  type="primary"
                  @click="addOrgSave('addForm')"
                >保 存</el-button>
                <el-button @click="addVisible = false,cancelForm('addForm')">取 消</el-button>
              </el-form-item>
            </el-form>
          </el-dialog>
          <!--编辑弹窗-->
          <el-dialog title="编辑" :visible.sync="editVisible" custom-class="dialog-box">
            <el-form
              :model="editForm"
              status-icon
              :rules="editRules"
              ref="editForm"
              label-width="100px"
              class="demo-ruleForm"
            >
              <el-form-item v-if="!authority.mt.startsWith('org_admin')" label="所属组织" prop="nodeId">
                <el-select v-model="editForm.userOrg" disabled placeholder="所属组织"></el-select>
              </el-form-item>
              <el-form-item label="用户类型" prop="type">
                <el-select v-model="editForm.role" disabled placeholder="全部用户类型">
                  <el-option label="数据管理员" :value="'data_admin'"></el-option>
                  <el-option label="资源用户" :value="'resource_user'"></el-option>
                  <el-option
                    v-if="!authority.mt.startsWith('org_admin')"
                    label="组织管理员"
                    :value="'org_admin'"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="用户名" prop="account">
                <el-input v-model="editForm.account" placeholder="请输入" readonly></el-input>
              </el-form-item>
              <el-form-item v-if="passResetShow" label="密码" prop="resetPass">
                <el-input type="password" placeholder="***********" autocomplete="off" readonly>
                  <a class="changePas" slot="suffix" title="修改密码" @click="changeResetPass()">修改密码</a>
                </el-input>
              </el-form-item>
              <div v-if="passResetHide">
                <el-form-item v-if="passVisible" label="用户密码" prop="password">
                  <el-input
                    type="password"
                    v-model="editForm.password"
                    autocomplete="off"
                    placeholder="请输入"
                  >
                    <i
                      slot="suffix"
                      title="显示密码"
                      @click="changePass('show')"
                      style="cursor:pointer;"
                      class="iconfont iconshowPassword"
                    ></i>
                  </el-input>
                </el-form-item>
                <el-form-item v-else label="用户密码" prop="password">
                  <el-input
                    type="text"
                    v-model="editForm.password"
                    autocomplete="off"
                    placeholder="请输入"
                  >
                    <i
                      slot="suffix"
                      title="隐藏密码"
                      @click="changePass('hide')"
                      style="cursor:pointer;"
                      class="iconfont iconhidePassword"
                    ></i>
                  </el-input>
                </el-form-item>
                <el-form-item v-if="checkPassVisible" label="确认密码" prop="checkPass">
                  <el-input
                    type="password"
                    v-model="editForm.checkPass"
                    autocomplete="off"
                    placeholder="请输入"
                  >
                    <i
                      slot="suffix"
                      title="显示密码"
                      @click="changeCheckPass('show')"
                      style="cursor:pointer;"
                      class="iconfont iconshowPassword"
                    ></i>
                  </el-input>
                </el-form-item>
                <el-form-item v-else label="确认密码" prop="checkPass">
                  <el-input
                    type="text"
                    v-model="editForm.checkPass"
                    autocomplete="off"
                    placeholder="请输入"
                  >
                    <i
                      slot="suffix"
                      title="隐藏密码"
                      @click="changeCheckPass('hide')"
                      style="cursor:pointer;"
                      class="iconfont iconhidePassword"
                    ></i>
                  </el-input>
                </el-form-item>
              </div>
              <el-form-item label="真实姓名" prop="name">
                <el-input v-model="editForm.name" placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="editForm.phone" placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item label="备注" prop="remark">
                <el-input type="textarea" v-model="editForm.remark" :rows="2" placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="editSave('editForm')">保 存</el-button>
                <el-button @click="editVisible = false,cancelForm('editForm')">取 消</el-button>
              </el-form-item>
            </el-form>
          </el-dialog>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import moment from "moment";
import LocalSave from "@/libs/LocalSave.js";
import request from "@/libs/request";
import md5 from "md5";
import { setTimeout } from "timers";

export default {
  name: "UserManager",
  data() {
    var validateEditPass = (rule, value, callback) => {
      if (this.editForm.checkPass !== "") {
        this.$refs.editForm.validateField("checkPass");
      }
      callback();
    };

    var validateEditPass2 = (rule, value, callback) => {
      if (value !== this.editForm.password) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    var validateAddPass = (rule, value, callback) => {
      if (this.addForm.checkPass !== "") {
        this.$refs.addForm.validateField("checkPass");
      }
      callback();
    };
    var validateAddPass2 = (rule, value, callback) => {
      if (value !== this.addForm.password) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };

    const repeatUserName = async (rule, value, callBack) => {
      let { status } = await request.post("/usergroup/create/checkoutAccount", {
        account: value
      });
      if (status === 200) {
        callBack();
      } else {
        callBack(new Error("用户名已存在"));
      }
    };
    return {
      authority: "",
      catalogList: [],
      defaultOption: {
        value: "nodeId",
        label: "nodeName",
        children: "children",
        checkStrictly: true
      },
      closeOnPressEscape: false,
      tableData: [], //列表数据
      activeTab: "file", //选项卡选中值
      selectTable: [], //表格选中数据
      searchValue: {
        //搜索值
        status: "",
        text: ""
      },
      currentPage: 1, //分页初始值为1
      totalNum: 0, //分页总数
      pageSize: 10, //设置分页大小
      addVisible: false,
      passReset: true,
      passVisible: true,
      checkPassVisible: true,
      passResetShow: true,
      passResetHide: false,
      addForm: {
        nodeIdAry: [],
        nodeId: "",
        type: "",
        account: "",
        password: "",
        checkPass: "",
        name: "",
        phone: "",
        remark: ""
      },
      editVisible: false,
      editFormId: "",
      editForm: {
        orgNameAry: [],
        orgName: ""
      },
      addRules: {
        nodeId: [
          { required: true, message: "请选择用户类型", trigger: "change" }
        ],
        type: [
          { required: true, message: "请选择用户类型", trigger: "change" }
        ],
        account: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 6,
            max: 20,
            message: "长度不低于 6 不大于 20 个字符",
            trigger: "blur"
          },
          { validator: repeatUserName, trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入用户密码", trigger: "blur" },
          {
            min: 6,
            max: 20,
            message: "长度不低于 6 不大于 20 个字符",
            trigger: "blur"
          },
          { validator: validateAddPass, trigger: "blur" }
        ],
        checkPass: [
          { required: true, message: "请确认用户密码", trigger: "blur" },
          {
            min: 6,
            max: 20,
            message: "长度不低于 6 不大于 20 个字符",
            trigger: "blur"
          },
          { validator: validateAddPass2, trigger: "blur" }
        ],
        name: [{ max: 10, message: "长度不大于 10 个字符", trigger: "blur" }],
        phone: [
          { min: 11, max: 11, message: "长度为 11 个字符", trigger: "blur" }
        ],
        remark: [
          { max: 100, message: "长度不大于 100 个字符", trigger: "blur" }
        ]
      },
      editRules: {
        password: [
          { required: true, message: "请输入用户密码", trigger: "blur" },
          {
            min: 6,
            max: 20,
            message: "长度不低于 6 不大于 20 个字符",
            trigger: "blur"
          },
          { validator: validateEditPass, trigger: "blur" }
        ],
        checkPass: [
          { required: true, message: "请确认用户密码", trigger: "blur" },
          {
            min: 6,
            max: 20,
            message: "长度不低于 6 不大于 20 个字符",
            trigger: "blur"
          },
          { validator: validateEditPass2, trigger: "blur" }
        ],
        name: [{ max: 10, message: "长度不大于 10 个字符", trigger: "blur" }],
        phone: [
          { min: 11, max: 11, message: "长度为 11 个字符", trigger: "blur" }
        ],
        remark: [
          { max: 100, message: "长度不大于 100 个字符", trigger: "blur" }
        ]
      }
    };
  },

  created() {
    this.getDataList();
    this.getAuthority();
  },
  methods: {
    getAuthority() {
      this.authority = JSON.parse(LocalSave.getSession("authority"));
    },
    // 获取数据列表
    async getDataList() {
      var params = {
        type: parseInt(this.searchValue.status),
        sname: this.searchValue.text,
        pageSize: this.pageSize,
        pageIndex: this.currentPage
      };
      let oData = await request.post("/usergroup/get/userList", params, {
        loading: true
      });
      if (oData.status === 200) {
        this.tableData = oData.data;
        this.totalNum = oData.total;
      } else if (oData.status === 204) {
        this.tableData = null;
        this.totalNum = 0;
      } else {
        this.$message.warning(oData.message);
      }
    },
    //筛选数据列表
    async onSelect() {
      this.currentPage = 1;
      this.getDataList();
    },
    getTime(row, col, val) {
      if (val) {
        return moment(val).format("YYYY-MM-DD HH:mm:ss");
      } else {
        return moment().format("YYYY-MM-DD HH:mm:ss");
      }
    },
    //获取级联选择器数据
    async optionSelect() {
      let oData = await request.get(
        "/usergroup/org/getDepartmentTree",
        {},
        { loading: true }
      );
      if (oData.status === 200) {
        this.catalogList = oData.data;
      } else if (oData.status === 204) {
        this.catalogList = null;
      } else {
        this.$message.warning(oData.message);
      }
    },
    addBtn() {
      setTimeout(() => {
        this.$refs.addForm.resetFields();
      }, 1);
      this.addVisible = true;
      if (!this.authority.mt.startsWith("org_admin")) {
        this.optionSelect();
      }
    },
    //获取级联level
    handleItemChange(value) {
      this.addForm.nodeIdAry = value;
    },
    async addSave(formName) {
      // let oData = await request.post("/usergroup/create/createUser", params, {loading: true});
      this.$refs[formName].validate(valid => {
        if (valid) {
          var params = {
            orgId: this.addForm.nodeIdAry[this.addForm.nodeIdAry.length - 1],
            account: this.addForm.account,
            name: this.addForm.name,
            password: md5(this.addForm.password),
            phone: this.addForm.phone,
            remark: this.addForm.remark,
            type: this.addForm.type
          };
          request
            .post("/usergroup/create/createUser", params, { loading: true })
            .then(oData => {
              if (oData.status === 200) {
                this.addVisible = false;
                this.$message({
                  type: "success",
                  message: "提交成功！"
                });
                this.$refs[formName].resetFields();
                this.getDataList();
              } else {
                this.$message.error(oData.message);
              }
            });
        } else {
          this.$message.error("表单校验未通过！");
        }
      });
    },
    async addOrgSave(formName) {
      // let oData = await request.post("/usergroup/create/createUser", params, {loading: true});
      this.$refs[formName].validate(valid => {
        if (valid) {
          var params = {
            orgId: this.tableData[0].orgId,
            account: this.addForm.account,
            name: this.addForm.name,
            password: md5(this.addForm.password),
            phone: this.addForm.phone,
            remark: this.addForm.remark,
            type: this.addForm.type
          };
          request
            .post("/usergroup/create/createUser", params, { loading: true })
            .then(oData => {
              if (oData.status === 200) {
                this.addVisible = false;
                this.$message({
                  type: "success",
                  message: "提交成功！"
                });
                this.$refs[formName].resetFields();
                this.getDataList();
              } else {
                this.$message.error(oData.message);
              }
            });
        } else {
          this.$message.error("表单校验未通过！");
        }
      });
    },
    refreshData() {
      // 刷新数据列表
      this.searchValue.status = "";
      this.searchValue.text = "";
      this.onSelect();
    },
    changeResetPass() {
      this.passResetShow = false;
      this.passResetHide = true;
    },
    changePass(value) {
      this.passVisible = !(value === "show");
    },
    changeCheckPass(value) {
      this.checkPassVisible = !(value === "show");
    },
    async startBtn(row) {
      this.$confirm("确定启用此用户?", "启用", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          request
            .post(
              "/usergroup/alter/initiateUser",
              { ids: [row.id] },
              {
                loading: true,
                loadingTitle: "启用中"
              }
            )
            .then(oData => {
              if (oData.status === 200) {
                this.$message({
                  type: "success",
                  message: "启用成功！"
                });
                this.getDataList();
              } else {
                this.$message.error(oData.message);
              }
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消此操作！"
          });
        });
    },
    async stopBtn(row) {
      this.$confirm("确定停用此用户?", "停用", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          request
            .post(
              "/usergroup/alter/shutUser",
              { ids: [row.id] },
              { loading: true, loadingTitle: "停用中" }
            )
            .then(oData => {
              if (oData.status === 200) {
                this.$message({
                  type: "success",
                  message: "停用成功！"
                });
                this.getDataList();
              } else {
                this.$message.error(oData.message);
              }
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消此操作！"
          });
        });
    },
    async removeBtn(row) {
      this.$confirm("确定删除此用户?", "删除", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          request
            .post(
              "/usergroup/alter/deleteUser",
              { ids: [row.id] },
              { loading: true, loadingTitle: "删除中" }
            )
            .then(oData => {
              if (oData.status === 200) {
                this.$message({
                  type: "success",
                  message: "删除成功！"
                });
                this.getDataList();
              } else {
                this.$message.error(oData.message);
              }
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消此操作！"
          });
        });
    },
    handleSizeChange(val) {
      // 改变每页显示条数
      this.pageSize = val;
      this.getDataList();
    },
    handleCurrentChange(val) {
      //改变当前页
      this.currentPage = val;
      this.getDataList();
    },
    handleSelectionChange(val) {
      // 表格选中复选框
      this.selectTable = val;
    },
    // async removeTableData() { // 删除选中的表格数据
    //     if (this.selectTable.length) {
    //         try {
    //             let length = this.selectTable.length;
    //             let confirm = await this.$confirm(`是否确定删除这${length}条数据?`, "删除", {
    //                 confirmButtonText: "确定",
    //                 cancelButtonText: "取消",
    //                 type: "warning"
    //             });
    //             if (confirm) {
    //                 //获取所选框id
    //                 var ids = this.selectTable.map(item => item.id);
    //                 let oData = await request.post("/usergroup/alter/deleteUser", {ids: ids}, {
    //                     loading: true,
    //                     loadingTitle: "删除中"
    //                 });
    //                 if (oData.status === 200) {
    //                     this.$message({
    //                         type: 'success',
    //                         message: '删除成功！'
    //                     });
    //                     this.getDataList();
    //                 } else {
    //                     this.$message.error(oData.message);
    //                 }
    //             }
    //         } catch (e) {
    //         }
    //     } else {
    //         this.$message.warning("请选择要删除的数据");
    //     }
    // },
    async startTableData() {
      // 启用选中的表格数据
      if (this.selectTable.length) {
        try {
          let length = this.selectTable.length;
          let confirm = await this.$confirm(
            `是否确定启用这${length}个用户?`,
            "启用",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            }
          );
          if (confirm) {
            //获取所选框id
            var ids = this.selectTable.map(item => item.id);
            let oData = await request.post(
              "/usergroup/alter/initiateUser",
              { ids: ids },
              {
                loading: true,
                loadingTitle: "启用中"
              }
            );
            if (oData.status === 200) {
              this.$message({
                type: "success",
                message: "启用成功！"
              });
              this.getDataList();
            } else {
              this.$message.error(oData.message);
            }
          }
        } catch (e) {}
      } else {
        this.$message.warning("请选择要启用的用户");
      }
    },
    async stopTableData() {
      // 停用选中的表格数据
      if (this.selectTable.length) {
        try {
          let length = this.selectTable.length;
          let confirm = await this.$confirm(
            `是否确定停用这${length}个用户?`,
            "停用",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            }
          );
          if (confirm) {
            //获取所选框id
            var ids = this.selectTable.map(item => item.id);
            let oData = await request.post(
              "/usergroup/alter/shutUser",
              { ids: ids },
              {
                loading: true,
                loadingTitle: "停用中"
              }
            );
            if (oData.status === 200) {
              this.$message({
                type: "success",
                message: "停用成功！"
              });
              this.getDataList();
            } else {
              this.$message.error(oData.message);
            }
          }
        } catch (e) {}
      } else {
        this.$message.warning("请选择要停用的用户");
      }
    },
    editBtn(row) {
      //记录数据
      setTimeout(() => {
        this.$refs.editForm.resetFields();
        this.editForm = row;
        this.getDataList();
        // this.editForm.orgNameAry = this.editForm.userOrg.split('>');
        // this.editForm.orgName = this.editForm.orgNameAry[this.editForm.orgNameAry.length-1]
      }, 1);
      this.editVisible = true;
      this.passResetShow = true;
      this.passResetHide = false;
    },
    async editSave(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          var params = {
            orgId: this.editForm.orgId,
            id: this.editForm.id,
            name: this.editForm.name,
            phone: this.editForm.phone,
            remark: this.editForm.remark
          };
          if (
            this.editForm.password == "" ||
            this.editForm.password == undefined ||
            this.editForm.password == null
          ) {
            // params.password = "";
          } else {
            params.password = md5(this.editForm.password);
          }
          request
            .post("/usergroup/alter/userInformation", params, { loading: true })
            .then(oData => {
              if (oData.status === 200) {
                this.editVisible = false;
                this.$message({
                  type: "success",
                  message: "提交成功！"
                });
                this.$refs[formName].resetFields();
                this.passResetShow = true;
                this.passResetHide = false;
                this.getDataList();
              } else {
                this.$message.error(oData.message);
              }
            });
        } else {
          this.$message.warning("表单校验未通过！");
          // return false;
          // this.$refs[formName].resetFields();
          this.passResetShow = true;
          this.passResetHide = false;
        }
      });
    },
    cancelForm(formName) {
      this.$refs[formName].resetFields();
      this.$message({
        type: "info",
        message: "取消输入"
      });
    }
    // closeDialog(done) {
    //     this.$confirm('确认关闭？')
    //         .then(_ => {
    //             done();
    //             location.reload();
    //         })
    //         .catch(_ => {
    //         });
    // }
  }
};
</script>

<style scoped lang="less">
.search-box {
  .el-input {
    margin-left: 20px;
    width: 300px;

    .el-button {
    }
  }

  .search-result {
    margin-left: 20px;
    color: #999;
  }
}

.changePas {
  cursor: pointer;
  margin-right: 20px;
  color: #ccc;
}

.changePas:hover {
  color: #66b1ff;
}
</style>
