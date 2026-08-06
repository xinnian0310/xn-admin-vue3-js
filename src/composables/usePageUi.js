import { onMounted, ref } from 'vue'
import { getPageUiConfig } from '@/api/page-ui'
import { mapButtonItems, mapSearchItems } from '@/utils/page-ui'
function usePageUi(routePath) {
  const searchItems = ref([])
  const buttonItems = ref([])
  const tableButtonItems = ref([])
  const loading = ref(false)
  async function loadPageUi() {
    loading.value = true
    try {
      const res = await getPageUiConfig(routePath)
      searchItems.value = mapSearchItems(res.data.searchItems ?? [])
      buttonItems.value = mapButtonItems(res.data.buttons ?? [])
      tableButtonItems.value = mapButtonItems(res.data.tableButtons ?? [])
    } finally {
      loading.value = false
    }
  }
  onMounted(loadPageUi)
  return {
    searchItems,
    buttonItems,
    tableButtonItems,
    loading,
    reloadPageUi: loadPageUi,
  }
}
export { usePageUi }
