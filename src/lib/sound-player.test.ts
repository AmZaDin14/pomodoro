import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { playChime } from './sound-player.js'

let createOscillator: ReturnType<typeof vi.fn>
let createGain: ReturnType<typeof vi.fn>

beforeEach(() => {
  const node = { connect: vi.fn().mockReturnThis(), start: vi.fn(), stop: vi.fn() }
  createOscillator = vi.fn(() => ({ ...node, frequency: { value: 0 } }))
  createGain = vi.fn(() => ({ ...node, gain: { value: 0, exponentialRampToValueAtTime: vi.fn() } }))
  vi.stubGlobal('AudioContext', vi.fn().mockImplementation(() => ({
    currentTime: 0,
    destination: {},
    createOscillator,
    createGain,
    close: vi.fn(),
  })))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('playChime', () => {
  it('creates an AudioContext', () => {
    playChime()
    expect(AudioContext).toHaveBeenCalled()
  })

  it('creates an oscillator', () => {
    playChime()
    expect(createOscillator).toHaveBeenCalled()
  })

  it('creates a gain node', () => {
    playChime()
    expect(createGain).toHaveBeenCalled()
  })

  it('sets oscillator frequency to 880 Hz', () => {
    playChime()
    const osc = createOscillator.mock.results[0].value
    expect(osc.frequency.value).toBe(880)
  })
})
