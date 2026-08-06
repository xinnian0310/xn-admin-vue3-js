<template>
  <XnErrorPage
    code="403"
    tone="warn"
    title="无权限访问"
    description="抱歉，您没有权限访问此页面。如需开通，请联系管理员。"
  >
    <template #actions>
      <el-button type="primary" @click="router.push('/dashboard')">返回工作台</el-button>
    </template>
  </XnErrorPage>
</template>

<script setup>
import { useRouter } from 'vue-router'
import XnErrorPage from '@/components/xnErrorPage/xnErrorPage.vue'
defineOptions({ name: 'Forbidden' })
const router = useRouter()
</script>
