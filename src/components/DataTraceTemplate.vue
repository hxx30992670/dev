<template>
  <div >
    <div class="trace-box">
      <div class="item" v-for="(item,index) in formData">
        <p>{{item}}</p>
        <i slot="suffix" class="iconfont iconarrowDown" v-if="index < formData.length -1"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DataTrace",
  props: {
    formData: Array
  },
  data(){
    return {

    }
  },
  mounted(){
  },
  methods:{
    createFlowMap(){

    }
  }
}
</script>

<style scoped lang="less">
  .trace-box{
    width: 100%;
    .item{
      width: 400px;
      margin: 0 auto;
      text-align: center;
      p{
        background: #5C9CEC;
        color: #fff;
        height: 36px;
        text-align: center;
        line-height: 36px;
        border-radius: 12px;
      }
      i{
        color: #5C9CEC;
        font-size: 30px;
      }
    }
  }
</style>
