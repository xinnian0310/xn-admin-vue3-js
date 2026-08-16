const menus = [
  {
    id: 'dashboard',
    title: '\u9996\u9875',
    path: '/dashboard',
    permission: 'menu:dashboard',
    affix: true,
  },
  {
    id: 'personal',
    title: '\u4E2A\u4EBA\u4E2D\u5FC3',
    permission: 'menu:personal',
    children: [
      {
        id: 'profile',
        title: '\u4E2A\u4EBA\u4FE1\u606F',
        path: '/profile',
        permission: 'menu:profile',
      },
      {
        id: 'mine-message',
        title: '\u6211\u7684\u6D88\u606F',
        path: '/messages/mine',
        permission: 'menu:personal:message',
      },
    ],
  },
  {
    id: 'monitor',
    title: '\u7CFB\u7EDF\u76D1\u63A7',
    permission: 'menu:monitor',
    children: [
      {
        id: 'monitor-online',
        title: '\u5728\u7EBF\u7528\u6237',
        path: '/monitor/online',
        permission: 'menu:monitor:online',
      },
      {
        id: 'monitor-server',
        title: '\u670D\u52A1\u76D1\u63A7',
        path: '/monitor/server',
        permission: 'menu:monitor:server',
      },
      {
        id: 'monitor-redis',
        title: '\u7F13\u5B58\u76D1\u63A7',
        path: '/monitor/redis',
        permission: 'menu:monitor:redis',
      },
      {
        id: 'monitor-sql',
        title: 'SQL\u76D1\u63A7',
        path: '/monitor/sql',
        permission: 'menu:monitor:sql',
      },
      {
        id: 'logs',
        title: '\u65E5\u5FD7\u7BA1\u7406',
        permission: 'menu:monitor:logs',
        children: [
          {
            id: 'login-log',
            title: '\u767B\u5F55\u65E5\u5FD7',
            path: '/system/logs/login',
            permission: 'menu:system:login-log',
          },
          {
            id: 'oper-log',
            title: '\u64CD\u4F5C\u65E5\u5FD7',
            path: '/system/logs/oper',
            permission: 'menu:system:oper-log',
          },
          {
            id: 'exception-log',
            title: '\u5F02\u5E38\u65E5\u5FD7',
            path: '/system/logs/exception',
            permission: 'menu:system:exception-log',
          },
        ],
      },
    ],
  },
  {
    id: 'system',
    title: '\u7CFB\u7EDF\u7BA1\u7406',
    permission: 'menu:system',
    children: [
      {
        id: 'org',
        title: '\u7EC4\u7EC7\u4E0E\u8D26\u53F7',
        permission: 'menu:system:org',
        children: [
          {
            id: 'user',
            title: '\u7528\u6237\u7BA1\u7406',
            path: '/users',
            permission: 'menu:system:user',
          },
          {
            id: 'unit',
            title: '\u5355\u4F4D\u7BA1\u7406',
            path: '/system/units',
            permission: 'menu:system:unit',
          },
        ],
      },
      {
        id: 'rbac',
        title: '\u6743\u9650\u4E0E\u5B89\u5168',
        permission: 'menu:system:rbac',
        children: [
          {
            id: 'role-list',
            title: '\u89D2\u8272\u5217\u8868',
            path: '/system/roles',
            permission: 'menu:system:role',
          },
          {
            id: 'permission',
            title: '\u89D2\u8272\u6743\u9650',
            path: '/system/permissions',
            permission: 'menu:system:permission',
          },
          {
            id: 'permission-content',
            title: '\u6743\u9650\u5185\u5BB9',
            path: '/system/permissions-content',
            permission: 'menu:system:permission-content',
          },
          {
            id: 'route',
            title: '\u8DEF\u7531\u7BA1\u7406',
            path: '/system/routes',
            permission: 'menu:system:route',
          },
        ],
      },
      {
        id: 'content',
        title: '\u5185\u5BB9\u8FD0\u8425',
        permission: 'menu:system:content',
        children: [
          {
            id: 'notice',
            title: '\u516C\u544A\u7BA1\u7406',
            path: '/system/notices',
            permission: 'menu:system:notice',
          },
          {
            id: 'message',
            title: '\u7AD9\u5185\u4FE1',
            path: '/system/messages',
            permission: 'menu:system:message',
          },
        ],
      },
      {
        id: 'base',
        title: '\u57FA\u7840\u6570\u636E',
        permission: 'menu:system:base',
        children: [
          {
            id: 'dict',
            title: '\u5B57\u5178\u7BA1\u7406',
            path: '/system/dicts',
            permission: 'menu:system:dict',
          },
        ],
      },
      {
        id: 'settings',
        title: '\u7CFB\u7EDF\u8BBE\u7F6E',
        permission: 'menu:system:settings',
        children: [
          {
            id: 'login-settings',
            title: '\u767B\u5F55\u9875\u8BBE\u7F6E',
            path: '/system/login-settings',
            permission: 'menu:system:login-page',
          },
          {
            id: 'system-config',
            title: '\u7CFB\u7EDF\u914D\u7F6E',
            path: '/system/config',
            permission: 'menu:system:config',
          },
          {
            id: 'remote-storage',
            title: '远程连接配置',
            path: '/system/remote-storage',
            permission: 'menu:system:remote-storage',
          },
          {
            id: 'site-contact',
            title: '\u8054\u7CFB\u4E0E\u6350\u8D60',
            path: '/system/site-contact',
          },
        ],
      },
      {
        id: 'tools',
        title: '\u7CFB\u7EDF\u5DE5\u5177',
        permission: 'menu:system:tools',
        children: [
          {
            id: 'files',
            title: '\u6587\u4EF6\u7BA1\u7406',
            path: '/system/files',
            permission: 'menu:system:file',
          },
          {
            id: 'jobs',
            title: '\u5B9A\u65F6\u4EFB\u52A1',
            path: '/system/jobs',
            permission: 'menu:system:job',
          },
          {
            id: 'api-docs',
            title: '\u63A5\u53E3\u6587\u6863',
            path: '/system/api-docs',
            permission: 'menu:system:api-docs',
          },
        ],
      },
    ],
  },
  {
    id: 'demo',
    title: '\u7EC4\u4EF6\u6F14\u793A',
    permission: 'menu:demo',
    children: [
      {
        id: 'demo-ui',
        title: '\u57FA\u7840\u7EC4\u4EF6',
        path: '/demos/ui',
        permission: 'menu:demo:ui',
      },
      {
        id: 'demo-xn',
        title: '\u7CFB\u7EDF\u7EC4\u4EF6',
        path: '/demos/xn',
        permission: 'menu:demo:xn',
      },
    ],
  },
]
export { menus }
