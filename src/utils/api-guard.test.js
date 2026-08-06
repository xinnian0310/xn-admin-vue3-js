import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearApiRegistry,
  isApiRegistered,
  isRegistryLoaded,
  isWhitelisted,
  setApiRegistry,
} from './api-guard'
describe('api-guard', () => {
  beforeEach(() => {
    clearApiRegistry()
  })
  it('whitelists auth endpoints before registry load', () => {
    expect(isWhitelisted('/api/auth/login')).toBe(true)
    expect(isWhitelisted('/api/auth/captcha')).toBe(true)
    expect(isWhitelisted('/api/users')).toBe(false)
    expect(isRegistryLoaded()).toBe(false)
  })
  it('matches registered APIs including path variables', () => {
    setApiRegistry({
      apis: [
        { method: 'GET', path: '/api/users' },
        { method: 'DELETE', path: '/api/users/{id}' },
        { method: 'POST', path: '/api/monitor/infra/{name}/restart' },
      ],
      codes: ['api:GET:/api/users'],
    })
    expect(isRegistryLoaded()).toBe(true)
    expect(isApiRegistered('GET', '/api/users')).toBe(true)
    expect(isApiRegistered('DELETE', '/api/users/42')).toBe(true)
    expect(isApiRegistered('POST', '/api/monitor/infra/redis/restart')).toBe(true)
    expect(isApiRegistered('DELETE', '/api/users')).toBe(false)
    expect(isApiRegistered('GET', '/api/roles')).toBe(false)
  })
})
