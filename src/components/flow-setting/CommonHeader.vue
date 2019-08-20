<template>
<div class="container">
  <p>{{title}}</p>
  <div class="button-box">
    <el-button type="info" @click="fullScreen">{{isFull ? '初始大小' : '全屏'}}</el-button>
    <el-button type="primary"  @click="saveSetting" :disabled="!isEdit" >保存</el-button>
    <el-button  @click="closePanel"> 关闭</el-button>
  </div>
</div>
</template>

<script>
import {mapState} from "vuex";
export default {
  name: "CommonHeader",
  props: {
    isEdit: {
      type: Boolean,
      default: true,
    },
    title: String
  },
  computed: {
    ...mapState(["isFullScreen"])
  },
  data () {
    return {
      isFull: false
    }
  },
  methods: {
    closePanel() {
      this.$emit("close-panel");
    },
    saveSetting() {
      this.$emit("save-setting");
    },
    fullScreen() {
      this.isFull = !this.isFull;
      let iWidth = $(".setting-panel").offsetParent().width();
      if(this.isFull) {
        this.$store.commit("changeFullScreen", true);
        $(".setting-panel").width(iWidth);
        $(".setting-panel").css("left",0);
      }else {
        $(".setting-panel").width("50%");
        $(".setting-panel").css("left",iWidth - $(".setting-panel").width() );
        this.$store.commit("changeFullScreen", false);
      }
    }
  }
}
</script>

<style scoped lang="less">
.container {
  height: 40px;
  padding: 0 15px;
  background: #edf1f2;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  p {
    color: #000;
  }

}
</style>
