import { inject, isRef } from 'vue'
const CRUD_API_KEY = 'crudApi'
function useCrudApi() {
  const injected = inject(CRUD_API_KEY, null)
  if (injected == null) {
    throw new Error(
      '[useCrudApi] \u672A\u6CE8\u5165 crudApi\uFF0C\u8BF7\u5728 xnTable \u4E0A\u914D\u7F6E api',
    )
  }
  return new Proxy(
    {},
    {
      get(_target, prop, _receiver) {
        const api = isRef(injected) ? injected.value : injected
        if (!api) {
          throw new Error(
            '[useCrudApi] crudApi \u4E3A\u7A7A\uFF0C\u8BF7\u786E\u8BA4 xnTable \u7684 api \u914D\u7F6E\u6B63\u786E',
          )
        }
        const value = Reflect.get(api, prop, api)
        return typeof value === 'function' ? value.bind(api) : value
      },
    },
  )
}
export { CRUD_API_KEY, useCrudApi }
