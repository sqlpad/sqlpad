import { useContext } from "react"
//
import { AuthContext } from "../contexts/Auth"

// ----------------------------------------------------------------------

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) throw new Error("useAuth context must be use inside AuthProvider")

  return context
}

export default useAuth
