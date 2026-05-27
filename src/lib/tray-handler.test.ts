import { describe, it, expect } from 'vitest'
import { initialState, transition, DURATIONS, type TimerState } from './timer-machine.js'
import { handleTrayCommand } from './tray-handler.js'

describe('handleTrayCommand', () => {
  it('skip from running work goes to shortBreak running', () => {
    const running = transition(initialState, 'start').state
    const result = handleTrayCommand(running, 'skip')
    expect(result.state.session).toBe('shortBreak')
    expect(result.state.phase).toBe('running')
    expect(result.state.remaining).toBe(DURATIONS.shortBreak)
    expect(result.state.cycleCount).toBe(0)
  })

  it('skip from shortBreak goes to next work and increments cycleCount', () => {
    const running: TimerState = {
      phase: 'running', session: 'shortBreak', cycleCount: 1,
      remaining: 100, total: DURATIONS.shortBreak,
    }
    const result = handleTrayCommand(running, 'skip')
    expect(result.state.session).toBe('work')
    expect(result.state.phase).toBe('running')
    expect(result.state.cycleCount).toBe(2)
    expect(result.state.remaining).toBe(DURATIONS.work)
  })

  it('skip from longBreak resets to work with cycleCount 0', () => {
    const running: TimerState = {
      phase: 'running', session: 'longBreak', cycleCount: 4,
      remaining: 500, total: DURATIONS.longBreak,
    }
    const result = handleTrayCommand(running, 'skip')
    expect(result.state.session).toBe('work')
    expect(result.state.phase).toBe('running')
    expect(result.state.cycleCount).toBe(0)
    expect(result.state.remaining).toBe(DURATIONS.work)
  })

  it('stop resets remaining, goes idle, preserves session and cycleCount', () => {
    const running: TimerState = {
      phase: 'running', session: 'work', cycleCount: 2,
      remaining: 400, total: DURATIONS.work,
    }
    const result = handleTrayCommand(running, 'stop')
    expect(result.state.remaining).toBe(DURATIONS.work)
    expect(result.state.phase).toBe('idle')
    expect(result.state.session).toBe('work')
    expect(result.state.cycleCount).toBe(2)
  })
})
