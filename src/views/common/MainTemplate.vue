<template>
  <el-container class="main-wrap"
    v-loading="loading"
    :element-loading-text="loadingTitle"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <el-header>
      <div class="header-box">
        <h1 class="title">中云FAAS平台</h1>
        <div class="right-info">
          <p class="date">
            <span>{{getDate}}</span>
            <span>{{getWeek}}</span>
          </p>
          <p class="person">管理员：{{loginInfo.account}}</p>
          <el-button type="text" @click="logout">注销</el-button>
        </div>
      </div>
    </el-header>
    <el-container>
      <el-aside>
        <el-menu router background-color="#39476b" text-color="#fff" active-text-color="#9dbbff" :default-active="defaultRouter" :default-openeds="openList">
          <template v-for="item in menuList">
            <el-submenu v-if="item.children && item.children.length > 0" :index="item.path">
              <template slot="title">
                <i :class="item.icon" style="margin-right: 10px; color: #fff;"></i>
                <span>{{item.text}}</span>
              </template>
              <el-menu-item v-for="child in item.children" :index="child.path">
                <template slot="title">
                  <span>{{child.text}}</span>
                </template>
              </el-menu-item>
            </el-submenu>
            <el-menu-item v-else :index="item.path">
              <i :class="item.icon" style="margin-right: 10px; color: #fff;"></i>
              <span>{{item.text}}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>
      <el-main class="main-container">
        <div class="main-content">
          <!--<el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item v-for="item in breadcrumbList">{{item}}</el-breadcrumb-item>
          </el-breadcrumb>-->
          <transition :name="animateName">
            <router-view class="content-wrap">

            </router-view>
          </transition>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import request from "@/libs/request.js";
import LocalSave from "@/libs/LocalSave.js";
import RouterList from "@/libs/routerApi.js";
import {mapState} from "vuex";
import moment from "moment";
export default {
  name: "MainTemplate",
  data(){
    return {
      menuList: [], //菜单列表
      defaultActive: "/data-manager/file-collection",
      openList: [],
      loginInfo: {
        account: "",
      },
      animateName: "left"
    }
  },
  async created() {
    this.createMenu();
  },

  watch: {
    $route: {
      immediate: true,
      handler(val,oldVal){
        if(oldVal) {
          let newIndex = val.meta.index;
          let oldIndex = oldVal.meta.index;
          if(newIndex > oldIndex) {
            this.animateName = "left";
          }else {
            this.animateName = "right";
          }
        }else {
          this.animateName = "left";
        }

        let active = val.name;
        this.$store.commit("changeDefaultRouter", active);
        let navList = val.meta.nav;
        this.$store.commit("changeBreadCrumbList", navList);
        let authority = JSON.parse(LocalSave.getSession("authority"));
        if(authority){
          //authority = JSON.parse(authority);
          this.loginInfo = authority;
        }
        let mt = this.loginInfo.mt;
        if(mt.startsWith("data_admin")){
          if(!val.path.startsWith("/data-manager")){
            this.$router.push("/login");
          }
        }else if(mt.startsWith("platform_admin")){
          if(!val.path.startsWith("/platform-manager")){
            this.$router.push("/login");
          }
        }else if(mt.startsWith("resource_user")){
          if(!val.path.startsWith("/resource-service")){
            this.$router.push("/login");
          }
        }else if(mt.startsWith("org_admin")) {
          const bOn = RouterList.orgAdmin.some(item => {
            let isYes = item.path === val.path;
            if(!isYes) {
              if(item.children && item.children.length) {
                isYes = item.children.some(child => child.path === val.path);
              }
            }
            return isYes
          }) ;
          if(!bOn) {
            this.$router.push("/login");
          }
        }
      }
    }
  },
  computed: {
    ...mapState(["defaultRouter", "breadcrumbList", "loading", "loadingTitle"]),
    getDate(){
      return moment().format("YYYY-MM-DD")
    },
    getWeek(){
      let week = moment().format("d");
      week = Number(week);
      switch (week) {
        case 1:
          return "星期一";
          break;
        case 2:
          return "星期二";
          break;
        case 3:
          return "星期三";
          break;
        case 4:
          return "星期四";
          break;
        case 5:
          return "星期五";
          break;
        case 6:
          return "星期六";
          break;
        case 7:
          return "星期七";
          break;
      }
    }
  },
  methods: {
    createMenu(){
      let authority = JSON.parse(LocalSave.getSession("authority"));

      if(authority){
        //authority = JSON.parse(authority);
        this.loginInfo = authority;
        if(authority.mt){
          if(authority.mt.startsWith("data_admin")){
            this.menuList = [
              {
                id: Math.random(),
                text: "数据采集",
                path: "/data-manager/data-collection",
                icon: "iconfont icondataCollect",
                children: [
                  {
                    id: Math.random(),
                    text: "文件采集",
                    path: "/data-manager/file-collection",
                  },
                  {
                    id: Math.random(),
                    text: "接口注册",
                    path: "/data-manager/interface-register",
                  },
                  {
                    id: Math.random(),
                    text: "库表同步",
                    path: "/data-manager/table-sync",
                  },
                ]
              },
              {
                id: Math.random(),
                text: "数据管理",
                path: "/data-manager/data-manager",
                icon: "iconfont icondataManagement",
                children: [
                  {
                    id: Math.random(),
                    text: "数据列表",
                    path: "/data-manager/data-list"
                  },
                  {
                    id: Math.random(),
                    text: "目录管理",
                    path: "/data-manager/dir-manager"
                  }
                ]
              },
              {
                id: Math.random(),
                text: "数据治理",
                path: "/data-manager/data-government",
                icon: "iconfont iconscreening",
                children: [
                  {
                    id: Math.random(),
                    text: "治理列表",
                    path: "/data-manager/government-list"
                  },
                  {
                    id: Math.random(),
                    text: "数据追溯",
                    path: "/data-manager/data-trace"
                    /*path: "/data-manager/dir-manager"*/
                  }
                ]
              }
            ];
          }else if(authority.mt.startsWith("platform_admin")){
            this.menuList = [
              {
                text: "服务管理",
                path: "/platform-manager/resource-manager",
                icon: "iconfont iconresource"
              },
              {
                text: "组织管理",
                path: "/platform-manager/organization-manager",
                icon: "iconfont icondataCollect",
              },
              {
                text: "用户管理",
                path: "/platform-manager/user-manager",
                icon: "iconfont iconuserManagement"
              },
              {
                text: "审核管理",
                path: "/platform-manager/audit-manager",
                icon: "iconfont iconaudit",
                children: [
                  {
                    text: "目录审核",
                    path: "/platform-manager/catalog-audit",
                  },
                  {
                    text: "服务订阅审核",
                    path: "/platform-manager/resource-audit"
                  }
                ]
              },
              {
                text: "主题库配置",
                path: "/platform-manager/theme-setting",
                icon: "iconfont icontopic"
              },
              {
                text: "数据可视化",
                path: "/platform-manager/data-visualization",
                icon: "iconfont iconvisual",
                children:[
                  {
                    text:"采集监控",
                    path: "/platform-manager/collection-monitor",
                  },
                  {
                    text:"服务监控",
                    path: "/platform-manager/interface-monitor",
                  },
                  {
                    text:"数据追溯",
                    path: "/platform-manager/data-back",
                  },
                ]
              },
              {
                text: "安全管控",
                path: "/platform-manager/safe-control",
                icon: "iconfont iconsecurityControl",
                children:[
                  {
                    text:"接口管控",
                    path: "/platform-manager/interface-control",
                  },
                  {
                    text:"用户操作日志",
                    path: "/platform-manager/login-log",
                  },
                ]
              }
            ]
          }else if(authority.mt.startsWith("resource_user")){
            this.menuList = [
              {
                text: "数据服务",
                path: "/resource-service",
                icon: "iconfont iconresource",
                children: [
                  {
                    text: "服务列表",
                    path: "/resource-service/resource-list",
                  },
                  {
                    text: "我的服务",
                    path: "/resource-service/my-resource"
                  },
                  {
                    text: "接口管理",
                    path: "/resource-service/interface-manager"
                  }
                ]
              }
            ]
          }else if(authority.mt.startsWith('org_admin')) {
            this.menuList = [
              {
                text: "服务管理",
                path: "/platform-manager/resource-manager",
                icon: "iconfont iconresource"
              },
              {
                text: "用户管理",
                path: "/platform-manager/user-manager",
                icon: "iconfont iconuserManagement"
              },
              {
                text: "审核管理",
                path: "/platform-manager/audit-manager",
                icon: "iconfont iconaudit",
                children: [
                  {
                    text: "目录审核",
                    path: "/platform-manager/catalog-audit",
                  },
                  {
                    text: "服务订阅审核",
                    path: "/platform-manager/resource-audit"
                  }
                ]
              }
            ]
          }
          this.openList = this.menuList.map(item => {
            return item.path
          })
        }
      }else{
        //this.$router.push("/login");
      }
      /*let type = LocalSave.getString("type");
      if(type === "admin"){
        this.menuList = [
          {
            id: Math.random(),
            text: "数据采集",
            path: "/data-manager/data-collection",
            icon: "iconfont icondataCollect",
            children: [
              {
                id: Math.random(),
                text: "文件采集",
                path: "/data-manager/file-collection",
              },
              {
                id: Math.random(),
                text: "接口注册",
                path: "/data-manager/interface-register",
              },
              {
                id: Math.random(),
                text: "库表同步",
                path: "/data-manager/table-sync",
              },
            ]
          },
          {
            id: Math.random(),
            text: "数据管理",
            path: "/data-manager/data-manager",
            icon: "iconfont icondataManagement",
            children: [
              {
                id: Math.random(),
                text: "数据列表",
                path: "/data-manager/data-list"
              },
              {
                id: Math.random(),
                text: "目录管理",
                path: "/data-manager/dir-manager"
              }
            ]
          },
          {
            id: Math.random(),
            text: "数据治理",
            path: "/data-manager/data-government",
            icon: "iconfont iconscreening",
            children: [
              {
                id: Math.random(),
                text: "治理列表",
                path: "/data-manager/government-list"
              },
              {
                id: Math.random(),
                text: "数据追溯",
                path: "/data-manager/data-trace"
              }
            ]
          }
        ];
      }else if(type === "platform"){
        this.menuList = [
          {
            text: "数据服务",
            path: "/platform-manager/resource-manager",
            icon: "iconfont iconresource"
          },
          {
            text: "用户管理",
            path: "/platform-manager/user-manager",
            icon: "iconfont iconuserManagement"
          },
          {
            text: "审核管理",
            path: "/platform-manager/audit-manager",
            icon: "iconfont iconaudit",
            children: [
              {
                text: "目录审核",
                path: "/platform-manager/catalog-audit",
              },
              {
                text: "资源订阅审核",
                path: "/platform-manager/resource-audit"
              }
            ]
          },
          {
            text: "主题库配置",
            path: "/platform-manager/theme-setting",
            icon: "iconfont icontopic"
          },
          {
            text: "数据可视化",
            path: "/platform-manager/data-visualization",
            icon: "iconfont iconvisual",
              children:[
                  {
                      text:"采集监控",
                      path: "/platform-manager/collection-monitor",
                  },
                  {
                      text:"服务监控",
                      path: "/platform-manager/interface-monitor",
                  },
                  {
                      text:"数据追溯",
                      path: "/platform-manager/data-back",
                  },
              ]
          },
          {
            text: "安全管控",
            path: "/platform-manager/safe-control",
            icon: "iconfont iconsecurityControl",
            children:[
                {
                    text:"接口管控",
                    path: "/platform-manager/interface-control",
                },
                {
                    text:"用户操作日志",
                    path: "/platform-manager/login-log",
                },
            ]
          }
        ]
      }else if(type === "test"){
        this.menuList = [
          {
            text: "数据服务",
            path: "/resource-service",
            icon: "iconfont iconresource",
            children: [
              {
                text: "服务列表",
                path: "/resource-service/resource-list",
              },
              {
                text: "我的服务",
                path: "/resource-service/my-resource"
              },
              {
                text: "接口管理",
                path: "/resource-service/interface-manager"
              }
            ]
          }
        ]
      }
      this.openList = this.menuList.map(item => {
        return item.path
      })*/
    },
    async logout(){
      try {
        let params = {
          mt: this.loginInfo.mt
        };
        let {message, status} = await request.post("/usergroup/logout/userLogout", params, {
          loading: true,
          loadingTitle: "正在注销用户"
        });
        if(status === 200){
          this.$router.push("/login");
        }else{
          this.$message.warning(message);
        }
      }catch (e) {

      }

    }
  }
}
</script>

<style scoped lang="less">
/deep/.main-container {
  background: #f3f6fb;
  .main-content {
    position: relative;
  }
}
  .left-enter {
    position: absolute;
    width: 100%;
    left: 0;
    top: 0;
    transform: translateX(100%);
  }
  .left-enter-to {
    transform: translateX(0);
    position: relative;
  }
  .left-enter-active {
    transition: 0.8s;
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
  }
  .left-leave {
    position: absolute;
    width: 100%;
    left: 0;
    top: 0;
    transform: translateX(0);
  }
  .left-leave-to {
    position: relative;
    transform: translateX(-100%);
  }
  .left-leave-active {
    transition: 0.8s;
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
  }



.right-enter {
  position: absolute;
  width: 100%;
  left: 0;
  top: 0;
  transform: translateX(-100%);
}
.right-enter-to {
  transform: translateX(0);
  position: relative;
}
.right-enter-active {
  transition: 0.8s;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
}
.right-leave {
  position: absolute;
  width: 100%;
  left: 0;
  top: 0;
  transform: translateX(0);
}
.right-leave-to {
  position: relative;
  transform: translateX(100%);
}
.right-leave-active {
  transition: 0.8s;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
}
</style>
