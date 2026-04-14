import { ipcMain } from 'electron'

export default function registerLockSystem() {
  ipcMain.on('trigger-lockdown', (event) => {
    console.log('🔒 TACTICAL LOCKDOWN INITIATED VIA AI.')
    event.sender.reload()
  })
}
