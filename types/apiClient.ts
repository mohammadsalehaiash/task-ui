import axios from "axios"
import Cookies from "js-cookie"

const apiClient = axios.create({
  baseURL: "https://api-crm.mohammadsaleh.online/api/",
    // baseURL: "http://127.0.0.1:8000/api/",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
})

apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("auth_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      Cookies.remove("auth_token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export default apiClient