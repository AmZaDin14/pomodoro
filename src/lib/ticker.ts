export interface Ticker {
  start(): void
  stop(): void
}

export function createTicker(onTick: () => void, intervalMs: number): Ticker {
  let id: ReturnType<typeof setInterval> | undefined

  return {
    start() {
      if (id !== undefined) return
      id = setInterval(onTick, intervalMs)
    },
    stop() {
      if (id !== undefined) {
        clearInterval(id)
        id = undefined
      }
    },
  }
}
