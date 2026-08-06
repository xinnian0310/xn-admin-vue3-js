import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import { applyAppConfig, applyRemoteAppConfig, captureGlobalUiBaseline } from '@/config/app'
import { getPublicConfig } from '@/api/system-config'
import { setupPermissionDirective } from '@/directives/permission'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { useUiPreferenceStore } from '@/stores/uiPreference'
import { startSessionGuard } from '@/utils/session-guard'
import './style.css'
applyAppConfig()
async function bootstrapRemoteConfig() {
  try {
    const res = await getPublicConfig()
    applyRemoteAppConfig(res.data)
  } catch {
    // 后端未启动或网络失败时沿用本地默认
  }
  captureGlobalUiBaseline()
  const userStore2 = useUserStore()
  if (userStore2.token) {
    await useUiPreferenceStore().load()
  }
}
const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
setupPermissionDirective(app)
const userStore = useUserStore()
if (localStorage.getItem('token')) {
  userStore.loadRegistry()
  startSessionGuard()
}
useThemeStore().applyCurrent()
void bootstrapRemoteConfig().finally(() => {
  useThemeStore().applyCurrent()
  app.mount('#app')
})
