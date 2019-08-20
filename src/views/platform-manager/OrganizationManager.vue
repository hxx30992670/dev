<template>
  <div class="content-wrap">
    <el-tabs type="card" v-model="activeTab" class="custom-tab">
      <el-tab-pane label="组织管理" name="file">
        <div class="content-box">
          <div class="search-box">
            <div class="left">
              <el-input v-model="searchValue" placeholder="请输入用户名" maxlength="10" prefix-icon="el-icon-search">
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
            </div>
          </div>
          <div class="table-wrap">
              <el-table :data="tableData" :default-expand-all="expandTable" stripe border header-cell-class-name="th-style" row-key="nodeId" :tree-props="{children: 'children', hasChildren: 'hasChildren'}" ref="orgList">
                <el-table-column prop="nodeName" label="组织名称" :show-overflow-tooltip="true">
                  <template slot-scope="scope">
                    <span :class="{find: scope.row.nodeName.includes(searchValue) && searchValue !== ''}">{{scope.row.nodeName}}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="level" label="级别" :show-overflow-tooltip="true"> </el-table-column>
                <el-table-column prop="createTime" label="创建时间" :formatter="getTime" :show-overflow-tooltip="true"> </el-table-column>
                <el-table-column label="操作" width="160">
                  <template slot-scope="scope">
                    <div>
                      <el-button type="text" @click="editBtn(scope.row)" class="iconfont3 icon-bianji" title="编辑"></el-button>
                      <el-button type="text" @click="removeBtn(scope.row)" style="color:#F56C86" class="iconfont3 icon-shanchu" title="删除"></el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
          </div>
          <!--分页-->
          <!--<div class="page-wrap">-->
            <!--<el-pagination-->
              <!--@size-change="handleSizeChange"-->
              <!--@current-change="handleCurrentChange"-->
              <!--:current-page="currentPage"-->
              <!--:page-size="pageSize"-->
              <!--layout="total, prev, pager, next, jumper"-->
              <!--:total="totalNum">-->
            <!--</el-pagination>-->
          <!--</div>-->
          <!--新增弹窗-->
          <el-dialog title="新增组织" :visible.sync="addVisible" custom-class="dialog-box">
            <el-form :model="addForm" status-icon :rules="addRules" ref="addForm"
                     label-width="140px"
                     class="demo-ruleForm">
              <el-form-item label="上级组织" prop="nodeId">
                <el-cascader v-model="addForm.nodeId" :options="catalogList" :show-all-levels="false" :props="defaultOption" @change="handleItemChange">
                </el-cascader>
              </el-form-item>
              <el-form-item label="组织名称" prop="nodeName">
                <el-input v-model="addForm.nodeName" placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item label="统一社会信用代码" prop="socialCreditCode">
                <el-input v-model="addForm.socialCreditCode" placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="addSave('addForm')">保 存</el-button>
                <el-button @click="addVisible = false,cancelForm('addForm')">取 消</el-button>
              </el-form-item>
            </el-form>
          </el-dialog>
          <!--编辑弹窗-->
          <el-dialog title="组织编辑" :visible.sync="editVisible" custom-class="dialog-box">
            <el-form :model="editForm" status-icon :rules="editRules" ref="editForm" label-width="140px"
                     class="demo-ruleForm">
              <el-form-item label="上级组织">
                <el-select v-model="parentName" disabled></el-select>
              </el-form-item>
              <el-form-item label="组织名称" prop="nodeName">
                <el-input v-model="editForm.nodeName" placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item label="统一社会信用代码" prop="socialCreditCode">
                <el-input v-model="editForm.socialCreditCode" placeholder="请输入"></el-input>
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
  import request from "@/libs/request";
  import newArrayData from "@/libs/resultFilterArray";
  export default {
    name: "OrganizationManager",
    watch: {
      searchValue(val,oldVal) {
        if(val) {
          // this.expandTable = true;
          clearInterval(this.time);
          this.time = setTimeout(() => {
            if(this.getDataTable.length) {
              this.getDataTable.forEach(item => {
                // this.expandRow(item, true);
              });
            }
          },200);
        }else {
          // this.expandTable = false;
          clearInterval(this.time);
          this.time = setTimeout(() => {
            if(this.getDataTable.length) {
              this.getDataTable.forEach(item => {
                // this.expandRow(item, false);
              });
            }
          },200);
        }
      }
    },
    computed: {
      getDataTable() {
        // this.searchData = this.tableAllData;
        let newData = this.tableAllData;
        if(this.searchValue !== '') {
          this.searchData = newArrayData(newData,'nodeName',this.searchValue)
          return newArrayData(newData,'nodeName',this.searchValue);
        }else {
          this.searchData = this.tableData;
          return this.tableData;
        }
      }
    },
    data() {
      const repeatAddName = async (rule, value, callBack) => {
        let {status} = await request.post("/usergroup/org/checkOrgName", {name:value});
        if (status === 200) {
          callBack();
        } else {
          callBack(new Error("组织名称已存在"));
        }
      };
      const repeatEditName = async (rule, value, callBack) => {
        let {status} = await request.post("/usergroup/org/checkOrgName", {name:value,id:this.editForm.nodeId});
        if (status === 200) {
          callBack();
        } else {
          callBack(new Error("组织名称已存在"));
        }
      };
      return {
        time: null,
        searchData: [],
        tableAllData:[],
        expandTable: false,
        closeOnPressEscape: false,
        defaultOption: {
          value: "nodeId",
          label: "nodeName",
          children: "children",
          checkStrictly:true
        },
        tableData: [], //列表数据
        activeTab: "file", //选项卡选中值
        selectTable: [], //表格选中数据
        searchValue: "",
        currentPage: 1,//分页初始值为1
        totalNum: 0,//分页总数
        pageSize: 10,//设置分页大小
        addVisible: false,
        catalogList: [],
        addForm: {
          // level:'',
          nodeIdAry:[],
          nodeId:'',
          nodeName: '',
          socialCreditCode: ''
        },
        editVisible: false,
        parentName: '',
        editForm: {},
        addRules: {
          nodeId: [
            {required: true, message: '请选择上级组织', trigger: 'change'}
          ],
          nodeName: [
            {required: true, message: '请输入组织名称', trigger: 'blur'},
            {max: 50, message: '长度不可大于 50 个字符', trigger: 'blur'},
            {validator: repeatAddName, trigger: "blur"}
          ],
          socialCreditCode: [
            {min: 18, max: 18, message: '长度需为18个字符', trigger: 'blur'},
            { pattern: /^[a-zA-Z0-9]+$/, message: '输入类型只能为数字或字母' }
          ]
        },
        editRules: {
          nodeName: [
            {required: true, message: '请输入组织名称', trigger: 'focus'},
            {max: 50, message: '长度不可大于 50 个字符', trigger: 'focus'},
            {validator: repeatEditName, trigger: "focus"}
          ],
          socialCreditCode: [
            {min: 18, max: 18, message: '长度需为18个字符', trigger: 'blur'},
            { pattern: /^[a-zA-Z0-9]+$/, message: '输入类型只能为数字或字母' }
          ]
        }
      }
    },
    created() {
      this.getDataList();
    },
    methods: {
      //展开搜索出来的行
      expandRow(row, flag) {
        if(row.children && row.children.length) {
          this.$refs.orgList.toggleRowExpansion(row,flag);
          row.children.forEach(child => {
            this.expandRow(child,flag);
          });
        }
      },
      async getDataList() {
        let oData = await request.get("/usergroup/org/getDepartmentTree",{}, {loading: true});

        this.getDataTable.forEach(item => {
          this.expandRow(item, false);
        });
        if (oData.status === 200) {
          this.tableData = oData.data;
          this.tableAllData = oData.data;
          this.totalNum = oData.data.length;
        } else if (oData.status === 204) {
          this.tableData = null;
          this.totalNum = 0;
        } else {
          this.$message.warning(oData.message);
        }
      },
      //筛选数据列表
      async onSelect() {
        this.tableData = this.searchData;
        // this.expandRow(item, true);
        var search = this.searchValue;
        setTimeout(() => {
          this.getDataTable.forEach(item => {
            this.expandRow(item, true);
          });
        },20)

        if (search) {
          this.totalNum = this.searchData.length;
          if(this.searchData.length === 0){
            this.searchData = [];
          }
        } else if(search.length === 0) {
          this.getDataList();
        } else {
          return this.tableData;
        }

        // var search = this.searchValue;
        // if (search) {
        //   this.searchData = this.tableData.filter(array => array.nodeName.match(search));
        //   this.totalNum = this.searchData.length;
        //   if(this.searchData.length === 0){
        //     this.searchData = [];
        //   }
        // } else if(search.length === 0) {
        //   this.getDataList();
        // } else {
        //   return this.searchData;
        // }
      },
      getTime(row, col, val) {
        if (val) {
          return moment(val).format("YYYY-MM-DD HH:mm:ss");
        } else {
          return moment().format("YYYY-MM-DD HH:mm:ss");
        }
      },
      refreshData() { // 刷新数据列表
        this.searchValue = "";
        this.getDataList();
      },
      async removeBtn(row) {
        this.$confirm('确定删除此组织?', '删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          request.delete("/usergroup/org/delete/"+row.nodeId,{}, {loading: true, loadingTitle: "删除中"})
            .then(oData => {
              if (oData.status === 200) {
                this.$message({
                  type: 'success',
                  message: '删除成功！'
                });
                this.getDataList();
              } else {
                this.$message.error(oData.message);
              }
            })

        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消此操作！',
          });
        });
      },
      handleSizeChange(val) { // 改变每页显示条数
        this.pageSize = val;
        this.getDataList();
      },
      handleCurrentChange(val) { //改变当前页
        this.currentPage = val;
        this.getDataList();
      },
      //获取级联选择器数据
      async optionSelect() {
        let oData = await request.get("/usergroup/org/getDepartmentTree",{}, {loading: true});
        if (oData.status === 200) {
          this.catalogList = oData.data;
          this.catalogList.unshift({nodeId:'0',nodeName:'无'});
          console.log(this.catalogList)
        } else if (oData.status === 204) {
          this.catalogList = null;
        } else {
          this.$message.warning(oData.message);
        }
      },
      //点击新增按钮
      addBtn() {
        setTimeout(() => {
          this.$refs.addForm.resetFields();
        }, 30);
        this.addVisible = true;
        this.optionSelect();
      },
      //获取级联level
      handleItemChange(value) {
        this.addForm.nodeIdAry = value;
        // if(value[0] === '0'){
        //   this.addForm.level = 0;
        // } else {
        //   this.addForm.level = value.length;
        // }
      },
      //新增提交按钮
      async addSave(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            var params = {
              // "level": this.addForm.level,
              "parentId": this.addForm.nodeIdAry[this.addForm.nodeIdAry.length-1],
              "name": this.addForm.nodeName,
              "socialCreditCode": this.addForm.socialCreditCode
            };
            request.post("/usergroup/org/createOrg", params, {loading: true})
              .then(oData => {
                if (oData.status === 200) {
                  this.addVisible = false;
                  this.$message({
                    type: 'success',
                    message: '提交成功！',
                  });
                  this.$refs[formName].resetFields();
                  this.getDataList();
                } else {
                  this.$message.error(oData.message);
                }
              })
          } else {
            this.$message.error('表单校验未通过！');
          }
        })
      },
      editBtn(row) {
        this.editForm.nodeId = row.nodeId;
        request.get("/usergroup/org/detail/"+this.editForm.nodeId,{}, {loading: true}).then(oData => {
          if (oData.status === 200) {
            this.parentName = oData.data.parentNodeName;
          } else if (oData.status === 204) {
            this.parentName = null
          } else {
            this.$message.warning(oData.message);
          }
        });
        //记录数据
        setTimeout(() => {
          this.$refs.editForm.resetFields();
          this.editForm = row;
          this.getDataList();
        }, 30);
        this.editVisible = true;

      },
      async editSave(formName) {
        this.$refs[formName].validate((valid) => {
            // request.post("/usergroup/org/checkOrgName", {name:this.editForm.nodeName}, {loading: true})
            //   .then(repeatData => {
            //     if( repeatData.status === 200 ){
                  if (valid) {
                    var params = {
                      "id": this.editForm.nodeId,
                      // "level": this.editForm.level,
                      "name": this.editForm.nodeName,
                      "socialCreditCode": this.editForm.socialCreditCode
                    };
                    request.post("/usergroup/org/updateOrg", params, {loading: true})
                      .then(oData => {
                        if (oData.status === 200) {
                          this.editVisible = false;
                          this.$message({
                            type: 'success',
                            message: '提交成功！',
                          });
                          this.$refs[formName].resetFields();
                          this.getDataList();
                        } else {
                          this.$message.error(oData.message);
                        }
                      })
                  } else {
                    this.$message.warning('表单校验未通过！');
                  }
              //   } else {
              //     this.$message.warning('名字不可重复！');
              //   }
              //
              // })

        })
      },
      cancelForm(formName) {
        this.$refs[formName].resetFields();
        this.$message({
          type: 'info',
          message: '取消输入'
        });
      },
    }
  }
</script>

<style scoped lang="less">
  .search-box {
    .el-input {
      width: 300px;

      .el-button {

      }
    }

    .search-result {
      margin-left: 20px;
      color: #999;
    }
  }
  .find {
    color: #4887ED;
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
