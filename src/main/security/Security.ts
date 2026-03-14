import { ipcMain } from 'electron'
import Store from 'electron-store'
import bcrypt from 'bcryptjs'

const StoreClass = (Store as any).default || Store
const store = new StoreClass()

export default function registerSecurityVault() {
  const legacyFace = store.get('iris_vault_face') as number[] | undefined
  if (legacyFace && !store.get('iris_vault_faces')) {
    store.set('iris_vault_faces', [legacyFace])
    store.delete('iris_vault_face')
  }

  ipcMain.handle('check-vault-status', () => {
    const hasPin = !!store.get('iris_vault_hash')
    const faces = store.get('iris_vault_faces') as number[][] | undefined
    const hasFace = faces && faces.length > 0
    return { hasPin, hasFace, faceCount: faces ? faces.length : 0 }
  })

  ipcMain.handle('get-personality', () => {
    return store.get('iris_personality') as string | undefined
  })

  ipcMain.handle('set-personality', (_, text: string) => {
    store.set('iris_personality', text)
    return true
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
    const faces = (store.get('iris_vault_faces') as number[][]) || []
    faces.push(descriptor)
    store.set('iris_vault_faces', faces)
    return true
  })

  ipcMain.handle('verify-vault-face', (_, descriptor: number[]) => {
    const faces = store.get('iris_vault_faces') as number[][] | undefined
    if (!faces || faces.length === 0) return false

    for (const savedFace of faces) {
      if (savedFace.length !== 128) continue
      let distance = 0
      for (let i = 0; i < descriptor.length; i++) {
        distance += Math.pow(descriptor[i] - savedFace[i], 2)
      }
      distance = Math.sqrt(distance)

      if (distance < 0.55) return true
    }
    return false
  })
}
