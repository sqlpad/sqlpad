import axios from "axios"
import { PATH_AUTH } from "../routes/paths"
// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  baseURL: process.env.REACT_APP_BACKEND_URI,
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.data === "SessionExpired") {
      window.location.href = PATH_AUTH.logout
    }
    return Promise.reject(`${error.response && error.response.data}` || "Something went wrong")
  }
)

export default axiosInstance
