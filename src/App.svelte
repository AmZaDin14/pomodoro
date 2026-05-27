<script lang="ts">
  import { onMount } from 'svelte'
  import { listen } from '@tauri-apps/api/event'
  import { invoke } from '@tauri-apps/api/core'
  import { initialState, transition, type TimerState } from './lib/timer-machine.js'
  import { createTicker } from './lib/ticker.js'
  import { formatTime } from './lib/format.js'
  import { handleTrayCommand } from './lib/tray-handler.js'
  import { playChime } from './lib/sound-player.js'
  import { notifySessionEnd } from './lib/notifier.js'

  let state: TimerState = $state(initialState)
  let flash = $state(false)

  const ticker = createTicker(() => {
    const prevSession = state.session
    const result = transition(state, 'tick')
    state = result.state
    if (result.events.includes('sessionEnded')) {
      playChime()
      notifySessionEnd(prevSession)
      flash = true
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

  onMount(() => {
    const un1 = listen('tray:pause_resume', () => handleClick())
    const un2 = listen('tray:skip', () => {
      state = handleTrayCommand(state, 'skip').state
      ticker.start()
    })
    const un3 = listen('tray:stop', () => {
      state = handleTrayCommand(state, 'stop').state
      ticker.stop()
    })
    const un4 = listen('tray:quit', () => {
      ticker.stop()
      window.close()
    })

    return () => {
      un1.then(f => f())
      un2.then(f => f())
      un3.then(f => f())
      un4.then(f => f())
    }
  })

  $effect(() => {
    invoke('set_tray_phase', { phase: state.phase })
  })

  $effect(() => {
    if (flash) {
      const timer = setTimeout(() => flash = false, 1500)
      return () => clearTimeout(timer)
    }
  })

  $effect(() => {
    return () => ticker.stop()
  })
</script>

<div
  class="container"
  class:flash
  data-tauri-drag-region
  onclick={handleClick}
  onkeydown={(e) => e.key === 'Enter' && handleClick()}
  role="button"
  tabindex="0"
>
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
    transition: background 0.3s;
  }

  .container.flash {
    background: #3a3a3a;
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
