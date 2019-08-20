<template>
<div class="container">
  <div class="main">
    <div class="row">
      <h3 class="title">{{serviceData.serviceName}}</h3>
    </div>
    <div class="row">
      <div class="create-time">
        <span>创建时间：</span>
        <span>{{getTime(serviceData.createTime)}}</span>
      </div>
      <div class="last-update-time">
        <span>最后更新时间：</span>
        <span>{{getTime(serviceData.updateTime)}}</span>
      </div>
    </div>
    <div class="row">
      <div class="service-status">
        <span>服务状态：</span>
        <span>{{serviceData.serviceStatus}}</span>
      </div>
      <div class="service-theme">
        <span>服务主题：</span>
        <span>{{serviceData.serviceTopic}}</span>
      </div>
      <div class="service-detail">
        <span>服务详情：</span>
        <el-button type="text" @click="showServiceMethod">{{showService ? '隐藏' : '查看'}}</el-button>
      </div>
    </div>
  </div>
  <transition name="service">
	  <div class="service-wrap" v-if="showService">
		  <div class="item" v-for="(item,index) in serviceData.serviceItemDetailList" :key="index">
			  <el-popover
				  placement="top"
				  trigger="click"
				  popper-class="custom-popover"
			  >
				  <div class="pop-info">
					  <div class="main">
						  <div class="row">
							  <p class="title-name">类型：</p>
							  <p class="text">{{item.type}}</p>
						  </div>
						  <div class="row">
							  <p class="title-name">说明：</p>
							  <p class="text">{{item.name}}</p>
						  </div>
						  <div class="row">
							  <p class="title-name">长度：</p>
							  <p class="text">{{item.length}}</p>
						  </div>
					  </div>
				  </div>
				  <el-button slot="reference">{{item.name}}</el-button>
			  </el-popover>
		  </div>
	  </div>
  </transition>
</div>
</template>

<script>
import moment from "moment";
export default {
	name: "ServiceCatalog",
	props: {
		serviceData: Object
	},
	mounted() {
	},
  data() {
    return {
      showService: false,
    }
  },
  methods: {
    showServiceMethod() {
			if(this.serviceData && this.serviceData.serviceItemDetailList && this.serviceData.serviceItemDetailList.length) {
				this.showService = !this.showService;
			}else {
				this.$message.warning('无数据');
			}
      
		},
		getTime(val) {
			return moment(val).format("YYYY-MM-DD HH:mm:ss");
		}
  }
}
</script>

<style scoped lang="less">
.container {
	padding-top: 30px;
  border-bottom: 3px solid #ccc ;
  .main {
    .row {
      display: flex;
      justify-content: space-between;
      padding: 0 20px 20px;
    }
  }
  .service-wrap {
    display: grid;
    grid-template-columns: repeat(5,1fr);
    grid-gap: 20px;
    padding: 20px;
    border-top: 3px solid #ccc;
    .item {
      font-size: 20px;
	    /deep/ .el-button {
		    background: #f9f9f9;
		    width: 100%;
	    }
    }
  }
}
.custom-popover{
  .pop-info {
    width: 300px;
    .title {
      height: 30px;
      line-height: 30px;
      text-align: center;
      color: #fff;
      background: #5c9cec;
    }
    .main {
      padding: 20px 20px 0;
      .row {
        padding-bottom: 15px;
        display: flex;
        align-items: flex-start;
        .title-name {
        }
        .text {
          flex: 1;
	        margin-left: 15px;
        }
      }
    }
  }
}
.service-enter {
	opacity: 0;
}
.service-enter-to {
	opacity: 1;
}
.service-enter-active {
	transition: .6s;
}
/*.service-leave {
	opacity: 1;
}
.service-leave-to {
	opacity: 0;
}
.service-leave-active {
	transition: .6s;
}*/


</style>