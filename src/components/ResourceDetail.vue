<template>
    <div class="content-box">
        <!--接口-->
        <div v-if="formData.serviceTypeName === '接口'" class="interface-detail">
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
                <el-form-item label="订阅时间:">
                    <el-input readonly v-model="formData.subscribeTime"></el-input>
                </el-form-item>
                <el-form-item label="最后更新时间:">
                    <el-input readonly v-model="formData.updateTime"></el-input>
                </el-form-item>
                <el-form-item label="服务状态:" v-if="formData.serviceStatus === 0">
                    <el-input readonly value="更新中"></el-input>
                </el-form-item>
                <el-form-item label="服务状态:" v-if="formData.serviceStatus === 1">
                    <el-input readonly value="停止更新" style="color: #ff7787;"></el-input>
                </el-form-item>
                <el-form-item label="服务主题:">
                    <el-input readonly v-model="formData.topicName"></el-input>
                </el-form-item>
                <el-form-item label="订阅状态:" v-if="formData.status === 0">
                    <span style="color: #E6A23C">审核中</span>
                </el-form-item>
                <el-form-item label="订阅状态:" v-if="formData.status === 1">
                    <el-input readonly value="订阅成功"></el-input>
                </el-form-item>
                <el-form-item label="订阅状态:" v-if="formData.status === 2">
                    <span style="color: #ff7787;cursor: pointer" @click="resMes">订阅失败<i class="iconfont"
                                                                                        style="color: #ff7787;font-size: 12px;padding-left: 5px">&#xf03f;</i></span>
                </el-form-item>
                <el-form-item label="服务方式:">
                    <span style="padding:8px 25px;border-radius:3px;background-color: #409EFF;color: #fff"><i
                            class="iconfont" style="font-size: 12px;padding-right: 8px">&#xf02b;</i>接口</span>
                </el-form-item>
                <el-form-item label="" v-if="formData.isDelete === 1">
                    <span style="color: #ff7787;">该服务已被删除</span>
                </el-form-item>
                <el-form-item label="接口地址:">
                    <el-input readonly v-model="formData.proxyAddress"></el-input>
                </el-form-item>
                <el-form-item label="返回格式:">
                    <el-input readonly v-model="formData.responseTypeName"></el-input>
                </el-form-item>
                <el-form-item label="请求方式:">
                    <el-input readonly v-model="formData.requestModeName"></el-input>
                </el-form-item>
                <el-form-item label="API Key:" v-if="formData.status === 1 && formData.isDelete === 0">
                    <div style="width: 100%;border: 1px solid #DCDFE6;border-radius: 3px">
                        <span style="padding: 0px 16px;color: #606266">{{formData.apiKey}}</span>
                        <i class="iconfont" style="font-size: 12px;cursor: pointer;color: #409EFF" @click="apiImg">&#xf045;</i>
                    </div>
                    <!--apikey使用说明-->
                    <el-dialog custom-class="small" title="apikey使用说明" :visible.sync="centerDialogVisible">
                        <img src="@/assets/apiDes.png" width="100%"/>
                    </el-dialog>
                    <!--<el-input readonly v-model="formData.apiKey"></el-input>-->
                </el-form-item>
                <el-form-item label="Token:" v-if="formData.status === 1 && formData.isDelete === 0">
                    <el-input readonly v-model="formData.token"></el-input>
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
                        <el-table-column property="desc" label="说明"></el-table-column>
                    </el-table>
                </el-form-item>
                <el-form-item label="返回参数说明:">
                    <el-table :data="formData.responseParam" stripe border header-cell-class-name="th-style">
                        <el-table-column label="名称" prop="name"></el-table-column>
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
                        <el-table-column label="说明" prop="description"></el-table-column>
                    </el-table>
                </el-form-item>
                <el-form-item label="错误码说明:">
                    <el-table :data="formData.errorCode" stripe border header-cell-class-name="th-style">
                        <el-table-column label="名称" prop="name"></el-table-column>
                        <el-table-column label="说明" prop="desc"></el-table-column>
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
            </el-form>
        </div>
        <!--文件/库表/视图查询-->
        <div v-if="formData.serviceTypeName === '库表/视图/文件'" class="mysqldump-detail">
            <el-form :model="formData" :rules="rules" label-width="140px" label-position="right" ref="formBox">
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
                <el-form-item label="订阅时间:">
                    <el-input readonly v-model="formData.subscribeTime"></el-input>
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
                <el-form-item label="订阅状态:" v-if="formData.status === 0">
                    <span style="color: #E6A23C">审核中</span>
                </el-form-item>
                <el-form-item label="订阅状态:" v-if="formData.status === 1">
                    <el-input readonly value="订阅成功"></el-input>
                </el-form-item>
                <el-form-item label="订阅状态:" v-if="formData.status === 2">
                    <span style="color: #ff7787;cursor: pointer" @click="resMes">订阅失败<i class="iconfont"
                                                                                        style="color: #ff7787;font-size: 12px;padding-left: 5px">&#xf03f;</i></span>
                </el-form-item>
                <el-form-item label="数据字段:">
                    <el-table :data="formData.dataFields" stripe border header-cell-class-name="th-style" max-height="445" width="100%">
                        <el-table-column property="name" label="名称" width="150"></el-table-column>
                        <el-table-column property="type" label="类型" width="200"></el-table-column>
                        <!--<el-table-column property="length" label="长度" width="200"></el-table-column>-->
                        <el-table-column property="desc" label="说明"></el-table-column>
                    </el-table>
                </el-form-item>
                <el-form-item label="服务预览:">
                    <el-table :data="formData.servicePreview" stripe border header-cell-class-name="th-style" max-height="445" width="100%">
                        <el-table-column v-for="item in colNames" :prop="item" :label="item"  :show-overflow-tooltip="true"></el-table-column>

                    </el-table>
                    <div style="margin-top: 20px;font-size: 12px;color: #E6A23C">注*数据预览只可查看50条数据！</div>
                </el-form-item>
                <el-form-item label="服务方式:">
                    <el-button @click="mysqldumpbtn(1)" :class="flag==1?'active':''"><i class="iconfont"
                                                                                        style="font-size: 12px;padding-right: 8px">&#xf033;</i>库表/视图
                    </el-button>
                    <el-button @click="filebtn(2)" :class="flag==2?'active':''"><i class="iconfont"
                                                                                   style="font-size: 12px;padding-right: 8px">&#xf034;</i>文件
                    </el-button>
                </el-form-item>
                <el-form-item label="" v-if="formData.isDelete === 1">
                    <span style="color: #ff7787;">该服务已被删除</span>
                </el-form-item>
                <!--文件下载-->
                <el-form-item label="" v-show="fileDownload" v-if="formData.status === 1 && formData.isDelete === 0">
                  <template v-if="formData.serviceFile !== undefined">
                    <span style="color: #606266;">{{formData.fileName}}.{{formData.fileFormat}}</span>
                    <a href="javascript:void(0);" @click="download" style="padding-left: 20px;color: #516BC0">下载</a>
                    <div style="font-size: 12px;color: #E6A23C">注*文件默认格式为utf-8</div>
                  </template>
                  <template v-else>
                    <span style="font-size: 12px;color: #E6A23C">文件生成中，请等待...</span>
                  </template>
                </el-form-item>
                <!--库表接口封装-->
                <div v-show="interfaceEncapsulation" class="encapsulation-detail"
                     v-if="formData.status === 1 && formData.isDelete === 0">
                    <el-form-item label="数据源名称:">
                        <el-input readonly v-model="formData.resName"></el-input>
                    </el-form-item>
                    <el-form-item label="数据源类型:">
                        <el-input readonly v-model="formData.dbTypeName"></el-input>
                    </el-form-item>
                    <el-form-item label="数据源地址:">
                        <el-input readonly v-model="formData.host"></el-input>
                    </el-form-item>
                    <el-form-item label="端口:">
                        <el-input readonly v-model="formData.port"></el-input>
                    </el-form-item>
                    <el-form-item label="数据库名称:">
                        <el-input readonly v-model="formData.databaseName"></el-input>
                    </el-form-item>
                    <el-form-item label="用户名:">
                        <el-input readonly v-model="formData.userName"></el-input>
                    </el-form-item>
                    <el-form-item label="密码:">
                        <el-input readonly v-model="formData.password"></el-input>
                    </el-form-item>
                    <el-form-item label="表/视图:">
                        <el-input readonly v-model="formData.tableName"></el-input>
                    </el-form-item>
                    <el-form-item label="数据字段:">
                        <el-table :data="formData.dataFields" stripe border header-cell-class-name="th-style" max-height="445" width="100%">
                            <el-table-column property="name" label="名称" width="150"></el-table-column>
                            <el-table-column property="type" label="类型" width="200"></el-table-column>
                            <!--<el-table-column property="length" label="长度" width="200"></el-table-column>-->
                            <el-table-column property="desc" label="说明"></el-table-column>
                        </el-table>
                        <el-button v-if="formData.isPackage === 0" v-on:click="encapsulation"
                                   type="primary" style="margin: 20px 0 0 0">接口封装
                        </el-button>
                        <el-button v-if="formData.isPackage === 1" type="primary"
                                   style="margin: 20px 0 0 0">接口已封装
                        </el-button>
                        <span v-if="formData.isPackage === 1" style="margin-left: 20px;font-size: 12px;color: #E6A23C">*如需重新封装，需到接口管理中，删除已经生成的接口。</span>
                    </el-form-item>
                    <!--点击进行接口封装-->
                    <div v-show="encapsulationSteps" class="interface-encapsulation">
                        <el-steps :active="steps" simple>
                            <el-step title="选择输出的列"></el-step>
                            <el-step title="选择参数定义"></el-step>
                            <el-step title="添加排序定义"></el-step>
                            <el-step title="添加分页属性"></el-step>
                            <el-step title="完成"></el-step>
                        </el-steps>
                        <template class="form-wrap">
                            <template v-if="steps === 1">
                                <el-form-item prop="outputValue" style="margin-top: 20px;">
                                    <el-transfer class="transfer" v-model="formData.outputValue" :data="formStrFields"
                                                 :titles="['选择输出列', '已选择列']" panelWidht="400" style="overflow-x: hidden">
                                      <span slot-scope="{option}" v-if="option.label !== null || option.label !== ''">
                                        <p :title="option.label" style="width: 120px;overflow: hidden;text-overflow: ellipsis;white-space:nowrap;">{{option.label}}</p>
                                      </span>
                                    </el-transfer>
                                </el-form-item>
                                <!--<el-form-item label="字段说明：" style="padding-top: 30px" prop="outputDescription">-->
                                    <!--<el-input placeholder="请输入" v-model="formData.outputDescription" style="width: 70%"></el-input>-->
                                <!--</el-form-item>-->
                            </template>
                            <template v-else-if="steps === 2">
                                <el-form-item prop="paramValue" style="margin-top: 20px">
                                    <el-transfer class="transfer" v-model="formData.paramValue" :data="formStrFields"
                                                 :titles="['选择参数列', '已选择参数']" panelWidht="400">
                                      <span slot-scope="{option}" v-if="option.label !== null || option.label !== ''">
                                        <p :title="option.label" style="width: 120px;overflow: hidden;text-overflow: ellipsis;white-space:nowrap;">{{option.label}}</p>
                                      </span>
                                    </el-transfer>
                                </el-form-item>
                                <!--<el-form-item label="字段说明：" style="padding-top: 30px" prop="paramDescription">-->
                                    <!--<el-input placeholder="请输入" v-model="formData.paramDescription" style="width: 70%"></el-input>-->
                                <!--</el-form-item>-->
                            </template>
                            <template v-else-if="steps === 3" style="margin-top: 20px">
                                <el-form-item style="margin-top: 20px" label="是否自定义排序？" prop="customSortRadio">
                                    <el-radio v-model="customSortRadio" label="true">是</el-radio>
                                    <el-radio v-model="customSortRadio" label="false">否</el-radio>
                                </el-form-item>
                                <template v-if="customSortRadio === 'true'">
                                    <el-form-item label="排序字段：" prop="customSortVaule">
                                        <el-select v-model="formData.customSortVaule" clearable
                                                   placeholder="请选择排序字段">
                                            <el-option v-for="item in formData.tableFields"
                                                       :key="item.name+';'+item.type+';'+item.length"
                                                       :label="item.name"
                                                       :value="item.name+';'+item.type+';'+item.length">
                                            </el-option>
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="排序规则：" prop="customSort">
                                        <el-select v-model="formData.customSort" clearable
                                                   placeholder="请选择排序规则">
                                            <el-option label="降序" value="desc"></el-option>
                                            <el-option label="升序" value="asc"></el-option>
                                        </el-select>
                                    </el-form-item>
                                </template>
                            </template>
                            <template v-else-if="steps === 4" style="margin-top: 20px">
                                <el-form-item style="margin-top: 20px" label="是否支持分页？" prop="pageRadio">
                                    <el-radio v-model="pageRadio" label="true">是</el-radio>
                                    <el-radio v-model="pageRadio" label="false">否</el-radio>
                                </el-form-item>
                                <el-form-item label="最小每页结果数：" v-if="pageRadio === 'true'" prop="minPage">
                                    <el-input placeholder="请输入" type='text' v-model.number="formData.minPage"
                                              prop="minPage"
                                              clearable></el-input>
                                </el-form-item>
                                <el-form-item label="最大每页结果数：" v-if="pageRadio === 'true'" prop="maxPage">
                                    <el-input placeholder="请输入" type='text' v-model.number="formData.maxPage"
                                              prop="maxPage"
                                              clearable></el-input>
                                </el-form-item>
                            </template>
                            <template v-else-if="steps === 5" style="margin-top: 20px">
                                <el-form-item>
                                    <div style="margin-top: 20px">状态</div>
                                    <div style="margin-top: 10px">接口封装已完成！请点完成按钮后查看接口信息。</div>
                                </el-form-item>
                            </template>
                            <el-form-item>
                                <el-button type="primary" v-if="steps > 1" @click="prevStep">上一步</el-button>
                                <el-button type="primary" @click="nextStep">{{getButtonTitle}}</el-button>
                            </el-form-item>
                            <div class="submit-box">
                            </div>
                        </template>
                    </div>
                    <!--接口已封装详情-->
                    <el-form-item v-show="formData.isPackage === 1" label="接口信息:">
                        <template>
                            <div class="ciDesc" v-html="formData.ciDesc"></div>
                            <div class="ciDesc" v-html="interfaceInfo"></div>
                        </template>
                    </el-form-item>
                </div>
            </el-form>
        </div>
      <!--服务项为空-->
      <div v-if="formData.deleteNum === 1">
        <el-form :model="formData" label-width="140px" label-position="right">
            <span style="color: #E6A23C">{{ formData.deleteMes }}</span>
        </el-form>
      </div>
    </div>
</template>


<script>
    import moment from "moment";
    import request from "@/libs/request";

    export default {
        name: "ResourceDetail",
        props: {
            formData: {
                type: Object,
                required: true
            }
        },
        watch: {
            formData(val, oldval) {
                if (val !== oldval) {
                    this.formData = this.formData;
                    if (this.formData.serviceTypeName === '库表/视图/文件') {
                      this.formStrFields = [];
                        this.colNames = this.formData.servicePreview.length ==0 ? null : Object.keys(this.formData.servicePreview[0]);
                        if(this.formData.status === 1){
                            let formStr = this.formData.dataFields;
                            if(formStr === null || formStr === "" || formStr === undefined) {
                              this.formStrFields = [];
                            }else {
                              this.formStrFields = formStr.map(item => {
                                return {
                                  key: `${item.name};${item.type};${item.length}`,
                                  label: `${item.name};${item.type};${item.length}`
                                }
                              })
                            }
                        }
                    }
                }
            }
        },
        computed: {
            getButtonTitle() {
                if (this.steps === 5) {
                    return "完成";
                } else {
                    return "下一步";
                }
            },
            rules() {
                var validatePass = (rule, value, callback) => {
                    if (this.formData.minPage >= this.formData.maxPage) {
                        callback(new Error('最小页结果数不能大于或等于最大页结果数'));
                    } else {
                        callback()
                    }
                };
                return {
                    outputValue: [
                        {required: true, message: "已选择输出列不能为空", trigger: "blur"}
                    ],
                    // outputDescription: [
                    //     {required: true, message: "字段说明不能为空", trigger: "blur"},
                    //     {max: 100, message: "字段说明不能超过100", trigger: "blur"}
                    // ],
                    paramValue: [
                        {required: true, message: "已选择参数不能为空", trigger: "blur"}
                    ],
                    // paramDescription: [
                    //     {required: true, message: "字段说明不能为空", trigger: "blur"},
                    //     {max: 100, message: "字段说明不能超过100", trigger: "blur"}
                    // ],
                    customSortVaule: [
                        {required: true, message: "选择排序字段不能为空", trigger: "change"}
                    ],
                    customSort: [
                        {required: true, message: "选择排序规则不能为空", trigger: "change"}
                    ],
                    minPage: [
                        {required: true, message: "最小每页结果数不能为空", trigger: "blur"},
                        {type: 'number', min: 1, message: '最小分页不能小于1', trigger: 'blur'},
                        {type: 'number', max: 99, message: '最大分页不能大于99', trigger: 'blur'}
                    ],
                    maxPage: [
                        {required: true, message: "最大每页结果数不能为空", trigger: "blur"},
                        {type: 'number', min: 2, message: '最大分页不能小于2', trigger: 'blur'},
                        {type: 'number', max: 100, message: '最小分页不能大于100', trigger: 'blur'},
                        {required: true, trigger: 'blur', validator: validatePass}
                    ],
                }
            }
        },
        data() {
            return {
                // 验证规则
                // rules: {
                // },
                flag: 1,
                centerDialogVisible: false, //apikey使用说明（弹框入口）
                interfaceDetail: false,//接口详情默认隐藏
                mysqldumpDetail: false,//文件/库表/视图查询详情默认隐藏
                interfaceEncapsulation: true,//接口封装默认显示
                fileDownload: false,//文件下载
                encapsulationSteps: false,//接口未封装
                interfaceIfn: false,//接口已封装详情
                steps: 1,//接口封装步骤默认1
                formStrFields: [],
                outputValue: [],//选择表输出的列
                outputDescription: '',//输出表字段的说明
                paramValue: [],//选择参数列
                paramDescription: '',//参数字段说明
                customSortVaule: '',//选择排序字段value
                customSort: '',//选择排序规则
                customSortRadio: 'true',//是否自定义排序默认值“1”，是支持自定义排序，单选
                customSortOptions: [],//排序字段选项卡
                pageRadio: 'true',//是否支持分页默认“1”，是支持分页，单选
                minPage: '',//最小显示页数
                maxPage: '',//最大显示页数
                active: 1,
                serviceDbId: "",//数据库ID
                interfaceInfo: "",
                colNames:[],
            }
        },
        updated(){
            $('.ciDesc table').css({
                'width': '100%',
                'border':'none'
            });
            $('.ciDesc table .wservice td').css({
                'background': '#EDF1F2',
                'font-weight': 'bold'
            });
            $('.ciDesc table tr td').css({
                'padding':'8px 0px 8px 10px',
                'border-left': '1px solid #EBEEF5',
                'border-bottom': '1px solid #EBEEF5',
            });
        },
        methods: {
            //下一步按钮事件
            nextStep() {
                const formBox = this.$refs.formBox;
                formBox.validate(async valid => {
                    if (valid) {
                        if (this.steps < 5) {
                            this.steps += 1;
                        } else {
                            this.encapsulationSteps = false;
                            this.interfaceIfn = true;
                            let params = {
                                "dbId": this.formData.serviceDbId,//数据库ID
                                "tableName": this.formData.tableName, //表名
                                "outputFields": this.formData.outputValue.toString(),//输出列
                                // "outputFieldsDesc": this.formData.outputDescription,//输出列说明
                                "paramFields": this.formData.paramValue.toString(),//参数列
                                // "paramFieldsDesc": this.formData.paramDescription,//参数说明
                                "isOrder": this.customSortRadio,//是否自定义排序
                                "isPage": this.pageRadio,//是否自定义分页
                                "maxsize": this.formData.maxPage,//最大分页数
                                "minsize": this.formData.minPage,//最小分页数
                                "orderFields": this.formData.customSortVaule + ';' + this.formData.customSort,//排序字段
                            }
                            request.post("/serviceitem/packagingInterface/createInterface", params, {
                                loading: true,
                                loadingTitle: "接口云封装中……"
                            }).then(res => {
                                if (res.status === 200) {
                                    this.interfaceInfo = res.interfaceInfo;
                                    this.formData.isPackage = 1;
                                } else {
                                  this.$message.error(res.message);
                                }
                            })
                        }
                    }
                })
            },
            //上一步按钮事件
            prevStep() {
                if (this.steps > 1) {
                    this.steps--;
                }
            },
            // 初始化步骤
            resetStep() {
                this.steps = 1;
            },
            //库表详情按钮
            mysqldumpbtn() {
                this.interfaceEncapsulation = true;
                this.fileDownload = false;
                this.flag = 1;
            },
            //文件下载按钮
            filebtn() {
                this.fileDownload = true;
                this.interfaceEncapsulation = false;
                this.flag = 2;
            },
            //接口封装和接口已封装
            encapsulation() {
                this.encapsulationSteps = true;
            },
            //订阅失败弹框
            resMes() {
                if(this.formData.resMessage === null || this.formData.resMessage === undefined || this.formData.resMessage === ""){
                    this.$alert('暂无驳回理由', '订阅失败',{
                        showConfirmButton:false,
                      callback: action => {
                      }
                    });
                }else {
                    this.$alert(this.formData.resMessage, '订阅失败',{
                        showConfirmButton:false,
                      callback: action => {
                      }
                    });
                }
            },
             apiImg() {
                // const APIKeyUrl = require('@/assets/apiDes.png');
                // this.$alert("<strong><img src=" + APIKeyUrl + " width=100% height=100%></strong>", '使用说明：', {
                //     dangerouslyUseHTMLString: true
                // });
                this.centerDialogVisible = true
            },
            download(){
                window.location.href = this.formData.downloadAddress;
            },
        }
    }
</script>

<style scoped lang="less">

    .active {
        background-color: #409EFF;
        color: #fff;
        border-radius: 3px;
        border: 1px solid #409EFF;
    }

    .file-download {
        padding: 0 20px;
    }

    .step1, .step2, .step3, .step4, .step5 {
        margin-top: 20px;
    }
    .ciService{
        width: 100%!important;
    }
    .ciDesc .ciService tr td{
        padding-left: 10px!important;
    }
</style>
