<template>
  <el-config-provider v-bind="elementPlusConfig">
    <router-view />
    <!-- 全局主题弹窗：任意页面可通过 themeStore.openDialog() 打开 -->
    <xnThemeDialog />
  </el-config-provider>
</template>

<script setup>
import { computed } from 'vue'
import { appConfig, getElementPlusProviderProps } from '@/config/app'
import xnThemeDialog from '@/components/xnThemePicker/xnThemeDialog.vue'
const elementPlusConfig = computed(() => getElementPlusProviderProps(appConfig))
</script>
