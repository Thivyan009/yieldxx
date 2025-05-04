import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { WatchlistProvider } from "@/contexts/watchlist-context"
import GoogleAnalytics from "@/components/google-analytics"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "YieldMax - DeFi Yield Tracker",
  description: "Track the base performance of DeFi products with transparent, data-driven insights",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <WatchlistProvider>
              <GoogleAnalytics />
              {children}
            </WatchlistProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'