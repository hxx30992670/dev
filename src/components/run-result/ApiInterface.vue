<template>
  <div class="run-result">
    <el-form :model="interfaceRunResult" label-position="left">
      <el-form-item label="接口地址：">
        <p>{{interfaceRunResult.address}}</p>
      </el-form-item>
      <el-form-item label="返回格式：">
        <p>{{interfaceRunResult.format}}</p>
      </el-form-item>
      <el-form-item label="请求方式：">
        <p>{{interfaceRunResult.method}}</p>
      </el-form-item>
      <el-form-item label="接口描述：">
        <p>{{interfaceRunResult.description}}</p>
      </el-form-item>
      <el-form-item label="请求参数说明：">
        <div class="info-box">
          <el-table :data="interfaceRunResult.requestParams" stripe border header-cell-class-name="th-style" max-height="300">
            <el-table-column label="序号" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="name"></el-table-column>
            <el-table-column label="是否必填">
              <template slot-scope="scope">
                <span v-if="scope.row.must === 1">是</span>
                <span v-else>否</span>
              </template>
            </el-table-column>
            <el-table-column label="类型">
              <template slot-scope="scope">
                <el-select v-model="scope.row.type" placeholder="请选择" disabled>
                  <el-option label="BigInt" :value="1"></el-option>
                  <el-option label="Varchar" :value="2"></el-option>
                  <el-option label="Datetime" :value="3"></el-option>
                  <el-option label="Double" :value="4"></el-option>
                  <el-option label="Array" :value="5"></el-option>
                  <el-option label="Object" :value="6"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="说明" prop="desc"></el-table-column>
          </el-table>
        </div>
      </el-form-item>
      <el-form-item label="返回参数说明：">
        <div class="info-box">
          <el-table :data="interfaceRunResult.responseParams" stripe border header-cell-class-name="th-style" max-height="300">
            <el-table-column label="序号" type="index"></el-table-column>
            <el-table-column label="中文名称" prop="name"></el-table-column>
            <el-table-column label="英文名称" prop="nameEng"></el-table-column>
            <el-table-column label="类型">
              <template slot-scope="scope">
                <el-select v-model="scope.row.type" placeholder="请选择" disabled>
                  <el-option label="BigInt" :value="1"></el-option>
                  <el-option label="Varchar" :value="2"></el-option>
                  <el-option label="Datetime" :value="3"></el-option>
                  <el-option label="Double" :value="4"></el-option>
                  <el-option label="Array" :value="5"></el-option>
                  <el-option label="Object" :value="6"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <!--<el-table-column label="长度" prop="length">
              <template slot-scope="scope">
                <span v-if="scope.row.length">{{scope.row.length}}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>-->
            <el-table-column label="说明" prop="description"></el-table-column>
          </el-table>
        </div>
      </el-form-item>
      <el-form-item label="错误码说明：">
        <div class="info-box">
          <el-table :data="interfaceRunResult.errorCode" stripe border header-cell-class-name="th-style" max-height="300">
            <el-table-column label="序号" type="index"></el-table-column>
            <el-table-column label="错误码名称" prop="name"></el-table-column>
            <el-table-column label="错误码说明" prop="desc"></el-table-column>
          </el-table>
        </div>
      </el-form-item>
      <el-form-item label="请求示例：">
        <el-input type="textarea" v-model="interfaceRunResult.requestDemo" rows="5"></el-input>
      </el-form-item>
      <el-form-item label="返回示例：">
        <el-input type="textarea" v-model="interfaceRunResult.responseDemo" rows="5"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import {mapState} from "vuex";
  export default {
    name: "ApiInterface",
    computed: {
      ...mapState(["interfaceRunResult"])
    }
  }
</script>

<style scoped lang="less">

</style>
