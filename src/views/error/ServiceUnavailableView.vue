<template>
  <XnErrorPage
    code="503"
    tone="danger"
    title="服务暂时不可用"
    description="无法连接后端服务或菜单加载失败，请确认服务已启动后重试。"
  >
    <template #actions>
      <el-button :loading="retrying" @click="retry">重新加载</el-button>
      <el-button type="primary" @click="router.push('/dashboard')">返回工作台</el-button>
    </template>
  </XnErrorPage>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import XnErrorPage from '@/components/xnErrorPage/xnErrorPage.vue'
import { resetDynamicRoutes } from '@/utils/route-register'
defineOptions({ name: 'ServiceUnavailable' })
const router = useRouter()
const retrying = ref(false)
function retry() {
  retrying.value = true
  resetDynamicRoutes()
  window.location.assign('/dashboard')
}
</script>
