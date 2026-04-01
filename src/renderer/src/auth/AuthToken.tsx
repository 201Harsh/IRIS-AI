'use client'

import AxiosInstance from '@renderer/config/AxiosInstance'
import { useAuthStore } from '@renderer/store/auth-store'
import { useEffect } from 'react'

export default function AuthInitializer() {
  const setAccessToken = useAuthStore((s) => s.setAccessToken)
  const setIsAuthInitialized = useAuthStore((s) => s.setIsAuthInitialized)

  useEffect(() => {
    const init = async () => {
      try {
        const res = await AxiosInstance.post('/users/refresh-token')

        const accessToken = res.data.accessToken

        setAccessToken(accessToken)
      } catch (err) {
        setAccessToken(null)
      } finally {
        setIsAuthInitialized(true)
      }
    }

    init()
  }, [setAccessToken, setIsAuthInitialized])

  return null
}
