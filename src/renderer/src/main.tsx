import './assets/main.css'

import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import LockScreen from './UI/LockScreen'
import LoginPage from './auth/Login'
import SetupPage from './auth/Setup'

const electronAPI = (window as any).electron?.ipcRenderer

const RootApp = () => {
  const [authState, setAuthState] = useState<'loading' | 'login' | 'setup' | 'locked' | 'app'>(
    'loading'
  )

  useEffect(() => {
    const checkSystemState = async () => {
      const jwt = localStorage.getItem('iris_cloud_token')
      if (!jwt) {
        setAuthState('login')
        return
      }

      if (electronAPI) {
        const keysExist = await electronAPI.invoke('check-keys-exist')
        if (!keysExist) {
          setAuthState('setup')
          return
        }
      }

      setAuthState('locked')
    }

    checkSystemState()

    if (electronAPI) {
      electronAPI.on('oauth-callback', (_event: any, url: string) => {
        const urlObj = new URL(url)
        const token = urlObj.searchParams.get('token')
        if (token) {
          localStorage.setItem('iris_cloud_token', token)
          checkSystemState()
        }
      })
    }
  }, [])

  if (authState === 'loading') {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center text-[#10b981] font-mono text-sm">
        Checking System Integrity...
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-black overflow-hidden relative border border-emerald-500/20 rounded-xl">
      <div className="flex-1 relative overflow-hidden">
        {authState === 'login' && <LoginPage onLoginSuccess={() => setAuthState('setup')} />}
        {authState === 'setup' && <SetupPage onSetupComplete={() => setAuthState('locked')} />}
        {authState === 'locked' && <LockScreen onUnlock={() => setAuthState('app')} />}
        {authState === 'app' && <App />}
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>
)
