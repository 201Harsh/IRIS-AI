import { ipcMain } from 'electron'
import Store from 'electron-store'
import bcrypt from 'bcryptjs'

const StoreClass = (Store as any).default || Store
const store = new StoreClass()

export default function registerSecurityVault() {
  ipcMain.handle('check-vault-status', () => {
    const hasPin = !!store.get('iris_vault_hash')
    const hasFace = !!store.get('iris_vault_face')
    return { hasPin, hasFace }
  })

  ipcMain.handle('setup-vault-pin', async (_, pin: string) => {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(pin, salt)
    store.set('iris_vault_hash', hash)
    return true
  })

  ipcMain.handle('verify-vault-pin', async (_, pin: string) => {
    const hash = store.get('iris_vault_hash') as string
    if (!hash) return false
    return await bcrypt.compare(pin, hash)
  })

  ipcMain.handle('setup-vault-face', (_, descriptor: number[]) => {
    store.set('iris_vault_face', descriptor)
    return true
  })

  ipcMain.handle('verify-vault-face', (_, descriptor: number[]) => {
    const savedFace = store.get('iris_vault_face') as number[] | undefined
    if (!savedFace || savedFace.length !== 128) return false

    let distance = 0
    for (let i = 0; i < descriptor.length; i++) {
      distance += Math.pow(descriptor[i] - savedFace[i], 2)
    }
    distance = Math.sqrt(distance)

    return distance < 0.55
  })
}
