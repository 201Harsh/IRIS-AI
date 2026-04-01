import AxiosInstance from '@renderer/config/AxiosInstance'
import React from 'react'

const authMiddleware = async ({ children }: { children: React.ReactNode }): Promise<any> => {
  const getUser = async () => {
    try {
      const response = await AxiosInstance.get('/users/me')

      if (response.status === 200) {
        return response.data.data
      }
    } catch (error) {
      return null
    }
  }

  const user = await getUser()

  if (user) {
    return { children }
  }

}

export default authMiddleware
