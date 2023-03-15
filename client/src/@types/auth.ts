import { ConfirmPasswordDTO, EmailDTO, LoginDTO, SignupDTO, VerifyDTO } from "./dto"

export type User = {
  name: string
  email: string
  logged_at: string
}

export type AuthContextType = {
  isAuthenticated: boolean
  authError: string
  user: User | undefined
  login: (params: LoginDTO) => void
  logout: () => void
  signup: (params: SignupDTO) => void
  verify: (params: VerifyDTO) => void
  recovery: (params: EmailDTO) => void
  confirmNewPassword: (params: ConfirmPasswordDTO) => void
  cleanError: () => void
}
