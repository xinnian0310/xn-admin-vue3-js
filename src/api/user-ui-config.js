import request from '@/utils/request'
function getUserUiConfig() {
  return request.get('/user-ui-config')
}
function saveUserUiConfig(data) {
  return request.put('/user-ui-config', data)
}
function resetUserUiConfig() {
  return request.delete('/user-ui-config')
}
export { getUserUiConfig, resetUserUiConfig, saveUserUiConfig }
