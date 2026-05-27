import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createTicker } from './ticker.js'

describe('createTicker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('start() fires the callback', () => {
    const fn = vi.fn()
    const ticker = createTicker(fn, 1000)
    ticker.start()
    vi.advanceTimersByTime(1000)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('stop() prevents further callbacks', () => {
    const fn = vi.fn()
    const ticker = createTicker(fn, 1000)
    ticker.start()
    vi.advanceTimersByTime(1000)
    expect(fn).toHaveBeenCalledTimes(1)
    ticker.stop()
    vi.advanceTimersByTime(2000)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('start() twice does not double-register', () => {
    const fn = vi.fn()
    const ticker = createTicker(fn, 1000)
    ticker.start()
    ticker.start()
    vi.advanceTimersByTime(1000)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
