# Pomodoro App — Product Requirements Document

## Problem Statement

Desktop Pomodoro timers are either full-window apps that steal screen real estate or browser tabs buried among dozens of others. There is no lightweight, always-on-top widget that lives in the corner of the screen, showing exactly the two numbers you need: time remaining and which session you're on.

## Solution

A Tauri v2 desktop app with a Svelte frontend that renders a 200×70px always-on-top text widget. The window sits at the top-right of the screen showing `MM:SS` on the first line and the session label (e.g., `Work 2/4`) on the second. Click the widget to pause/resume; right-click to open a system tray menu with Pause/Resume, Skip, Stop, and Quit. On session end, the app plays a chime, fires a system notification, and briefly flashes the display.

## User Stories

1. As a user, I want a tiny always-on-top window so I can see my timer without switching context.
2. As a user, I want the timer to show `MM:SS` in large text so I can read it at a glance.
3. As a user, I want the second line to show which session I'm on (`Work 2/4`, `ShortBreak`, `LongBreak`) so I know where I am in the cycle.
4. As a user, I want to click the window to pause/resume the timer so I can handle interruptions.
5. As a user, I want to right-click the tray icon to Pause/Resume, Skip, Stop, or Quit the app so I can control the timer without reaching for the window.
6. As a user, I want standard Pomodoro durations (25 min work, 5 min short break, 15 min long break) so I can follow the proven technique.
7. As a user, I want the cycle to alternate: Work → ShortBreak (×3) → Work → LongBreak → Work (repeat) so I get a longer reset after every 4 work sessions.
8. As a user, I want the timer to pause and resume without resetting so I can step away mid-session.
9. As a user, I want to skip the current session (work or break) and advance to the next so I can adjust on the fly.
10. As a user, I want Stop to reset the current timer only, keeping my place in the cycle so I can restart the same session fresh.
11. As a user, I want a chime to play when a session ends so I notice even if I'm looking away.
12. As a user, I want a system notification banner when a session ends so I notice even if the window is occluded.
13. As a user, I want the window to visually flash when a session ends so I notice even on mute.
14. As a user, I want the window to be draggable so I can position it where I want.
15. As a user, I want the window to remember its last position so it stays where I put it after restart.

## Implementation Decisions

### Module architecture

The app is split into six modules, with the core state machine extracted as a pure, testable deep module:

1. **TimerMachine** — Pure state machine (no I/O, no Tauri, no DOM). Accepts commands and returns the next state with emitted events. Encodes the entire Pomodoro cycle logic.
2. **Ticker** — Wraps `setInterval` at 1 s resolution. Calls `timerMachine.tick()` each beat and forwards the resulting state to the UI.
3. **SoundPlayer** — Thin wrapper around the Web Audio API. `playChime()` decodes and plays an embedded `.wav` resource.
4. **Notifier** — Calls the Tauri notification API and triggers a CSS flash class on the DOM element.
5. **TrayManager** — Creates the system tray icon with its menu (Pause/Resume, Skip, Stop, Quit). Forwards menu commands to the app.
6. **App** — Root Svelte component. Owns the `TimerMachine` instance, wires click/tray events to commands, and binds state to the two-line template.

### TimerMachine interface

```typescript
type Command = 'start' | 'pause' | 'resume' | 'skip' | 'stop' | 'tick'
type SessionType = 'work' | 'shortBreak' | 'longBreak'

interface TimerState {
  phase: 'idle' | 'running' | 'paused'
  session: SessionType
  cycleCount: number    // work sessions completed this cycle (0–4)
  remaining: number     // seconds remaining
  total: number         // total seconds for current session (for display)
}

interface TickResult {
  state: TimerState
  events: Array<'sessionEnded' | 'cycleComplete'>
}

function transition(state: TimerState, command: Command): TickResult
```

### Tray icon

A simple static SVG bundled as a Tauri asset. Created programmatically at build time (or committed as a placeholder).

### Sound

A short `.wav` chime embedded in the Svelte frontend as a base64 asset. Played via the Web Audio API (`AudioContext.decodeAudioData` + `AudioBufferSourceNode`). No Rust audio crates.

### Window configuration

- **Size:** 200 × 70 px (fixed, no resize)
- **Position:** Top-right of primary display, saved to Tauri app config directory on move
- **Decorations:** Frameless (no title bar); draggable via `data-tauri-drag-region`
- **Always-on-top:** Enabled via Tauri v2 `WindowBuilder::set_always_on_top(true)`
- **Devtools:** Disabled in production

### Notifications

- **System notification:** `tauri-plugin-notification` or `tauri::api::notification::Notification` (v2 API)
- **Visual flash:** CSS animation applied to the widget container on session end; removed after 1.5 s

### Backend responsibilities (Rust)

- Create and position the window
- Build and manage the system tray
- Forward tray menu events to the frontend via Tauri events
- (No timer logic runs in Rust)

## Testing Decisions

**What makes a good test:** Test external behavior through the public interface, not internal implementation details. For `TimerMachine`, this means testing that the state returned by `transition()` has the expected shape — not that internal counters or private helpers were called.

- **TimerMachine** — Unit tests covering every state transition: start from idle, tick to zero, pause/resume, skip from every session type, stop mid-session, stop at idle, long break triggers after 4 work sessions. No real timers, no I/O. ~15–20 test cases.
- **Ticker** — Unit test that `start()` calls `transition('tick')` on interval and `stop()` clears it. Mock `setInterval`/`clearInterval`.
- **SoundPlayer** — Unit test that `playChime()` calls `AudioContext.decodeAudioData` and `AudioBufferSourceNode.start`. Mock the Audio API.
- **App** — Component test (with Vitest + jsdom or Playwright) that the two-line template renders `MM:SS` and the session label from a given timer state. Verify clicking dispatches the correct command. Verify flash class is applied on session end.

**Prior art:** No existing tests in the repo — this is the first. Standard Vitest config for Svelte components.

## Out of Scope

- Task/todo list management
- Analytics or statistics (sessions completed per day, etc.)
- Custom duration configuration (uses fixed 25/5/15)
- Global keyboard shortcuts (hotkeys to pause/skip)
- Multiple workspaces/monitor awareness
- Theming or color customization (dark text on dark background is the only variant)
- Resizable window
- Persistent session state across app restart (crash recovery)

## Further Notes

- No state persistence. The app runs continuously in the tray; restarting resets to Idle.
- The `TimerMachine` module is designed so the `transition` function can be extracted into its own npm package or embedded in a Rust enum in the future without changing the test surface.
- Sound asset placeholder: a 1-second 440 Hz sine wave WAV generated at build time or committed as a small file.
- Tray icon placeholder: a 32×32 SVG red circle with the letter "P" in white, matching the minimal aesthetic.
