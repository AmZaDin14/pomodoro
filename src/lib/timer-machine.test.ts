import { describe, it, expect } from 'vitest'
import { type TimerState, initialState, transition, DURATIONS } from './timer-machine.js'

describe('TimerMachine', () => {
  it('initialState has phase=idle, session=work, cycleCount=0, remaining=1500, total=1500', () => {
    expect(initialState).toEqual({
      phase: 'idle',
      session: 'work',
      cycleCount: 0,
      remaining: DURATIONS.work,
      total: DURATIONS.work,
    })
  })

  it('start transitions idle to running', () => {
    const result = transition(initialState, 'start')
    expect(result.state.phase).toBe('running')
    expect(result.state.session).toBe('work')
    expect(result.state.cycleCount).toBe(0)
    expect(result.state.remaining).toBe(DURATIONS.work)
    expect(result.state.total).toBe(DURATIONS.work)
    expect(result.events).toEqual([])
  })

  it('tick decrements remaining by 1 when running', () => {
    const running = transition(initialState, 'start').state
    const result = transition(running, 'tick')
    expect(result.state.remaining).toBe(DURATIONS.work - 1)
    expect(result.events).toEqual([])
  })

  it('tick to 0 emits sessionEnded and transitions to shortBreak', () => {
    const running: TimerState = {
      phase: 'running', session: 'work', cycleCount: 0,
      remaining: 1, total: DURATIONS.work,
    }
    const result = transition(running, 'tick')
    expect(result.state.remaining).toBe(DURATIONS.shortBreak)
    expect(result.state.total).toBe(DURATIONS.shortBreak)
    expect(result.state.session).toBe('shortBreak')
    expect(result.state.cycleCount).toBe(0)
    expect(result.state.phase).toBe('idle')
    expect(result.events).toEqual(['sessionEnded'])
  })

  it('pause sets phase to paused', () => {
    const running = transition(initialState, 'start').state
    const result = transition(running, 'pause')
    expect(result.state.phase).toBe('paused')
    expect(result.state.remaining).toBe(DURATIONS.work)
    expect(result.events).toEqual([])
  })

  it('resume sets phase back to running', () => {
    const running = transition(initialState, 'start').state
    const paused = transition(running, 'pause').state
    const result = transition(paused, 'resume')
    expect(result.state.phase).toBe('running')
    expect(result.state.remaining).toBe(DURATIONS.work)
    expect(result.events).toEqual([])
  })

  it('skip advances from work to shortBreak, keeping cycleCount', () => {
    const running: TimerState = {
      phase: 'running', session: 'work', cycleCount: 2,
      remaining: 800, total: DURATIONS.work,
    }
    const result = transition(running, 'skip')
    expect(result.state.session).toBe('shortBreak')
    expect(result.state.cycleCount).toBe(2)
    expect(result.state.remaining).toBe(DURATIONS.shortBreak)
    expect(result.state.total).toBe(DURATIONS.shortBreak)
    expect(result.state.phase).toBe('idle')
    expect(result.events).toEqual([])
  })

  it('stop resets remaining to total, goes to idle, preserves session/cycleCount', () => {
    const running: TimerState = {
      phase: 'running', session: 'work', cycleCount: 2,
      remaining: 400, total: DURATIONS.work,
    }
    const result = transition(running, 'stop')
    expect(result.state.remaining).toBe(DURATIONS.work)
    expect(result.state.phase).toBe('idle')
    expect(result.state.session).toBe('work')
    expect(result.state.cycleCount).toBe(2)
    expect(result.state.total).toBe(DURATIONS.work)
    expect(result.events).toEqual([])
  })

  it('4th work ticking to 0 emits cycleComplete and transitions to longBreak', () => {
    const running: TimerState = {
      phase: 'running', session: 'work', cycleCount: 3,
      remaining: 1, total: DURATIONS.work,
    }
    const result = transition(running, 'tick')
    expect(result.state.session).toBe('longBreak')
    expect(result.state.cycleCount).toBe(4)
    expect(result.state.remaining).toBe(DURATIONS.longBreak)
    expect(result.state.total).toBe(DURATIONS.longBreak)
    expect(result.state.phase).toBe('idle')
    expect(result.events).toContain('cycleComplete')
    expect(result.events).toContain('sessionEnded')
  })

  it('longBreak ticking to 0 resets to Work, cycleCount=0', () => {
    const running: TimerState = {
      phase: 'running', session: 'longBreak', cycleCount: 4,
      remaining: 1, total: DURATIONS.longBreak,
    }
    const result = transition(running, 'tick')
    expect(result.state.session).toBe('work')
    expect(result.state.cycleCount).toBe(0)
    expect(result.state.remaining).toBe(DURATIONS.work)
    expect(result.state.total).toBe(DURATIONS.work)
    expect(result.state.phase).toBe('idle')
    expect(result.events).toEqual(['sessionEnded'])
  })

  it('skip from shortBreak goes to Work and increments cycleCount', () => {
    const running: TimerState = {
      phase: 'running', session: 'shortBreak', cycleCount: 1,
      remaining: 200, total: DURATIONS.shortBreak,
    }
    const result = transition(running, 'skip')
    expect(result.state.session).toBe('work')
    expect(result.state.cycleCount).toBe(2)
    expect(result.state.remaining).toBe(DURATIONS.work)
    expect(result.state.total).toBe(DURATIONS.work)
    expect(result.state.phase).toBe('idle')
    expect(result.events).toEqual([])
  })

  it('skip from longBreak goes to Work, cycleCount=0', () => {
    const running: TimerState = {
      phase: 'running', session: 'longBreak', cycleCount: 4,
      remaining: 500, total: DURATIONS.longBreak,
    }
    const result = transition(running, 'skip')
    expect(result.state.session).toBe('work')
    expect(result.state.cycleCount).toBe(0)
    expect(result.state.remaining).toBe(DURATIONS.work)
    expect(result.state.total).toBe(DURATIONS.work)
    expect(result.state.phase).toBe('idle')
    expect(result.events).toEqual([])
  })

  it('tick while paused does not decrement remaining', () => {
    const running = transition(initialState, 'start').state
    const paused = transition(running, 'pause').state
    const result = transition(paused, 'tick')
    expect(result.state.remaining).toBe(DURATIONS.work)
    expect(result.state.phase).toBe('paused')
    expect(result.events).toEqual([])
  })

  it('stop preserves cycleCount and session', () => {
    const running: TimerState = {
      phase: 'running', session: 'shortBreak', cycleCount: 3,
      remaining: 100, total: DURATIONS.shortBreak,
    }
    const result = transition(running, 'stop')
    expect(result.state.cycleCount).toBe(3)
    expect(result.state.session).toBe('shortBreak')
    expect(result.state.remaining).toBe(DURATIONS.shortBreak)
    expect(result.state.phase).toBe('idle')
    expect(result.events).toEqual([])
  })
})
