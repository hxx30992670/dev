<template>
  <div>
    <el-tabs type="card" v-model="activeTab" class="custom-tab">
      <el-tab-pane label="数据目录" name="file">
        <div class="content-box">
          <div class="catalog-wrap">
            <div class="left-main">
              <el-input placeholder="请输入关键词" v-model="searchValue" maxlength="20" prefix-icon="el-icon-search"
                        clearable >
                <!--<el-button slot="append" type="success" v-on:click="getNewAddDirList(),getDirList()">
                  搜索
                </el-button>-->
                <!--<template slot="append" v-on:click="getNewAddDirList(),getDirList()">搜索</template>-->
              </el-input>
              <div class="tree-box">
                <div class="header">未发布的目录</div>
                <!--:data="newAddDir" -->
                <el-tree :props="newAddDirProps" :data="newAddDirList" :expand-on-click-node="false"
                         node-key="id" ref="addTree" :filter-node-method="filterNode" >
                  <div class="tree-node" slot-scope="{node,data}" @mouseenter="showBtnBox(node,data)"
                       @mouseleave="hideBtnBox(data)">
                    <p class="text" @click="dirListInfo(node,data)">{{data.name}}</p>
                    <div class="btn-box" v-if="!data.children&&data.auditResult === 0"
                         v-show="data.isShow">
                      <el-button type="text" style="color:#ebb563">审核中</el-button>
                    </div>
                    <div class="btn-box" v-if="!data.children&&data.auditResult!== 0"
                         v-show="data.isShow">
                      <el-button type="text" @click="editNode(node,data)" disabled v-if="data.childNode && data.childNode.length >= 1">编辑</el-button>
                      <el-button type="text" @click="editNode(node,data)" v-else>编辑</el-button>
                      <el-button type="text" @click="removeNode(node,data)">删除</el-button>
                    </div>
                  </div>
                </el-tree>
              </div>
              <div class="tree-box">
                <div class="header">已发布的目录</div>
                <el-tree :props="dirProps" :data="dirList" :expand-on-click-node="false" node-key="id"
                         ref="saveTree" :filter-node-method="filterNode">
                  <div class="tree-node" slot-scope="{node,data}" @mouseenter="showBtnBox(node,data)"
                       @mouseleave="hideBtnBox(data)">
                    <p v-if="node.level!==3" class="text" @click="dirListInfo(node,data)">{{data.name}}</p>
                    <p v-if="node.level===3" class="text" @click="dirListInfo(node,data)">{{data.name}}</p>
                    <div class="btn-box"
                         v-if="data.type !== 'resource' && !data.children && node.level!==3"
                         v-show="data.isShow">
                      <el-button type="text" @click="removeSaveNode(node,data)">删除</el-button>
                    </div>
                  </div>
                </el-tree>
              </div>
            </div>
            <div class="right-main">
              <el-tabs v-model="dirTab" @tab-click="tabClick">
                <el-tab-pane label="目录创建" name="first">
                  <div class="btn-box">
                    <el-button icon="el-icon-plus" round style="margin-right: 30px"
                               @click="addMasterDir">新增数据目录
                    </el-button>
                    <el-button icon="el-icon-plus" round style="margin-right: 30px"
                               @click="addChildDir">新增数据子目录
                    </el-button>
                    <el-button round style="margin-right: 30px" @click="importFile">导入目录</el-button>
                    <el-button round style="margin-right: 30px" @click="downloadFile">导出目录导入模板
                    </el-button>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="目录发布" name="second">
                  <div class="release-box">
                    <h3 class="title">请选择要发布的目录</h3>
                    <el-select v-model="releaseDir.catalog">
                      <el-option :label="dir.rootName +'/'+dir.name" :value="dir.id"
                                 v-for="dir in releaseDir.dirList"></el-option>
                    </el-select>
                    <div class="btn-box">
                      <el-button type="primary" @click="releaseCatalog">发布</el-button>
                    </div>
                    <ul class="record-list" v-for="item in recordList">
                      <li class="item">
                        <p class="record">{{item.label}}</p>
                        <p class="info">已发布，等待管理员审核</p>
                      </li>
                    </ul>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="发布记录" name="third">
                  <div class="table-wrap">
                    <el-table :data="recordList" stripe border header-cell-class-name="th-style">
                      <el-table-column label="目录名称">
                        <template slot-scope="scope">
                          <span>{{scope.row.rootName}}/{{scope.row.name}}</span>
                        </template>
                      </el-table-column>
                      <el-table-column label="发布时间" prop="createTime"
                                       :formatter="getTime"></el-table-column>
                      <el-table-column label="目录状态" prop="auditResult" :formatter="getStatus">
                        <template slot-scope="scope">
                          <span v-if="scope.row.auditResult==2">审核通过</span>
                          <span v-else-if="scope.row.auditResult==1"
                                style="color: #FFAB2E; cursor: pointer;"
                                @click="showMessage(scope.row)"><i style="font-size: 12px;"
                                                                   class="iconfont iconinformation01"></i>审核未通过</span>
                          <span v-else>待审核</span>
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
                      :total="totalNum">
                    </el-pagination>
                  </div>
                </el-tab-pane>
              </el-tabs>
              <!--信息项和子目录详情-->
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="服务目录" name="service">
        <div class="content-box">
          <div class="catalog-wrap">
            <div class="left-main">
              <el-input placeholder="请输入关键词" v-model="searchValueService" maxlength="20" prefix-icon="el-icon-search"
                        clearable >
              </el-input>
              <div class="tree-box">
                <el-tree
                  :props="serviceProps"
                  :data="serviceTreeData"
                  :expand-on-click-node="false"
                  node-key="id"
                  :filter-node-method="filterService"
                  @node-click="serviceNodeClick"
                  ref="serviceTree"
                />
              </div>
            </div>
            <div class="right-main">
              <h2 class="title">服务项</h2>
              <div class="search-table">
                <el-input
                  v-model="searchService"
                  prefix-icon="el-icon-search"
                  placeholder="请输入关键字"
                  style="width: 60%"
                  clearable
                >
                  <el-button slot="append" @click="searchServiceHandler">搜索</el-button>
                </el-input>
              </div>
              <div class="list-wrap">
                <ul class="list">
                  <li v-for="item in serviceListData" :key="item.id">
                    <service-catalog :service-data="item" />
                  </li>
                </ul>
                <div class="page-wrap">
                  <el-pagination
                    @current-change="servicePageChange"
                    :current-page="serviceCurrentPage"
                    :page-size="servicePageSize"
                    layout="total, prev, pager, next, jumper"
                    :total="serviceTotal"
                  ></el-pagination>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <el-dialog :visible.sync="dialogVisible" width="50%" :title="dialogTitle" custom-class="dialog-box">
      <catalog-edit ref="catalogEdit" :catalog-data.sync="catalogData" @close-catalog="closeCatalog"
                    :dialog-type="dialogType" :rootdiroptions="this.rootDirOptions"
                    @add-masterdir="addMasterDir"></catalog-edit>
    </el-dialog>
    <!--//上传文件-->
    <el-dialog custom-class="dialog-box" title="导入目录" :visible.sync="centerDirModel" @close="closeDir()" width="40%">
      <div >
        <el-form :model="uploadFormData" label-position="right" label-width="140px" ref="uploadForm" :rules="uploadRules">
          <el-form-item label="选择上传文件：" prop="fileList">
            <el-upload
              class="upload-demo"
              action="/api/collection/info/DirectoryRoot/dirModelUpload"
              :headers="getMt"
              ref="upload"
              :on-change="changeUploadFile"
              :multiple="false"
              :on-success="fileUploadSuccess"
              :auto-upload="false"
              :on-error="errorUpload"
              :file-list="uploadFormData.fileList">
              <div style="display: flex">
                <el-button size="small" type="primary" slot="trigger">选择文件</el-button>
                <div slot="tip" class="el-upload__tip" style="color: rgb(230, 162, 60); margin-left: 20px; margin-top: 0;">只能上传专用模板文件</div>
              </div>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      <div class="submit-box">
        <el-button type="primary" @click="saveFile">导入</el-button>
        <el-button @click="cancelSave">取消</el-button>
      </div>
      <ul class="error-list">
        <li v-for="(item,index) in errorList" :key="index">
          <p style="width: 45%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; color: rgb(230, 162, 60)">
            <span class="name">失败目录名称：</span>
            <span class="content">{{item.dirName}}</span>
          </p>
          <p style="width: 45%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; margin-left: 8%; color: rgb(230, 162, 60)">
            <span class="name">失败原因：</span>
            <span class="content">{{item.reason}}</span>
          </p>
        </li>
      </ul>
      <!--<el-button type="primary" size="small" @click="importDirModel">确定</el-button>-->
    </el-dialog>
    <!--子目录和信息项详情-->
    <el-dialog custom-class="dialog-box" :title="dirTitle + '-详情'" :visible.sync="dirDialog" @close="closeDirDialog">
      <div class="dirInfo" v-if="dirStaua === 2">
        <el-form :model="catalogData" label-position="right" label-width="120px">
          <el-form-item label="所属目录：" prop="rootName">
            <span>{{catalogData.rootName}}</span>
          </el-form-item>
          <el-form-item label="子目录名称：" prop="name">
            <span>{{catalogData.name}}</span>
          </el-form-item>
          <el-form-item label="数据类型：" prop="dataType">
            <span v-if="catalogData.dataType === 1">文件</span>
            <span v-if="catalogData.dataType === 2">接口</span>
            <span v-if="catalogData.dataType === 3">库表</span>
          </el-form-item>
          <el-form-item label="数据格式：" prop="dataFormat">
            <span>{{catalogData.dataFormat}}</span>
          </el-form-item>
          <el-form-item label="共享权限：" prop="sharePermission">
            <span v-if="catalogData.sharePermission === 1">申请使用</span>
            <span v-if="catalogData.sharePermission === 2">无需申请</span>
          </el-form-item>
          <el-form-item label="开放权限：" prop="openPermission">
            <span v-if="catalogData.openPermission === 1">有条件开放</span>
            <span v-if="catalogData.openPermission === 2">无条件开放</span>
          </el-form-item>
        </el-form>
      </div>
      <div class="infoDetail" v-if="dirStaua === 3">
        <el-form :model="infologData" label-position="right" label-width="120px" ref="formBox">
          <el-form-item label="英文名称：">
            <span>{{infologData.nameEng}}</span>
          </el-form-item>
          <el-form-item label="中文名称：">
            <span>{{infologData.name}}</span>
          </el-form-item>
          <el-form-item label="类型：">
            <span>{{infologData.dataType}}</span>
          </el-form-item>
          <el-form-item label="说明：">
            <span>{{infologData.description}}</span>
          </el-form-item>
          <el-form-item label="长度：">
            <span>{{infologData.length}}</span>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>

    <!--新增主目录-->
    <el-dialog custom-class="dialog-box" :title="masterDirTitle" :visible.sync="catalogDialog" width="40%" :before-close="addBeforeClose">
      <el-form ref="masterDir" :model="catalogFormData" label-width="140px" label-position="right" :rules="catalogRule">
        <el-form-item label="目录名称：" prop="name">
          <el-input v-model="catalogFormData.name" placeholder="请输入" style="width: 90%;"></el-input>
        </el-form-item>
        <div class="submit-box">
          <el-button type="primary"  @click="saveMasterCatalog">保存</el-button>
          <el-button @click="cancelAddCatalog">取消</el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
  import CatalogEdit from "@/components/CatalogEdit";
  import moment from "moment";
  import Vue from "vue";
  import request from "@/libs/request";
  import LocalSave from "@/libs/LocalSave";
  import ServiceCatalog from "@/components/ServiceCatalog.vue";

  export default {
    name: "DirManager",
    components: {
      CatalogEdit,
      ServiceCatalog
    },
    watch: {
      $route: {
        immediate: true,
        deep: true,
        handler(val, oldVal) {
          if (val.query.add) {
            this.addMasterDir();
            this.$router.replace("/data-manager/dir-manager");
          }
        }
      },
      searchValue(val){
        this.$refs.addTree.filter(val);
        this.$refs.saveTree.filter(val);
      },
      searchValueService(val){
        this.$refs.serviceTree.filter(val);
      }
    },
    computed: {
      masterDirTitle(){
        if(this.masterType === 1){
          return "新增数据目录"
        }else{
          return "编辑数据目录"
        }
      },
      getMt() {
        let authority = LocalSave.getSession("authority");
        if (authority) {
          authority = JSON.parse(authority);
          if (authority.mt) {
            return {
              mt: authority.mt
            }
          }
        }
      },
      dialogTitle() {
        if (this.dialogType === "new") {
          return "新增数据子目录";
        } else {
          return "编辑数据子目录";
        }
      }
    },
    data() {
      const validUpload = (rule,value,callBack) => {
        let nameArr = value[0].name.split(".");
        let lastName = nameArr[nameArr.length - 1];
        if(lastName.toUpperCase() === "XLS"){
          callBack();
        }else{
          callBack(new Error("错误的模板文件，请重新选择正确的文件"));
        }
      }
      const repeatMaster = async (rule, value, callBack) =>{
        let {status} = await request.post("/collection/info/DirectoryRoot/selectByName", {name: value});
        if(status === 200){
          callBack();
        }else{
          callBack(new Error("目录名已经存在"));
        }
      }
      return {
        serviceTreeData: [],
        serviceCurrentPage: 1,
        currentServiceId: '',
        currentTopicId: '',
        servicePageSize: 5,
        serviceTotal: 0,
        serviceListData: [],
        serviceTab: "first",
        searchValueService: "",
        searchService: "",
        serviceProps: {
          label: 'serviceName',
          children: 'serviceList',
        },
        errorList: [], //导入目录失败信息列表
        editMaster: {
          name: ""
        },
        masterType: 1,
        catalogRule: {
          name: [
            {required: true, message: "目录名称不能为空", trigger: "blur"},
            {max: 50, message: "目录名称长度不能超过50", trigger: "blur"},
            {pattern: /^[^\s]+$/, message: "目录名称不能包含空格", trigger: "change"},
            {validator: repeatMaster, trigger: "blur"}
          ]
        },
        catalogFormData: {
          name: ""
        },
        catalogDialog: false,
        addTreeExpand: [],
        saveTreeExpand: [],
        dirStaua: '',
        dirTitle: '',
        dirDialog: false,
        // dirListInfos: false,
        // InfosDetail: false,
        recordList: [],
        newAddDirList: [],
        dirList: [],
        rootDirOptions: [],
        newAddDirProps: {
          label: 'name',
          children: 'childNode',
          isLeaf: 'leaf'
        },
        dirProps: {
          label: 'name',
          children: 'childNode',
          isLeaf: 'leaf'
        },

        activeTab: "file",
        dirTab: "first",
        searchValue: "",
        dialogVisible: false, //弹窗变量
        dialogType: "new",
        catalogData: { // 新增和编辑的子目录数据
          masterDir: "",
          name: "",
          dataFormat: "",
          dataType: "",
          sharePermission: "1",
          openPermission: "1"
        },
        infologData: { // 信息巷详情
          nameEng: "",
          name: "",
          dataType: "",
          length: "",
          description: ""
        },
        releaseDir: { //目录发布
          catalog: "", //所选目录
          dirList: [],
        },
        currentPage: 1,//分页初始值为1
        totalNum: 0,//分页总数
        pageSize: 10,//设置分页大小
        centerDirModel: false,//上传
        fileList: [],
        uploadFormData: {
          fileList: [],
        },
        uploadRules: {
          fileList: [
            {required: true, message: "上传文件不能选择为空", trigger: "change"},
            {validator: validUpload, trigger: "change"}
          ]
        },
        fileAddress: "",
        sufixName: "",
        dataName: ""
      }
    },
    created() {
      this.getNewAddDirList();
      this.getDirList();
      this.getServiceTreeData();
      this.getServicesListData();
      
      // this.getRecordList();
    },
    
    methods: {
      //服务目录点击节点
      serviceNodeClick(data, node, tree) {
        console.log(data, node);
        this.serviceCurrentPage = 1;
        this.searchService = '';
        if(node.level === 1){
          this.currentServiceId = '';
          this.currentTopicId = data.topicId;
        }else if(node.level === 2) {
          this.currentTopicId = '';
          this.currentServiceId = data.serviceId;
        }
        this.getServicesListData();
      },
      cancelSave(){
        this.closeDir();
      },
      errorUpload(err){
        if(err.status === 401){
          this.$message.warning(err.message);
          this.$router.push("/login")
        }
      },
      //获取服务目录树数据
      async getServiceTreeData() {
        try{
          const {status, message, data} = await request.get("/serviceitem/serviceDirectory/getServiceDirectoryTree");
          if(status === 200) {
            let newData = data.map(item => {
              item.serviceName = item.topicName;
              return item;
            });
            this.serviceTreeData = newData;
          }
        }catch(e) {
          this.$message.warning(e);
        }
      },
      //获取服务列表数据
      async getServicesListData() {
        try{
          const params = {
            name: this.searchService ? this.searchService : undefined,
            pageIndex: this.serviceCurrentPage,
            pageSize: this.servicePageSize,
            serviceId: this.currentServiceId ? this.currentServiceId : undefined,
            topicId: this.currentTopicId ? this.currentTopicId : undefined
          }
          const {status, data, message, total} = await request.post("/serviceitem/serviceDirectory/getServiceDirectoryDetail", params, {loading: true, loadingTitle: '获取服务列表中……'});
          if(status === 200) {
            this.serviceListData = data;
            this.serviceTotal = total ? total : 0;
          }else {
            this.$message.warning(message);
          }
        }catch(e){
          this.$message.error(e);
        }
      },
      servicePageChange(page) {
        this.serviceCurrentPage = page;
        this.getServicesListData();
      },
      searchServiceHandler() {
        this.serviceCurrentPage = 1;
        this.currentServiceId = '';
        this.currentTopicId = '';
        this.getServicesListData();
      },
      saveFile(){
        this.$refs.uploadForm.validate(valid => {
          if(valid){
            if(!this.uploadFormData.fileList.length){
              this.$message.warning("没有选择需要上传的文件");
            }else{
              this.$refs.upload.submit();
            }
          }else{
            this.$message.warning("请选择正确规范的模板文件");
          }
        })
      },
      async saveMasterCatalog(){ //保存主目录
        if(this.masterType === 1){
          try {
            this.$refs.masterDir.validate(async valid => {
              if(valid){
                let oData = await request.post("/collection/info/DirectoryRoot/createRootDir", {name: this.catalogFormData.name}, {
                  loading: true,
                  loadingTitle: "目录保存中"
                });
                if (oData.status === 200) {
                  this.$message.success("增加目录成功");
                  this.$refs.masterDir.resetFields();
                  this.getNewAddDirList();
                  this.getDirList();
                  this.catalogDialog = false;
                } else {
                  this.$message.warning(oData.message);
                }
              }else{
                this.$message.warning("请按规则完善字段");
              }
            });
          } catch (e) {

          }
        }else{
          this.editMasterSave();
        }
      },
      cancelAddCatalog(){ //新增主目录取消按钮
        this.catalogDialog = false;
      },
      filterNode(value, data){ //过滤节点
        if(!value) return true;
        return data.name.includes(value);
      },
      filterService(value,data) { //过滤服务节点
        if(!value) return true;
        return data.serviceName.includes(value);
      },
      //导入目录模板
      importFile() {
        this.file = null;
        this.centerDirModel = true;
      },
      closeDir() {
        this.centerDirModel = false;
        this.$refs.upload.clearFiles();
        this.errorList = [];
      },
      //上传前检查文件类型大小
      beforeUploadFile(file, fileList) {
        const maxSize = 1024 * 1024 * 20;
        let nameArr = file.name.split(".");
        let sufixName = nameArr[nameArr.length - 1];
        this.dataName = nameArr[0];
        this.sufixName = sufixName;
        this.fileName = file.name;
        if (this.sufixName.toUpperCase() === "XLS") {
          if (file.size > maxSize) {
            this.$message.warning("文件不能超过20M");
            return false
          } else {
            return true;
          }
        } else {
          this.$message.warning("不支持的文件类型");
          return false;
        }
      },
      //选择、改变上传文件时钩子函数
      changeUploadFile(file, fileList) {
        /*let nameArr = file.name.split(".");
        let sufixName = nameArr[nameArr.length - 1];
        if(sufixName.toUpperCase() !=="XLS"){
          this.$refs.upload.clearFiles();
          this.$message.warning("不支持的文件类型");
          return false;
        }*/
        let maxSize = 500 * 1024;
        if(file.size > maxSize){
          this.$message.warning("文件不能大于500Kb");
          return false;
        }
        if (fileList.length > 1) {
          fileList.splice(0, 1);
        }
        this.uploadFormData.fileList = fileList;
       /* this.file = file;
        this.dataName = nameArr[0];
        this.sufixName = sufixName;
        this.fileName = file.name;*/
      },
      //文件选择成功发送服务器回函数
      fileUploadSuccess({status,message,data}, file) {
        if(status === 200){
          this.$message.success("导入成功");
          this.closeDir();
          this.getNewAddDirList();
        }else{
          if(status === 400){
            this.errorList = data;
          }
          this.$message.warning(message);
          //this.$refs.upload.clearFiles();
          if(parseInt(status) === 401){
            this.$router.push("/login");
          }
        }
        /*if (res.status === 200) {
          this.file = file;
          this.$message.success(res.message);
          this.getNewAddDirList();
          this.centerDirModel = true;
        } else {
          this.file = null;
          this.centerDirModel = true;
          this.$message.warning(res.message);
        }*/
      },
      //导出目录模板
      async downloadFile() {
        window.open("/api/collection/info/DirectoryRoot/downloadModelFile");
      },
      //获取新增目录树
      async getNewAddDirList() {
        let oData = await request.post("/collection/info/DirectoryRoot/listAllData", {
          isPutaway: 0,
          searchName: this.searchValue
        }, {loading: true}, {loadingTitle: "获取目录树数据中……"});
        if (oData.status === 200) {
          this.newAddDirList = oData.data;
          this.addTreeExpand = this.newAddDirList.map(item => item.id);
        } else if (oData.status === 204) {
          this.newAddDirList = null;
        } else {
          this.$message.warning(oData.message);
        }
      },
      //获取数据目录树
      async getDirList() {
        try {
          let oData = await request.post("/collection/info/DirectoryRoot/listAllData", {
            isPutaway: 1,
            searchName: this.searchValue
          }, {loading: true, loadingTitle: "获取数据目录树数据中……"});
          if (oData.status === 200) {
            this.dirList = oData.data;
            this.saveTreeExpand = this.dirList.map(item => item.id);
          } else if (oData.status === 204) {
            this.dirList = [];
          } else {
            this.$message.warning(oData.message);
          }
          console.log(this.dirList);
        } catch (e) {

        }
      },
      //获取发布记录列表数据
      async getRecordList() {
        try {
          var params = {
            "auditResult": 9,
            "name": "",
            "pageSize": this.pageSize,
            "pageIndex": this.currentPage,
          };
          let oData = await request.post("/collection/info/DirectoryRoot/listRootAndSupDirectoryByStatus", params, {loading: true});
          if (oData.status === 200) {
            this.recordList = oData.data;
            this.totalNum = oData.total;
          } else if (oData.status === 204) {
            this.recordList = null;
          } else {
            this.$message.warning(oData.message);
          }
        } catch (e) {

        }
      },
      async getWaitRelease() {
        try {
          let result = await request.post("/collection/info/DirectoryRoot/listRootAndSupDirectoryByStatus", {
            auditResult: -1,
          }, {loading: true, loadingTitle: "数据目录获取中"});
          if (result.status === 200) {
            this.releaseDir.dirList = result.data;
          } else if (result.status === 204) {
            this.releaseDir.dirList = [];
          } else {
            this.$message.warning(result.message);
          }
        } catch (e) {

        }
      },
      //增加主目录
      async addMasterDir() {
        this.dialogVisible = false;
        this.catalogDialog = true;
        this.masterType = 1;
        this.catalogFormData = {
          name: ""
        }
      },
      //删除根目录
      async removeNode(node, data) {
        this.$confirm('确定删除此目录?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (node.level === 1) {
            let params = {
              id: data.id
            };
            request.post("/collection/info/DirectoryRoot/delete", params, {
              loading: true,
              loadingTitle: "删除中"
            })
              .then(oData => {
                if (oData.status === 200) {
                  this.$refs.addTree.remove(node);
                  this.$message.success(oData.message);
                  this.getNewAddDirList();
                } else {
                  this.$message.warning(oData.message);
                }
              })
          } else if (node.level === 2) {
            let dirParams = {
              id: data.id
            };
            request.post("/collection/info/DirectorySub/delete", dirParams, {
              loading: true,
              loadingTitle: "删除中"
            })
              .then(dirData => {
                if (dirData.status === 200) {
                  this.$refs.addTree.remove(node);
                  this.$message.success(dirData.message);
                  this.getNewAddDirList();
                } else {
                  this.$message.warning(dirData.message);
                }
              })
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消此操作！',
          });
        });
      },
      //删除发布过的目录
      async removeSaveNode(node, data) {
        this.$confirm('确定删除此目录?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (node.level === 1) {
            let params = {
              id: data.id
            };
            request.post("/collection/info/DirectoryRoot/delete", params, {
              loading: true,
              loadingTitle: "删除中"
            })
              .then(oData => {
                if (oData.status === 200) {
                  this.$refs.addTree.remove(node);
                  this.$message.success(oData.message);
                  this.getDirList();
                } else {
                  this.$message.warning(oData.message);
                }
              })
          } else if (node.level === 2) {
            let dirParams = {
              id: data.id
            };
            request.post("/collection/info/DirectorySub/delete", dirParams, {
              loading: true,
              loadingTitle: "删除中"
            })
              .then(dirData => {
                if (dirData.status === 200) {
                  this.$refs.addTree.remove(node);
                  this.$message.success(dirData.message);
                  this.getDirList();
                } else {
                  this.$message.warning(dirData.message);
                }
              })
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消此操作！',
          });
        });
      },
      // async removeSaveNode(node, data) {
      //     if (node.level === 1) {
      //         let params = {
      //             id: data.id
      //         };
      //         let oData = await request.post("/collection/info/DirectoryRoot/delete", params, {loading: true});
      //         if (oData.status === 200) {
      //             this.$refs.addTree.remove(node);
      //             this.$message.success(oData.message);
      //             this.getDirList();
      //         } else {
      //             this.$message.warning(oData.message);
      //         }
      //     } else if (node.level === 2) {
      //         let dirParams = {
      //             id: data.id
      //         };
      //         let dirData = await request.post("/collection/info/DirectorySub/delete", dirParams, {loading: true});
      //         if (dirData.status === 200) {
      //             this.$refs.addTree.remove(node);
      //             this.$message.success(dirData.message);
      //             this.getDirList();
      //         } else {
      //             this.$message.warning(dirData.message);
      //         }
      //     }
      // },

      //新增数据子目录
      addChildDir() {
        this.dialogVisible = true;
        this.getRootDir();
        this.getNewAddDirList();
        this.getDirList();
        setTimeout(() => {
          this.$refs.catalogEdit.clearFields();
          this.catalogData = { // 重置数据的值
            masterDir: "",//根目录名称
            name: "",//子目录名称
            id: "",//子目录ID
            dataType: "",//文件类型：1=文件，2=接口，3=库表
            dataFormat: "",//数据类型表，联合data_format的值
            sharePermission: 1,//1=申请使用2=无需申请
            openPermission: 1,//1=有条件开放2=无条件开放
          }
        }, 200)
      },
      // 编辑目录
      editNode(node, data) {
        console.log(data);
        if (node.level === 1) {
          this.editMasterNode(node, data);
        } else if (node.level === 2) {
          this.editChildNode(node, data);
        }
      },
      //编辑主目录
      async editMasterNode(node, data) {
        this.masterType = 2;
        this.catalogDialog = true;
        this.catalogFormData = {
          ...data
        };
      },
      async editMasterSave(){
        try {
          this.$refs.masterDir.validate(async valid => {
            if(valid){
              let params = {
                id: this.catalogFormData.id,
                name: this.catalogFormData.name
              };
              let oData = await request.post("/collection/info/DirectoryRoot/update", params, {loading: true, loadingTitle: "修改目录中……"});
              if (oData.status === 200) {
                this.$message.success("修改成功！");
                this.getNewAddDirList();
                this.catalogDialog = false;
              } else if (oData.status === 400) {
                this.$message.error(oData.message);
              } else {
                this.$message.warning(oData.message);
              }
            }else{
              this.$message.warning("请按规则填写目录名称");
            }
          });
        } catch (e) {

        }
      },
      async addBeforeClose(done){
        this.$refs.masterDir.resetFields();
        await this.getNewAddDirList();
        done();
      },
      //编辑子目录
      async editChildNode(node, data) {
        this.dialogType = "edit";
        this.dialogVisible = true;
        this.catalogData = { // 重置数据的值
          "masterDir": data.rootId,//根目录名称
          "name": data.name,//子目录名称
          "id": data.id,//子目录ID
          "dataType": parseInt(data.dataType),//文件类型：1=文件，2=接口，3=库表
          "dataFormat": data.dataFormat,//数据类型表，联合data_format的值
          "sharePermission": parseInt(data.shareType),//1=申请使用2=无需申请
          "openPermission": parseInt(data.shareOpenType),//1=有条件开放2=无条件开放
        }
      },
      //获取根目录和id
      async getRootDir() {
        let oData = await request.post("/collection/info/DirectoryRoot/listAllRootDirectory", {loading: true});
        if (oData.status === 200) {
          this.rootDirOptions = oData.data;
        } else if (oData.status === 204) {
          this.rootDirOptions = null;
        } else {
          this.$message.warning(oData.message);
        }
      },
      //关闭新增修改子目录弹窗
      closeCatalog() {
        this.dialogVisible = false;
        this.getNewAddDirList();
        this.getDirList();
        this.catalogData = { // 重置数据的值
          masterDir: "",//根目录名称
          name: "",//子目录名称
          id: "",//子目录ID
          dataType: "",//文件类型：1=文件，2=接口，3=库表
          dataFormat: "",//数据类型表，联合data_format的值
          sharePermission: 1,//1=申请使用2=无需申请
          openPermission: 1,//1=有条件开放2=无条件开放
        }
      },
      //格式化时间
      getTime(row, col, val) {
        if (val) {
          return moment(val).format("YYYY-MM-DD HH:mm:ss")
        } else {
          return moment().format("YYYY-MM-DD HH:mm:ss")
        }
      },
      //格式化状态
      getStatus(row, col, val) {
        if (val === true) {
          return "已通过";
        } else {
          return "审核未通过"
        }
      },
      //改变每页显示多少条记录
      handleSizeChange(val) {
        this.pageSize = val;
        this.getRecordList();
      },
      //改变当前页
      handleCurrentChange(val) {
        this.currentPage = val;
        this.getRecordList();
      },
      //弹出审核未通过消息
      async showMessage(row) {
        try {
          if (row.reason == null || row.reason == "" || row.reason == undefined) {
            await this.$alert("暂无驳回理由", "审核未通过", {
              showConfirmButton: false
            });
          } else {
            await this.$alert(row.reason, "审核未通过", {
              showConfirmButton: false
            });
          }
        } catch (e) {
        }
      },
      //鼠标点击查看详情
      dirListInfo(node, data) {
        if (node.level === 2) {
          this.dirStaua = 2;
          this.dirDialog = true;
          this.dirTitle = data.name;
          this.catalogData = { // 重置数据的值
            "masterDir": data.rootId,//根目录名称
            "rootName": data.rootName,
            "name": data.name,//子目录名称
            "id": data.id,//子目录ID
            "dataType": parseInt(data.dataType),//文件类型：1=文件，2=接口，3=库表
            "dataFormat": data.dataFormat,//数据类型表，联合data_format的值
            "sharePermission": parseInt(data.shareType),//1=申请使用2=无需申请
            "openPermission": parseInt(data.shareOpenType),//1=有条件开放2=无条件开放
          }
        } else if (node.level === 3) {
          this.dirStaua = 3;
          this.dirDialog = true;
          this.dirTitle = data.name;
          console.log(data);
          this.infologData = {
            nameEng: data.nameEng,
            name: data.name,
            dataType: data.dataType,
            length: data.length === 0 ? '-' : data.length,
            description: data.description
          }
        }
      },
      // 鼠标移入事件
      showBtnBox(node, data) {
        if (!data.isShow) {
          Vue.set(data, "isShow", true);
        } else {
          data.isShow = true;
        }
      },
      //鼠标移出事件
      hideBtnBox(data) {
        if (!data.isShow) {
          Vue.set(data, "isShow", false);
        } else {
          data.isShow = false;
        }
      },
      //发布目录
      async releaseCatalog() {
        try {
          if(!this.releaseDir.catalog){
            this.$message.warning("请选择要发布的目录");
            return;
          }
          let result = await request.post("/collection/info/DirectorySub/releaseSupDirectory", {
            subId: this.releaseDir.catalog
          }, {loading: true, loadingTitle: "目录发布中"});
          if (result.status === 200) {
            this.$message.success("目录成布成功");
            this.getNewAddDirList();
            this.getDirList();
            let currDir = this.releaseDir.dirList.find(item => item.id === this.releaseDir.catalog);
            await this.getWaitRelease();
            this.releaseDir.catalog = "";
            this.recordList.push({
              label: currDir.name
            });
          } else {
            this.$message.warning(result.message);
          }
        } catch (e) {

        }
      },
      //选项卡切换
      tabClick(tab, event) {
        if (tab.name === "second") {
          this.getWaitRelease();
          this.recordList = [];
        } else if (tab.name === "third") {
          this.getRecordList();
        }
      },
      //子目录详情弹框
      closeDirDialog() {
        this.dirDialog = false;
      }
    }
  }
</script>

<style lang="less">
  .content-box {
    box-sizing: border-box;

    .catalog-wrap {
      border: 1px solid #DFE6E8;
      display: flex;
      min-height: 400px;
      box-sizing: border-box;

      .left-main {
        box-sizing: border-box;
        padding: 15px;
        width: 300px;
        height: 100%;
        /*border-right: 1px solid #DFE6E8;*/

        .tree-box {
          padding-top: 15px;

          .el-tree {
            max-height: 500px;
            overflow-y: auto;

            .el-tree-node__content {
              height: 40px !important;
            }
          }

          .tree-node {
            height: 40px;
            width: 90%;
            display: flex;
            padding-right: 10px;
            align-items: center;
            justify-content: space-between;

            .btn-box {
              width: 65px;
            }

            .text {
              flex: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              font-size: 12px;
            }
          }

          .header {
            padding-left: 20px;
            line-height: 36px;
            background: #4C576C;
            color: #fff;
          }
        }
      }

      .right-main {
        height: 100%;
        flex: 1 1 auto;
        box-sizing: border-box;
        padding: 15px;

        .release-box {
          padding-left: 15px;

          h3.title {
            padding-bottom: 20px;
          }

          .btn-box {
            padding-top: 20px;
          }

          .record-list {
            padding-top: 20px;

            .item {
              display: flex;
              width: 60%;
              justify-content: space-between;
              align-items: center;
              height: 40px;

              .info {
                color: #999;
              }
            }
          }
        }

        .btn-box {
          display: flex;

          .el-input {
            margin-right: 30px !important;
          }
        }

        .search-table {
          padding-top: 20px;
        }
        .list-wrap {

        }
      }
    }
  }

  .el-aside {
  }

  .error-list{
    padding-top: 20px;
    max-height: 300px;
    overflow-y: auto;
    li{
      display: flex;
      justify-content: space-between;
      color: red;
      padding: 10px 5px;
      p{
        flex: 1 1 auto;
      }
    }
  }

</style>

