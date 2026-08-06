<template>
  <!-- 经典左侧菜单布局 -->
  <el-container class="layout-side">
    <LayoutAside :visible="!isFullscreen" />

    <el-container class="layout-side__main">
      <LayoutHeader :visible="!isFullscreen" />
      <xnTagsView v-show="!isFullscreen" />
      <LayoutContent />
    </el-container>
  </el-container>
</template>

<script setup>
import xnTagsView from '@/components/xnTagsView/xnTagsView.vue'
import LayoutAside from '../components/LayoutAside.vue'
import LayoutHeader from '../components/LayoutHeader.vue'
import LayoutContent from '../components/LayoutContent.vue'
defineProps({
  isFullscreen: { required: true },
})
</script>

<style scoped>
.layout-side {
  height: 100%;
}

.layout-side__main {
  flex-direction: column;
  min-width: 0;
}
</style>
