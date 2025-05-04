"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useWatchlist } from "@/contexts/watchlist-context"
import { fetchYieldData, formatAPY, formatTVL, getChainInfo, type YieldPool } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Loader2, Star, ChevronUp, ChevronDown } from "lucide-react"
import { Logo } from "@/components/logo"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { platformLogos } from "@/lib/logos"
import { getAssetName, getPlatformName } from '@/lib/mappings'

// Helper function to get token name
const getTokenName = (symbol: string) => {
  return getAssetName(symbol)
}

// Helper function to preserve original capitalization
const preserveOriginalCase = (symbol: string) => {
  // Special case for sUSDE
  if (symbol.toUpperCase() === 'SUSDE') {
    return 'sUSDE';
  }
  return symbol;
}

export default function WatchlistPage() {
  const { user } = useAuth()
  const { watchlist, toggleWatchlist } = useWatchlist()
  const [isLoading, setIsLoading] = useState(true)
  const [watchlistItems, setWatchlistItems] = useState<YieldPool[]>([])
  const router = useRouter()
  const [sortColumn, setSortColumn] = useState<string>("tvlUsd")
  const [sortDirection, setSortDirection] = useState<string>("asc")

  useEffect(() => {
    if (!user) {
      router.push("/signin")
    }
  }, [user, router])

  useEffect(() => {
    const loadWatchlistData = async () => {
      if (watchlist.length === 0) {
        setWatchlistItems([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const allData = await fetchYieldData()
        const filteredData = allData.filter((item) => watchlist.includes(item.pool))
        setWatchlistItems(filteredData)
      } catch (error) {
        console.error("Error loading watchlist data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadWatchlistData()
  }, [watchlist])

  const handleSort = (column: string) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    }>
      <div className="flex min-h-screen flex-col bg-[#f8fafc] dark:bg-[#0f172a]">
        <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-[#1e293b] shadow-sm">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Logo />
            </div>
          </div>
        </header>
        <main className="flex-1 container py-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Watchlist</CardTitle>
              <CardDescription>Track your favorite DeFi opportunities in one place</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading watchlist data...</span>
                </div>
              ) : watchlistItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Your watchlist is empty</p>
                  <Button onClick={() => router.push("/")}>Browse Opportunities</Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Asset</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Chain</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("tvlUsd")}>
                        <div className="flex items-center gap-1">
                          TVL
                          {sortColumn === "tvlUsd" &&
                            (sortDirection === "asc" ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("apyBase")}>
                        Base APY
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("apyReward")}>
                        Reward APY
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("apy")}>
                        <div className="flex items-center gap-1">
                          Total APY
                          {sortColumn === "apy" &&
                            (sortDirection === "asc" ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("apyPct7D")}>
                        7d APY
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("apyPct30D")}>
                        30d APY
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {watchlistItems.map((item) => {
                      const chainInfo = getChainInfo(item.chain.toLowerCase())
                      const platformLogo = platformLogos[item.project.toLowerCase()] || "/placeholder.svg?height=40&width=40"
                      
                      return (
                        <TableRow key={item.pool}>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toggleWatchlist(item.pool)}
                            >
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage 
                                  src={platformLogos[item.project.toLowerCase()] || "/placeholder.svg"} 
                                  alt={`${getPlatformName(item.project)} logo`} 
                                />
                                <AvatarFallback>{getPlatformName(item.project).substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <span>{getPlatformName(item.project)}</span>
                            </div>
                          </TableCell>
                          <TableCell>{item.project}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={chainInfo.logoURI || "/placeholder.svg?height=20&width=20"} alt={`${chainInfo.name} logo`} />
                                <AvatarFallback>{chainInfo.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <span>{chainInfo.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{formatTVL(item.tvlUsd)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{formatAPY(item.apyBase)}</span>
                              <span className="text-xs text-muted-foreground">Base</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{formatAPY(item.apyReward)}</span>
                              <span className="text-xs text-muted-foreground">Reward</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col items-center">
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-green-600">{formatAPY(item.apy)}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{formatAPY(item.apyPct7D)}</span>
                              <span className="text-xs text-muted-foreground">7 days</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{formatAPY(item.apyPct30D)}</span>
                              <span className="text-xs text-muted-foreground">30 days</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </Suspense>
  )
}
