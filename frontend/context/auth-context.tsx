<<<<<<< HEAD
 'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
=======
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1

export interface User {
  id: string
  email: string
  name: string
  meterId: string
  location: string
  dailyLimit: number
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
<<<<<<< HEAD
  signup: (payload: {
    email: string
    password: string
    name: string
    phone: string
    location: string
    meterId: string
  }) => Promise<void>
=======
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
  logout: () => void
  updateDailyLimit: (limit: number) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

<<<<<<< HEAD
=======
  // Load user from localStorage on mount
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
  useEffect(() => {
    const storedUser = localStorage.getItem('smartgrid_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

<<<<<<< HEAD
  const persistUser = (userData: User) => {
    setUser(userData)
    localStorage.setItem('smartgrid_user', JSON.stringify(userData))
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    const result = await apiFetch<{ message: string; user: { id: string; email: string; name?: string; phone?: string; location?: string; meterId?: string } }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    const userData: User = {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name || email.split('@')[0],
      location: result.user.location || 'Unknown',
      meterId: result.user.meterId || 'MTR-2024-001',
      dailyLimit: 50, // Default value, could be stored in backend later
    }

    persistUser(userData)
    setIsLoading(false)
  }

  const signup = async ({ email, password, name, phone, location, meterId }: {
    email: string
    password: string
    name: string
    phone: string
    location: string
    meterId: string
  }) => {
    setIsLoading(true)

    const result = await apiFetch<{ message: string; user: { id: string; email: string; name?: string; phone?: string; location?: string; meterId?: string } }>('/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, phone, location, meterId }),
    })

    const userData: User = {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name || name,
      meterId: result.user.meterId || meterId,
      location: result.user.location || location,
      dailyLimit: 50,
    }

    persistUser(userData)
=======
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock user data
    const mockUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      meterId: 'MTR-2024-001',
      location: 'New Delhi, India',
      dailyLimit: 50,
    }

    setUser(mockUser)
    localStorage.setItem('smartgrid_user', JSON.stringify(mockUser))
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('smartgrid_user')
  }

  const updateDailyLimit = (limit: number) => {
    if (user) {
      const updatedUser = { ...user, dailyLimit: limit }
<<<<<<< HEAD
      persistUser(updatedUser)
=======
      setUser(updatedUser)
      localStorage.setItem('smartgrid_user', JSON.stringify(updatedUser))
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
    }
  }

  return (
<<<<<<< HEAD
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateDailyLimit }}>
=======
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateDailyLimit }}>
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
<<<<<<< HEAD
}
=======
}
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
