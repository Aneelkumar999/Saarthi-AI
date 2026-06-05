import { useState, createContext, useContext, useEffect } from 'react'
import { authAPI } from '../api/auth'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('saarthi_admin') === 'true')
  const [user, setUser] = useState(() => isAdmin ? { full_name: 'System Admin', role: 'admin' } : null)
  const [token, setToken] = useState(() => localStorage.getItem('saarthi_token'))
  const [loading, setLoading] = useState(true)

  const logout = () => {
    localStorage.removeItem('saarthi_token')
    localStorage.removeItem('saarthi_admin')
    setToken(null)
    setUser(null)
    setIsAdmin(false)
  }

  useEffect(() => {
    if (token) {
      authAPI.me()
        .then(u => setUser(u))
        .catch(() => { logout() })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const saveAuth = (data) => {
    localStorage.setItem('saarthi_token', data.access_token)
    setToken(data.access_token)
    setUser(data.user)
  }

  const loginAsAdmin = () => {
    localStorage.setItem('saarthi_admin', 'true')
    setIsAdmin(true)
    setUser({ full_name: 'System Admin', role: 'admin' })
  }

  const signup = async (payload) => {
    const data = await authAPI.signup(payload)
    saveAuth(data)
    return data
  }

  const sendOTP = async (payload) => {
    return await authAPI.sendOTP(payload)
  }

  const verifyOTP = async (payload) => {
    const data = await authAPI.verifyOTP(payload)
    saveAuth(data)
    return data
  }

  const googleLogin = async () => {
    // Mock Google OAuth - in production use Google Identity Services
    const mockPayload = {
      token: 'mock-google-token-' + Date.now(),
      full_name: 'Google User',
      email: 'user' + Date.now() + '@gmail.com',
      avatar_url: null,
    }
    const data = await authAPI.googleAuth(mockPayload)
    saveAuth(data)
    return data
  }

  return (
    <AuthContext.Provider value={{
      user, token, isAdmin, loading,
      signup, sendOTP, verifyOTP, googleLogin, loginAsAdmin, logout,
      isAuthenticated: (!!token && !!user) || isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
