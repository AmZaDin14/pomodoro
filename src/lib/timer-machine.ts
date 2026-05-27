export type Command = 'start' | 'pause' | 'resume' | 'skip' | 'stop' | 'tick'
export type SessionType = 'work' | 'shortBreak' | 'longBreak'

export interface TimerState {
  phase: 'idle' | 'running' | 'paused'
  session: SessionType
  cycleCount: number
  remaining: number
  total: number
}

export interface TickResult {
  state: TimerState
  events: Array<'sessionEnded' | 'cycleComplete'>
}

export const DURATIONS: Record<SessionType, number> = {
  work: 1500,
  shortBreak: 300,
  longBreak: 900,
}

export const initialState: TimerState = {
  phase: 'idle',
  session: 'work',
  cycleCount: 0,
  remaining: DURATIONS.work,
  total: DURATIONS.work,
}

export function transition(state: TimerState, command: Command): TickResult {
  if (command === 'start') {
    return {
      state: { ...state, phase: 'running' },
      events: [],
    }
  }
  if (command === 'pause' && state.phase === 'running') {
    return {
      state: { ...state, phase: 'paused' },
      events: [],
    }
  }
  if (command === 'resume' && state.phase === 'paused') {
    return {
      state: { ...state, phase: 'running' },
      events: [],
    }
  }
  if (command === 'stop') {
    const duration = DURATIONS[state.session]
    return {
      state: {
        ...state,
        phase: 'idle',
        remaining: duration,
        total: duration,
      },
      events: [],
    }
  }
  if (command === 'skip') {
    const nextSession = nextSessionType(state.session)
    const duration = DURATIONS[nextSession]
    const cycleCount = nextSession === 'work' && state.session === 'shortBreak'
      ? state.cycleCount + 1
      : nextSession === 'work' && state.session === 'longBreak'
        ? 0
        : state.cycleCount
    return {
      state: {
        ...state,
        phase: 'idle',
        session: nextSession,
        remaining: duration,
        total: duration,
        cycleCount,
      },
      events: [],
    }
  }
  if (command === 'tick') {
    if (state.phase !== 'running') {
      return { state, events: [] }
    }
    if (state.remaining > 1) {
      return {
        state: { ...state, remaining: state.remaining - 1 },
        events: [],
      }
    }
    if (state.remaining === 1) {
      if (state.session === 'work' && state.cycleCount >= 3) {
        const duration = DURATIONS.longBreak
        return {
          state: {
            ...state,
            phase: 'idle',
            session: 'longBreak',
            remaining: duration,
            total: duration,
            cycleCount: state.cycleCount + 1,
          },
          events: ['sessionEnded', 'cycleComplete'],
        }
      }
      const nextSession = nextSessionType(state.session)
      const duration = DURATIONS[nextSession]
      const cycleCount = state.session === 'longBreak'
        ? 0
        : state.session === 'shortBreak'
          ? state.cycleCount + 1
          : state.cycleCount
      return {
        state: {
          ...state,
          phase: 'idle',
          session: nextSession,
          remaining: duration,
          total: duration,
          cycleCount,
        },
        events: ['sessionEnded'],
      }
    }
  }
  throw new Error('not implemented')
}

function nextSessionType(session: SessionType): SessionType {
  switch (session) {
    case 'work': return 'shortBreak'
    case 'shortBreak': return 'work'
    case 'longBreak': return 'work'
  }
}
