import { cookies } from 'next/headers'
import type { AuthUser } from '@/lib/types/user'
import type { ApiResponse } from '@/lib/types/api'

// Server-side API client for making authenticated requests
class ServerApiClient {
  private baseURL: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3005/api'
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('sessiontoken')

    if (!sessionToken?.value) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `sessiontoken=${sessionToken.value}`,
        ...options.headers,
      },
      cache: 'no-store', // Always fetch fresh data on server
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const data: ApiResponse<T> = await response.json()
    return data.data
  }

  // Get current user
  async getCurrentUser(): Promise<AuthUser> {
    return this.makeRequest<AuthUser>('/auth/me')
  }

  // Check if user is authenticated (without throwing)
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getCurrentUser()
      return true
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const serverApi = new ServerApiClient()

// Export individual methods for convenience
export const serverAuthApi = {
  getCurrentUser: () => serverApi.getCurrentUser(),
  isAuthenticated: () => serverApi.isAuthenticated(),
}