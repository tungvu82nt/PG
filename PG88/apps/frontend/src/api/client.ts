import axios from 'axios'
import { getToken } from '../store/auth.store'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Clear token and redirect to login
        window.location.href = '/login'
      }
      return Promise.reject(error.response.data)
    } else if (error.request) {
      return Promise.reject({ message: 'Không thể kết nối đến server' })
    } else {
      return Promise.reject({ message: error.message })
    }
  }
)

export { apiClient }