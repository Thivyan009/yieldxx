"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface User {
  id: string
  email: string
  name: string
}

interface StoredUser extends User {
  password: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (name: string, email: string, password: string) => Promise<boolean>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Validate user object has all required fields
function isValidUser(user: unknown): user is User {
  return (
    user &&
    typeof user === 'object' &&
    user !== null &&
    'id' in user &&
    'email' in user &&
    'name' in user &&
    typeof (user as User).id === 'string' &&
    typeof (user as User).email === 'string' &&
    typeof (user as User).name === 'string'
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is stored in localStorage
    try {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        // Only set the user if it's valid
        if (isValidUser(parsedUser)) {
          setUser(parsedUser)
        } else {
          // If invalid user data, clear it
          localStorage.removeItem("user")
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      localStorage.removeItem("user")
    }
    setIsLoading(false)
  }, [])

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if user exists in localStorage (our "database")
      const users = JSON.parse(localStorage.getItem("users") || "[]") as StoredUser[]
      const foundUser = users.find((u) => u.email === email && u.password === password)

      if (foundUser) {
        // Create a user object without the password
        const userToStore: User = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name || 'User', // Provide fallback name
        }

        // Store user in state and localStorage
        setUser(userToStore)
        localStorage.setItem("user", JSON.stringify(userToStore))
        return true
      }

      return false
    } catch (error) {
      console.error("Error during sign in:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if user already exists
      const users = JSON.parse(localStorage.getItem("users") || "[]") as StoredUser[]
      if (users.some((u) => u.email === email)) {
        return false
      }

      // Create new user
      const newUser: StoredUser = {
        id: `user-${Date.now()}`,
        name: name || 'User', // Provide fallback name
        email,
        password, // In a real app, this would be hashed
      }

      // Add to "database"
      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))

      // Log user in
      const userToStore: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      }

      setUser(userToStore)
      localStorage.setItem("user", JSON.stringify(userToStore))

      return true
    } catch (error) {
      console.error("Error during sign up:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
