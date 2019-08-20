const RouteList = {
  "dataAdmin": [
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
  ],
  "platformAdmin": [
    {
      text: "服务管理",
      path: "/platform-manager/resource-manager",
      icon: "iconfont iconresource"
    },
    {
      text: "组织管理",
      path: "/platform-manager/organization-manager",
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
  ],
  "resourceUser": [
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
  ],
  "orgAdmin": [
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
};

export default RouteList
