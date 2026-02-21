import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, AuthContextType } from '../types/types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const isValidTokenFormat = (token: string): boolean => {
    if (!token || token.length < 10) return false

    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        const header = JSON.parse(atob(parts[0]))
        return header && typeof header === 'object'
      }

      return token.length >= 20
    } catch {
      return false
    }
  }

  const checkAuth = (): boolean => {
    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('userData')

    if (storedToken && storedUser && isValidTokenFormat(storedToken)) {
      try {
        const userData = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(userData)
        return true
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error)
        logout()
        return false
      }
    } else {
      logout()
      return false
    }
  }

  const login = (authToken: string, userData: User) => {
    if (!isValidTokenFormat(authToken)) {
      console.error('Token com formato inválido')
      return
    }

    localStorage.setItem('authToken', authToken)
    localStorage.setItem('userData', JSON.stringify(userData))
    setToken(authToken)
    setUser(userData)
    navigate('/Home')
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    setToken(null)
    setUser(null)
    navigate('/')
  }

  useEffect(() => {
    setIsLoading(true)

    const isAuth = checkAuth()

    if (isAuth && window.location.pathname === '/') {
      navigate('/Home')
    }
    else if (!isAuth && window.location.pathname !== '/') {
      navigate('/')
    }

    setIsLoading(false)
  }, [navigate])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        if (!e.newValue || !isValidTokenFormat(e.newValue)) {
          logout()
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user && isValidTokenFormat(token || ''),
    isLoading,
    login,
    logout,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}