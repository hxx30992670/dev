<template>
  <div class="report-wrap">
    <template v-if="formData.isEdit || formData.isEmpty">
      <h2 style="text-align: center; color: #999; width: 100%;">暂无数据</h2>
    </template>
    <template v-else>
      <div class="left">
        <div class="round" :class="getStyle">
          <p class="status-ball-num">{{formData.score}}</p>
          <p v-if="formData.score > 80">好</p>
          <p v-else-if="formData.score <= 80 && formData.score >= 60">一般</p>
          <p v-else>差</p>
        </div>
        <div class="title">质量评分</div>
      </div>
      <div class="right">
        <div class="row">
          <p>完整性：<span>{{formData.wz}}</span></p>
        </div>
        <div class="row">
          <p>唯一性：<span>{{formData.wy}}</span></p>
        </div>

        <div class="row">
          <p>有效性：<span>{{formData.yx}}</span></p>
          <!--<p>合规性：<span>{{formData.hg}}</span></p>-->
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import request from "@/libs/request";
export default {
  name: "QualityReport",
  props: {
    formData: Object
  },
  updated(){

  },
  computed: {
    getStyle(){
      if(this.formData.score > 80){
        return "green";
      }else if(this.formData.score >= 60 && this.formData.score <=80 ){
        return "blue"
      }else if(this.formData.score < 60){
        return "red";
      }else{
        return "";
      }
    }
  },
  created() {
    console.log(this.formData);
  },
  methods: {

  }
}
</script>

<style scoped lang="less">
  .report-wrap{
    width: 100%;
    display: flex;
    padding: 10px 10px;
    box-sizing: border-box;
    align-items: center;
    justify-content: space-between;
    .left{
      width: 50%;
      height: 100%;
      .title{
        padding-top: 20px;
        width: 100px;
        margin: 0 auto;
        text-align: center;
        font-weight: bold;
      }
      .round{
        margin: 0 auto;
        width: 120px;
        height: 120px;
        border: 1px solid #000;
        border-radius: 50%;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        &.green{
          border: 2px solid #27CA8E;
          color: #27CA8E;
          background-color: rgb(240, 249, 235);
        }
        &.blue{
          border: 2px solid #F4AB37;
          color: #F4AB37;
          background-color: rgb(253, 246, 236);
        }
        &.red{
          border: 2px solid #F56C86;
          color: #F56C86;
          background-color: rgb(254, 240, 240);
        }
      }
    }
    .right{
      height: 100%;
      width: 50%;
      .row{
        width: 100%;
        padding: 10px 10px;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        p{
          font-weight: bold;
          span{
            font-weight: normal;
          }
        }
      }
    }
  }

  .status-ball-num {
    font-size: 30px;
  }
</style>
