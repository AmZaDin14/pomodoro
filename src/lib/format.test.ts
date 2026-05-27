import { describe, it, expect } from 'vitest'
import { formatTime } from './format.js'

describe('formatTime', () => {
  it('0 seconds formats as 00:00', () => {
    expect(formatTime(0)).toBe('00:00')
  })

  it('90 seconds formats as 01:30', () => {
    expect(formatTime(90)).toBe('01:30')
  })

  it('1500 seconds formats as 25:00', () => {
    expect(formatTime(1500)).toBe('25:00')
  })
})
