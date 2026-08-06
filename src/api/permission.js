import request from '@/utils/request'
function list() {
  return request.get('/permissions/tree')
}
function findInTree(nodes, id) {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children?.length) {
      const found = findInTree(node.children, id)
      if (found) return found
    }
  }
  return void 0
}
async function get(id) {
  const res = await list()
  const found = findInTree(res.data, id)
  if (!found) {
    return Promise.reject(new Error(`\u6743\u9650\u4E0D\u5B58\u5728: ${id}`))
  }
  return { ...res, data: found }
}
function create(data) {
  return request.post('/permissions', data)
}
function update(id, data) {
  return request.put(`/permissions/${id}`, data)
}
function remove(id) {
  return request.delete(`/permissions/${id}`)
}
function getMenuGroups(menuId) {
  return request.get(`/permissions/${menuId}/groups`)
}
export { create, get, getMenuGroups, list, remove, update }
