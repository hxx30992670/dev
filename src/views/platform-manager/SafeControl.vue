<template>
<!--内容区域-->
<div class="content-wrap">
  <el-tabs type="card" v-model="activeTab" class="custom-tab">
    <el-tab-pane label="安全管控" name="file">
      <div>
      </div>
    </el-tab-pane>
  </el-tabs>
</div>
</template>

<script>
export default {
  name: "SafeControl",
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
