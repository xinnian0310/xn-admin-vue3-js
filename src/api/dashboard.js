import request from '@/utils/request'
function getDashboardStats() {
  return request.get('/dashboard/stats')
}
export { getDashboardStats }
