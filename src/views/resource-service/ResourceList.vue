<template>
  <!--内容区域-->
  <div class="content-wrap">
    <el-tabs type="card" v-model="activeTab" @tab-remove="handleTabsEdit" class="custom-tab">
      <el-tab-pane label="服务列表" name="file">
        <div class="content-box">
          <!--条件筛选-->
          <div class="search-box">
            <div class="left">
              <div class="search-condition01">
                <el-select
                  class="search-select"
                  v-model="servicesValue"
                  clearable
                  placeholder="请选择服务状态"
                  v-on:change="searchDataList()"
                >
                  <el-option label="更新中" v-bind:value="0"></el-option>
                  <el-option label="停止更新" v-bind:value="1"></el-option>
                </el-select>
              </div>
              <div class="search-condition">
                <el-select
                  class="search-select"
                  v-model="topicValue"
                  clearable
                  placeholder="请选择服务主题"
                  v-on:change="searchDataList()"
                >
                  <el-option
                    v-for="item in topicOptions"
                    :key="item.id"
                    :label="item.topicName"
                    v-bind:value="item.id"
                  ></el-option>
                </el-select>
              </div>
              <div class="search-condition">
                <el-input
                  placeholder="请输入服务名称"
                  maxlength="20"
                  v-model="searchValue.text"
                  class="input-with-select"
                  prefix-icon="el-icon-search"
                  clearable
                >
                  <el-button slot="append" v-on:click="searchDataList()">搜索</el-button>
                </el-input>
              </div>
              <div class="search-condition">
                <span>创建时间：</span>
                <el-date-picker
                  class="datepicker"
                  v-model="dateValue"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  value-format="yyyy-MM-dd"
                  format="yyyy-MM-dd"
                  :picker-options="pickerOptions"
                  v-on:change="searchDataList()"
                ></el-date-picker>
                <span class="search-result">找到相关结果{{totalNum}}条</span>
              </div>
            </div>
            <div class="right">
              <el-button class="list-refresh" type="info" @click="refList()" title="刷新">
                <i class="iconfont3 icon-shuaxin"></i>
              </el-button>
            </div>
          </div>
          <!--服务列表-->
          <el-table
            :data="tableData"
            stripe
            border
            header-cell-class-name="th-style"
            class="resource-list"
          >
            <el-table-column prop="name" :show-overflow-tooltip="true" label="服务名称" width="180">
              <template slot-scope="scope">
                <el-button @click="resIfno(scope.row)" type="text">{{scope.row.name}}</el-button>
              </template>
            </el-table-column>
            <el-table-column prop="orgName" label="所属组织" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column prop="creatorName" label="创建人" width="110"></el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180" :formatter="getTime"></el-table-column>
            <el-table-column prop="updateTime" label="最后更新时间" width="180" :formatter="getTime"></el-table-column>
            <el-table-column prop="resourceStatus" label="服务状态" width="140"></el-table-column>
            <el-table-column prop="topicName" label="服务主题"></el-table-column>
            <el-table-column prop="serviceTypeName" label="服务方式">
              <template slot-scope="scope">
                <span v-if="scope.row.serviceTypeName === '接口'">接口</span>
                <span v-if="scope.row.serviceTypeName === '文件/库表/视图查询'">库表/视图/文件</span>
              </template>
            </el-table-column>
            <el-table-column prop="isSubscribe" label="服务订阅" width="100">
              <template slot-scope="scope">
                <el-button type="text">
                  <span
                    v-if="scope.row.isSubscribe === 0"
                    @click="subscriptionBtn(scope.row)"
                    style="color:#67C23A"
                  >订阅</span>
                  <span v-if="scope.row.isSubscribe === 1" style="color:#F56C6C">已订阅</span>
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
              :total="totalNum"
            ></el-pagination>
          </div>
        </div>
      </el-tab-pane>
      <!--资源详情-->
      <el-tab-pane
        v-for="item in tabList"
        :closable="true"
        :key="item.id"
        :label="item.label"
        :name="item.name"
      >
        <div class="content-box">
          <el-form :model="formData" label-width="140px" label-position="right">
            <el-form-item label="服务名称:">
              <el-input readonly v-model="formData.serviceName"></el-input>
            </el-form-item>
            <el-form-item label="所属组织:">
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
            <el-form-item label="服务订阅:">
              <span v-if="formData.status != 3" style="color: #ff7787">已订阅</span>
              <el-button
                v-if="formData.status == 3"
                type="text"
                style="font-size: 16px"
                @click="subscriptionBt(formData)"
              >订阅</el-button>
            </el-form-item>
            <template v-if="formData.serviceTypeName === '文件/库表/视图查询'">
              <el-form-item label="数据字段:">
                <el-table
                  :data="formData.dataFields"
                  stripe
                  border
                  header-cell-class-name="th-style"
                  max-height="445"
                  width="100%"
                >
                  <el-table-column property="name" label="名称"></el-table-column>
                  <el-table-column property="type" label="类型"></el-table-column>
                  <!--<el-table-column property="length" label="长度"></el-table-column>-->
                  <el-table-column property="desc" label="说明"></el-table-column>
                </el-table>
              </el-form-item>
              <el-form-item label="服务预览:">
                <el-table
                  :data="formData.servicePreview"
                  stripe
                  border
                  header-cell-class-name="th-style"
                  max-height="445"
                  width="100%"
                >
                  <el-table-column
                    v-for="item in colNames"
                    :prop="item"
                    :label="item"
                    :show-overflow-tooltip="true"
                  ></el-table-column>
                </el-table>
                <div style="margin-top: 20px;font-size: 12px;color: #E6A23C">注*数据预览只可查看50条数据！</div>
              </el-form-item>
            </template>
            <el-form-item label="服务方式:">
              <el-button v-if="formData.serviceTypeName === '接口'">
                <i class="iconfont" style="font-size: 12px;padding-right: 8px">&#xf033;</i>接口
              </el-button>
              <el-button v-if="formData.serviceTypeName === '文件/库表/视图查询'">
                <i class="iconfont" style="font-size: 12px;padding-right: 8px">&#xf034;</i>库表/视图/文件
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
                <el-table
                  :data="formData.requestParam"
                  stripe
                  border
                  header-cell-class-name="th-style"
                >
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
                      <span v-if="scope.row.type === 2">String</span>
                      <span v-if="scope.row.type === 3">DateTime</span>
                      <span v-if="scope.row.type === 4">Double</span>
                      <span v-if="scope.row.type === 5">Array</span>
                      <span v-if="scope.row.type === 6">Object</span>
                    </template>
                  </el-table-column>
                  <el-table-column property="desc" label="说明"></el-table-column>
                </el-table>
              </el-form-item>
              <el-form-item label="返回参数说明:">
                <el-table
                  :data="formData.responseParam"
                  stripe
                  border
                  header-cell-class-name="th-style"
                >
                  <el-table-column label="名称" prop="name"></el-table-column>
                  <el-table-column label="类型" prop="type">
                    <template slot-scope="scope">
                      <span v-if="scope.row.type === 1">Long</span>
                      <span v-if="scope.row.type === 2">Varchar</span>
                      <span v-if="scope.row.type === 3">DateTime</span>
                      <span v-if="scope.row.type === 4">Double</span>
                      <span v-if="scope.row.type === 5">Array</span>
                      <span v-if="scope.row.type === 6">Object</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="说明" prop="description"></el-table-column>
                </el-table>
              </el-form-item>
              <el-form-item label="错误码说明:">
                <el-table
                  :data="formData.errorCode"
                  stripe
                  border
                  header-cell-class-name="th-style"
                >
                  <el-table-column label="名称" prop="name"></el-table-column>
                  <el-table-column label="说明" prop="desc"></el-table-column>
                </el-table>
              </el-form-item>
              <el-form-item label="请求示例:">
                <el-input
                  readonly
                  type="textarea"
                  v-model="formData.requestDemo"
                  :autosize="{ minRows: 1, maxRows: 4}"
                  resize="none"
                ></el-input>
              </el-form-item>
              <el-form-item label="返回示例:">
                <el-input
                  readonly
                  type="textarea"
                  v-model="formData.responseDemo"
                  :autosize="{ minRows: 2, maxRows: 8}"
                  resize="none"
                ></el-input>
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
import request from "@/libs/request";

export default {
  name: "ResourceList",
  data() {
    return {
      tabList: [], //资源详情
      colNames: [],
      formData: {
        detailId: "",
        serviceName: "",
        orgName: "",
        creatorName: "",
        createTime: "",
        updateTime: "",
        serviceStatus: "",
        topicName: "",
        status: "",
        serviceTypeName: "",
        servicePreview: [], //服务预览
        dataFields: [], //数据字段
        //接口详情
        proxyAddress: "",
        responseTypeName: "",
        requestModeName: "",
        desc: "",
        requestDemo: "",
        requestParam: [],
        responseDemo: "",
        responseParam: [],
        errorCode: []
      },
      selectDate: "",
      //日期选择范围在一个月内
      pickerOptions: {
        disabledDate: time => {
          return time.getTime() > Date.now();
        }
      },
      breadcrumbList: [],
      activeTab: "file",
      searchValue: {
        //搜索值
        status: "",
        text: ""
      },
      servicesValue: "", //服务状态value
      topicValue: "", //服务主题value
      topicOptions: [], //主题的option
      dateValue: [], //起止时间选择
      tableData: [], //服务列表数据
      currentPage: 1, //分页初始值为1
      totalNum: 0, //分页总数
      pageSize: 10, //设置分页大小
      topicNames: []
    };
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
    //获取服务列表数据
    getDataList() {
      let params = {
        topicId: this.topicValue,
        resourceStatus: this.servicesValue,
        serviceName: this.searchValue.text,
        pageSize: this.pageSize,
        pageIndex: this.currentPage
      };
      if (this.dateValue && this.dateValue.length) {
        params.beginDate = this.dateValue[0];
        params.endDate = this.dateValue[1];
      } else {
        params.beginDate = null;
        params.endDate = null;
      }
      request
        .post("/serviceitem/service/getServiceListByCriteria", params, {
          loading: true,
          loadingTitle: "获取服务列表数据……"
        })
        .then(res => {
          if (res.status === 200 || res.status === 204) {
            this.totalNum = res.total;
            this.pageSize = 10;
            this.currentPage = res.pageIndex;
            this.tableData = res.data;
          } else {
            this.message.warning(res.message);
          }
        });
    },
    //筛选服务列表数据
    searchDataList() {
      this.pageSize = 10;
      this.currentPage = 1;
      this.getDataList();
    },
    getTime(row, col, val) {
      //格式化时间
      if (val) {
        return moment(val).format("YYYY-MM-DD HH:mm:ss");
      } else {
        return moment().format("YYYY-MM-DD HH:mm:ss");
      }
    },
    //当前页
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getDataList();
    },
    //订阅
    subscriptionBtn(row) {
      this.$confirm("确定订阅此服务?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let params = {
            id: row.id
          };
          request
            .post("/serviceitem/serviceSubscription/subscribeService", params)
            .then(res => {
              if (res.status === 200) {
                this.$message({
                  type: "success",
                  message:
                    "服务订阅申请已提交，等待管理员审核！审核结果请到“我的服务”中查看。"
                });
                this.getDataList();
              } else if (res.status === 204) {
                this.$confirm("该服务已订阅", "提示", {
                  confirmButtonText: "确定",
                  type: "warning"
                });
              } else {
                setTimeout(function() {
                  this.message.warning(res.message);
                }, 500);
              }
              this.getDataList();
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消此操作！"
          });
          this.getDataList();
        });
    },
    //筛选
    //获取主题名称和id
    getTopic() {
      request.get("/serviceitem/serviceTopic/getTopicList").then(res => {
        if (res.status === 200 || res.status === 204) {
          this.topicOptions = res.data;
        } else {
          this.message.warning(res.message);
        }
      });
    },
    //刷新
    refList() {
      this.topicValue = "";
      this.servicesValue = "";
      this.searchValue.text = "";
      this.dateValue = [];
      this.currentPage = 1;
      this.getDataList();
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
          name: "detail"
        }
      ];
      this.activeTab = "detail";
      this.formData = {};
      // this.formData.detailId = row.id;
      let params = {
        id: row.id
      };
      request
        .post("/serviceitem/service/serviceDetailByUser", params, {
          loading: true,
          loadingTitle: "获取资源详情……"
        })
        .then(res => {
          if (res.status === 200 || res.status === 204) {
            if (res.data.createTime || res.data.updateTime) {
              this.createTime = moment(res.data.createTime).format(
                "YYYY-MM-DD HH:mm:ss"
              );
              this.updateTime = moment(res.data.updateTime).format(
                "YYYY-MM-DD HH:mm:ss"
              );
            } else {
              return moment().format("YYYY-MM-DD HH:mm:ss");
            }
            if (row.serviceTypeName === "文件/库表/视图查询") {
              this.formData = {
                detailId: res.data.id,
                serviceName: res.data.serviceName,
                orgName: res.data.orgName,
                creatorName: res.data.creatorName,
                createTime: this.createTime,
                updateTime: this.updateTime,
                serviceStatus: res.data.serviceStatus,
                topicName: res.data.topicName,
                status: res.data.subscribeStatus,
                serviceTypeName: row.serviceTypeName,
                servicePreview: res.data.serviceDb.dataList,
                dataFields:
                  res.data.serviceDb.tableFields.length == 0
                    ? null
                    : res.data.serviceDb.tableFields
              };
              this.colNames =
                this.formData.servicePreview.length == 0
                  ? null
                  : Object.keys(this.formData.servicePreview[0]);
            } else {
              let serviceApi = res.data.serviceApi;
              if (serviceApi === undefined) {
                this.formData = {
                  detailId: res.data.id,
                  serviceName: res.data.serviceName,
                  orgName: res.data.orgName,
                  creatorName: res.data.creatorName,
                  createTime: this.createTime,
                  updateTime: this.updateTime,
                  serviceStatus: res.data.serviceStatus,
                  topicName: res.data.topicName,
                  status: res.data.subscribeStatus,
                  serviceTypeName: row.serviceTypeName
                };
              } else {
                this.formData = {
                  detailId: res.data.id,
                  serviceName: res.data.serviceName,
                  orgName: res.data.orgName,
                  creatorName: res.data.creatorName,
                  createTime: this.createTime,
                  updateTime: this.updateTime,
                  serviceStatus: res.data.serviceStatus,
                  topicName: res.data.topicName,
                  status: res.data.subscribeStatus,
                  serviceTypeName: row.serviceTypeName,
                  proxyAddress: res.data.serviceApi.proxyAddress,
                  responseTypeName: res.data.serviceApi.responseTypeName,
                  requestModeName: res.data.serviceApi.requestModeName,
                  desc: res.data.serviceApi.desc,
                  requestDemo: res.data.serviceApi.requestDemo,
                  responseDemo: res.data.serviceApi.responseDemo,
                  requestParam:
                    res.data.serviceApi.requestParam === "" ||
                    res.data.serviceApi.requestParam === null ||
                    res.data.serviceApi.requestParam === undefined ||
                    res.data.serviceApi.requestParam === "{}"
                      ? null
                      : JSON.parse(res.data.serviceApi.requestParam),
                  responseParam:
                    res.data.serviceApi.responseParam === "" ||
                    res.data.serviceApi.responseParam === null ||
                    res.data.serviceApi.responseParam === undefined ||
                    res.data.serviceApi.responseParam === "{}"
                      ? null
                      : JSON.parse(res.data.serviceApi.responseParam),
                  errorCode:
                    res.data.serviceApi.errorCode === "" ||
                    res.data.serviceApi.errorCode === null ||
                    res.data.serviceApi.errorCode === undefined ||
                    res.data.serviceApi.errorCode === "{}"
                      ? null
                      : JSON.parse(res.data.serviceApi.errorCode)
                };
              }
            }
          } else {
            this.message.warning(res.message);
          }
        });
    },
    //详情中的订阅
    subscriptionBt(formData) {
      this.$confirm("确定订阅此服务?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let params = {
            id: formData.detailId
          };
          request
            .post("/serviceitem/serviceSubscription/subscribeService", params)
            .then(res => {
              if (res.status === 200) {
                this.$message({
                  type: "success",
                  message:
                    "服务订阅申请已提交，等待管理员审核！审核结果请到“我的服务”中查看。"
                });
                this.getDataList();
                let params = {
                  id: formData.detailId
                };
                request
                  .post("/serviceitem/service/serviceDetailByUser", params, {
                    loading: true,
                    loadingTitle: "获取资源详情……"
                  })
                  .then(res => {
                    if (res.status === 200 || res.status === 204) {
                      if (formData.serviceTypeName === "文件/库表/视图查询") {
                        this.formData = {
                          detailId: res.data.id,
                          serviceName: res.data.serviceName,
                          orgName: res.data.orgName,
                          creatorName: res.data.creatorName,
                          createTime: res.data.createTime,
                          updateTime: res.data.updateTime,
                          serviceStatus: res.data.serviceStatus,
                          topicName: res.data.topicName,
                          status: res.data.subscribeStatus,
                          serviceTypeName: formData.serviceTypeName,
                          servicePreview: res.data.serviceDb.dataList,
                          dataFields:
                            res.data.serviceDb.tableFields.length == 0
                              ? null
                              : res.data.serviceDb.tableFields
                        };
                        this.colNames =
                          this.formData.servicePreview.length == 0
                            ? null
                            : Object.keys(this.formData.servicePreview[0]);
                      } else {
                        let serviceApi = res.data.serviceApi;
                        if (serviceApi === undefined) {
                          this.formData = {
                            detailId: res.data.id,
                            serviceName: res.data.serviceName,
                            orgName: res.data.orgName,
                            creatorName: res.data.creatorName,
                            createTime: this.createTime,
                            updateTime: this.updateTime,
                            serviceStatus: res.data.serviceStatus,
                            topicName: res.data.topicName,
                            status: res.data.subscribeStatus,
                            serviceTypeName: row.serviceTypeName
                          };
                        } else {
                          this.formData = {
                            detailId: res.data.id,
                            serviceName: res.data.serviceName,
                            orgName: res.data.orgName,
                            creatorName: res.data.creatorName,
                            createTime: this.createTime,
                            updateTime: this.updateTime,
                            serviceStatus: res.data.serviceStatus,
                            topicName: res.data.topicName,
                            status: res.data.subscribeStatus,
                            serviceTypeName: row.serviceTypeName,
                            proxyAddress: res.data.serviceApi.proxyAddress,
                            responseTypeName:
                              res.data.serviceApi.responseTypeName,
                            requestModeName:
                              res.data.serviceApi.requestModeName,
                            desc: res.data.serviceApi.desc,
                            requestDemo: res.data.serviceApi.requestDemo,
                            responseDemo: res.data.serviceApi.responseDemo,
                            requestParam:
                              res.data.serviceApi.requestParam === "" ||
                              res.data.serviceApi.requestParam === null ||
                              res.data.serviceApi.requestParam === undefined ||
                              res.data.serviceApi.requestParam === "{}"
                                ? null
                                : JSON.parse(res.data.serviceApi.requestParam),
                            responseParam:
                              res.data.serviceApi.responseParam === "" ||
                              res.data.serviceApi.responseParam === null ||
                              res.data.serviceApi.responseParam === undefined ||
                              res.data.serviceApi.responseParam === "{}"
                                ? null
                                : JSON.parse(res.data.serviceApi.responseParam),
                            errorCode:
                              res.data.serviceApi.errorCode === "" ||
                              res.data.serviceApi.errorCode === null ||
                              res.data.serviceApi.errorCode === undefined ||
                              res.data.serviceApi.errorCode === "{}"
                                ? null
                                : JSON.parse(res.data.serviceApi.errorCode)
                          };
                        }
                      }
                    } else {
                      this.message.warning(res.message);
                    }
                  });
              }
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消此操作！"
          });
        });
    }
  }
};
</script>

<style scoped lang="less">
.search-box {
  .el-input {
    /*margin-left: 20px;*/
    width: 300px;

    .el-button {
      line-height: 30px;
    }
  }

  .search-result {
    margin-left: 20px;
    color: #999;
  }
}
/*筛选条件*/
.search-condition,
.search-condition01 {
  border-radius: 4px;
  display: inline-block;
  padding: 0;
  margin: 0;

  .search-select {
    width: 150px !important;
  }

  .datepicker {
    width: 250px !important;
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
