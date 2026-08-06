import wechatQr from '@/assets/payment-qrcode/wechat.jpg'
import alipayQr from '@/assets/payment-qrcode/alipay.jpg'
const changelogTypeMeta = {
  feature: { label: '\u65B0\u589E', tag: 'success' },
  fix: { label: '\u4FEE\u590D', tag: 'warning' },
  refactor: { label: '\u4F18\u5316', tag: 'info' },
}
const homeConfig = {
  intro: {
    title: '心念后台管理系统（Vue3 JS）',
    version: `v${__APP_VERSION__}`,
    description: '',
    features: [
      {
        icon: 'Lock',
        title: 'RBAC \u6743\u9650',
        desc: '\u7528\u6237 / \u89D2\u8272 / \u5355\u4F4D / \u6743\u9650\u5185\u5BB9\u56DB\u7EA7\u6A21\u578B\uFF0C\u63A5\u53E3\u4E0E\u6309\u94AE\u7EA7\u7BA1\u63A7',
      },
      {
        icon: 'Guide',
        title: '\u52A8\u6001\u8DEF\u7531',
        desc: '\u83DC\u5355\u4E0E\u8DEF\u7531\u7531\u540E\u7AEF\u4E0B\u53D1\uFF0C\u524D\u7AEF\u96F6\u6539\u52A8\u5373\u53EF\u589E\u5220\u9875\u9762',
      },
      {
        icon: 'Brush',
        title: '\u4E3B\u9898\u5E03\u5C40',
        desc: '\u9884\u8BBE / \u4EAE\u6697\u8272 / \u4E2A\u6027\u5316\u914D\u8272\u4E0E\u5E95\u56FE\uFF0C\u591A\u79CD\u5E03\u5C40\u6A21\u5F0F\u968F\u5FC3\u5207\u6362',
      },
      {
        icon: 'Monitor',
        title: '\u7CFB\u7EDF\u76D1\u63A7',
        desc: '\u5728\u7EBF\u7528\u6237\u3001\u670D\u52A1\u5668 CPU / \u5185\u5B58 / \u78C1\u76D8\u5B9E\u65F6\u53EF\u89C6',
      },
      {
        icon: 'Bell',
        title: '\u6D88\u606F\u516C\u544A',
        desc: 'WebSocket \u5B9E\u65F6\u63A8\u9001\uFF0C\u5DF2\u8BFB\u56DE\u6267\u4E0E\u7AD9\u5185\u4FE1\u4E00\u4F53',
      },
      {
        icon: 'Grid',
        title: 'page-ui CRUD',
        desc: '\u540E\u7AEF\u4E0B\u53D1\u8868\u683C\u4E0E\u8868\u5355\u914D\u7F6E\uFF0C\u901A\u7528\u5217\u8868\u9875\u5FEB\u901F\u843D\u5730',
      },
    ],
  },
  frontendTech: [
    { name: 'Vue', version: '3.5', desc: '\u6E10\u8FDB\u5F0F\u6846\u67B6 \xB7 Composition API' },
    {
      name: 'JavaScript',
      version: 'ESNext',
      desc: '原生 JS \xB7 Composition API / <script setup>',
    },
    {
      name: 'Vite',
      version: '8.x',
      desc: '\u4E0B\u4E00\u4EE3\u524D\u7AEF\u6784\u5EFA\u4E0E\u5F00\u53D1\u5DE5\u5177',
    },
    { name: 'Element Plus', version: '2.14', desc: '\u684C\u9762\u7AEF Vue \u7EC4\u4EF6\u5E93' },
    { name: 'Pinia', version: '4.x', desc: '\u5B98\u65B9\u63A8\u8350\u72B6\u6001\u7BA1\u7406' },
    {
      name: 'Vue Router',
      version: '5.x',
      desc: '\u5B98\u65B9\u8DEF\u7531 \xB7 \u52A8\u6001\u6CE8\u518C',
    },
    { name: 'Axios', version: '1.x', desc: 'HTTP \u8BF7\u6C42\u4E0E\u62E6\u622A\u5C01\u88C5' },
    {
      name: 'ECharts',
      version: '6.x',
      desc: '\u6570\u636E\u53EF\u89C6\u5316\uFF08vue-echarts\uFF09',
    },
    { name: 'wangEditor', version: '5.x', desc: '\u5BCC\u6587\u672C\u7F16\u8F91\u5668' },
    { name: 'Iconify', version: '5.x', desc: '\u56FE\u6807\u96C6 \xB7 \u914D\u5408 Element Icons' },
    { name: 'dayjs', version: '1.x', desc: '\u8F7B\u91CF\u65E5\u671F\u65F6\u95F4\u5904\u7406' },
    { name: 'vue-i18n', version: '11.x', desc: '\u56FD\u9645\u5316\u591A\u8BED\u8A00' },
    { name: 'ExcelJS / xlsx', version: '-', desc: 'Excel \u5BFC\u5165\u5BFC\u51FA' },
    { name: 'Vitest', version: '4.x', desc: '\u5355\u5143\u6D4B\u8BD5' },
    {
      name: 'ESLint / Prettier',
      version: '-',
      desc: '\u4EE3\u7801\u89C4\u8303\u4E0E\u683C\u5F0F\u5316',
    },
    { name: 'Husky', version: '9.x', desc: 'Git hooks \xB7 commitlint' },
  ],
  backendTech: [
    { name: 'Spring Boot', version: '4.1', desc: '\u5FAE\u670D\u52A1\u5E94\u7528\u6846\u67B6' },
    { name: 'Java', version: '21', desc: 'LTS \u957F\u671F\u652F\u6301\u7248\u672C' },
    {
      name: 'Spring Cloud Gateway',
      version: '2025.1',
      desc: '\u7EDF\u4E00\u7F51\u5173\u5165\u53E3',
    },
    { name: 'Nacos', version: '3.x', desc: '\u670D\u52A1\u6CE8\u518C\u4E0E\u53D1\u73B0' },
    { name: 'Spring Security', version: '6.x', desc: '\u8BA4\u8BC1\u4E0E\u6388\u6743' },
    { name: 'Spring Data JPA', version: '4.x', desc: 'ORM \u6301\u4E45\u5C42' },
    { name: 'MySQL', version: '8.x', desc: '\u5173\u7CFB\u578B\u6570\u636E\u5E93' },
    { name: 'Redis', version: '7.x', desc: '\u7F13\u5B58\u4E0E\u4F1A\u8BDD\u8F85\u52A9' },
    {
      name: 'MinIO',
      version: '8.x',
      desc: '\u5BF9\u8C61\u5B58\u50A8 \xB7 \u6587\u4EF6\u670D\u52A1',
    },
    { name: 'Flyway', version: '-', desc: '\u6570\u636E\u5E93\u7248\u672C\u8FC1\u79FB' },
    { name: 'Quartz', version: '-', desc: '\u5206\u5E03\u5F0F\u5B9A\u65F6\u4EFB\u52A1' },
    { name: 'JWT', version: '0.12', desc: '\u65E0\u72B6\u6001\u4EE4\u724C\u9274\u6743' },
    {
      name: 'WebSocket',
      version: '-',
      desc: '\u516C\u544A\u4E0E\u6D88\u606F\u5B9E\u65F6\u63A8\u9001',
    },
    { name: 'springdoc', version: '3.x', desc: 'OpenAPI / Swagger \u6587\u6863' },
    { name: 'EasyExcel', version: '4.x', desc: '\u670D\u52A1\u7AEF Excel \u8BFB\u5199' },
    { name: 'Maven', version: '3.x', desc: '\u591A\u6A21\u5757\u4F9D\u8D56\u4E0E\u6784\u5EFA' },
  ],
  contacts: [
    { icon: 'User', label: '\u516C\u53F8', type: 'text', value: '\u5FC3\u5FF5\u79D1\u6280' },
    {
      icon: 'Message',
      label: '\u90AE\u7BB1',
      type: 'email',
      value: 'support@xinnian.com',
      link: 'mailto:support@xinnian.com',
    },
    {
      icon: 'Link',
      label: '\u5B98\u7F51',
      type: 'link',
      value: 'https://xinnian.example.com',
      link: 'https://xinnian.example.com',
    },
    {
      icon: 'ChatDotRound',
      label: '\u4EA4\u6D41\u7FA4',
      type: 'qq',
      value: '123456789',
      groups: [{ value: '123456789', full: false }],
    },
  ],
  /** 本地兜底；线上优先走 GET /api/site-contact/public */
  donation: {
    tip: '\u5982\u679C\u8FD9\u4E2A\u9879\u76EE\u5BF9\u4F60\u6709\u5E2E\u52A9\uFF0C\u6B22\u8FCE\u8BF7\u4F5C\u8005\u559D\u676F\u5496\u5561 \u2615',
    qrcodes: [
      { label: '\u5FAE\u4FE1\u652F\u4ED8', src: wechatQr },
      { label: '\u652F\u4ED8\u5B9D', src: alipayQr },
    ],
  },
}
export { changelogTypeMeta, homeConfig }
