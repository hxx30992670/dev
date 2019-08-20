<template xmlns="http://www.w3.org/1999/html">
<!--内容区域-->
<div class="content-wrap">
  <el-tabs type="card" v-model="activeTab" @tab-remove="handleTabsEdit" class="custom-tab">
    <el-tab-pane label="我的服务" :closable="false" name="file">
      <div class="content-box">
        <!--筛选条件-->
        <div class="search-box">
          <div class="left">
          <div class="search-condition01">
            <el-select class="search-select" v-model="subscribeValue" clearable placeholder="请选择订阅状态"
                       v-on:change="searchDataList()">
              <el-option label="审核中" :value="0"></el-option>
              <el-option label="订阅成功" :value="1"></el-option>
              <el-option label="订阅失败" :value="2"></el-option>
            </el-select>
          </div>
          <div class="search-condition">
            <el-select class="search-select" v-model="servicesValue" clearable placeholder="请选择服务状态"
                       v-on:change="searchDataList()">
              <el-option label="更新中" :value="0"></el-option>
              <el-option label="停止更新" :value="1"></el-option>
            </el-select>
          </div>
          <div class="search-condition">
            <el-select class="search-select" v-model="topicValue" clearable placeholder="请选择服务主题"
                       v-on:change="searchDataList()">
              <el-option
                v-for="item in topicOptions"
                :key="item.id"
                :label="item.topicName"
                :value="item.id">
              </el-option>
            </el-select>
          </div>
          <div class="search-condition">
            <el-input placeholder="请输入服务名称" prefix-icon="el-icon-search"
                      clearable maxlength="20" v-model="searchValue.text" class="input-with-select">
              <el-button slot="append" v-on:click="getDataList()">搜索</el-button>
            </el-input>
          </div>
          <span class="search-result">找到相关结果{{totalNum}}条</span>
          </div>
          <div class="right">
            <el-button type="info" @click="refList()" title="刷新">
              <i class="iconfont3 icon-shuaxin"></i>
            </el-button>
          </div>
        </div>
        <!--我的服务列表-->
        <el-table :data="tableData" stripe border header-cell-class-name="th-style" class=" resource-list">
          <el-table-column prop="serviceName" :show-overflow-tooltip="true" label="服务名称" width="180"></el-table-column>
          <el-table-column prop="orgName" label="所属组织" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="creatorName" label="创建人" width="110"></el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" :formatter="getTime"></el-table-column>
          <el-table-column prop="subscribeTime" label="订阅时间" width="180" :formatter="getTime"></el-table-column>
          <el-table-column prop="updateTime" label="最后更新时间" width="180" :formatter="getTime"></el-table-column>
          <el-table-column prop="serviceStatusName" label="服务状态"></el-table-column>
          <el-table-column prop="topicName" label="服务主题"></el-table-column>
          <el-table-column prop="serviceTypeName" label="服务方式">
            <template slot-scope="scope">
            <span v-if="scope.row.serviceTypeName === '接口'">接口</span>
            <span v-if="scope.row.serviceTypeName === '文件/库表/视图查询'">库表/视图/文件</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="订阅状态">
            <template slot-scope="scope">
            <span v-if="scope.row.status === 0" style="color: #F4AB37">审核中</span>
            <span v-if="scope.row.status === 1">订阅成功</span>
            <span v-if="scope.row.status === 2">
                                    <el-button type="text" style="color: #ff7787" @click="open(scope.row)">订阅失败<i
                                      class="iconfont"
                                      style="color: #ff7787;font-size: 12px;padding-left: 5px">&#xf03f;</i></el-button>
                                </span>
            </template>
          </el-table-column>
          <el-table-column prop="subscibe" label="操作" width="100">
            <template slot-scope="scope">
            <el-button @click="typechange(scope.row)" type="text" size="small"
                       :form-data="formData" title="详情" class="iconfont iconinfo">
            </el-button>
            <el-button v-if="scope.row.status === 1 || scope.row.status === 2"
                       @click.native.prevent="deleteRow(scope.row)" type="text"
                       size="small" style="color:#F56C86" class="iconfont3 icon-shanchu" title="删除">
            </el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--分页-->
        <div class="page">
          <el-pagination
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
      <resource-detail :form-data="formData" ref="ResourceDetail"></resource-detail>
    </el-tab-pane>
  </el-tabs>
</div>
</template>

<script>
import moment from "moment";
import ResourceDetail from "@/components/ResourceDetail";
import request from "@/libs/request";

export default {
  name: "MyResource",
  components: {
    ResourceDetail
  },
  data() {
    return {
      breadcrumbList: [],
      formData: {
        serviceName: "",
        orgName:"",
        creatorName: "",
        serviceStatus: "",
        topicName: "",
        proxyAddress: "",
        serviceFile:{},
        responseTypeName: "",
        requestModeName: "",
        apiKey: "",
        token: "",
        requestDemo: "",
        requestParam: "",
        responseDemo: "",
        responseParam: "",
        errorCode: [],
        desc: "",
        resName: "",
        dbTypeName: "",
        host: "",
        port: "",
        databaseName: "",
        userName: "",
        password: "",
        updateTime: "",
        tableFields: [
          {name: "", type: "", length: 0}
        ],
        tableName: "",
        fileName: "",
        fileFormat: "",
        isPackage: "",
        serviceId: "",
        ciDesc: "",
        subscribeTime: "",
        isDelete: "",
        serviceDbId: "",
        resMessage: "",
        downloadAddress: "",
        servicePreview: [],//服务预览
        dataFields: [],//数据字段
        deleteMes:"",
        deleteNum:1,
      },
      resFileFormat:{},
      activeTab: "file",
      subscribeValue: '',//订阅状态value
      servicesValue: '',//服务状态value
      topicValue: '',//服务主题value
      topicOptions: [],//主题的option
      searchValue: {  //搜索值
        status: "",
        text: "",
      },
      tableData: [], //我的服务列表数据
      currentPage: 1,//分页初始值1
      totalNum: 0,//分页总数
      pageSize: 10,//设置分页大小
      topicNames: [],
      //资源详情
      tabList: [], //资源详情页面
      colNames: [],
    }
  },
  created() {
    this.createBreadCrumb();
    this.getDataList();
    this.getTopic();
    this.refList();
  },
  methods: {
    createBreadCrumb() {
      let navList = this.$route.meta.nav;
      this.breadcrumbList = navList;
    },
    //当前页
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getDataList();
    },
    //获取我的服务列表
    getDataList() {
      let params = {
        "topicId": this.topicValue,
        "resourceType": this.servicesValue,
        "serviceName": this.searchValue.text,
        "status": this.subscribeValue,
        "pageSize": this.pageSize,
        "pageIndex": this.currentPage
      }
      request.post('/serviceitem/serviceSubscription/subscribeServiceListByUser', params, {
        loading: true, loadingTitle: "获取我的服务列表数据……"
      })
        .then(res => {
          if (res.status === 200 || res.status === 204) {
            this.totalNum = res.total;
            this.pageSize = 10;
            this.currentPage = res.pageIndex;
            this.tableData = res.data;
          } else {
            this.message.error(res.message);
          }
        })
    },
    //筛选我的服务列表
    searchDataList() {
      this.pageSize = 10;
      this.currentPage = 1;
      this.getDataList();
    },
    getTime(row, col, val) { //格式化时间
      if (val) {
        return moment(val).format("YYYY-MM-DD HH:mm:ss");
      } else {
        return moment().format("YYYY-MM-DD HH:mm:ss");
      }
    },
    //打开资源详情标签
    typechange(row) {
      this.tabList = [
        {
          label: "服务详情",
          name: "detail",
        }
      ];
      this.activeTab = "detail";
      this.formData = {};
      let params = {
        "id": row.serviceId
      };
      request.post('/serviceitem/service/serviceDetailByUser', params, {loading: true, loadingTitle: "获取资源详情……"})
        .then(res => {
          if (res.status === 200 || res.status === 204) {
            if (res.data.createTime || res.data.updateTime || res.data.updateTime) {
              this.createTime = moment(res.data.createTime).format("YYYY-MM-DD HH:mm:ss");
              this.updateTime = moment(res.data.updateTime).format("YYYY-MM-DD HH:mm:ss");
              this.subscribeTime = moment(res.data.subscribeTime).format("YYYY-MM-DD HH:mm:ss");
            } else {
              return moment().format("YYYY-MM-DD HH:mm:ss");
            }
            let serviceApi = res.data.serviceApi;
            if (row.serviceTypeName === '接口' && res.data.isDelete === 0) {
              if (res.data.subscribeStatus === 1) {
                if(serviceApi !== undefined){
                  this.formData = {
                    serviceTypeName: row.serviceTypeName,
                    serviceName: res.data.serviceName,
                    orgName:res.data.orgName,
                    creatorName: res.data.creatorName,
                    status: res.data.subscribeStatus,
                    createTime: this.createTime,
                    updateTime: this.updateTime,
                    subscribeTime: this.subscribeTime,
                    serviceStatus: res.data.serviceStatus,
                    resMessage: res.data.message,
                    topicName: res.data.topicName,
                    isDelete: res.data.isDelete,
                    serviceId: res.data.serviceId,
                    desc: res.data.serviceApi.desc,
                    proxyAddress: res.data.serviceApi.proxyAddress,
                    responseTypeName: res.data.serviceApi.responseTypeName,
                    requestModeName: res.data.serviceApi.requestModeName,
                    apiKey: res.data.serviceApi.apiKey,
                    token: res.data.serviceApi.token,
                    requestDemo: res.data.serviceApi.requestDemo,
                    responseDemo: res.data.serviceApi.responseDemo,
                    requestParam: res.data.serviceApi.requestParam === "" || res.data.serviceApi.requestParam === null || res.data.serviceApi.requestParam === undefined || res.data.serviceApi.requestParam === "{}" ? null : JSON.parse(res.data.serviceApi.requestParam),
                    responseParam: res.data.serviceApi.responseParam === "" || res.data.serviceApi.responseParam === null || res.data.serviceApi.responseParam === undefined || res.data.serviceApi.responseParam === "{}" ? null : JSON.parse(res.data.serviceApi.responseParam),
                    errorCode: res.data.serviceApi.errorCode === "" || res.data.serviceApi.errorCode === null || res.data.serviceApi.errorCode === undefined || res.data.serviceApi.errorCode === "{}" ? null : JSON.parse(res.data.serviceApi.errorCode),
                  };
                }else {
                  this.formData = {
                    serviceTypeName: row.serviceTypeName,
                    serviceName: res.data.serviceName,
                    orgName:res.data.orgName,
                    creatorName: res.data.creatorName,
                    status: res.data.subscribeStatus,
                    createTime: this.createTime,
                    updateTime: this.updateTime,
                    subscribeTime: this.subscribeTime,
                    serviceStatus: res.data.serviceStatus,
                    resMessage: res.data.message,
                    topicName: res.data.topicName,
                    isDelete: res.data.isDelete,
                    serviceId: res.data.serviceId,
                  }
                }

              } else {
                if(serviceApi !== undefined){
                  this.formData = {
                    serviceTypeName: row.serviceTypeName,
                    serviceName: res.data.serviceName,
                    orgName:res.data.orgName,
                    creatorName: res.data.creatorName,
                    status: res.data.subscribeStatus,
                    createTime: this.createTime,
                    updateTime: this.updateTime,
                    subscribeTime: this.subscribeTime,
                    serviceStatus: res.data.serviceStatus,
                    resMessage: res.data.message,
                    topicName: res.data.topicName,
                    isDelete: res.data.isDelete,
                    serviceId: res.data.serviceId,
                    desc: res.data.serviceApi.desc,
                    proxyAddress: res.data.serviceApi.proxyAddress,
                    responseTypeName: res.data.serviceApi.responseTypeName,
                    requestModeName: res.data.serviceApi.requestModeName,
                    requestDemo: res.data.serviceApi.requestDemo,
                    responseDemo: res.data.serviceApi.responseDemo,
                    requestParam: res.data.serviceApi.requestParam === "" || res.data.serviceApi.requestParam === null || res.data.serviceApi.requestParam === undefined || res.data.serviceApi.requestParam === "{}" ? null : JSON.parse(res.data.serviceApi.requestParam),
                    responseParam: res.data.serviceApi.responseParam === "" || res.data.serviceApi.responseParam === null || res.data.serviceApi.responseParam === undefined || res.data.serviceApi.responseParam === "{}" ? null : JSON.parse(res.data.serviceApi.responseParam),
                    errorCode: res.data.serviceApi.errorCode === "" || res.data.serviceApi.errorCode === null || res.data.serviceApi.errorCode === undefined || res.data.serviceApi.errorCode === "{}" ? null : JSON.parse(res.data.serviceApi.errorCode),
                  };
                }else {
                this.formData = {
                  serviceTypeName: row.serviceTypeName,
                  serviceName: res.data.serviceName,
                  orgName:res.data.orgName,
                  creatorName: res.data.creatorName,
                  status: res.data.subscribeStatus,
                  createTime: this.createTime,
                  updateTime: this.updateTime,
                  subscribeTime: this.subscribeTime,
                  serviceStatus: res.data.serviceStatus,
                  resMessage: res.data.message,
                  topicName: res.data.topicName,
                  isDelete: res.data.isDelete,
                  serviceId: res.data.serviceId,
                };
                }
              }

            } else if (row.serviceTypeName === '接口' && res.data.isDelete === 1) {
              if(serviceApi !== undefined){
                this.formData = {
                  serviceTypeName: row.serviceTypeName,
                  serviceName: res.data.serviceName,
                  orgName:res.data.orgName,
                  creatorName: res.data.creatorName,
                  status: res.data.subscribeStatus,
                  createTime: this.createTime,
                  updateTime: this.updateTime,
                  subscribeTime: this.subscribeTime,
                  serviceStatus: res.data.serviceStatus,
                  resMessage: res.data.message,
                  topicName: res.data.topicName,
                  isDelete: res.data.isDelete,
                  serviceId: res.data.serviceId,
                  desc: res.data.serviceApi.desc,
                  proxyAddress: res.data.serviceApi.proxyAddress,
                  responseTypeName: res.data.serviceApi.responseTypeName,
                  requestModeName: res.data.serviceApi.requestModeName,
                  requestDemo: res.data.serviceApi.requestDemo,
                  responseDemo: res.data.serviceApi.responseDemo,
                  requestParam: res.data.serviceApi.requestParam === "" || res.data.serviceApi.requestParam === null || res.data.serviceApi.requestParam === undefined || res.data.serviceApi.requestParam === "{}" ? null : JSON.parse(res.data.serviceApi.requestParam),
                  responseParam: res.data.serviceApi.responseParam === "" || res.data.serviceApi.responseParam === null || res.data.serviceApi.responseParam === undefined || res.data.serviceApi.responseParam === "{}" ? null : JSON.parse(res.data.serviceApi.responseParam),
                  errorCode: res.data.serviceApi.errorCode === "" || res.data.serviceApi.errorCode === null || res.data.serviceApi.errorCode === undefined || res.data.serviceApi.errorCode === "{}" ? null : JSON.parse(res.data.serviceApi.errorCode),
                };
              }else {
              this.formData = {
                serviceTypeName: row.serviceTypeName,
                serviceName: res.data.serviceName,
                orgName: res.data.orgName,
                creatorName: res.data.creatorName,
                status: res.data.subscribeStatus,
                createTime: this.createTime,
                updateTime: this.updateTime,
                subscribeTime: this.subscribeTime,
                serviceStatus: res.data.serviceStatus,
                resMessage: res.data.message,
                topicName: res.data.topicName,
                isDelete: res.data.isDelete,
                serviceId: res.data.serviceId,
              };
              }
            } else if (row.serviceTypeName === '文件/库表/视图查询' && res.data.isDelete === 0) {
              if (res.data.subscribeStatus === 1) {
                this.resFileFormat = res.data.serviceFile;
                console.log(this.resFileFormat);
                if(this.resFileFormat !== undefined){
                  this.formData = {
                    serviceTypeName: "库表/视图/文件",
                    serviceName: res.data.serviceName,
                    orgName:res.data.orgName,
                    creatorName: res.data.creatorName,
                    createTime: this.createTime,
                    updateTime: this.updateTime,
                    subscribeTime: this.subscribeTime,
                    serviceStatus: res.data.serviceStatus,
                    topicName: res.data.topicName,
                    status: res.data.subscribeStatus,
                    isDelete: res.data.isDelete,
                    serviceId: res.data.serviceId,
                    resMessage: res.data.message,
                    resName: res.data.serviceDb.name,
                    serviceDbId: res.data.serviceDb.id,
                    dbTypeName: res.data.serviceDb.dbTypeName,
                    host: res.data.serviceDb.host,
                    port: res.data.serviceDb.port,
                    databaseName: res.data.serviceDb.databaseName,
                    userName: res.data.serviceDb.userName,
                    password: res.data.serviceDb.password,
                    tableFields: res.data.serviceDb.tableFields,
                    tableName: res.data.serviceDb.tableName,
                    isPackage: res.data.serviceDb.isPackage,
                    servicePreview: res.data.serviceDb.dataList,
                    dataFields: res.data.serviceDb.tableFields.length == 0 ? null : res.data.serviceDb.tableFields,
                    serviceFile:res.data.serviceFile,
                    downloadAddress: res.data.serviceFile.proxyAddress,
                    fileName: res.data.serviceFile.fileName,
                    fileFormat: res.data.serviceFile.fileFormat,
                    ciDesc: res.data.serviceDb.ciDesc,
                  };
                  console.log(this.formData,"123465");
                }else {
                  this.formData = {
                    serviceTypeName: "库表/视图/文件",
                    serviceName: res.data.serviceName,
                    orgName:res.data.orgName,
                    creatorName: res.data.creatorName,
                    createTime: this.createTime,
                    updateTime: this.updateTime,
                    subscribeTime: this.subscribeTime,
                    serviceStatus: res.data.serviceStatus,
                    topicName: res.data.topicName,
                    status: res.data.subscribeStatus,
                    isDelete: res.data.isDelete,
                    serviceId: res.data.serviceId,
                    resMessage: res.data.message,
                    resName: res.data.serviceDb.name,
                    serviceDbId: res.data.serviceDb.id,
                    dbTypeName: res.data.serviceDb.dbTypeName,
                    host: res.data.serviceDb.host,
                    port: res.data.serviceDb.port,
                    databaseName: res.data.serviceDb.databaseName,
                    userName: res.data.serviceDb.userName,
                    password: res.data.serviceDb.password,
                    tableFields: res.data.serviceDb.tableFields,
                    tableName: res.data.serviceDb.tableName,
                    isPackage: res.data.serviceDb.isPackage,
                    servicePreview: res.data.serviceDb.dataList,
                    dataFields: res.data.serviceDb.tableFields.length == 0 ? null : res.data.serviceDb.tableFields,
                    serviceFile:res.data.serviceFile,
                    // downloadAddress: res.data.serviceFile.proxyAddress,
                    // fileName: res.data.serviceFile.fileName,
                    // fileFormat: res.data.serviceFile.fileFormat,
                    // ciDesc: res.data.serviceDb.ciDesc,
                  };
                }
              } else {
                this.formData = {
                  serviceTypeName: "库表/视图/文件",
                  serviceName: res.data.serviceName,
                  orgName:res.data.orgName,
                  creatorName: res.data.creatorName,
                  createTime: this.createTime,
                  updateTime: this.updateTime,
                  subscribeTime: this.subscribeTime,
                  serviceStatus: res.data.serviceStatus,
                  topicName: res.data.topicName,
                  status: res.data.subscribeStatus,
                  isDelete: res.data.isDelete,
                  serviceId: res.data.serviceId,
                  resMessage: res.data.message,
                  servicePreview: res.data.serviceDb.dataList,
                  dataFields: res.data.serviceDb.tableFields.length == 0 ? null : res.data.serviceDb.tableFields
                };
              }
            } else if (row.serviceTypeName === '文件/库表/视图查询' && res.data.isDelete === 1) {
              this.formData = {
                serviceTypeName: "库表/视图/文件",
                serviceName: res.data.serviceName,
                orgName:res.data.orgName,
                creatorName: res.data.creatorName,
                createTime: this.createTime,
                updateTime: this.updateTime,
                subscribeTime: this.subscribeTime,
                serviceStatus: res.data.serviceStatus,
                topicName: res.data.topicName,
                status: res.data.subscribeStatus,
                isDelete: res.data.isDelete,
                serviceId: res.data.serviceId,
                resMessage: res.data.message,
                servicePreview: res.data.serviceDb.dataList,
                dataFields: res.data.serviceDb.tableFields.length == 0 ? null : res.data.serviceDb.tableFields
              };
            }
          }else if (res.status === 499) {
            this.formData = {
              deleteMes:"该服务项已被管理员删除",
              deleteNum:1
            };
          }else {
            this.message.warning(res.message);
            // this.formData = {};
          }
        })
        .catch(res => {
          this.formData = {};
        })
    },
    //跳转到治理面板
    handleTabsEdit() {
      this.tabList = [];
      this.activeTab = "file";
    },
    //删除弹框
    deleteRow(row) {
      this.$confirm('确定删除' + '"' + row.serviceName + '"' + '选择项?', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let params = {
          "id": row.subscribeId
        };
        request.post("/serviceitem/serviceSubscription/deleteSubscribe", params)
          .then(res => {
            if (res.status === 200) {
              this.$message({
                type: 'success',
                message: '此服务已删除成功!',
              });
              this.getDataList();
            } else {
              this.$message.error(res.message);
            }
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消此操作！',
        });
        this.getDataList();
      });
    },
    //订阅失败弹框
    open(row) {
      if (row.message === null || row.message === undefined || row.message === "") {
        this.$alert('暂无驳回理由', '订阅失败', {
          showConfirmButton: false,
          callback: action => {
          }
        });
      } else {
        this.$alert(row.message, '订阅失败', {
          showConfirmButton: false,
          callback: action => {
          }
        });
      }
    },
    //筛选
    //获取主题名称和id
    getTopic() {
      request.get('/serviceitem/serviceTopic/getTopicList')
        .then(res => {
          if (res.status === 200 || res.status === 204) {
            this.topicOptions = res.data;
          } else {
            // console.log(res);
          }
        })
    },
    //刷新
    refList() {
      this.topicValue = "";
      this.servicesValue = "";
      this.searchValue.text = "";
      this.subscribeValue = "";
      this.currentPage = 1;
      this.getDataList();
    },
  }
}
</script>

<style scoped lang="less">
  /*筛选条件*/
  .search-condition, .search-condition01 {
    border-radius: 4px;
    display: inline-block;
    padding: 0;
    margin: 0;

    .search-select {
      width: 150px !important;
    }
  }

  .search-condition {
    padding-left: 20px;
  }

  .search-result {
    padding: 0 10px;
    font-size: 14px;
    color: #999;
  }

  .list-refresh {
    float: right;
  }

  .resource-list {
    width: 100%;
    margin-top: 20px;
  }

  .page {
    margin-top: 20px;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    justify-content: center;
  }
</style>
