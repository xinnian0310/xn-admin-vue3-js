<template>
  <XnErrorPage
    code="404"
    tone="muted"
    title="页面不存在"
    description="您访问的页面不存在或已被移除，请检查地址是否正确。"
  >
    <template #actions>
      <el-button @click="goBack">返回上一页</el-button>
      <el-button type="primary" @click="router.push('/dashboard')">返回工作台</el-button>
    </template>
  </XnErrorPage>
</template>

<script setup>
import { useRouter } from 'vue-router'
import XnErrorPage from '@/components/xnErrorPage/xnErrorPage.vue'
defineOptions({ name: 'NotFoundPage' })
const router = useRouter()
function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push('/dashboard')
}
</script>
