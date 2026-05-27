# Pomodoro App

## Domain terms

- **App:** A Tauri desktop application with a Svelte frontend, running as a small always-on-top window.
- **Pomodoro cycle:** Standard durations (25 min work, 5 min short break, 15 min long break after 4 work sessions).
- **Timer states:** Idle → Work → ShortBreak ↺ (repeat 3×) → Work → LongBreak → Work (repeat).
- **Pause:** Timer pauses; resume continues from where it left off.
- **Skip:** Current session (work or break) can be skipped, advancing to the next state in the cycle.
- **Stop:** Resets the current timer only; preserves cycle position (e.g., stopping work session 2 means "Start" resumes work session 2).
- **Notification:** Sound + system notification on session end.
- **Window layout:** Two-line text-only widget — top row shows MM:SS, bottom row shows state label and cycle count (e.g., "Work 2/4").
- **Controls:** Click window to pause/resume. Right-click → system tray menu with Pause/Resume, Skip, Stop, Quit.
