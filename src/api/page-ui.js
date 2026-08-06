import request from '@/utils/request'
function getPageUiConfig(path) {
  return request.get('/page-ui', { params: { path } })
}
export { getPageUiConfig }
