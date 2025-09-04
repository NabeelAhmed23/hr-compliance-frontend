export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isActive: boolean
  avatar?: string
  createdAt: string
}

export interface Organization {
  id: string
  name: string
  industry: string | null
  createdAt: string
}

export interface AuthUser {
  user: User
  organization: Organization
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginResponse {
  user: User
  organization: Organization
  tokens?: AuthTokens
}

export interface RegisterResponse {
  user: User
  organization: Organization
  message: string
  requiresEmailVerification?: boolean
}

export interface AuthError {
  message: string
  field?: string
  code?: string
}