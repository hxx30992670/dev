<template>
<!--内容区域-->
<div class="content-wrap">
  <el-tabs type="card" v-model="activeTab" class="custom-tab">
    <el-tab-pane label="数据可视化" name="file">
      <div>
      </div>
    </el-tab-pane>
  </el-tabs>
</div>
</template>

<script>
export default {
  name: "DataVisualization",
  data() {
    return {
      breadcrumbList: [],
      activeTab: "file"
    }
  },
  created() {
    this.createBreadCrumb();
  },
  methods: {
    createBreadCrumb() {
      let navList = this.$route.meta.nav;
      this.breadcrumbList = navList;
    }
  }
}
</script>

<style scoped>

</style>
