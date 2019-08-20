<template>
<!--内容区域-->
<div class="content-wrap">
  <el-tabs type="card" v-model="activeTab" class="custom-tab">
    <el-tab-pane label="审核管理" name="file">
      <div>
      </div>
    </el-tab-pane>
  </el-tabs>
</div>
</template>

<script>
export default {
  name: "AuditManager",
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
