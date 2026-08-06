import request from '@/utils/request'
function login(data) {
  return request.post('/auth/login', data)
}
function logout(token) {
  return request.post(
    '/auth/logout',
    null,
    token ? { headers: { Authorization: `Bearer ${token}` } } : void 0,
  )
}
function fetchCaptcha() {
  return request.get('/auth/captcha')
}
function verifySliderCaptcha(captchaId, percent) {
  return request.post('/auth/captcha/slider', { captchaId, percent })
}
function refreshToken() {
  return request.post('/auth/refresh')
}
function getCurrentUser() {
  return request.get('/auth/me')
}
function updateCurrentUser(data) {
  return request.put('/auth/me', data)
}
function changePassword(data) {
  return request.put('/auth/me/password', data)
}
function getPasswordRules() {
  return request.get('/auth/password-rules')
}
function uploadAvatar(file) {
  const form = new FormData()
  form.append('file', file)
  return request.post('/auth/me/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
function getAuthMenus() {
  return request.get('/auth/menus')
}
function getApiRegistry() {
  return request.get('/auth/api-registry')
}
export {
  changePassword,
  fetchCaptcha,
  getApiRegistry,
  getAuthMenus,
  getCurrentUser,
  getPasswordRules,
  login,
  logout,
  refreshToken,
  updateCurrentUser,
  uploadAvatar,
  verifySliderCaptcha,
}
