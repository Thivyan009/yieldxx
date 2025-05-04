"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ArrowUpDown,
  DollarSign,
  ChevronDown,
  Menu,
  TrendingUp,
  Wallet,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Star,
  StarOff,
  Info,
  AlertTriangle,
  ArrowRight,
  Sliders,
  Percent,
  Bookmark,
  ChevronUp,
  Download,
  Layers,
  LogIn,
  UserPlus,
  Loader2,
  Shield,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { StatsCard } from "@/components/stats-card"
import { MobileDataCard } from "@/components/mobile-data-card"
import { useState, useEffect } from "react"
import { fetchYieldData, formatAPY, formatTVL, getChainInfo, type YieldPool } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useWatchlist } from "@/contexts/watchlist-context"
import { UserMenu } from "@/components/user-menu"
import { useRouter } from "next/navigation"
import { TokenFilters } from "@/components/token-filters"
import { useTheme } from "next-themes"
import { trackFilterChange, trackSortChange } from '@/lib/analytics'
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

export default function Home() {
  const { user } = useAuth()
  const { watchlist, isInWatchlist, toggleWatchlist } = useWatchlist()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [yieldData, setYieldData] = useState<YieldPool[]>([])
  const [sortColumn, setSortColumn] = useState("tvlUsd")
  const [sortDirection, setSortDirection] = useState("desc")
  const [platformFilters, setPlatformFilters] = useState<string[]>([])
  const [chainFilters, setChainFilters] = useState<string[]>([])
  const [tokenFilters, setTokenFilters] = useState<string[]>(["USDT", "USDC"])
  const [filteredData, setFilteredData] = useState<YieldPool[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [tvlRange, setTvlRange] = useState<number>(100000000) // Default to $100M
  const [minApy, setMinApy] = useState<number>(0)
  const [maxApy, setMaxApy] = useState<number>(1000) // Default to 1000% max APY
  const [rateType, setRateType] = useState<"all" | "fixed" | "variable">("all")

  // Get unique platforms for filter
  const platforms = Array.from(new Set(yieldData.map((item) => item.project)))
  
  // Group related platforms
  const groupedPlatforms = platforms.reduce((acc, platform) => {
    const baseName = platform.toLowerCase()
      .replace(/ v\d+$/, '') // Remove version numbers
      .replace(/^(uniswap|aave|curve|compound|balancer|yearn|maker)/, '$1') // Group common protocols
    
    if (!acc[baseName]) {
      acc[baseName] = []
    }
    acc[baseName].push(platform)
    return acc
  }, {} as Record<string, string[]>)

  const uniqueChains = Array.from(new Set(yieldData.map((item) => item.chain.toLowerCase())))

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const data = await fetchYieldData()
        setYieldData(data)
        setFilteredData(data)
        setIsLoading(false)
      } catch (err) {
        setError("Failed to load data. Please try again later.")
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchTerm, platformFilters, chainFilters, tokenFilters, tvlRange, minApy, maxApy, rateType, yieldData])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      const newDirection = sortDirection === "asc" ? "desc" : "asc"
      setSortDirection(newDirection)
      trackSortChange(column, newDirection)
    } else {
      setSortColumn(column)
      setSortDirection("desc")
      trackSortChange(column, "desc")
    }
  }

  const togglePlatformFilter = (platform: string) => {
    setPlatformFilters((prev) => {
      // If the platform is part of a group, toggle all related platforms
      const baseName = platform.toLowerCase()
        .replace(/ v\d+$/, '')
        .replace(/^(uniswap|aave|curve|compound|balancer|yearn|maker)/, '$1')
      
      const relatedPlatforms = groupedPlatforms[baseName] || []
      const allRelatedSelected = relatedPlatforms.every(p => prev.includes(p))
      
      if (allRelatedSelected) {
        // Remove all related platforms
        return prev.filter(p => !relatedPlatforms.includes(p))
      } else {
        // Add all related platforms
        return [...new Set([...prev, ...relatedPlatforms])]
      }
    })
  }

  const isPlatformSelected = (platform: string) => {
    const baseName = platform.toLowerCase()
      .replace(/ v\d+$/, '')
      .replace(/^(uniswap|aave|curve|compound|balancer|yearn|maker)/, '$1')
    
    const relatedPlatforms = groupedPlatforms[baseName] || []
    return relatedPlatforms.some(p => platformFilters.includes(p))
  }

  const toggleChainFilter = (chain: string) => {
    setChainFilters((prev) => {
      const newFilters = prev.includes(chain)
        ? prev.filter((c) => c !== chain)
        : [...prev, chain]
      trackFilterChange('chain', chain)
      return newFilters
    })
  }

  const toggleTokenFilter = (token: string) => {
    if (token === "OTHER_STABLECOINS") {
      // Toggle all stablecoins except USDT and USDC
      const otherStablecoins = ["USDS", "USDG", "DAI", "BUSD", "TUSD", "FRAX", "LUSD", "sUSD"]
      const hasOtherStablecoins = otherStablecoins.some(t => tokenFilters.includes(t))
      
      if (hasOtherStablecoins) {
        // Remove other stablecoins
        setTokenFilters(tokenFilters.filter(t => !otherStablecoins.includes(t)))
      } else {
        // Add other stablecoins
        setTokenFilters([...tokenFilters, ...otherStablecoins])
      }
    } else {
      setTokenFilters(prev => 
        prev.includes(token) 
          ? prev.filter(t => t !== token)
          : [...prev, token]
      )
    }
  }

  const resetTokenFilters = () => {
    setTokenFilters(["USDT", "USDC"])
  }

  const applyFilters = () => {
    let result = [...yieldData]

    // Filter out pools with TVL under $10M
    result = result.filter((item) => (item.tvlUsd || 0) >= 10000000)

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (item) =>
          item.project.toLowerCase().includes(term) ||
          item.symbol.toLowerCase().includes(term) ||
          item.chain.toLowerCase().includes(term),
      )
    }

    // Apply platform filters
    if (platformFilters.length > 0) {
      result = result.filter((item) => platformFilters.includes(item.project))
    }

    // Apply chain filters
    if (chainFilters.length > 0) {
      result = result.filter((item) => chainFilters.includes(item.chain.toLowerCase()))
    }

    // Apply token filters
    if (tokenFilters.length > 0) {
      result = result.filter((item) => tokenFilters.includes(item.symbol))
    }

    // Apply rate type filter
    if (rateType !== "all") {
      result = result.filter((item) => {
        if (rateType === "fixed") {
          // Fixed rate pools have only base APY and no reward APY
          return item.apyReward === 0 || item.apyReward === null || item.apyReward === undefined
        } else {
          // Variable rate pools have reward APY
          return item.apyReward > 0
        }
      })
    }

    // Apply TVL range filter
    result = result.filter((item) => (item.tvlUsd || 0) >= tvlRange)

    // Apply APY range filter
    result = result.filter((item) => {
      const apy = item.apy || 0
      return apy >= minApy && apy <= maxApy
    })

    // Sort the filtered data with null checks
    result.sort((a, b) => {
      const aValue = a[sortColumn as keyof YieldPool]
      const bValue = b[sortColumn as keyof YieldPool]

      // Handle null or undefined values
      if (aValue === null || aValue === undefined) {
        return sortDirection === "asc" ? -1 : 1
      }
      if (bValue === null || bValue === undefined) {
        return sortDirection === "asc" ? 1 : -1
      }

      // Handle numeric values
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      // Handle string values
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return 0
    })

    setFilteredData(result)
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  // Calculate stats
  const totalTVL = filteredData.reduce((sum, item) => sum + (item.tvlUsd || 0), 0)
  const validApyValues = filteredData.filter((item) => item.apy !== null && item.apy !== undefined)
  const averageAPY =
    validApyValues.length > 0
      ? validApyValues.reduce((sum, item) => sum + (item.apy || 0), 0) / validApyValues.length
      : 0
  const topAPY = validApyValues.length > 0 ? Math.max(...validApyValues.map((item) => item.apy || 0)) : 0
  const topAPYPool = filteredData.find((item) => item.apy === topAPY)

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const exportToCSV = () => {
    const headers = ["Project", "Chain", "Symbol", "APY", "TVL", "Pool"]
    const csvData = filteredData.map((item) => [
      item.project,
      item.chain,
      item.symbol,
      item.apy.toString(),
      item.tvlUsd.toString(),
      item.pool,
    ])

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "defi_yields.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleWatchlistToggle = (poolId: string) => {
    if (!user) {
      // Redirect to sign in if not logged in
      router.push("/signin")
    } else {
      toggleWatchlist(poolId)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] dark:bg-[#0f172a]">
      <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-[#1e293b] shadow-sm">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                  <SheetDescription>Navigate DeFi yield opportunities</SheetDescription>
                </SheetHeader>
                <div className="py-6">
                  <div className="mb-4">
                    <Input
                      placeholder="Search protocols, assets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="dashboard">
                      <AccordionTrigger className="py-2">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          <span>Dashboard</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col space-y-1 pl-6">
                          <Button variant="ghost" className="justify-start h-8 px-2">
                            Overview
                          </Button>
                          <Button variant="ghost" className="justify-start h-8 px-2">
                            Analytics
                          </Button>
                          <Button
                            variant="ghost"
                            className="justify-start h-8 px-2"
                            onClick={() => (user ? router.push("/watchlist") : router.push("/signin"))}
                          >
                            Watchlist
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="networks">
                      <AccordionTrigger className="py-2">
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4" />
                          <span>Networks</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col space-y-1 pl-6">
                          {uniqueChains.slice(0, 8).map((chain) => (
                            <Button
                              key={chain}
                              variant="ghost"
                              className="justify-start h-8 px-2"
                              onClick={() => toggleChainFilter(chain)}
                            >
                              {getChainInfo(chain).name}
                            </Button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="protocols">
                      <AccordionTrigger className="py-2">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <span>Protocols</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col space-y-1 pl-6 max-h-[200px] overflow-y-auto">
                          {platforms.slice(0, 10).map((platform) => (
                            <Button
                              key={platform}
                              variant="ghost"
                              className="justify-start h-8 px-2"
                              onClick={() => togglePlatformFilter(platform)}
                            >
                              {platform}
                            </Button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
                <div className="absolute bottom-4 left-4 right-4 space-y-2">
                  {!user ? (
                    <>
                      <Button className="w-full" variant="outline" onClick={() => router.push("/signin")}>
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </Button>
                      <Button className="w-full" onClick={() => router.push("/signup")}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Sign Up
                      </Button>
                    </>
                  ) : (
                    <Button className="w-full" onClick={() => router.push("/watchlist")}>
                      <Star className="h-4 w-4 mr-2" />
                      View Watchlist
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            <Logo />
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="hidden md:flex">
              <UserMenu />
            </div>
            <Button
              className="md:hidden"
              size="icon"
              variant="outline"
              onClick={() => router.push(user ? "/watchlist" : "/signin")}
            >
              {user ? <Star className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          <div className="flex flex-col gap-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">DeFi Yield Tracker</h1>
              <p className="text-muted-foreground">
                Track the base performance of DeFi products with transparent, data-driven insights
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatsCard
                title="Top APY"
                value={formatAPY(topAPY)}
                description={topAPYPool ? `${topAPYPool.project} - ${topAPYPool.symbol}` : "Loading..."}
                icon={TrendingUp}
                trend="up"
                trendValue="+1.2%"
              />
              <StatsCard
                title="Total Value Locked"
                value={formatTVL(totalTVL)}
                description="Across all tracked protocols"
                icon={Wallet}
                trend="up"
                trendValue="+$12.4M"
              />
              <StatsCard
                title="Average APY"
                value={formatAPY(averageAPY)}
                description="Average across all pools"
                icon={Percent}
                trend="neutral"
                trendValue="0.0%"
              />
            </div>

            <Card className="mb-6">
              <CardHeader className="pb-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Yield Opportunities</CardTitle>
                    <CardDescription>
                      {isLoading
                        ? "Loading yield data..."
                        : error
                          ? "Error loading data"
                          : `Showing ${filteredData.length.toLocaleString()} opportunities`}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <TokenFilters 
                      selectedTokens={tokenFilters} 
                      onTokenToggle={toggleTokenFilter} 
                      onReset={resetTokenFilters}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          <Sliders className="h-3.5 w-3.5 mr-2" />
                          Filters
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[300px]">
                        <div className="p-4 space-y-4">
                          <div>
                            <div className="mb-2 text-sm font-medium">Asset Type</div>
                            <div className="flex flex-wrap gap-1">
                              <Badge
                                variant={tokenFilters.length === 0 ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => setTokenFilters([])}
                              >
                                All
                              </Badge>
                              <Badge
                                variant={tokenFilters.includes("USDT") || tokenFilters.includes("USDC") ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => {
                                  if (tokenFilters.includes("USDT") || tokenFilters.includes("USDC")) {
                                    setTokenFilters(tokenFilters.filter(t => t !== "USDT" && t !== "USDC"))
                                  } else {
                                    setTokenFilters([...tokenFilters, "USDT", "USDC"])
                                  }
                                }}
                              >
                                Stablecoins
                              </Badge>
                              <Badge
                                variant={tokenFilters.includes("ETH") ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => toggleTokenFilter("ETH")}
                              >
                                ETH
                              </Badge>
                              <Badge
                                variant={tokenFilters.includes("BTC") ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => toggleTokenFilter("BTC")}
                              >
                                BTC
                              </Badge>
                              <Badge
                                variant={tokenFilters.includes("sUSDE") ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => toggleTokenFilter("sUSDE")}
                              >
                                sUSDE
                              </Badge>
                            </div>
                          </div>

                          <div>
                            <div className="mb-2 text-sm font-medium">Rate Type</div>
                            <div className="flex flex-wrap gap-1">
                              <Badge
                                variant={rateType === "all" ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => setRateType("all")}
                              >
                                All
                              </Badge>
                              <Badge
                                variant={rateType === "fixed" ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => setRateType("fixed")}
                              >
                                Fixed
                              </Badge>
                              <Badge
                                variant={rateType === "variable" ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => setRateType("variable")}
                              >
                                Variable
                              </Badge>
                            </div>
                          </div>

                          <div>
                            <div className="mb-2 text-sm font-medium">TVL Range</div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Min: ${(tvlRange / 1000000).toFixed(0)}M</span>
                                <span className="text-sm">Max: All</span>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <Button 
                                  variant={tvlRange === 100000000 ? "default" : "outline"} 
                                  size="sm"
                                  onClick={() => setTvlRange(100000000)}
                                  className={tvlRange === 100000000 ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300" : ""}
                                >
                                  $100M
                                </Button>
                                <Button 
                                  variant={tvlRange === 500000000 ? "default" : "outline"} 
                                  size="sm"
                                  onClick={() => setTvlRange(500000000)}
                                  className={tvlRange === 500000000 ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300" : ""}
                                >
                                  $500M
                                </Button>
                                <Button 
                                  variant={tvlRange === 1000000000 ? "default" : "outline"} 
                                  size="sm"
                                  onClick={() => setTvlRange(1000000000)}
                                  className={tvlRange === 1000000000 ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300" : ""}
                                >
                                  $1B
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="mb-2 text-sm font-medium">APY Range</div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Min: {minApy}%</span>
                                <span className="text-sm">Max: {maxApy}%</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label htmlFor="minApy" className="text-xs">Min APY (%)</label>
                                  <Input 
                                    id="minApy"
                                    type="number" 
                                    value={minApy} 
                                    onChange={(e) => setMinApy(Number(e.target.value))}
                                    className="h-8"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label htmlFor="maxApy" className="text-xs">Max APY (%)</label>
                                  <Input 
                                    id="maxApy"
                                    type="number" 
                                    value={maxApy} 
                                    onChange={(e) => setMaxApy(Number(e.target.value))}
                                    className="h-8"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="mb-2 text-sm font-medium">Network</div>
                            <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto">
                              {uniqueChains.map((chain) => {
                                const chainInfo = getChainInfo(chain)
                                return (
                                  <div key={chain} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`chain-${chain}`}
                                      checked={chainFilters.includes(chain)}
                                      onCheckedChange={() => toggleChainFilter(chain)}
                                    />
                                    <label
                                      htmlFor={`chain-${chain}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                                    >
                                      <div className={`h-4 w-4 rounded-full ${chainInfo.color}`}></div>
                                      {chainInfo.name}
                                    </label>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          <div>
                            <div className="mb-2 text-sm font-medium">Platforms</div>
                            <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto">
                              {Object.entries(groupedPlatforms).map(([baseName, platforms]) => (
                                <div key={baseName} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`platform-${baseName}`}
                                    checked={isPlatformSelected(platforms[0])}
                                    onCheckedChange={() => togglePlatformFilter(platforms[0])}
                                  />
                                  <label
                                    htmlFor={`platform-${baseName}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {baseName.charAt(0).toUpperCase() + baseName.slice(1)}
                                    {platforms.length > 1 && (
                                      <span className="text-xs text-muted-foreground ml-1">
                                        ({platforms.length})
                                      </span>
                                    )}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Button className="w-full" onClick={applyFilters}>
                            Apply Filters
                          </Button>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          <ArrowUpDown className="h-3.5 w-3.5 mr-2" />
                          Sort
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSortColumn("apy")
                            setSortDirection("desc")
                          }}
                        >
                          APY (High to Low)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSortColumn("apy")
                            setSortDirection("asc")
                          }}
                        >
                          APY (Low to High)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSortColumn("tvlUsd")
                            setSortDirection("desc")
                          }}
                        >
                          TVL (High to Low)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSortColumn("project")
                            setSortDirection("asc")
                          }}
                        >
                          Project (A-Z)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 pt-4">
                {isLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading yield data...</span>
                  </div>
                ) : error ? (
                  <div className="flex justify-center items-center py-20 text-destructive">
                    <AlertTriangle className="h-8 w-8 mr-2" />
                    <span>{error}</span>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader className="bg-muted/50">
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
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentItems.map((item, index) => {
                            const chainInfo = getChainInfo(item.chain.toLowerCase())
                            const inWatchlist = user && isInWatchlist(item.pool)

                            return (
                              <TableRow key={item.pool} className="hover:bg-muted/50">
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleWatchlistToggle(item.pool)}
                                  >
                                    {inWatchlist ? (
                                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    ) : (
                                      <StarOff className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </Button>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{getTokenName(item.symbol)}</span>
                                    <span className="text-xs text-muted-foreground">({preserveOriginalCase(item.symbol)})</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{getPlatformName(item.project)}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`h-6 w-6 rounded-full ${chainInfo.color} flex items-center justify-center`}
                                    >
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage src={chainInfo.logoURI} alt={`${chainInfo.name} logo`} />
                                        <AvatarFallback>{chainInfo.name.substring(0, 2)}</AvatarFallback>
                                      </Avatar>
                                    </div>
                                    <span className="text-sm">{chainInfo.name}</span>
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
                                <TableCell className="text-right">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8"
                                    onClick={() => {
                                      const baseUrl = item.project.toLowerCase()
                                        .replace(/ v\d+$/, '')
                                        .replace(/^(uniswap|aave|curve|compound|balancer|yearn|maker)/, '$1')
                                      window.open(`https://${baseUrl}.finance`, '_blank')
                                    }}
                                  >
                                    <span>Details</span>
                                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="md:hidden">
                      <div className="space-y-2">
                        {currentItems.map((item) => {
                          const chainInfo = getChainInfo(item.chain.toLowerCase())
                          const inWatchlist = user && isInWatchlist(item.pool)

                          return (
                            <MobileDataCard
                              key={item.pool}
                              platform={item.project}
                              description={item.poolMeta || item.symbol}
                              apy24h={formatAPY(item.apy)}
                              apy30d={formatAPY(item.apyBase)}
                              apyLifetime={formatAPY(item.apyReward)}
                              tvl={formatTVL(item.tvlUsd)}
                              days={item.count || 0}
                              chain={item.chain.toLowerCase()}
                              chainData={chainInfo}
                              inWatchlist={inWatchlist}
                              onWatchlistToggle={() => handleWatchlistToggle(item.pool)}
                              onDetailsClick={() => {
                                const baseUrl = item.project.toLowerCase()
                                  .replace(/ v\d+$/, '')
                                  .replace(/^(uniswap|aave|curve|compound|balancer|yearn|maker)/, '$1')
                                window.open(`https://${baseUrl}.finance`, '_blank')
                              }}
                            />
                          )
                        })}
                      </div>
                      <div className="flex justify-center items-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled={currentPage === totalPages}
                          onClick={() => handlePageChange(currentPage + 1)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex items-center justify-between py-4">
                <div className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium">
                    {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredData.length}</span> opportunities
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNumber = i + 1
                    return (
                      <Button
                        key={`page-${pageNumber}`}
                        variant="outline"
                        size="icon"
                        className={`h-8 w-8 ${currentPage === pageNumber ? "bg-primary/10" : ""}`}
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        <span className="text-xs">{pageNumber}</span>
                      </Button>
                    )
                  })}
                  {totalPages > 5 && <span className="px-2">...</span>}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <footer className="border-t py-6 bg-white dark:bg-[#1e293b]">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <Logo size="small" />
              <p className="text-sm text-muted-foreground">Transparent DeFi yield tracking</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                About
              </Button>
              <Button variant="ghost" size="sm">
                API
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
