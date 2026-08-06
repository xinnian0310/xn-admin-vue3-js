import { describe, expect, it } from 'vitest'
import { hexToRgbCss, isLightColor, parseHex, toHex } from './color'
describe('parseHex', () => {
  it('parses 6-digit hex', () => {
    expect(parseHex('#409eff')).toEqual([64, 158, 255])
  })
  it('parses 3-digit hex', () => {
    expect(parseHex('#abc')).toEqual([170, 187, 204])
  })
  it('returns null for invalid input', () => {
    expect(parseHex('not-a-color')).toBeNull()
  })
})
describe('toHex / hexToRgbCss', () => {
  it('round-trips rgb to hex', () => {
    expect(toHex(64, 158, 255)).toBe('#409eff')
  })
  it('formats rgb css channel list', () => {
    expect(hexToRgbCss('#409eff')).toBe('64, 158, 255')
  })
})
describe('isLightColor', () => {
  it('treats white as light and near-black as dark', () => {
    expect(isLightColor('#ffffff')).toBe(true)
    expect(isLightColor('#111111')).toBe(false)
  })
})
