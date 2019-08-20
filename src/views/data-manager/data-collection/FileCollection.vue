<template>
<div class="content-wrap">
	<el-tabs type="card" v-model="activeTab" class="custom-tab">
		<el-tab-pane label="文件采集" name="file">
			<div class="content-box">
				<el-form :model="formData" :rules="rules" label-position="right" label-width="140px" ref="formBox">
					<el-form-item label="所属目录：" prop="beLongCatalog">
						<div class="form-row">
							<el-cascader
								:options="catalogList"
								v-model="formData.beLongCatalog"
								:show-all-levels="false"
								:props="defaultOption">
							</el-cascader>
							<p style="color: #999; display: flex; margin-left: 20px;">
								*无关联目录，请先
								<router-link class="tips" tag="span" style="cursor: pointer"
								             :to="{path:'/data-manager/dir-manager',query: {add:true}}">创建目录
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
					<el-form-item label="选择上传文件：">
						<div class="custom-upload" style="width: 60%; margin-bottom: 10px; display: flex; align-items: flex-end">
							<el-upload
								style="flex: 1"
								action="/api/collection/info/DataFile/uploadFileResource"
								:file-list="formData.uploadList"
								:show-file-list="true"
								:headers="getMt"
								:auto-upload="true"
								:before-upload="beforeUploadFile"
								:on-change="changeUploadFile"
								:on-remove="removeUploadFile"
								:multiple="false"
								:on-success="fileUploadSuccess"
								:on-progress="fileProgress"
								:on-error="fileUploadError"
								ref="upload">
								<!--<el-input v-model="fileName" style="margin-right: 20px"  placeholder="文件名" disabled></el-input>-->
								<div style="display: flex">
									<el-button size="small" type="primary" slot="trigger" :disabled="noOperation">选择文件</el-button>
									<p style="color: #E6A23C; margin-left: 20px;" slot="tip">*只能上传Csv和Excel（xls、xlsx）文件，大小不可超过20M</p>
								</div>
								<p v-if="noOperation" style="text-align: left; padding-top: 15px;"><span class="el-icon-loading"></span>文件解析中,请等待……
								</p>
							</el-upload>
							<div class="data-preview" style="margin-left: 20px; position: relative;
top: 2px;" v-if="formData.fileCatalog.length" @click="openDataPreview">
								数据预览
							</div>
						</div>
					</el-form-item>
					<el-form-item>
						<el-collapse-transition>
							<div style="padding-bottom: 20px;" class="file-catalog" v-if="formData.fileCatalog.length">
								<div class="custom-table" style="width: 70%">
									<table cellspacing="0" cellpadding="0" border="0">
										<thead>
											<th><span class="red">*</span>中文名称</th>
											<th><span class="red">*</span>英文名称</th>
											<th><span class="red">*</span>类型</th>
											<th><span class="red">*</span>说明(中文)</th>
										</thead>
										<tbody>
											<tr v-for="(item,index) in formData.fileCatalog" :key="item.id">
												<td>
													<el-form-item :prop="`fileCatalog.${index}.name`" :rules="fileCatalogRules.name"
													              :inline-message="false">
														<el-input v-model="item.name" placeholder="请输入" autocomplete="no"></el-input>
													</el-form-item>
												</td>
												<td>
													<el-form-item :prop="`fileCatalog.${index}.nameEng`" :rules="fileCatalogRules.nameEng"
													              :inline-message="false">
														<el-input v-model="item.nameEng" placeholder="请输入" autocomplete="no"></el-input>
													</el-form-item>
												</td>
												<td>
													<el-form-item>
														<el-select v-model="item.type" placeholder="请选择">
															<el-option label="Bigint" :value="1"></el-option>
															<el-option label="Varchar" :value="2"></el-option>
															<el-option label="Double" :value="3"></el-option>
															<el-option label="Datetime" :value="4"></el-option>
															<el-option label="time" :value="41"></el-option>
															<el-option label="date" :value="43"></el-option>
														</el-select>
													</el-form-item>
												</td>
												<td>
													<el-form-item :prop="`fileCatalog.${index}.description`" :rules="fileCatalogRules.description"
													              :inline-message="false">
														<el-input v-model="item.description" placeholder="请输入" autocomplete="no"></el-input>
													</el-form-item>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
								<p style="color: #666666">注：字段类型默认Varchar，如修改与源文件不符可能会造成文件采集失败。</p>
							</div>
						</el-collapse-transition>
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
					<div class="submit-box">
						<el-button type="primary" @click="saveSubmit">提交</el-button>
						<!--<el-button class="cancel-btn">取消</el-button>-->
					</div>
				</el-form>
			</div>
		</el-tab-pane>
	</el-tabs>
	<el-dialog
		:visible.sync="fileDetailShow"
		width="60%" title="数据预览" custom-class="dialog-box"
		:close-on-click-modal="false"
		:close-on-press-escape="false">
		<file-detail
			v-if="fileDetailShow"
			:header-list="this.previewHeader"
			:data-list="this.previewData"
		/>
	</el-dialog>
</div>
</template>

<script>
import request from "@/libs/request.js";
import LocalSave from "@/libs/LocalSave.js";
import FileDetail from "@/components/FileDataDetail.vue";

export default {
	name: "FileCollection",
	components: {
		FileDetail
	},
	computed: {
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

	},
	data() {
		const validName = (rule, value, callBack) => {
			if (value === "") {
				callBack(new Error("中文名称不能为空"));
			} else {
				let re = /^[^\s]+$/g;
				if (re.test(value)) {
					if (value.length > 64) {
						callBack(new Error("中文名称长度不能超过64"));
					} else {
						callBack();
					}
				} else {
					callBack(new Error("中文名称不能有空格"));
				}
			}
		};
		const validNameEnglish = (rule, value, callBack) => {
			if (value === "") {
				callBack(new Error("英文名称不能为空"));
			} else {
				let re = /^[a-zA-Z_0-9]+$/g;
				if (re.test(value)) {
					if (value.length > 64) {
						callBack(new Error("英文名称长度不能超过64"));
					} else {
						callBack();
					}
				} else {
					callBack(new Error("英文名称只能是英文字母或者英文字母加下划线或者数字"));
				}
			}
		};
		const validDesc = (rule, value, callBack) => {
			if (value === "") {
				callBack(new Error("说明不能为空"));
			} else {
				let re = /^[^\s]+$/g;
				if (re.test(value)) {
					if (value.length > 100) {
						callBack(new Error("说明长度不能超过100"));
					} else {
						callBack();
					}
				} else {
					callBack(new Error("说明不能有空格"));
				}
			}
		}
		const repeatName = async (rule, value, callBack) => {
			let {status} = await request.post("/collection/info/Data/selectDataByName", {
				name: value,
			});
			if (status === 200) {
				callBack();
			} else {
				callBack(new Error("数据名称已经存在"));
			}
		}
		return {
			fileDetailShow: false,
			noOperation: false,
			progressStatus: "text",
			loaderBytes: 0,
			fileStatus: false,
			currentFile: null,
			uniqueIdentifier: "",
			defaultOption: {
				value: "id",
				label: "name",
				children: "childNode"
			},
			breadcrumbList: [],
			activeTab: "file",
			catalogList: [],
			previewData: [],
			previewHeader: [],
			formData: {
				sufixName: "",
				file: null,
				fileAddress: "",
				fileName: "",
				beLongCatalog: [], // 选择目录
				uploadList: [], //上传文件列表
				dataName: "", //数据名称
				dataDescription: "", //数据描述
				dataUse: "", //数据用途
				fileCatalog: [],
				dataSource: ""
			},
			rules: {
				beLongCatalog: [
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
			},
			fileCatalogRules: {
				name: [
					{validator: validName, trigger: "blur"}
					/*{required: true, message: "中文名称不能为空", trigger: "blur"},
					{pattern: /^[^\s]+$/g,message: "中文名称不能包含空格", trigger: "blur"},
					{max: 20, message: "中文名称长度不能超过20",trigger: "blur"}*/
				],
				nameEng: [
					{validator: validNameEnglish, trigger: "blur"}
					/*{required: true, message: "英文名称不能为空", trigger: "blur"},
					{pattern: /^[a-zA-Z_]+$/, message: "英文名称必须为英文或者英文加下划线", trigger: "blur"},
					{max: 20, message: "英文名称长度不能超过20", trigger: "blur"}*/
				],
				description: [
					/*{required: true, message: "说明不能为空", trigger: "blur"},
					{pattern: /^[^\s]+$/, message: "说明不能有空格", trigger: "blur"},
					{max: 50, message: "说明长度不能超过50", trigger: "blur"}*/
					{validator: validDesc, trigger: "blur"}
				]
			}
		}
	},
	created() {
		this.getCatalogList();
	},
	mounted() {
		console.log(1);
	},
	methods: {
		//打开数据预览
		openDataPreview() {
			this.fileDetailShow = true;
		},
		fileProgress(event, file, fileList) {
			if (event.loaded === event.total) {
				this.noOperation = true;
			}
		},
		fileUploadError(err, file, fileList) {
			this.$refs.upload.clearFiles();
		},
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
		beforeUploadFile(file) { //上传前检查文件类型大小
			console.log(file);
			const maxSize = 1024 * 1024 * 20;
			let nameArr = file.name.split(".");
			let sufixName = nameArr[nameArr.length - 1];
			if (sufixName.toUpperCase() === "CSV" || sufixName.toUpperCase() === "XLSX" || sufixName.toUpperCase() === "XLS") {
				if (file.size > maxSize) {
					this.$message.warning("文件超出大小限制");
					return false;
				} else {
					return true;
				}
				return true;
			} else {
				this.$message.warning("不支持的文件类型");
				return false;
			}
		},
		//选择、改变上传文件时钩子函数
		changeUploadFile(file, fileList) {
			//const maxSize = 1024 * 1024 * 20;
			let nameArr = file.name.split(".");
			let sufixName = nameArr[nameArr.length - 1];
			nameArr.pop();
			console.log(nameArr);
			if (fileList.length > 1) {
				fileList.splice(0, 1);
			}
			this.formData.uploadList = fileList;
			this.formData.file = file;
			this.formData.dataName = nameArr.join(".");
			this.formData.sufixName = sufixName;
			this.formData.fileName = file.name;
		},
		fileUploadSuccess(res, file, filelist) { //文件选择成功发送服务器回函数
			if (res.status === 200) {
				this.formData.fileCatalog = res.data.directoryEntityList.map(item => {
					item.nameEng = item.nameEng ? item.nameEng : "";
					item.type = 2;
					item.length = 500;
					return item;
				});
				this.formData.file = file;
				this.formData.fileAddress = res.data.address;
				if(res.data.previewData) {
					this.previewHeader = res.data.previewData[0];
					this.previewData = res.data.previewData.slice(1);
					console.log(this.previewHeader)
					console.log(this.previewData)
				} else {
					this.previewHeader = [];
					this.previewData = [];
				}

			} else {
				this.$refs.upload.clearFiles();
				this.formData.fileCatalog = [];
				this.formData.file = null;
				this.formData.fileAddress = "";
				this.$message.warning(res.message);
			}
			this.noOperation = false;
		},
		removeUploadFile(file) { //移除上传文件
			if (this.noOperation) {
				this.$message.warning("文件正在解析中，禁止删除文件");
				return;
			}
			this.formData.fileCatalog = [];
			this.formData.file = null;
			this.formData.fileAddress = "";
		},
		saveSubmit() { //保存文件采集
			const formBox = this.$refs.formBox;
			formBox.validate(async valid => {
				if (valid) {
					if (!this.formData.file) {
						this.$message.warning("没有选择文件");
						return false;
					} else {
						if (!this.formData.fileCatalog.length) {
							this.$message.warning("请等待文件解析成功");
						}
						try {
							this.formData.fileCatalog = this.formData.fileCatalog.map(item => {
								item.rootId = this.formData.beLongCatalog[0];
								item.subId = this.formData.beLongCatalog[1];
								return item;
							});
							let result = await request.post("/collection/info/DataFile/insert", {
								address: this.formData.fileAddress,
								dataName: this.formData.dataName,
								dataSource: this.formData.dataSource,
								description: this.formData.dataDescription,
								format: this.formData.sufixName,
								name: this.formData.fileName,
								purpose: this.formData.dataUse,
								rootId: this.formData.beLongCatalog[0],
								subId: this.formData.beLongCatalog[1],
								metaInsertParam: this.formData.fileCatalog
							}, {loading: true});
							if (result.status === 200) {
								this.$message.success("保存数据成功");
								this.$router.push("/data-manager/data-list");
								/*this.getCatalogList();
								this.$refs.upload.clearFiles();
								this.$refs.formBox.resetFields();
								this.formData.fileCatalog = [];*/
							} else {
								this.$message.warning(result.message);
							}
						} catch (e) {

						}
					}
				} else {
					this.$message.warning("请完善必填字段");
				}
			})
		}
	},
}
</script>

<style lang="less">
.data-preview {
	width: 88px;
	height: 28px;
	line-height: 28px;
	text-align: center;
	border-radius: 2px;
	font-size: 13px;
	color: #ff6600;
	background: #fff2ea;
	cursor: pointer;
}
.uploader-btn {
	border-radius: 20px !important;
	background: #2F91D8 !important;
	color: #fff !important;
	border: none !important;
	padding: 8px 16px !important;
}

.file-catalog .el-form-item__content {
	margin-left: 0 !important;
}

.file-catalog .el-form-item {

}

.file-list {
	width: 50%;
	padding-top: 20px;

	.file-name {
		width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.main-content {
		display: flex;
		align-items: center;

		.progress {
			flex: 1 1 auto;
		}
	}
}
</style>
