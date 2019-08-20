import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isFullScreen: false,
    loading: false,
    loadingTitle: "获取数据中，请等待……",
    defaultRouter: "",
    addNewTableSyncData: {
      beLongCatalog: [],  //所选目录
      sourceData: "", //源数据库
      sourceTable: "", //源数据表
      fileCatalog: [ //源数据表解析出来的数据列表
        {id: Math.random(), name: "1111", type: 1, remark: "说明", length: ""}
      ],
      syncStrategy: 1,
    },
    breadcrumbList: [], //面包屑导航数据
    tableInputSetting: {
      sourceTable: "",
      processingId: "",
      tableName: "",
      tableData: []
    },
    enumMappingSetting: {
      name: "",
      tableData: [
      ]
    },
    ruleFilterSetting: {
      flow: {},
      tableData: [
        {
          id: Math.random(),
          tableField: "",
          ruleName: "",
          reg: "",
          isDelete: false
        }
      ]
    },
    ruleUpdateSetting:{
      flow: {},
      tableData: []
    },
    outputSetting: {
      theme: "",
      tableName: "",
      updateMethod: 1,
      specificTime: "",
      updateCycle: "",
      month: "",
      date: "",
      week: "",
	    governmentMethod: false,
	    governmentField: '',
	    primaryKey: '',
	    indexes: [
		    {
		    	id: Math.random(),
			    name: ''
		    }
	    ],
      sourceTable: [],
      realSourceTable: [],
      flow: {
        configJson: {}
      }
    },
    tableJoinData: {
      joinTableName: "",
      joinTableColumn: [],
      processingId: "",
      joinList: [
        {id: Math.random(),sourceTable: "", joinTable: "", delete: false}
      ],
      tableName: "",
      flow: {
        configJson: {}
      }
    },
    tableDiffData: {
      diffTableName: "",
      diffTableColumn: [],
      relatedColumn: [
        {id: Math.random(),sourceTable: "", diffTable: "", delete: false}
      ],
      processingId: "",
      diffList: [
        {id: Math.random(),sourceTable: "", diffTable: "", delete: false}
      ],
      tableName: "",
      ruleName: "",
      flow: {
        configJson: {}
      }
    },
    apiInputData: {
      flow: {
        configJson: {

        }
      },
      tableData: [],
      interfaceName: "",
    },
    apiOutputData: {
      flow: {
        configJson: {

        }
      },
      tableData: [],
      theme: "",
    },
    catalogList: [], //目录列表
    isEdit: true, //是否编辑
    sourceDataList: [], //数据源列表
    databaseRunResult: { //库表运行结果
      tableColumn: [],
      tableResult: []
    },
    interfaceRunResult : {
      address: "",
      format: "",
      method: "",
      description: "",
      requestParams: [],
      responseParams: [],
      errorCode: [],
      requestDemo: "",
      responseDemo: ""
    }
  },
  mutations: {
    changeDataSourceList(state, payload){
      state.sourceDataList = payload;
    },
    changeEditStatus(state, payload){
      state.isEdit = payload;
    },
    changeLoadingTitle(state,payload){ //改变loading
      state.loadingTitle = payload;
    },
    changeLoading(state,payload){ //改变loading状态
      state.loading = payload;
    },
    changeDefaultRouter(state,payload){ // 改变路由导航信息
      state.defaultRouter = payload;
    },
    changeAddTableSyncData(state, payload){
      state.addNewTableSyncData = payload
    },
    changeBreadCrumbList(state, payload){
      state.breadcrumbList = payload;
    },
    changeInputData(state,payload){
      state.tableInputSetting = payload;
    },
    changeEnumMappingData(state,payload){
      state.enumMappingSetting = payload;
    },
    changeRuleFilterData(state,payload){
      state.ruleFilterSetting = payload;
    },
    changeRuleUpdateData(state, payload){
      state.ruleUpdateSetting = payload;
    },
    changeOutputData(state,payload){
      state.outputSetting = payload;
    },
    changeApiInputData(state,payload){
      state.apiInputData = payload;
    },
    changeApiOutputData(state,payload){
      state.apiOutputData = payload;
    },
    changeCatalogData(state,payload){
      state.catalogList = payload;
    },
    changeTableJoinData(state,payload){
      state.tableJoinData = payload;
    },
    changeTableDiffData(state,payload){
      state.tableDiffData = payload;
    },
    changeDataBaseRunResult(state,payload){
      state.databaseRunResult = payload;
    },
    changeInterfaceRunResult(state,payload){
      state.interfaceRunResult = payload;
    },
    changeFullScreen(state, payload) {
      state.isFullScreen = payload;
    }
  },
  actions: {

  }
})
