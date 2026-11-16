import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import * as api from '../Api/AuthenticationApi'

const AuthContext = createContext()

const LOGOUT_TIME_MS = 2 * 60 * 60 * 1000

function readStored(key) {
  const raw = localStorage.getItem(key)
  try {
    return JSON.parse(raw)
  }
  catch {
    return raw // tokens saved by earlier versions were stored unquoted
  }
}

// useState that mirrors its value to localStorage (null removes the key).
function usePersistedState(key) {
  const [value, setValue] = useState(() => readStored(key))

  useEffect(() => {
    if (value == null)
      localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}

export function AuthProvider({ children }) {
  const [token, setToken] = usePersistedState('token')
  const [user, setUser] = usePersistedState('user')
  const [project, setProject] = usePersistedState('project')
  const [loginTimestamp, setLoginTimestamp]
    = usePersistedState('loginTimestamp')

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setProject(null)
    setLoginTimestamp(null)
  }, [
    setToken,
    setUser,
    setProject,
    setLoginTimestamp,
  ])

  const login = useCallback(
    async (username, password) => {
      const res = await api.login(username, password)
      if (!res.accessToken)
        throw new Error(res.msg || 'Login failed')
      setToken(res.accessToken)
      setUser({ username })
      setProject(res.project || null)
      setLoginTimestamp(Date.now())
    },
    [
      setToken,
      setUser,
      setProject,
      setLoginTimestamp,
    ],
  )

  // Log out two hours after login, including across page reloads.
  useEffect(() => {
    if (!token || !user)
      return
    if (!loginTimestamp)
      return logout()

    const timeout = setTimeout(
      logout,
      Math.max(0, LOGOUT_TIME_MS - (Date.now() - loginTimestamp)),
    )
    return () => clearTimeout(timeout)
  }, [token, user, loginTimestamp, logout])

  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        token,
        user,
        project,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
