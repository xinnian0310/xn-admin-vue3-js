<script setup>
import { onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
onBeforeMount(() => {
  const raw = route.params.path
  const path = Array.isArray(raw) ? raw.join('/') : String(raw || '')
  router.replace({ path: `/${path}`, query: route.query })
})
</script>

<template>
  <div />
</template>
