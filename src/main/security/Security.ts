import { ipcMain } from 'electron'
import Store from 'electron-store'
import bcrypt from 'bcryptjs'

// 🚨 ESM UNWRAP: This rips the class out of the module wrapper so it doesn't crash
const StoreClass = (Store as any).default || Store
const store = new StoreClass()

export default function registerSecurityVault() {
  // Check if a PIN is already set up on this computer
  ipcMain.handle('check-vault-status', () => {
    const existingHash = store.get('iris_vault_hash')
    return !!existingHash // Returns true if a PIN exists
  })

  // Set a new PIN (Hashes it before saving)
  ipcMain.handle('setup-vault-pin', async (_, pin: string) => {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(pin, salt)
    store.set('iris_vault_hash', hash)
    return true
  })

  // Verify the entered PIN against the saved hash
  ipcMain.handle('verify-vault-pin', async (_, pin: string) => {
    const hash = store.get('iris_vault_hash') as string
    if (!hash) return false

    const isValid = await bcrypt.compare(pin, hash)
    return isValid
  })
}
