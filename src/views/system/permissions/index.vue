<template>
  <xnPageLayout>
    <template #aside>
      <xnTreePanel
        title="选择角色"
        width="240px"
        v-model:filter="roleKeyword"
        filter-placeholder="搜索角色名称/编码"
      >
        <div
          v-for="role in filteredRoles"
          :key="role.id"
          class="role-item"
          :class="{ 'is-active': currentRole?.id === role.id }"
          @click="selectRole(role)"
        >
          <span class="role-item__name">{{ role.name }}</span>
          <el-tag v-if="role.builtIn" type="warning">内置</el-tag>
        </div>
      </xnTreePanel>
    </template>

    <template #toolbar>
      <div v-if="currentRole && !isSuperAdminRole">
        <h3 class="role-perm__title">为「{{ currentRole.name }}」配置权限</h3>
        <p class="role-perm__desc">左侧选菜单，右侧勾选后点击下方「保存」。</p>
      </div>
      <div v-else-if="currentRole">
        <h3 class="role-perm__title">{{ currentRole.name }}</h3>
      </div>
    </template>

    <div
      v-if="currentRole"
      class="role-perm__main-body"
      :class="{ 'is-super-admin': isSuperAdminRole }"
    >
      <div v-if="isSuperAdminRole" class="role-perm__locked">
        <div class="role-perm__locked-card">
          <div class="role-perm__locked-icon">
            <el-icon><Lock /></el-icon>
          </div>
          <h3 class="role-perm__locked-title">超级管理员</h3>
          <p class="role-perm__locked-desc">
            该角色默认拥有系统全部权限，无需在此配置，也无法修改。
          </p>
        </div>
      </div>

      <template v-else>
        <div v-loading="treeLoading" class="role-perm__body">
          <xnTreePanel
            ref="menuTreeRef"
            title="菜单"
            width="260px"
            v-model:filter="menuKeyword"
            filter-placeholder="搜索菜单名称/权限码"
            :data="menuTree"
            :tree-props="{ label: 'name', children: 'children', disabled: 'disabled' }"
            :filter-node-method="filterMenuNode"
            :current-key="selectedRouteId ?? undefined"
            class="role-perm__menus"
            @node-click="onMenuClick"
          >
            <template #node="{ data }">
              <span class="menu-node" :class="{ 'is-disabled': data.disabled }">
                <el-checkbox
                  :model-value="data.permissionId != null && isChecked(data.permissionId)"
                  :disabled="data.disabled || data.permissionId == null"
                  class="menu-node__check"
                  @click.stop
                  @change="
                    !data.disabled && data.permissionId != null && toggleItem(data.permissionId)
                  "
                />
                <span class="menu-node__name">{{ data.name }}</span>
                <el-tag
                  v-if="!data.permissionControl && data.type === 'MENU'"
                  type="info"
                  effect="plain"
                  class="menu-node__badge"
                >
                  未控权
                </el-tag>
                <el-tag
                  v-else-if="menuStat(data).total"
                  :type="menuStat(data).checked === menuStat(data).total ? 'success' : 'info'"
                  effect="plain"
                  class="menu-node__badge"
                >
                  {{ menuStat(data).checked }}/{{ menuStat(data).total }}
                </el-tag>
              </span>
            </template>
          </xnTreePanel>

          <section class="role-perm__detail">
            <template v-if="selectedRoute">
              <div class="role-perm__detail-header">
                <div class="role-perm__detail-title">
                  <span>{{ selectedRoute?.title }}</span>
                  <span v-if="selectedMenu?.code" class="role-perm__detail-code">{{
                    selectedMenu.code
                  }}</span>
                </div>
                <el-checkbox
                  v-if="assignableItems.length"
                  :model-value="isAllChecked"
                  :indeterminate="isIndeterminate"
                  @change="toggleSelectAll"
                >
                  全选
                </el-checkbox>
              </div>

              <el-scrollbar v-if="assignableItems.length" class="role-perm__detail-scroll">
                <div v-if="detailGroups.capability.length" class="perm-group">
                  <div class="perm-group__title">
                    <span>敏感信息</span>
                    <span class="perm-group__count">{{ detailGroups.capability.length }}</span>
                  </div>
                  <p class="perm-group__hint">
                    控制列表/详情/导出是否显示手机号、邮箱明文（字段范围在系统配置中设置）
                  </p>
                  <div class="perm-group__items">
                    <el-checkbox
                      v-for="item in detailGroups.capability"
                      :key="item.id"
                      border
                      :model-value="isChecked(item.id)"
                      class="perm-btn"
                      @change="toggleItem(item.id)"
                    >
                      {{ item.name }}
                      <el-tag type="danger" effect="plain" class="perm-btn__type">敏感</el-tag>
                    </el-checkbox>
                  </div>
                </div>

                <div v-if="detailGroups.button.length" class="perm-group">
                  <div class="perm-group__title">
                    <span>按钮</span>
                    <span class="perm-group__count">{{ detailGroups.button.length }}</span>
                  </div>
                  <p class="perm-group__hint">页面工具栏（新增 / 导入 / 导出等）</p>
                  <div class="perm-group__items">
                    <el-checkbox
                      v-for="item in detailGroups.button"
                      :key="item.id"
                      border
                      :model-value="isChecked(item.id)"
                      class="perm-btn"
                      @change="toggleItem(item.id)"
                    >
                      {{ item.name }}
                    </el-checkbox>
                  </div>
                </div>

                <div v-if="detailGroups.tableButton.length" class="perm-group">
                  <div class="perm-group__title">
                    <span>表格按钮</span>
                    <span class="perm-group__count">{{ detailGroups.tableButton.length }}</span>
                  </div>
                  <p class="perm-group__hint">表格操作列（查看 / 编辑 / 删除等）</p>
                  <div class="perm-group__items">
                    <el-checkbox
                      v-for="item in detailGroups.tableButton"
                      :key="item.id"
                      border
                      :model-value="isChecked(item.id)"
                      class="perm-btn"
                      @change="toggleItem(item.id)"
                    >
                      {{ item.name }}
                    </el-checkbox>
                  </div>
                </div>

                <div v-if="detailGroups.api.length" class="perm-group">
                  <div class="perm-group__title">
                    <span>接口权限</span>
                    <span class="perm-group__count">{{ detailGroups.api.length }}</span>
                  </div>
                  <div class="perm-group__apis">
                    <label
                      v-for="item in detailGroups.api"
                      :key="item.id"
                      class="perm-api"
                      :class="{ 'is-checked': isChecked(item.id) }"
                    >
                      <el-checkbox
                        :model-value="isChecked(item.id)"
                        @change="toggleItem(item.id)"
                      />
                      <el-tag :type="methodTagType(item.method)" class="perm-api__method">
                        {{ item.method || '-' }}
                      </el-tag>
                      <span class="perm-api__name">{{ item.name }}</span>
                      <code class="perm-api__path">{{ item.path }}</code>
                    </label>
                  </div>
                </div>
              </el-scrollbar>

              <el-empty
                v-else
                description="该菜单为分组菜单，请选择其下的子菜单进行配置"
                :image-size="90"
              />
            </template>

            <el-empty
              v-else
              description="请从左侧选择一个菜单，查看其接口与按钮权限"
              :image-size="110"
            />
          </section>
        </div>

        <div class="role-perm__footer">
          <span class="role-perm__footer-tip" :class="{ 'is-dirty': dirty }">
            {{ dirty ? '有未保存的修改' : '当前配置已保存' }}
          </span>
          <el-button type="primary" :loading="saving" :disabled="!dirty" @click="handleSave">
            保存
          </el-button>
        </div>
      </template>
    </div>

    <el-empty
      v-else
      class="role-perm__empty"
      description="请从最左侧选择一个角色"
      :image-size="120"
    />
  </xnPageLayout>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'
import xnPageLayout from '@/components/xnPageLayout/xnPageLayout.vue'
import xnTreePanel from '@/components/xnTreePanel/xnTreePanel.vue'
import { assignPermissions, get, getOptions } from '@/api/role'
import { list as listPermissions } from '@/api/permission'
import { list as listRoutes } from '@/api/route'
defineOptions({ name: 'RolePermissions' })
const route = useRoute()
const roleKeyword = ref('')
const menuKeyword = ref('')
const roles = ref([])
const currentRole = ref(null)
const routeTree = ref([])
const treeLoading = ref(false)
const saving = ref(false)
const checkedIds = ref(new Set())
const savedIds = ref(new Set())
const selectedRouteId = ref(null)
const menuTreeRef = ref()
const permissionById = new Map()
const permissionByCode = new Map()
const routeById = new Map()
const dirty = computed(() => {
  if (checkedIds.value.size !== savedIds.value.size) return true
  for (const id of checkedIds.value) {
    if (!savedIds.value.has(id)) return true
  }
  return false
})
async function confirmDiscardChanges() {
  if (!dirty.value) return true
  try {
    await ElMessageBox.confirm('有未保存的权限修改，确定离开吗？', '未保存提示', {
      type: 'warning',
      confirmButtonText: '离开',
      cancelButtonText: '继续编辑',
    })
    return true
  } catch {
    return false
  }
}
function onBeforeUnload(e) {
  if (!dirty.value) return
  e.preventDefault()
  e.returnValue = ''
}
onBeforeRouteLeave(async () => {
  return confirmDiscardChanges()
})
const isSuperAdminRole = computed(() => currentRole.value?.code === 'SUPER_ADMIN')
const filteredRoles = computed(() => {
  const keyword = roleKeyword.value.trim().toLowerCase()
  if (!keyword) return roles.value
  return roles.value.filter(
    (role) =>
      role.name.toLowerCase().includes(keyword) || role.code.toLowerCase().includes(keyword),
  )
})
const menuTree = computed(() => toMenuNodes(routeTree.value))
const selectedRoute = computed(() =>
  selectedRouteId.value != null ? (routeById.get(selectedRouteId.value) ?? null) : null,
)
const selectedMenu = computed(() => {
  const code = selectedRoute.value?.permission
  return code ? (permissionByCode.get(code) ?? null) : null
})
const detailGroups = computed(() => {
  const groups = {
    capability: [],
    api: [],
    button: [],
    tableButton: [],
  }
  for (const child of selectedMenu.value?.children ?? []) {
    // 能力型权限独立成组；兼容旧数据仍挂在 API 下的敏感权限
    if (child.action === 'capability' || child.code === 'user:sensitive:view') {
      groups.capability.push(child)
    } else if (child.type === 'API') {
      groups.api.push(child)
    } else if (child.type === 'BUTTON') {
      groups.button.push(child)
    } else if (child.type === 'TABLE_BUTTON') {
      groups.tableButton.push(child)
    }
  }
  return groups
})
const assignableItems = computed(() => [
  ...detailGroups.value.capability,
  ...detailGroups.value.button,
  ...detailGroups.value.tableButton,
  ...detailGroups.value.api,
])
const isAllChecked = computed(
  () =>
    assignableItems.value.length > 0 &&
    assignableItems.value.every((item) => checkedIds.value.has(item.id)),
)
const isIndeterminate = computed(() => {
  const checked = assignableItems.value.filter((item) => checkedIds.value.has(item.id)).length
  return checked > 0 && checked < assignableItems.value.length
})
function filterMenuNode(value, data) {
  if (!value) return true
  const q = value.trim().toLowerCase()
  if (!q) return true
  return (
    String(data.name ?? '')
      .toLowerCase()
      .includes(q) ||
    String(data.code ?? '')
      .toLowerCase()
      .includes(q)
  )
}
function toMenuNodes(nodes) {
  return [...nodes]
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
    .map((node) => {
      const code = node.permission || undefined
      const permissionControl = !!node.permissionControl
      const disabled = !(node.type === 'MENU' && permissionControl)
      return {
        id: node.id,
        name: node.title,
        code,
        type: node.type,
        permissionControl,
        disabled,
        permissionId: code ? permissionByCode.get(code)?.id : undefined,
        children: node.children?.length ? toMenuNodes(node.children) : [],
      }
    })
}
function indexPermissions(nodes) {
  for (const node of nodes) {
    permissionById.set(node.id, node)
    if (node.code) permissionByCode.set(node.code, node)
    if (node.children?.length) indexPermissions(node.children)
  }
}
function indexRoutes(nodes) {
  for (const node of nodes) {
    routeById.set(node.id, node)
    if (node.children?.length) indexRoutes(node.children)
  }
}
/** 仅收集按钮/接口（不含子菜单权限） */
function collectDirectAssignable(node) {
  if (!node?.children) return []
  return node.children.filter((child) => child.type !== 'MENU')
}
function collectAssignableUnderRoute(node) {
  const map = new Map()
  const walk = (n) => {
    if (n.code) {
      for (const item of collectDirectAssignable(permissionByCode.get(n.code))) {
        map.set(item.id, item)
      }
    }
    n.children.forEach(walk)
  }
  walk(node)
  return Array.from(map.values())
}
function menuStat(node) {
  const items = collectAssignableUnderRoute(node)
  const checked = items.filter((item) => checkedIds.value.has(item.id)).length
  return { total: items.length, checked }
}
function methodTagType(method) {
  switch (method) {
    case 'GET':
      return 'success'
    case 'POST':
      return 'primary'
    case 'PUT':
      return 'warning'
    case 'DELETE':
      return 'danger'
    default:
      return 'info'
  }
}
function isChecked(id) {
  return checkedIds.value.has(id)
}
function setChecked(id, value) {
  if (value) checkedIds.value.add(id)
  else checkedIds.value.delete(id)
}
function toggleItem(id) {
  setChecked(id, !checkedIds.value.has(id))
}
function toggleSelectAll(value) {
  const on = Boolean(value)
  for (const item of assignableItems.value) setChecked(item.id, on)
}
function onMenuClick(data) {
  if (data.disabled) return
  selectedRouteId.value = Number(data.id)
}
function firstAssignableRouteId(nodes) {
  const walk = (list, requireAssignable) => {
    for (const node of list) {
      if (
        !node.disabled &&
        (!requireAssignable ||
          collectDirectAssignable(node.code ? permissionByCode.get(node.code) : undefined).length >
            0)
      ) {
        return node.id
      }
      const childMatch = walk(node.children, requireAssignable)
      if (childMatch != null) return childMatch
    }
    return null
  }
  return walk(nodes, true) ?? walk(nodes, false)
}
async function loadRoles() {
  const res = await getOptions()
  // 超级管理员默认拥有全部权限，不在此页配置
  roles.value = (res.data || []).filter((r) => r.code !== 'SUPER_ADMIN')
}
async function loadTrees() {
  if (routeTree.value.length && permissionByCode.size) return
  treeLoading.value = true
  try {
    const [routeRes, permRes] = await Promise.all([listRoutes(), listPermissions()])
    routeTree.value = routeRes.data
    routeById.clear()
    indexRoutes(routeRes.data)
    permissionById.clear()
    permissionByCode.clear()
    indexPermissions(permRes.data)
  } finally {
    treeLoading.value = false
  }
}
async function selectRole(role) {
  if (currentRole.value && currentRole.value.id !== role.id) {
    const ok = await confirmDiscardChanges()
    if (!ok) return
  }
  currentRole.value = role
  selectedRouteId.value = null
  menuKeyword.value = ''
  checkedIds.value = new Set()
  savedIds.value = new Set()
  await loadTrees()
  if (role.code === 'SUPER_ADMIN') {
    return
  }
  const detail = await get(role.id)
  const ids = new Set(detail.data.permissionIds)
  checkedIds.value = new Set(ids)
  savedIds.value = new Set(ids)
  const firstId = firstAssignableRouteId(menuTree.value)
  selectedRouteId.value = firstId
  await nextTick()
  if (firstId != null) menuTreeRef.value?.setCurrentKey(firstId)
}
async function handleSave() {
  if (!currentRole.value || !dirty.value) return
  saving.value = true
  try {
    await assignPermissions(currentRole.value.id, Array.from(checkedIds.value))
    savedIds.value = new Set(checkedIds.value)
    ElMessage.success(`已为「${currentRole.value.name}」保存权限配置`)
  } finally {
    saving.value = false
  }
}
function selectRoleByQuery() {
  const roleId = Number(route.query.roleId)
  if (!roleId) return false
  const role = roles.value.find((item) => item.id === roleId)
  if (!role) return false
  selectRole(role)
  return true
}
async function selectDefaultRole() {
  if (selectRoleByQuery()) return
  if (roles.value.length) {
    await selectRole(roles.value[0])
  }
}
watch(
  () => route.query.roleId,
  () => {
    if (roles.value.length) {
      selectDefaultRole()
    }
  },
)
onMounted(async () => {
  window.addEventListener('beforeunload', onBeforeUnload)
  await loadRoles()
  await selectDefaultRole()
})
onUnmounted(() => {
  window.removeEventListener('beforeunload', onBeforeUnload)
})
</script>

<style scoped>
.role-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid var(--el-border-color);
  margin-bottom: 8px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.role-item:hover {
  background: var(--app-fill-color, #f5f7fa);
}

.role-item.is-active {
  background: var(--app-surface-soft, #ecf5ff);
  border-color: var(--app-surface-soft-border, #b3d8ff);
}

.role-item__name {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  color: var(--app-text-primary, #303133);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
}

.role-item :deep(.el-tag) {
  flex-shrink: 0;
  margin: 0;
}

.role-perm__title {
  margin: 0 0 4px;
  font-size: var(--app-font-size-main);
  color: #303133;
}

.role-perm__desc {
  margin: 0;
  font-size: var(--app-font-size-main);
  color: #909399;
}

.role-perm__main-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.role-perm__main-body.is-super-admin {
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--app-card-bg, #fff);
}

.role-perm__locked {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.role-perm__locked-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 360px;
  padding: 32px 28px;
}

.role-perm__locked-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: 16px;
  border-radius: 50%;
  background: var(--app-surface-soft);
  color: var(--app-color-primary);
}

.role-perm__locked-title {
  margin: 0 0 8px;
  font-size: var(--app-font-size-main);
  font-weight: 600;
  color: var(--app-text-primary, #303133);
}

.role-perm__locked-desc {
  margin: 0;
  font-size: var(--app-font-size-main);
  line-height: 1.6;
  color: var(--app-text-muted, #909399);
}

.role-perm__body {
  flex: 1;
  min-height: 0;
  display: flex;
  margin: 16px 16px 0;
  border: 1px solid var(--app-border-color, #ebeef5);
  overflow: hidden;
  background: var(--app-card-bg, #fff);
}

.role-perm__footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin: 0 16px 16px;
  padding: 12px 16px;
  background: var(--app-card-bg, #fff);
  border: 1px solid var(--app-border-color, #ebeef5);
  border-top: none;
}

.role-perm__footer-tip {
  margin-right: auto;
  font-size: var(--app-font-size-main);
  color: var(--app-text-muted, #909399);
}

.role-perm__footer-tip.is-dirty {
  color: #e6a23c;
}

.role-perm__menus {
  border-right: 1px solid var(--app-border-color, #ebeef5);
}

.menu-node {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  overflow: hidden;
}

.menu-node.is-disabled .menu-node__name {
  color: #c0c4cc;
}

.menu-node__check {
  height: auto;
}

.menu-node__name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-node__badge {
  flex-shrink: 0;
}

.role-perm__detail {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  overflow: hidden;
}

.role-perm__detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}

.role-perm__detail-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: var(--app-font-size-main);
  font-weight: 600;
  color: #303133;
}

.role-perm__detail-code {
  font-size: var(--app-font-size-main);
  font-weight: 400;
  color: #909399;
}

.role-perm__detail-scroll {
  flex: 1;
  min-height: 0;
}

.perm-group {
  margin-bottom: 20px;
}

.perm-group__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--app-font-size-main);
  font-weight: 600;
  color: #606266;
  margin-bottom: 12px;
}

.perm-group__hint {
  margin: -4px 0 12px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.perm-group__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 6px;
  font-size: var(--app-font-size-main);
  font-weight: 400;
  color: #909399;
  background: #f0f2f5;
  border-radius: 9px;
}

.perm-group__items {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.perm-btn {
  margin-right: 0;
}

.perm-btn__type {
  margin-left: 6px;
}

.perm-group__apis {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.perm-api {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid var(--app-border-color, #ebeef5);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.perm-api:hover {
  background: var(--app-fill-color, #f5f7fa);
}

.perm-api.is-checked {
  background: var(--app-surface-soft, #ecf5ff);
  border-color: var(--app-surface-soft-border, #b3d8ff);
}

.perm-api__method {
  flex-shrink: 0;
  width: 62px;
  text-align: center;
  font-family: monospace;
}

.perm-api__name {
  flex-shrink: 0;
  color: var(--app-text-primary, #303133);
  font-size: var(--app-font-size-main);
}

.perm-api__path {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--app-font-size-main);
  color: #909399;
}

.role-perm__empty {
  margin: auto;
}
</style>
