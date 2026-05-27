import { describe, it, expect, vi, beforeEach } from 'vitest'
import { notifySessionEnd } from './notifier.js'

const mockSendNotification = vi.fn()
const mockIsPermissionGranted = vi.fn()
const mockRequestPermission = vi.fn()

vi.mock('@tauri-apps/plugin-notification', () => ({
  isPermissionGranted: () => mockIsPermissionGranted(),
  requestPermission: () => mockRequestPermission(),
  sendNotification: (...args: unknown[]) => mockSendNotification(...args),
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockIsPermissionGranted.mockResolvedValue(true)
})

describe('notifySessionEnd', () => {
  it('sends notification for work session end', async () => {
    await notifySessionEnd('work')
    expect(mockSendNotification).toHaveBeenCalledWith({
      title: 'Work session complete!',
      body: 'Time for a break.',
    })
  })

  it('sends notification for shortBreak end', async () => {
    await notifySessionEnd('shortBreak')
    expect(mockSendNotification).toHaveBeenCalledWith({
      title: 'Break over!',
      body: 'Ready to focus.',
    })
  })

  it('sends notification for longBreak end', async () => {
    await notifySessionEnd('longBreak')
    expect(mockSendNotification).toHaveBeenCalledWith({
      title: 'Long break over!',
      body: 'Ready for the next cycle.',
    })
  })

  it('requests permission when not granted, then sends notification', async () => {
    mockIsPermissionGranted.mockResolvedValue(false)
    mockRequestPermission.mockResolvedValue('granted')
    await notifySessionEnd('work')
    expect(mockRequestPermission).toHaveBeenCalled()
    expect(mockSendNotification).toHaveBeenCalled()
  })

  it('does not send notification if permission denied', async () => {
    mockIsPermissionGranted.mockResolvedValue(false)
    mockRequestPermission.mockResolvedValue('denied')
    await notifySessionEnd('work')
    expect(mockSendNotification).not.toHaveBeenCalled()
  })
})
