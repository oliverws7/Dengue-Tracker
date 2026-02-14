export interface LoginResponse {
  status: string
  token: string
  data: {
    user: {
      id: string
      name: string
      email: string
      cpf: string
      verified: boolean
      verificationToken: string | null
      verificationTokenExpires: string | null
      createdAt: string
      updatedAt: string
    }
  }
}

export interface User {
  id: string
  name: string
  email: string
}

export interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, userData: User) => void
  logout: () => void
  checkAuth: () => boolean
}

export interface ProtectedRouteProps {
  children: React.ReactNode
}