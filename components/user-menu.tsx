"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { LogIn, LogOut, User, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function UserMenu() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => router.push("/signin")}>
          <LogIn className="h-4 w-4 mr-2" />
          Sign In
        </Button>
        <Button onClick={() => router.push("/signup")}>
          <UserPlus className="h-4 w-4 mr-2" />
          Sign Up
        </Button>
      </div>
    )
  }

  // Get user initials or fallback to 'U'
  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U'
  const displayName = user.name || 'User'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary">{userInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center">
          <User className="mr-2 h-4 w-4" />
          <span>{displayName}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/watchlist")}>Watchlist</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
