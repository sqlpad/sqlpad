import React, { createContext, ReactNode, useState } from "react"
import { AuthContextType, User } from "../@types/auth"
import useLocalStorage from "../hooks/useLocalStorage"
import { ConfirmPasswordDTO, EmailDTO, LoginDTO, SignupDTO, UserDTO, VerifyDTO } from "../@types/dto"
import { get, post } from "../fetchers/fetchers"
import { PATH_AUTH } from "../routes/paths"

const AuthContext = createContext<AuthContextType | null>(null)

type AuthProviderProps = {
  children: ReactNode
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useLocalStorage<User | null>("user", null)
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>("authenticated", false)
  const [authError, setAuthError] = useState<string>("")

  const errors: { [key: string]: string } = {
    UsernameExistsException: "The email address is already in use.",
    CodeSent: "The inserted code is not valid anymore. Check your email address for a new verification code.",
    CodeMismatchException: "The code is not valid anymore. Check your email address for a new verification code.",
    UserNotConfirmedException: "Before login, please confirm your email address.",
    NotAuthorizedException: "Incorrect username or password.",
    WaitingActivation: "Waiting for the administrator of your workspace to activate your account.",
  }

  const defaultError = "Error, try again later."

  const cleanError = () => setAuthError("")

  const signup = async (params: SignupDTO) => {
    setAuthError("")
    await post<SignupDTO, string>(params, process.env.REACT_APP_BACKEND_PATH_SIGNUP)
      .then(() => {
        window.location.replace(`${PATH_AUTH.verify}`)
      })
      .catch((err) => {
        setAuthError(errors[err] || defaultError)
      })
  }

  const verify = async (params: VerifyDTO) => {
    await post<VerifyDTO, UserDTO>(params, process.env.REACT_APP_BACKEND_PATH_VERIFY)
      .then((user) => {
        setAuthError("")
        if (user) {
          sessionStorage.removeItem("email-signup")
          setUser(user)
          setIsAuthenticated(true)
        }
      })
      .catch((err) => {
        // Special case, the has created the account, but needs to be activated by the admin
        if (err === "WaitingActivation") {
          window.location.replace(`${PATH_AUTH.login}/waiting`)
        }
        setAuthError(errors[err] || defaultError)
      })
  }

  const login = async (params: LoginDTO) => {
    setAuthError("")
    await post<LoginDTO, UserDTO>(params, process.env.REACT_APP_BACKEND_PATH_LOGIN)
      .then((user) => {
        if (user) {
          setUser(user)
          setIsAuthenticated(true)
        }
      })
      .catch((err) => {
        setAuthError(errors[err] || defaultError)
        setIsAuthenticated(false)
        setUser(null)
      })
  }
  // eslint-disable-next-line
  const getSession = async () => {
    await get<UserDTO>(process.env.REACT_APP_BACKEND_PATH_LOGIN_INFO)
      .then((res) => {
        setIsAuthenticated(true)
        setUser(res)
      })
      .catch(() => {
        setIsAuthenticated(false)
        setUser(null)
      })
      .finally(() => {
        setIsAuthenticated(false)
        setUser(null)
      })
  }

  const logout = async () => {
    await get<string>(process.env.REACT_APP_BACKEND_PATH_LOGOUT)
      .then(() => {
        setIsAuthenticated(false)
        setUser(null)
      })
      .catch(() => {
        setIsAuthenticated(false)
        setUser(null)
      })
      .finally(() => {
        setIsAuthenticated(false)
        setUser(null)
      })
  }

  const recovery = async (params: EmailDTO) => {
    await post<EmailDTO, string>(params, process.env.REACT_APP_BACKEND_PATH_RECOVERY).then(() => {
      window.location.replace(`${PATH_AUTH.newPassword}`)
    })
  }

  const confirmNewPassword = async (params: ConfirmPasswordDTO) => {
    await post<ConfirmPasswordDTO, string>(params, process.env.REACT_APP_BACKEND_PATH_NEW_PASSWORD)
      .then(() => {
        sessionStorage.removeItem("email-recovery")
        window.location.replace(`${PATH_AUTH.login}/success`)
      })
      .catch((err) => {
        if (err === "CodeMismatchException") {
          setAuthError("The code is not correct.")
        }
      })
      .finally(() => {})
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, authError, login, logout, signup, verify, recovery, confirmNewPassword, cleanError }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }
