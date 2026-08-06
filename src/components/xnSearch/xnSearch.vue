<template>
  <el-header ref="searchRef" class="xn-search" :height="height">
    <el-form :inline="true" :model="form" class="xn-search__form" @submit.prevent="handleQuery">
      <div
        v-for="(item, index) in searchItem"
        :key="item.prop"
        ref="formItemRefs"
        class="xn-search__field"
        :style="{ display: fieldDisplay(index) }"
      >
        <el-form-item :label="item.label">
          <div class="xn-search__control" :style="fieldStyle(item)">
            <el-input
              v-if="item.type === 'input'"
              v-model="form[item.prop]"
              :placeholder="item.placeholder ?? `请输入${item.label}`"
              :clearable="item.clearable !== false"
              @keydown.enter.stop="handleQuery"
            />

            <el-input-number
              v-else-if="item.type === 'number'"
              v-model="form[item.prop]"
              :placeholder="item.placeholder ?? `请输入${item.label}`"
              :controls="false"
            />

            <el-select
              v-else-if="item.type === 'select'"
              v-model="form[item.prop]"
              :placeholder="item.placeholder ?? `请选择${item.label}`"
              :clearable="item.clearable !== false"
              :multiple="item.multiple"
            >
              <el-option
                v-for="opt in item.options ?? []"
                :key="String(opt.value)"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>

            <el-date-picker
              v-else-if="item.type === 'date'"
              v-model="form[item.prop]"
              type="date"
              value-format="YYYY-MM-DD"
              :placeholder="item.placeholder ?? `请选择${item.label}`"
              :clearable="item.clearable !== false"
            />

            <el-date-picker
              v-else-if="item.type === 'datetime'"
              v-model="form[item.prop]"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              :placeholder="item.placeholder ?? `请选择${item.label}`"
              :clearable="item.clearable !== false"
            />

            <el-date-picker
              v-else-if="item.type === 'daterange'"
              v-model="form[item.prop]"
              type="daterange"
              value-format="YYYY-MM-DD"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :clearable="item.clearable !== false"
            />
          </div>
        </el-form-item>
      </div>

      <div v-if="$slots.default" ref="slotRef" class="xn-search__field">
        <slot />
      </div>

      <div ref="btnRef" class="xn-search__btn-wrap">
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
          <el-button type="warning" :icon="Refresh" @click="handleReset">重置</el-button>
          <el-button
            v-if="hasOverflow"
            type="primary"
            :icon="collapsed ? CaretBottom : CaretTop"
            @click="toggleAdvanced"
          />
          <slot name="button" />
        </el-form-item>
      </div>
    </el-form>
  </el-header>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, useSlots, watch } from 'vue'
import { CaretBottom, CaretTop, Refresh, Search } from '@element-plus/icons-vue'
import { SEARCH_FIELD_DEFAULT_WIDTH } from '@/types/search'
defineOptions({ name: 'xnSearch' })
const props = defineProps({
  searchItem: { required: true },
  height: { type: String, required: false, default: 'auto' },
  fieldWidth: { required: false, default: SEARCH_FIELD_DEFAULT_WIDTH },
})
const emit = defineEmits(['queryForm', 'reset'])
const slots = useSlots()
const form = reactive({})
const searchRef = ref()
const formItemRefs = ref([])
const slotRef = ref()
const btnRef = ref()
const formItemWidths = ref([])
const slotWidth = ref(0)
const btnWidth = ref(0)
const overflowIndices = ref([])
const slotOverflow = ref(false)
const hasOverflow = ref(false)
const collapsed = ref(true)
let resizeTimer
function createInitialForm() {
  const next = {}
  for (const item of props.searchItem) {
    if (item.type === 'daterange') {
      next[item.prop] = []
    } else if (item.type === 'number') {
      next[item.prop] = undefined
    } else {
      next[item.prop] = ''
    }
  }
  return next
}
function resetForm() {
  Object.assign(form, createInitialForm())
}
function fieldStyle(item) {
  const width = item.width ?? props.fieldWidth
  return { width: typeof width === 'number' ? `${width}px` : width }
}
function fieldDisplay(index) {
  if (!collapsed.value) return 'inline-block'
  return overflowIndices.value.includes(index) ? 'none' : 'inline-block'
}
function buildQueryForm() {
  const result = { ...form }
  for (const key of Object.keys(result)) {
    const value = result[key]
    if (value !== 0 && (value === '' || value === null || value === undefined)) {
      delete result[key]
    }
  }
  return result
}
function handleQuery() {
  emit('queryForm', buildQueryForm())
}
function handleReset() {
  resetForm()
  emit('reset', buildQueryForm())
}
function toggleAdvanced() {
  collapsed.value = !collapsed.value
  applyCollapsedDisplay()
}
function applyCollapsedDisplay() {
  const items = formItemRefs.value ?? []
  items.forEach((el, index) => {
    el.style.display = fieldDisplay(index)
  })
  if (slotRef.value) {
    slotRef.value.style.display = collapsed.value && slotOverflow.value ? 'none' : 'inline-block'
  }
}
async function measureWidths() {
  await nextTick()
  const items = formItemRefs.value ?? []
  items.forEach((el) => {
    el.style.display = 'inline-block'
  })
  if (slotRef.value) {
    slotRef.value.style.display = 'inline-block'
  }
  await nextTick()
  formItemWidths.value = items.map((el) => el.offsetWidth)
  slotWidth.value = slotRef.value?.offsetWidth ?? 0
  btnWidth.value = btnRef.value?.offsetWidth ?? 0
}
function updateLayout() {
  const root = searchRef.value
  const container = root && '$el' in root ? root.$el : root
  if (!container || !btnWidth.value) return
  const warpWidth = container.clientWidth - 28
  let itemAllWidth = btnWidth.value
  const hidden = []
  let slotHidden = false
  formItemWidths.value.forEach((width, index) => {
    itemAllWidth += width
    if (itemAllWidth >= warpWidth - 60) {
      hidden.push(index)
    }
  })
  if (slots.default && slotWidth.value) {
    itemAllWidth += slotWidth.value
    if (itemAllWidth >= warpWidth - 60) {
      slotHidden = true
    }
  }
  overflowIndices.value = hidden
  slotOverflow.value = slotHidden
  hasOverflow.value = hidden.length > 0 || slotHidden
  if (!hasOverflow.value) {
    collapsed.value = true
  }
  applyCollapsedDisplay()
}
async function refreshLayout() {
  await measureWidths()
  updateLayout()
}
function debounceRefreshLayout() {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    updateLayout()
  }, 120)
}
watch(
  () => props.searchItem,
  () => {
    resetForm()
    refreshLayout()
  },
  { deep: true },
)
onMounted(() => {
  resetForm()
  refreshLayout()
  window.addEventListener('resize', debounceRefreshLayout)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', debounceRefreshLayout)
  if (resizeTimer) clearTimeout(resizeTimer)
})
</script>

<style scoped>
.xn-search {
  padding: 0;
  height: auto !important;
  position: relative;
}

.xn-search__form {
  height: auto;
}

.xn-search__field,
.xn-search__btn-wrap {
  display: inline-block;
  vertical-align: top;
}

.xn-search__form :deep(.el-form-item) {
  margin-bottom: 13px;
  margin-right: 16px;
}

.xn-search__control {
  display: inline-block;
  vertical-align: top;
}

.xn-search__control :deep(.el-input),
.xn-search__control :deep(.el-select),
.xn-search__control :deep(.el-date-editor),
.xn-search__control :deep(.el-input-number) {
  width: 100%;
}
</style>
