import './assets/main.css'

import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import LockScreen from './UI/LockScreen' // 🚨 IMPORT VAULT HERE

const RootApp = () => {
  const [isUnlocked, setIsUnlocked] = useState(false)

  return (
    // The master wrapper that holds the entire desktop window
    <div className="flex flex-col h-screen w-screen bg-black overflow-hidden relative border border-emerald-500/20 rounded-xl">
      <div className="flex-1 relative overflow-hidden">
        {!isUnlocked ? (
          <LockScreen onUnlock={() => setIsUnlocked(true)} />
        ) : (
          <App />
        )}
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>
)