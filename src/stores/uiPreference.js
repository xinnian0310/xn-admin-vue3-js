import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserUiConfig, resetUserUiConfig, saveUserUiConfig } from '@/api/user-ui-config'
import { applyUserUiPreference } from '@/config/app'
const useUiPreferenceStore = defineStore('uiPreference', () => {
  const preference = ref(null)
  const drawerVisible = ref(false)
  const loaded = ref(false)
  function openDrawer() {
    drawerVisible.value = true
  }
  function closeDrawer() {
    drawerVisible.value = false
  }
  async function load() {
    try {
      const res = await getUserUiConfig()
      preference.value = res.data ?? null
      applyUserUiPreference(preference.value)
    } catch {
      preference.value = null
    } finally {
      loaded.value = true
    }
  }
  async function save(data) {
    const res = await saveUserUiConfig(data)
    preference.value = res.data
    applyUserUiPreference(preference.value)
    return res.data
  }
  async function reset() {
    await resetUserUiConfig()
    preference.value = null
    applyUserUiPreference(null)
  }
  function clearLocal() {
    preference.value = null
    loaded.value = false
    applyUserUiPreference(null)
  }
  return {
    preference,
    drawerVisible,
    loaded,
    openDrawer,
    closeDrawer,
    load,
    save,
    reset,
    clearLocal,
  }
})
export { useUiPreferenceStore }
