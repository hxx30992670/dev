<template>
  <el-dialog
    :visible.sync="dataDetailDialog"
    :title="dialogTitle"
    custom-class="dialog-box"
    :close-on-click-modal="false"
  >
    <div>
      <el-form :model="formData" label-width="140px" label-position="right">
        <el-form-item label="数据名称：">
          <el-input readonly v-model="formData.name" style="width: 90%"></el-input>
          <!--<p>{{formData.name}}</p>-->
        </el-form-item>
        <el-form-item label="数据描述：">
          <el-input readonly v-model="formData.description" style="width: 90%"></el-input>
          <!--<p>{{formData.description}}</p>-->
        </el-form-item>
        <el-form-item label="数据用途：">
          <el-input readonly v-model="formData.dataUse" style="width: 90%"></el-input>
          <!--<p>{{formData.dataUse}}</p>-->
        </el-form-item>
        <el-form-item label="所属系统：">
          <el-input readonly v-model="formData.dataSource" style="width: 90%"></el-input>
          <!--<p>{{formData.dataSource}}</p>-->
        </el-form-item>
        <el-form-item label="数据类型：" v-if="formData.dataType === 1">
          <el-input readonly value="文件" style="width: 90%"></el-input>
        </el-form-item>
        <el-form-item label="数据类型：" v-if="formData.dataType === 2">
          <el-input readonly value="接口" style="width: 90%"></el-input>
        </el-form-item>
        <el-form-item label="数据类型：" v-if="formData.dataType === 3">
          <el-input readonly value="库表" style="width: 90%"></el-input>
        </el-form-item>
        <!--<el-form-item label="数据类型：">
          <p v-if="formData.dataType === 1">文件</p>
          <p v-else-if="formData.dataType === 2">接口</p>
          <p v-else-if="formData.dataType === 3">库表</p>
        </el-form-item>-->
        <el-form-item label="所属目录：">
          <el-input readonly v-model="formData.rootSubName" style="width: 90%"></el-input>
          <!--<p>{{formData.rootSubName}}</p>-->
        </el-form-item>
        <template v-if="formData.dataType !== 2">
          <el-form-item label="数据储存条数：" v-if="formData.syncNum!==0">
            <el-input readonly v-model="formData.syncNum" style="width: 90%"></el-input>
            <!--{{formData.syncNum}}-->
          </el-form-item>
          <el-form-item label="数据储存条数：" v-if="formData.syncNum===0 && formData.dataType === 1">
            <!--<el-input readonly v-model="formData.rootSubName + '(文件入库失败，请先删除该条数据，并重新采集)'" style="width: 90%; color: #FF7D27" v-if="formData.fileStatus === 2"></el-input>
            <el-input readonly v-model="formData.syncNum + '(文件入库中)'" style="width: 90%; color: #669933" v-else-if="formData.fileStatus === 0"></el-input>-->
            <p
              style="color: #FF7D27"
              v-if="formData.fileStatus === 2"
            >{{formData.syncNum}}(文件入库失败，请先删除该条数据，并重新采集)</p>
            <p
              style="color: #669933"
              v-else-if="formData.fileStatus === 0"
            >{{formData.syncNum}}(文件入库中)</p>
          </el-form-item>
          <el-form-item label="数据储存条数：" v-if="formData.syncNum===0 && formData.dataType === 3">
            <!--<el-input readonly v-model="formData.syncNum + '(该库表数据对应同步过程未启动或启动失败)'" style="width: 90%; color: #FF7D27" ></el-input>-->
            <p style="color: #FF7D27">{{formData.syncNum}}(该库表数据对应同步过程未启动或启动失败)</p>
          </el-form-item>
        </template>
        <template v-if="formData.dataType !== 2">
          <el-form-item label="数据储存量：">
            <el-input readonly v-model="formData.saveNum + '(B)'" style="width: 90%"></el-input>
            <!--<p>{{formData.saveNum}}(B)</p>-->
          </el-form-item>
        </template>
        <el-form-item label="创建时间：">
          <el-input readonly v-model="formData.createTime" style="width: 90%"></el-input>
          <!--<p>{{formData.createTime}}</p>-->
        </el-form-item>
        <template v-if="formData.dataType === 1">
          <el-form-item label="文件格式：">
            <el-input readonly v-model="formData.fileFormat" style="width: 90%"></el-input>
            <!--<p>{{formData.fileFormat}}</p>-->
          </el-form-item>
          <el-form-item label="文件：">
            <el-input readonly v-model="formData.fileName" style="width: 90%"></el-input>
            <!--<p>{{formData.fileName}}</p>-->
          </el-form-item>
          <el-form-item label="数据字段：">
            <el-table stripe border header-cell-class-name="th-style" :data="formData.metaList">
              <el-table-column label="中文名称" prop="name"></el-table-column>
              <el-table-column label="英文名称" prop="nameEng"></el-table-column>
              <el-table-column label="类型" prop="dataType"></el-table-column>
              <!--<el-table-column label="长度" prop="length">
                <template slot-scope="scope">
                  <span v-if="scope.row.length === 0">-</span>
                  <span v-else>{{scope.row.length}}</span>
                </template>
              </el-table-column>-->
              <el-table-column label="描述" prop="description"></el-table-column>
            </el-table>
          </el-form-item>
        </template>
        <template v-if="formData.dataType === 2">
          <el-form-item label="接口地址：">
            <el-input readonly v-model="formData.address" style="width: 90%"></el-input>
            <!--<p>{{formData.address}}</p>-->
          </el-form-item>
          <el-form-item label="返回格式：">
            <el-input
              readonly
              v-model="formData.responseType === 1 ? 'json':'xml'"
              style="width: 90%"
            ></el-input>
            <!--<p>{{formData.responseType === 1 ? 'JSON' : 'XML'}}</p>-->
          </el-form-item>
          <el-form-item label="请求方式：">
            <el-input
              readonly
              v-model="formData.requestMode === 1 ? 'get':'post'"
              style="width: 90%"
            ></el-input>
            <!--<p>{{formData.requestMode === 1 ? 'GET':'POST'}}</p>-->
          </el-form-item>
          <el-form-item label="请求参数说明：">
            <el-table :data="formData.requsetParam" stripe border header-cell-class-name="th-style">
              <el-table-column label="名称" prop="name"></el-table-column>
              <el-table-column label="必填">
                <template slot-scope="scope">
                  <span>{{scope.row.must ? '是' : '否'}}</span>
                </template>
              </el-table-column>
              <el-table-column label="类型" prop="type">
                <template slot-scope="scope">
                  <span v-if="scope.row.type === 1">BigInt</span>
                  <span v-if="scope.row.type === 2">Varchar</span>
                  <span v-if="scope.row.type === 3">Double</span>
                  <span v-if="scope.row.type === 4">Datetime</span>
                </template>
              </el-table-column>
              <el-table-column label="说明" prop="desc"></el-table-column>
            </el-table>
          </el-form-item>
          <el-form-item label="返回参数说明：">
            <el-table
              :data="formData.responseParam"
              stripe
              border
              header-cell-class-name="th-style"
            >
              <el-table-column label="名称" prop="name"></el-table-column>
              <el-table-column label="类型" prop="type">
                <template slot-scope="scope">
                  <span v-if="scope.row.type === 1">BigInt</span>
                  <span v-if="scope.row.type === 2">Varchar</span>
                  <span v-if="scope.row.type === 3">Double</span>
                  <span v-if="scope.row.type === 4">Datetime</span>
                </template>
              </el-table-column>
              <el-table-column label="说明" prop="description"></el-table-column>
            </el-table>
          </el-form-item>
          <el-form-item label="错误说明：">
            <el-table :data="formData.errorCode" stripe border header-cell-class-name="th-style">
              <el-table-column label="名称" prop="name"></el-table-column>
              <el-table-column label="说明" prop="desc"></el-table-column>
            </el-table>
          </el-form-item>
          <el-form-item label="调用示例：">
            <el-input
              readonly
              v-model="formData.requsetDemo"
              type="textarea"
              :rows="5"
              style="width: 90%"
            ></el-input>
            <!--<p style="max-height: 200px; overflow-y: auto; border: 1px dotted #999; padding: 10px;">{{formData.requsetDemo}}</p>-->
          </el-form-item>
          <el-form-item label="返回示例：">
            <el-input
              readonly
              v-model="formData.responseDemo"
              type="textarea"
              :rows="5"
              style="width: 90%"
            ></el-input>
            <!--<p style="max-height: 200px; overflow-y: auto; border: 1px dotted #999; padding: 10px;">{{formData.responseDemo}}</p>-->
          </el-form-item>
        </template>
        <template v-if="formData.dataType === 3">
          <el-form-item label="源数据库：">
            <el-input readonly v-model="formData.dbname" style="width: 90%"></el-input>
            <!--<p>{{formData.dbname}}</p>-->
          </el-form-item>
          <el-form-item label="源表：">
            <el-input readonly v-model="formData.sourceTable" style="width: 90%"></el-input>
            <!--<p>{{formData.sourceTable}}</p>-->
          </el-form-item>
          <el-form-item label="同步策略：">
            <el-input readonly v-model="formData.syncStrategy" style="width: 90%"></el-input>
            <!--<p>{{formData.syncStrategy}}</p>-->
          </el-form-item>
          <el-form-item label="同步类型：">
            <el-input readonly v-model="formData.dbtype === 1?'全量同步':'增量同步'" style="width: 90%"></el-input>
            <!--<p>{{formData.dbtype === 1?'全量同步':'增量同步'}}</p>-->
          </el-form-item>
          <el-form-item label="最后更新时间：">
            <el-input readonly v-model="formData.updateTime" style="width: 90%"></el-input>
          </el-form-item>
          <el-form-item label="数据字段：">
            <el-table stripe border header-cell-class-name="th-style" :data="formData.metaList">
              <el-table-column label="中文名称" prop="name"></el-table-column>
              <el-table-column label="英文名称" prop="nameEng"></el-table-column>
              <el-table-column label="类型" prop="dataType"></el-table-column>
              <!--<el-table-column label="长度">
                <template slot-scope="scope">
                  <span v-if="scope.row.length === 0">-</span>
                  <span v-else>{{scope.row.length}}</span>
                </template>
              </el-table-column>-->
              <el-table-column label="描述" prop="description"></el-table-column>
            </el-table>
          </el-form-item>
        </template>
      </el-form>
      <div class="error-tips" v-if="formData.error">文件解析失败</div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "DataDetail",
  props: {
    dialogTitle: {
      type: String,
      default: "数据详情"
    },
    formData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      dataDetailDialog: false
    };
  }
};
</script>

<style scoped lang="less">
.form-wrap {
  position: relative;

  .error-tips {
    color: #ff7d27;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    border: 1px solid #ff7d27;
    line-height: 150px;
    text-align: center;
    position: absolute;
    top: 60px;
    font-size: 20px;
    left: 400px;
    transform: rotateZ(-45deg);
  }
}
</style>
