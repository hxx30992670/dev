<template>
<div class="content-wrap">
  <el-tabs type="card" v-model="activeTab" @tab-remove="handleTabsEdit" class="custom-tab">
    <el-tab-pane label="服务管理" name="file">
      <div class="content-box">
        <div class="search-box">
          <div class="left">
            <el-select v-model="servicesValue" placeholder="请选择服务状态" clearable style="max-width:140px"
                       v-on:change="onSelect()">
              <el-option label="更新中" v-bind:value="0"></el-option>
              <el-option label="停止更新" v-bind:value="1"></el-option>
            </el-select>
            <el-select v-model="topicValue" placeholder="请选择资源主题" clearable style="margin-left:20px;max-width:150px"
                       v-on:change="onSelect()">
              <el-option
                v-for="item in topicOptions"
                :key="item.id"
                :label="item.topicName"
                v-bind:value="item.id">
              </el-option>
            </el-select>

            <span style="margin-left:20px">创建时间：</span>
            <el-date-picker v-model="dateValue" :picker-options="pickerOptions" type="daterange" range-separator="至"
                            start-placeholder="开始时间"
                            end-placeholder="结束时间" style="max-width:220px" v-on:change="onSelect()"></el-date-picker>

            <el-input v-model="searchValue.text" placeholder="请输入服务名称" maxlength="20" prefix-icon="el-icon-search"
                      style="max-width:230px">
              <el-button slot="append" type="success" v-on:click="onSelect()">搜索</el-button>
            </el-input>
            <p class="search-result" v-model="totalNum">找到相关搜索结果 {{totalNum}} 条</p>
          </div>

          <div class="right" style="margin-right:20px">
            <el-button type="danger" @click="removeTableData()" title="删除">
              <i class="iconfont3 icon-shanchu"></i>
            </el-button>
            <el-button type="info" @click="refreshData()" title="刷新">
              <i class="iconfont3 icon-shuaxin"></i>
            </el-button>
          </div>
        </div>
        <div class="table-wrap">
          <el-table :data="tableData" stripe border header-cell-class-name="th-style"
                    @selection-change="handleSelectionChange">
            <el-table-column type="selection" :selectable="selectable" width="55"></el-table-column>
            <el-table-column prop="name" :show-overflow-tooltip="true" label="服务名称">
              <template slot-scope="scope">
              <el-button @click="resIfno(scope.row)" type="text">{{scope.row.name}}</el-button>
              </template>
            </el-table-column>
            <el-table-column v-if="!authority.mt.startsWith('org_admin')" label="所属组织" prop="orgName" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column label="创建人" prop="creatorName" width="120" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column label="创建时间" prop="createTime" :formatter="getTime" width="180"></el-table-column>
            <el-table-column label="最后更新时间" prop="updateTime" :formatter="getTime" width="180"></el-table-column>
            <el-table-column label="服务状态" prop="resourceStatus" width="100">
              <template slot-scope="scope">
              <span v-if="scope.row.resourceStatus == '停止更新'" style="color: #F4AB37">停止更新</span>
              <span v-else>{{scope.row.resourceStatus}}</span>
              </template>
            </el-table-column>
            <el-table-column label="服务主题" prop="topicName" width="120" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column label="服务类型" prop="serviceTypeName" width="170"></el-table-column>
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
            :total="totalNum">
          </el-pagination>
        </div>
      </div>
    </el-tab-pane>
    <!--资源详情-->
    <el-tab-pane v-for="item in tabList" :closable="true" :key="item.id" :label="item.label" :name="item.name">
      <div class="content-box">
      <el-form :model="formData" label-width="140px" label-position="right">
        <el-form-item label="服务名称:">
          <el-input readonly v-model="formData.serviceName"></el-input>
        </el-form-item>
        <el-form-item v-if="!authority.mt.startsWith('org_admin')" label="所属组织:">
          <el-input readonly v-model="formData.orgName"></el-input>
        </el-form-item>
        <el-form-item label="创建人:">
          <el-input readonly v-model="formData.creatorName"></el-input>
        </el-form-item>
        <el-form-item label="创建时间:">
          <el-input readonly v-model="formData.createTime"></el-input>
        </el-form-item>
        <el-form-item label="最后更新时间:">
          <el-input readonly v-model="formData.updateTime"></el-input>
        </el-form-item>
        <el-form-item label="服务状态:">
          <el-input readonly v-model="formData.serviceStatus === 0 ? '更新中':'停止更新'"></el-input>
        </el-form-item>
        <el-form-item label="服务主题:">
          <el-input readonly v-model="formData.topicName"></el-input>
        </el-form-item>
        <template v-if="formData.serviceTypeName === '文件/库表/视图查询'">
        <el-form-item label="数据字段:">
          <el-table :data="formData.dataFields" stripe border header-cell-class-name="th-style" style="max-height:450px;overflow-y:auto">
            <el-table-column property="name" label="名称" width="150"></el-table-column>
            <el-table-column property="type" label="类型" width="200"></el-table-column>
            <!--<el-table-column property="length" label="长度" width="200"></el-table-column>-->
            <el-table-column property="desc" label="说明" :show-overflow-tooltip="true"></el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item label="服务预览:">
          <el-table :data="formData.servicePreview" stripe border header-cell-class-name="th-style"
                    style="max-height:450px;overflow-y:auto">
            <el-table-column v-for="item in colNames" :prop="item" :label="item" :show-overflow-tooltip="true"></el-table-column>

          </el-table>
          <div style="margin-top: 20px;font-size: 12px;color: #F4AB37">注*数据预览只可查看50条数据！</div>
        </el-form-item>
        </template>
        <el-form-item label="服务方式:">
          <el-button v-if="formData.serviceTypeName === '接口'"><i class="iconfont"
                                                                 style="font-size: 12px;padding-right: 8px">&#xf033;</i>接口
          </el-button>
          <el-button v-if="formData.serviceTypeName === '文件/库表/视图查询'"><i class="iconfont"
                                                                         style="font-size: 12px;padding-right: 8px">&#xf034;</i>库表/视图/文件
          </el-button>
        </el-form-item>
        <template v-if="formData.serviceTypeName === '接口'">
        <el-form-item label="接口地址:">
          <el-input readonly v-model="formData.proxyAddress"></el-input>
        </el-form-item>
        <el-form-item label="返回格式:">
          <el-input readonly v-model="formData.responseTypeName"></el-input>
        </el-form-item>
        <el-form-item label="请求方式:">
          <el-input readonly v-model="formData.requestModeName"></el-input>
        </el-form-item>
        <el-form-item label="接口描述:">
          <el-input readonly v-model="formData.desc"></el-input>
        </el-form-item>
        <el-form-item label="请求参数说明:">
          <el-table :data="formData.requestParam" stripe border header-cell-class-name="th-style">
            <el-table-column property="name" label="名称" width="150"></el-table-column>
            <el-table-column property="must" label="必填" width="200">
              <template slot-scope="scope">
              <span v-if="scope.row.must === 1">是</span>
              <span v-if="scope.row.must === 0">否</span>
              </template>
            </el-table-column>
            <el-table-column property="type" label="类型">
              <template slot-scope="scope">
              <span v-if="scope.row.type === 1">Long</span>
              <span v-if="scope.row.type === 2">Varchar</span>
              <span v-if="scope.row.type === 3">DateTime</span>
              <span v-if="scope.row.type === 4">Double</span>
              <span v-if="scope.row.type === 5">Array</span>
              <span v-if="scope.row.type === 6">Object</span>
              </template>
            </el-table-column>
            <el-table-column property="desc" label="说明" :show-overflow-tooltip="true"></el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item label="返回参数说明:">
          <el-table :data="formData.responseParam" stripe border header-cell-class-name="th-style">
            <el-table-column label="名称" prop="name" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column label="类型" prop="type">
              <template slot-scope="scope">
              <span v-if="scope.row.type === 1">Long</span>
              <span v-if="scope.row.type === 2">String</span>
              <span v-if="scope.row.type === 3">DateTime</span>
              <span v-if="scope.row.type === 4">Double</span>
              <span v-if="scope.row.type === 5">Array</span>
              <span v-if="scope.row.type === 6">Object</span>
              </template>
            </el-table-column>
            <el-table-column label="说明" prop="description" :show-overflow-tooltip="true"></el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item label="错误码说明:">
          <el-table :data="formData.errorCode" stripe border header-cell-class-name="th-style">
            <el-table-column label="名称" prop="name" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column label="说明" prop="desc" :show-overflow-tooltip="true"></el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item label="请求示例:">
          <el-input readonly type="textarea" v-model="formData.requestDemo"
                    :autosize="{ minRows: 1, maxRows: 4}" resize="none"></el-input>
        </el-form-item>
        <el-form-item label="返回示例:">
          <el-input readonly type="textarea" v-model="formData.responseDemo"
                    :autosize="{ minRows: 2, maxRows: 8}" resize="none"></el-input>
        </el-form-item>
        </template>
      </el-form>
      </div>
    </el-tab-pane>

  </el-tabs>
</div>
</template>

<script>
import moment from "moment";
import LocalSave from "@/libs/LocalSave.js";
import request from "@/libs/request";

export default {
  name: "ResourceManager",
  data() {
    return {
      authority:"",
      tabList: [],//资源详情
      colNames: [],
      formData: {
        detailId: "",
        serviceName: "",
        orgName:"",
        creatorName: "",
        createTime: "",
        updateTime: "",
        serviceStatus: "",
        topicName: "",
        serviceTypeName: "",
        servicePreview: [],//服务预览
        dataFields: [],//数据字段
        //接口详情
        proxyAddress: "",
        responseTypeName: "",
        requestModeName: "",
        desc: "",
        requestDemo: "",
        requestParam: "",
        responseDemo: "",
        responseParam: "",
        errorCode: "",
      },
      selectDate: '',
      //日期选择范围在一个月内
      pickerOptions: {
        disabledDate: (time) => {
          return time.getTime() > Date.now()
        }
      },
      date: '',
      activeTab: "file",
      tableData: [], //列表数据
      selectTable: [], //表格选中数据
      searchValue: {  //搜索值
        text: "",
      },
      servicesValue: '',//服务状态value
      topicValue: '',//资源主题value
      topicOptions: [],//主题的option
      dateValue: '',//起止时间选择
      currentPage: 1,//分页初始值为1
      totalNum: 0,//分页总数
      pageSize: 10,//设置分页大小
    }
  },
  created() {
    this.getDataList();
    this.getTopic();
    this. getAuthority();
  },
  methods: {
    getAuthority(){
      this.authority = JSON.parse(LocalSave.getSession("authority"));
    },
    // 获取数据列表
    async getDataList() {
      var params = {
        "topicId": this.topicValue,
        "resourceStatus": this.servicesValue,
        "serviceName": this.searchValue.text,
        "pageSize": this.pageSize,
        "pageIndex": this.currentPage
      };
      if (this.dateValue && this.dateValue.length) {
        params.beginDate = this.dateValue[0];
        params.endDate = this.dateValue[1];
      } else {
        params.beginDate = null;
        params.endDate = null;
      }
      let oData = await request.post("/serviceitem/service/getServiceListByCriteria", params, {loading: true});
      if (oData.status === 200) {
        this.tableData = oData.data;
        this.totalNum = oData.total;
        // this.currentPage = oData.pageIndex;
      } else if (oData.status === 204) {
        this.tableData = null;
        this.totalNum = 0;
      } else {
        this.$message.warning(oData.message);
      }
    },
    // 筛选数据列表
    async onSelect() {
      this.currentPage = 1;
      this.getDataList();
    },
    //获取主题名称和id
    async getTopic() {
      let oData = await request.get("/serviceitem/serviceTopic/getTopicList");
      if (oData.status === 200) {
        this.topicOptions = oData.data;
      } else if (oData.status === 204) {
        this.topicOptions = null;
      } else {
        this.$message.warning(oData.message);
      }
    },
    refreshData() { // 刷新数据列表
      this.servicesValue = "";
      this.topicValue = "";
      this.dateValue = "";
      this.searchValue.text = "";
      this.onSelect();
    },
    getTime(row, col, val) { //格式化时间
      if (val) {
        return moment(val).format("YYYY-MM-DD HH:mm:ss");
      } else {
        return moment().format("YYYY-MM-DD HH:mm:ss");
      }
    },
    handleSizeChange(val) { // 改变每页显示条数
      this.pageSize = val;
      this.getDataList();
    },
    handleCurrentChange(val) { //改变当前页
      this.currentPage = val;
      this.getDataList();
    },
    handleSelectionChange(val) { // 表格选中复选框
      this.selectTable = val;
    },
    selectable(row) {
      if ((row.resourceStatus == '停止更新')) {
        return true
      } else {
        return false
      }
    },
    async removeTableData() { // 删除选中的表格数据
      if (this.selectTable.length) {
        try {
          let length = this.selectTable.length;
          let confirm = await this.$confirm(`是否确定删除这${length}条数据?`, "删除", {
            cancelButtonText: "取消",
            confirmButtonText: "确定",
            type: "warning"
          });
          if (confirm) {
            //获取所选框id
            var ids = this.selectTable.map(item => item.id);
            let oData = await request.post("/serviceitem/service/deleteService", {idList: ids}, {
              loading: true, loadingTitle: "删除中"
            });
            if (oData.status === 200) {
              this.$message({
                type: 'success',
                message: '删除成功！'
              });
              this.getDataList();
            } else {
              this.$message({
                type: 'info',
                message: '取消删除'
              });
            }
          }
        } catch (e) {
        }
      } else {
        this.$message.warning("请选择要删除的数据");
      }
    },
    //跳转到治理面板
    handleTabsEdit() {
      this.tabList = [];
      this.activeTab = "file";
    },
    //详情
    resIfno(row) {
      this.tabList = [
        {
          label: "服务详情",
          name: "detail",
        }
      ];
      this.activeTab = "detail";
      // this.formData.detailId = row.id;
      let params = {
        "id": row.id
      };
      request.post('/serviceitem/service/serviceDetailByAdmin', params, {
        loading: true,
        loadingTitle: "获取资源详情……"
      })
        .then(res => {
          if (res.status === 200 || res.status === 204) {
            if (res.data.createTime || res.data.updateTime) {
              this.createTime = moment(res.data.createTime).format("YYYY-MM-DD HH:mm:ss");
              this.updateTime = moment(res.data.updateTime).format("YYYY-MM-DD HH:mm:ss");
            } else {
              return moment().format("YYYY-MM-DD HH:mm:ss");
            }
            if (row.serviceTypeName === '文件/库表/视图查询') {
              this.formData = {
                detailId: res.data.id,
                serviceName: res.data.serviceName,
                orgName:res.data.orgName,
                creatorName: res.data.creatorName,
                createTime: this.createTime,
                updateTime: this.updateTime,
                serviceStatus: res.data.serviceStatus,
                topicName: res.data.topicName,
                serviceTypeName: row.serviceTypeName,
                servicePreview: res.data.serviceDb.dataList,
                dataFields: res.data.serviceDb.tableFields.length == 0 ? null : res.data.serviceDb.tableFields
              }
              this.colNames = this.formData.servicePreview.length == 0 ? null : Object.keys(this.formData.servicePreview[0]);
            } else {
              this.formData = {
                detailId: res.data.id,
                serviceName: res.data.serviceName,
                orgName:res.data.orgName,
                creatorName: res.data.creatorName,
                createTime: this.createTime,
                updateTime: this.updateTime,
                serviceStatus: res.data.serviceStatus,
                topicName: res.data.topicName,
                serviceTypeName: row.serviceTypeName,
                proxyAddress: res.data.serviceApi.proxyAddress,
                responseTypeName: res.data.serviceApi.responseTypeName,
                requestModeName: res.data.serviceApi.requestModeName,
                desc: res.data.serviceApi.desc,
                requestDemo: res.data.serviceApi.requestDemo,
                requestParam: res.data.serviceApi.requestParam === "" || res.data.serviceApi.requestParam === null || res.data.serviceApi.requestParam === undefined || res.data.serviceApi.requestParam === "{}" ? null : JSON.parse(res.data.serviceApi.requestParam),
                responseDemo: res.data.serviceApi.responseDemo,
                responseParam: res.data.serviceApi.responseParam === "" || res.data.serviceApi.responseParam === null || res.data.serviceApi.responseParam === undefined || res.data.serviceApi.responseParam === "{}" ? null : JSON.parse(res.data.serviceApi.responseParam),
                errorCode: res.data.serviceApi.errorCode === "" || res.data.serviceApi.errorCode === null || res.data.serviceApi.errorCode === undefined || res.data.serviceApi.errorCode === "{}" ? null : JSON.parse(res.data.serviceApi.errorCode),
              }
            }
          } else {
            this.message.warning(res.message);
          }
        })
    },
  }
}
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
</style>
