import axios from "axios"

const apiClient = axios.create({
  baseURL: "https://api-crm.mohammadsaleh.online/api/",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
})

export default apiClient