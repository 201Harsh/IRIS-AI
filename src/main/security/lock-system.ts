import { ipcMain } from 'electron'

export default function registerLockSystem() {
  ipcMain.on('trigger-lockdown', (event) => {
    event.sender.reload()
  })
}