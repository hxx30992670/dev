<template>
  <div class="run-result">
    <div class="table-box">
      <h4 class="title">目的表数据字段：</h4>
      <el-table width="100%" :data="databaseRunResult.tableColumn" stripe border header-cell-class-name="th-style" max-height="350">
        <el-table-column label="名称" prop="name"></el-table-column>
        <el-table-column label="类型" prop="type"></el-table-column>
        <!--<el-table-column label="长度" prop="length">
          <template slot-scope="scope">
            <span v-if="scope.row.length">{{scope.row.length}}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>-->
        <el-table-column label="说明" prop="description"></el-table-column>
      </el-table>
    </div>
    <div class="table-box two">
      <h4 class="title">目的表结果预览：</h4>
      <el-table width="100%" :data="databaseRunResult.tableResult" stripe border header-cell-class-name="th-style" max-height="350">
        <el-table-column :label="item" :prop="item" v-for="item in columnList"></el-table-column>
      </el-table>
    </div>
    <p class="tips">注*数据预览只可查看50条数据！</p>
  </div>
</template>

<script>
  import {mapState} from "vuex";
  export default {
    name: "DataBaseTable",
    computed: {
      ...mapState(["databaseRunResult"]),
      columnList(){
        if(this.databaseRunResult.tableResult.length){
          return Object.keys(this.databaseRunResult.tableResult[0]);
        }
      }
    }
  }
</script>

<style scoped lang="less">
  .run-result{
    .table-box{
      &.two{
        padding-top: 30px;
      }
      .title{
        padding-bottom: 10px;
      }
    }
    .tips{
      padding-top: 20px;
      color: #FF6600;
    }
  }
</style>
