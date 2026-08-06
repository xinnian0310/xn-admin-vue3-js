import request from '@/utils/request'
function getTableColumns(tableKey) {
  return request.get('/table-columns', {
    params: { tableKey },
  })
}
function saveTableColumns(payload) {
  return request.put('/table-columns', payload)
}
export { getTableColumns, saveTableColumns }
