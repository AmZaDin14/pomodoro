<script lang="ts">
  import { initialState, transition, type TimerState } from './lib/timer-machine.js'
  import { createTicker } from './lib/ticker.js'
  import { formatTime } from './lib/format.js'

  let state: TimerState = $state(initialState)

  const ticker = createTicker(() => {
    const result = transition(state, 'tick')
    state = result.state
    if (result.events.includes('sessionEnded')) {
      state = transition(state, 'start').state
    }
  }, 1000)

  function handleClick() {
    if (state.phase === 'idle') {
      state = transition(state, 'start').state
      ticker.start()
    } else if (state.phase === 'running') {
      state = transition(state, 'pause').state
      ticker.stop()
    } else if (state.phase === 'paused') {
      state = transition(state, 'resume').state
      ticker.start()
    }
  }

  function getLabel(): string {
    if (state.session === 'work') return `Work ${state.cycleCount + 1}/4`
    if (state.session === 'shortBreak') return 'Short Break'
    return 'Long Break'
  }

  $effect(() => {
    return () => ticker.stop()
  })
</script>

<div class="container" data-tauri-drag-region onclick={handleClick} onkeydown={(e) => e.key === 'Enter' && handleClick()} role="button" tabindex="0">
  <div class="time">{formatTime(state.remaining)}</div>
  <div class="label">{getLabel()}</div>
</div>

<style>
  .container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #1a1a1a;
    color: #ffffff;
    user-select: none;
  }

  .time {
    font-size: 32px;
    font-family: monospace;
    font-weight: bold;
    line-height: 1.1;
  }

  .label {
    font-size: 14px;
    font-family: sans-serif;
    opacity: 0.7;
  }
</style>
