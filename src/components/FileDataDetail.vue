<template>
  <div class="container">
    <el-table :data="dataList" stripe border header-cell-class-name="th-style" max-height="400">

      <el-table-column label="姓名" prop="name" v-for="(item,index) in headerList" :label="item">
        <template slot-scope="scope">
          {{scope.row[index]}}
        </template>
      </el-table-column>
      <!--<el-table-column label="性别" prop="gender"></el-table-column>
      <el-table-column label="年龄" prop="age"></el-table-column>
      <el-table-column label="身份证号码" prop="code"></el-table-column>-->
    </el-table>
    <div class="tips">
      注*数据预览只可查看50条数据！
    </div>
  </div>
</template>

<script>
export default {
  name: "FileDataDetail",
  props: {
    headerList: Array,
    dataList: Array
  },
  data() {
    return {
      tableList: []
    }
  }
}
</script>

<style scoped lang="less">
.container {
  .tips {
    padding-top: 20px;
    color: #FF6600;
    font-size: 14px;
  }
}
</style>
