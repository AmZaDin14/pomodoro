import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification'

import type { SessionType } from './timer-machine.js'

const titles: Record<SessionType, string> = {
  work: 'Work session complete!',
  shortBreak: 'Break over!',
  longBreak: 'Long break over!',
}

const bodies: Record<SessionType, string> = {
  work: 'Time for a break.',
  shortBreak: 'Ready to focus.',
  longBreak: 'Ready for the next cycle.',
}

export async function notifySessionEnd(session: SessionType): Promise<void> {
  let granted = await isPermissionGranted()
  if (!granted) {
    const permission = await requestPermission()
    granted = permission === 'granted'
  }
  if (granted) {
    sendNotification({ title: titles[session], body: bodies[session] })
  }
}
