import Vue from 'vue'
import Router from 'vue-router'
import MainTemplate from "./views/common/MainTemplate.vue";
import LoginBox from "./views/Login.vue";
//import FileComponent from "./views/data-manager/data-collection/FileCollection.vue";
import LocalSave from "./libs/LocalSave.js"

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      redirect: "/login"
    },
    {
      path: "/login",
      name: "/login",
      component: LoginBox,
      meta: {
        index: 1
      }
    },
    {
      path: "/data-manager",
      redirect: "/data-manager/file-collection",
      component: MainTemplate,
      meta: {
        isLogin: true,
      },
      children: [
        {
          path: "/data-manager/file-collection",
          name: "/data-manager/file-collection",
          component: () => import("./views/data-manager/data-collection/FileCollection.vue"),
          meta: {
            isLogin: true,
            nav: ["数据采集", "文件采集"],
            index: 2
          }
        },
        {
          path: "/data-manager/interface-register",
          name: "/data-manager/interface-register",
          component: () => import("@/views/data-manager/data-collection/InterfaceRegister.vue"),
          meta: {
            isLogin: true,
            nav: ["数据采集", "接口注册"],
            index: 3
          }
        },
        {
          path: "/data-manager/table-sync",
          name: "/data-manager/table-sync",
          component: () => import("@/views/data-manager/data-collection/TableSync.vue"),
          meta: {
            isLogin: true,
            nav: ["数据采集", "库表同步"],
            index: 4
          }
        },
        {
          path: "/data-manager/data-list",
          name: "/data-manager/data-list",
          component: () => import("@/views/data-manager/data-manager/DataList.vue"),
          meta: {
            isLogin: true,
            nav: ["数据管理", "数据列表"],
            index: 5
          }
        },
        {
          path: "/data-manager/dir-manager",
          name: "/data-manager/dir-manager",
          component: () => import("@/views/data-manager/data-manager/DirManager.vue"),
          meta: {
            isLogin: true,
            nav: ["数据管理", "目录管理"],
            index: 6
          }
        },
        {
          path: "/data-manager/government-list",
          name: "/data-manager/government-list",
          component: () => import("@/views/data-manager/data-government/GovernmentList.vue"),
          meta: {
            isLogin: true,
            nav: ["数据治理", "治理列表"],
            index: 7
          }
        },
        {
          path: "/data-manager/data-trace",
          name: "/data-manager/data-trace",
          component: () => import("@/views/data-manager/data-government/DataTraceBak.vue"),
          meta: {
            isLogin: true,
            nav: ["数据治理", "数据追溯"],
            index: 8
          }
        }
      ]
    },
    {
      path: "/platform-manager",
      component: MainTemplate,
      redirect: "/platform-manager/resource-manager",
      meta: {
        isLogin: true
      },
      children: [
        {
          path: "/platform-manager/resource-manager",
          name: "/platform-manager/resource-manager",
          component: () => import("@/views/platform-manager/ResourceManager.vue"),
          meta: {
            isLogin: true,
            nav: ["服务管理"],
            index: 2
          }
        },
        {
          path: "/platform-manager/organization-manager",
          name: "/platform-manager/organization-manager",
          component: () => import("@/views/platform-manager/OrganizationManager.vue"),
          meta: {
            isLogin: true,
            nav: ["组织管理"],
            index: 3
          }
        },
        {
          path: "/platform-manager/user-manager",
          name: "/platform-manager/user-manager",
          component: () => import("@/views/platform-manager/UserManager.vue"),
          meta: {
            isLogin: true,
            nav: ["用户管理"],
            index: 4
          }
        },
        {
          path: "/platform-manager/audit-manager",
          name: "/platform-manager/audit-manager",
          component: () => import("@/views/platform-manager/AuditManager.vue"),
          meta: {
            isLogin: true,
            nav: ["审核管理"],
            index: 5
          }
        },
        {
          path: "/platform-manager/catalog-audit",
          name: "/platform-manager/catalog-audit",
          component: () => import("@/views/platform-manager/audit-manager/CatalogAudit.vue"),
          meta: {
            isLogin: true,
            nav: ["审核管理", "目录审核"],
            index: 6
          }
        },
        {
          path: "/platform-manager/resource-audit",
          name: "/platform-manager/resource-audit",
          component: () => import("@/views/platform-manager/audit-manager/ResourceAudit.vue"),
          meta: {
            isLogin: true,
            nav: ["审核管理", "服务订阅审核"],
            index: 7
          }
        },
        {
          path: "/platform-manager/theme-setting",
          name: "/platform-manager/theme-setting",
          component: () => import("@/views/platform-manager/ThemeSetting.vue"),
          meta: {
            isLogin: true,
            nav: ["主题配置"],
            index: 8
          }
        },
        {
          path: "/platform-manager/data-visualization",
          name: "/platform-manager/data-visualization",
          component: () => import("@/views/platform-manager/DataVisualization.vue"),
          meta: {
            isLogin: true,
            nav: ["数据可视化"],
            index: 9
          }
        },
        {
          path: "/platform-manager/collection-monitor",
          name: "/platform-manager/collection-monitor",
          component: () => import("@/views/platform-manager/data-visualization/CollectionMonitor.vue"),
          meta: {
            isLogin: true,
            nav: ["数据可视化", "采集监控"],
            index: 10
          }
        },
        {
          path: "/platform-manager/interface-monitor",
          name: "/platform-manager/interface-monitor",
          component: () => import("@/views/platform-manager/data-visualization/InterfaceMonitor.vue"),
          meta: {
            isLogin: true,
            nav: ["数据可视化", "服务监控"],
            index: 11
          }
        },
        {
          path: "/platform-manager/data-back",
          name: "/platform-manager/data-back",
          component: () => import("@/views/platform-manager/data-visualization/DataBack.vue"),
          meta: {
            isLogin: true,
            nav: ["数据可视化", "数据追溯"],
            index: 12
          }
        },
        {
          path: "/platform-manager/safe-control",
          name: "/platform-manager/safe-control",
          component: () => import("@/views/platform-manager/SafeControl.vue"),
          meta: {
            isLogin: true,
            nav: ["安全管控"],
            index: 13
          }
        },
        {
          path: "/platform-manager/interface-control",
          name: "/platform-manager/interface-control",
          component: () => import("@/views/platform-manager/safe-control/InterfaceControl.vue"),
          meta: {
            isLogin: true,
            nav: ["安全管控", "接口管控"],
            index: 14
          }
        },
        {
          path: "/platform-manager/login-log",
          name: "/platform-manager/login-log",
          component: () => import("@/views/platform-manager/safe-control/LoginLog.vue"),
          meta: {
            isLogin: true,
            nav: ["安全管控", "用户操作日志"],
            index: 15
          }
        },
      ]
    },
    {
      path: "/resource-service",
      redirect: "/resource-service/resource-list",
      component: MainTemplate,
      meta: {
        isLogin: true
      },
      children: [
        {
          path: "/resource-service/resource-list",
          name: "/resource-service/resource-list",
          component: () => import("@/views/resource-service/ResourceList"),
          meta: {
            isLogin: true,
            nav: ["数据服务", "服务列表"],
            index: 2
          }
        },
        {
          path: "/resource-service/my-resource",
          name: "/resource-service/my-resource",
          component: () => import("@/views/resource-service/MyResource"),
          meta: {
            isLogin: true,
            nav: ["数据服务", "我的服务"],
            index: 3
          }
        },
        {
          path: "/resource-service/interface-manager",
          name: "/resource-service/interface-manager",
          component: () => import("@/views/resource-service/InterfaceManager"),
          meta: {
            isLogin: true,
            nav: ["数据服务", "接口管理"],
            index: 4
          }
        }
      ]
    }
  ]
});

router.beforeEach((to, from, next) => {
  let isLogin = to.matched.some(item => item.meta.isLogin);
  if (isLogin) {
    let authority = JSON.parse(LocalSave.getSession("authority"));
    //authority = JSON.parse(authority);
    if (authority && authority.mt) {
      next();
    } else {
      next("/login");
    }
  } else {
    next();
  }
});

export default router;
