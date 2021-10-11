import { defineConfig } from 'umi';

export default defineConfig({
  history: {
    type: 'browser',
  },
  locale: {
    default: 'zh-CN',
    antd: true,
  },
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    { path: '/', component: '@/pages/index' },
    { path: '/worker', component: '@/pages/worker' },
  ],
  // fastRefresh: {},
  // mfsu: {},
  // webpack5: {},
  exportStatic: {
    dynamicRoot: true,
    htmlSuffix: true,
  },
  electronBuilder: {
    routerMode: 'browser',
    externals: ['@byslin/macadam'],
    builderOptions: {
      npmRebuild: false,
      appId: 'com.byslin.video.matrix',
      productName: '视频采集切换系统',
      win: {
        target: [
          {
            target: 'nsis',
            arch: ['x64'],
          },
        ],
        artifactName: '视频采集切换系统.${ext}',
      },
    },
  },
});
