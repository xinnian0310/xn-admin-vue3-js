import request from '@/utils/request'
function getSecurityPolicy() {
  return request.get('/security-policy')
}
function updateSecurityPolicy(data) {
  return request.put('/security-policy', data)
}
function listLockedAccounts() {
  return request.get('/security-policy/locks')
}
function unlockAccount(username) {
  return request.delete(`/security-policy/locks/${encodeURIComponent(username)}`)
}
export { getSecurityPolicy, listLockedAccounts, unlockAccount, updateSecurityPolicy }
