<template>
<!--内容区域-->
<div class="content-wrap">
  <el-tabs type="card" v-model="activeTab" class="custom-tab">
    <el-tab-pane label="接口管理" name="file">
      <div class="content-box">
        <!--筛选条件-->
        <div class="search-box">
          <div class="left">
          <div class="search-condition">
            <el-input placeholder="请输入接口名称" maxlength="20" v-model="searchValue.text" prefix-icon="el-icon-search"
                      class="input-with-select" clearable>
              <el-button slot="append" @click="searchDataList">搜索</el-button>
            </el-input>
          </div>
          <span class="search-result">找到相关结果{{totalNum}}条</span>
          </div>
          <!--<el-row class="list-refresh">-->
            <div class="right">
            <el-button type="primary" @click="keyData()" title="key">key
            </el-button>
            <el-button type="danger" @click="removeTableData()" title="删除">
              <i class="iconfont3 icon-shanchu"></i>
            </el-button>
            <el-button type="info" @click="refList()" title="刷新">
              <i class="iconfont3 icon-shuaxin"></i>
            </el-button>
            </div>
          <!--</el-row>-->
        </div>
        <!--接口管理列表-->
        <el-table :data="tableData" stripe border header-cell-class-name="th-style" class=" resource-list"
                  @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="name" :show-overflow-tooltip="true" label="接口名称"></el-table-column>
          <el-table-column prop="url" :show-overflow-tooltip="true" label="接口地址"></el-table-column>
          <el-table-column prop="requestMethod" label="请求方式" width="100"></el-table-column>
          <el-table-column prop="isAuth" label="是否认证" width="100">
            <template slot-scope="scope">
            <span v-if="scope.row.isAuth === 0">是</span>
            <span v-if="scope.row.isAuth === 1">否</span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" :formatter="getTime"></el-table-column>
          <el-table-column prop="action" label="操作" width="100">
            <template slot-scope="scope">
            <el-button @click="btn(scope.row)" type="text" size="small" title="详情" class="iconfont iconinfo"></el-button>
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

        <!--接口详情-->
        <el-dialog custom-class="dialog-box" title="接口详情" :visible.sync="centerDialogVisible">
          <el-form :model="form">
            <el-form-item>
              <div v-html="form.desc" class="ciDesc"></div>
            </el-form-item>
          </el-form>
        </el-dialog>
        <!--apikey使用说明-->
        <el-dialog custom-class="small" title="apikey使用说明" :visible.sync="apiKeyDialogVisible">
          <img src="@/assets/apiDes.png" width="100%"/>
        </el-dialog>
      </div>
    </el-tab-pane>
  </el-tabs>
</div>
</template>

<script>
import moment from "moment";
import request from "@/libs/request";

export default {
  name: "InterfaceManager",
  data() {
    return {
      breadcrumbList: [],
      activeTab: "file",
      interfaceValue: '',//接口状态的value
      searchValue: {  //搜索值
        status: "",
        text: "",
      },
      tableData: [],//列表数据
      selectTable: [], //表格选中数据
      currentPage: 1, //分页初始值1
      totalNum: 0,//总数
      pageSize: 10,//每页显示条数
      centerDialogVisible: false, //接口名称点击事件（弹框入口）
      apiKeyDialogVisible: false,
      form: {
        desc: ''
      }, //表单值
    }
  },
  created() {
    this.createBreadCrumb();
    this.getDataList();
  },
  updated() {
    $('.ciDesc table').css({
      'width': '100%',
      'border': 'none'
    });
    $('.ciDesc table .wservice td').css({
      'background': '#EDF1F2',
      'font-weight': 'bold'
    });
    $('.ciDesc table tr td').css({
      'padding': '8px 0px 8px 10px',
      'border-left': '1px solid #EBEEF5',
      'border-bottom': '1px solid #EBEEF5',
    });
  },
  methods: {
    createBreadCrumb() {
      let navList = this.$route.meta.nav;
      this.breadcrumbList = navList;
    },
    // 获取接口管理数据列表
    getDataList() {
      let params = {
        "name": this.searchValue.text,
        "pageSize": this.pageSize,
        "pageIndex": this.currentPage
      }
      request.post('/serviceitem/ciService/getCiListByCriteria', params, {loading: true, loadingTitle: "获取接口管理列表数据……"})
        .then(res => {
          if (res.status === 200 || res.status === 204) {
            this.totalNum = res.total;
            this.pageSize = 10;
            this.currentPage = res.pageIndex;
            this.tableData = res.data;
          } else {
            this.message.warning(res.message);
          }
        })
    },
    // 获取接口管理数据列表
    searchDataList() {
      this.pageSize = 10;
      this.currentPage = 1;
      this.getDataList();
    },
    //显示详情弹框
    btn(row) {
      this.form = row;
      this.getDataList();
      this.centerDialogVisible = true
    },
    //格式化时间
    getTime(row, col, val) {
      if (val) {
        return moment(val).format("YYYY-MM-DD HH:mm:ss");
      } else {
        return moment().format("YYYY-MM-DD HH:mm:ss");
      }
    },
    //刷新
    refList() {
      this.searchValue.text = "";
      this.currentPage = 1;
      this.getDataList();
    },
    // 表格选中复选框
    handleSelectionChange(val) {
      this.selectTable = val;
    },
    //当前页
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getDataList();
    },
    //批量删除
    async removeTableData() { // 删除选中的表格数据
      if (this.selectTable.length) {
        try {
          let length = this.selectTable.length;
          let confirm = await this.$confirm(`是否确定删除这${length}条数据?`, "删除", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          });
          if (confirm) {
            //获取所选框id
            var ids = this.selectTable.map(item => item.id);
            var params = {
              idList: ids
            }
            let oData = await request.post("/serviceitem/ciService/deleteCi", params, {
              loading: true,
              loadingTitle: "删除中"
            });
            if (oData.status === 200) {
              this.$message({
                type: 'success',
                message: '删除成功！'
              });
              this.getDataList();
            } else {
              this.$message.error(oData.message);
              this.getDataList();
            }
          }
        } catch (e) {
          this.$message({
            type: 'info',
            message: '取消删除'
          });
        }
      } else {
        this.$message.warning("请选择要删除的数据");
      }
    },
    //API key和token
    keyData() {
      request.get('/serviceitem/ciService/getCiKey')
        .then(res => {
          if (res.status === 200 || res.status === 204) {
            let mesData = ['API Key:  ' + res.data.appKey, 'Token:  ' + res.data.token];
            //2.新建newDatas数组
            let newMesDatas = [];
            const h = this.$createElement;
            //3.通过循环data数组，调用h方法，将每项值传给h,h('标签名',样式,具体内容)
            for (let i in mesData) {
              //4.将data数据push进newDatas数组中
              newMesDatas.push(h('p', null, mesData[i]));
            }
            this.$msgbox({
              title: '服务key',
              message: h('div', null, newMesDatas),
              confirmButtonText: '说明',
            }).then(() => {
              this.apiKeyDialogVisible = true;
            }).catch(() => {
            })
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
  .search-condition {
    border-radius: 4px;
    display: inline-block;
    padding: 0;
    margin: 0;

    .search-select {
      width: 150px !important;
    }
  }

  /*.search-result {*/
    /*padding: 0 10px;*/
    /*font-size: 14px;*/
    /*color: #999;*/
  /*}*/

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

  .el-form {
    max-height: 600px;
    overflow-y: scroll;
  }
</style>
