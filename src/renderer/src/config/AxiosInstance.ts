import { useAuthStore } from '@renderer/store/auth-store'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean
}
type QueueItem = {
  resolve: (token: string) => void
  reject: (err: any) => void
}

const AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_KEY
})

AxiosInstance.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken

  if (accessToken) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

let isRefreshing = false
let queue: QueueItem[] = []

const processQueue = (error: any, token: string | null = null) => {
  queue.forEach((prom) => {
    if (error || !token) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  queue = []
}

AxiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes('/refresh-token') &&
      !originalRequest?.url?.includes('/users/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (token: string) => {
              originalRequest.headers = originalRequest.headers || {}
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(AxiosInstance(originalRequest))
            },
            reject: (err: any) => reject(err)
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const currentRefreshToken = localStorage.getItem('iris_cloud_token')

        if (!currentRefreshToken) {
          throw new Error('No refresh token found in local storage.')
        }

        const res = await axios.post(`${import.meta.env.VITE_BACKEND_KEY}/users/refresh-token`, {
          refreshToken: currentRefreshToken
        })

        const newAccessToken = res.data.accessToken

        if (res.data.refreshToken) {
          localStorage.setItem('iris_cloud_token', res.data.refreshToken)
        }

        useAuthStore.getState().setAccessToken(newAccessToken)

        processQueue(null, newAccessToken)

        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        return AxiosInstance(originalRequest)
      } catch (err) {
        processQueue(err, null)

        useAuthStore.getState().logout()
        localStorage.removeItem('iris_cloud_token')
        window.location.hash = '#/login' // Force redirect to login

        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default AxiosInstance
