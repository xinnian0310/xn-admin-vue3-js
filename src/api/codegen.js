import request from '@/utils/request'
import { APP_CLIENT_ID } from '@/config/client'

function listTables(includeSys = false) {
  return request.get('/codegen/tables', {
    params: { includeSys },
  })
}
function listColumns(tableName) {
  return request.get(`/codegen/tables/${encodeURIComponent(tableName)}/columns`)
}
function generate(data) {
  return request.post('/codegen/generate', {
    ...data,
    clientId: data?.clientId || APP_CLIENT_ID,
  })
}
export { generate, listColumns, listTables }
