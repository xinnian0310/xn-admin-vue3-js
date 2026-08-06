import request from '@/utils/request'
function listTables(includeSys = false) {
  return request.get('/codegen/tables', {
    params: { includeSys },
  })
}
function listColumns(tableName) {
  return request.get(`/codegen/tables/${encodeURIComponent(tableName)}/columns`)
}
function generate(data) {
  return request.post('/codegen/generate', data)
}
export { generate, listColumns, listTables }
