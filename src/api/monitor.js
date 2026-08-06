import request from '@/utils/request'
function getOnlineUsers() {
  return request.get('/monitor/online')
}
function kickUser(userId) {
  return request.post(`/monitor/online/${userId}/kick`)
}
function getServerMonitor() {
  return request.get('/monitor/server')
}
function getInfraStatus() {
  return request.get('/monitor/infra')
}
function restartInfra(name) {
  return request.post(`/monitor/infra/${name}/restart`)
}
function getRedisMonitor() {
  return request.get('/monitor/redis')
}
function deleteRedisKey(key) {
  return request.delete('/monitor/redis/keys', { params: { key } })
}
function flushRedis() {
  return request.delete('/monitor/redis/flush')
}
function getSqlMonitor() {
  return request.get('/monitor/sql')
}
function cleanSqlMonitor() {
  return request.delete('/monitor/sql/clean')
}
function removeSqlRecord(id) {
  return request.delete(`/monitor/sql/records/${id}`)
}
export {
  cleanSqlMonitor,
  deleteRedisKey,
  flushRedis,
  getInfraStatus,
  getOnlineUsers,
  getRedisMonitor,
  getServerMonitor,
  getSqlMonitor,
  kickUser,
  removeSqlRecord,
  restartInfra,
}
