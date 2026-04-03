import { useEffect } from 'react'
import { useAuthStore } from '../store/auth-store'
import AxiosInstance from '../config/AxiosInstance'

export default function AuthInitializer() {
  const setAccessToken = useAuthStore((s) => s.setAccessToken)
  const setIsAuthInitialized = useAuthStore((s: any) => s.setIsAuthInitialized)

  useEffect(() => {
    const init = async () => {
      try {
        const storedRefreshToken = localStorage.getItem('iris_cloud_token')

        if (!storedRefreshToken) {
          setAccessToken(null)
          return
        }

        const res = await AxiosInstance.post('/users/refresh-token', {
          refreshToken: storedRefreshToken
        })

        const accessToken = res.data.accessToken
        setAccessToken(accessToken)

        if (res.data.refreshToken) {
          localStorage.setItem('iris_cloud_token', res.data.refreshToken)
        }
      } catch (err) {
        setAccessToken(null)
        localStorage.removeItem('iris_cloud_token')
      } finally {
        if (setIsAuthInitialized) setIsAuthInitialized(true)
      }
    }

    init()
  }, [setAccessToken, setIsAuthInitialized])

  return null
}
