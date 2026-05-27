import { transition, type TimerState } from './timer-machine.js'

export function handleTrayCommand(state: TimerState, command: 'skip' | 'stop'): { state: TimerState } {
  if (command === 'skip') {
    const skipped = transition(state, 'skip')
    const started = transition(skipped.state, 'start')
    return { state: started.state }
  }
  return { state: transition(state, 'stop').state }
}
