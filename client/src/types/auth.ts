export interface User {
  id: string
  email: string
  displayName: string
  avatarUrl?: string
  createdAt: Date
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  displayName: string
}
