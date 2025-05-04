"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ChainInfo } from "@/lib/api"
import { ArrowRight, Star, StarOff, Info } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { platformLogos } from "@/lib/logos"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface MobileDataCardProps {
  platform: string
  description: string
  apy24h: string
  apy30d: string
  apyLifetime: string
  tvl: string
  days: number
  chain: string
  chainData: ChainInfo
  inWatchlist?: boolean
  onWatchlistToggle?: () => void
  onDetailsClick?: () => void
}

export function MobileDataCard({
  platform,
  description,
  apy24h,
  apy30d,
  apyLifetime,
  tvl,
  days,
  chain,
  chainData,
  inWatchlist = false,
  onWatchlistToggle,
  onDetailsClick,
}: MobileDataCardProps) {
  const platformLogo = platformLogos[platform.toLowerCase()] || "/placeholder-logo.svg"

  return (
    <Card className="mb-2 overflow-hidden active:scale-[0.98] transition-transform">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={platformLogo} alt={`${platform} logo`} />
                <AvatarFallback>{platform.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h3 className="font-medium">{platform}</h3>
                <div className="flex items-center gap-1">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={chainData.logoURI || "/placeholder-logo.svg"} alt={`${chainData.name} logo`} />
                    <AvatarFallback>{chainData.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <Badge variant="outline" className="text-xs">
                    {chainData.name}
                  </Badge>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
          </div>
          {onWatchlistToggle && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 shrink-0" 
              onClick={(e) => {
                e.stopPropagation()
                onWatchlistToggle()
              }}
            >
              {inWatchlist ? (
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              ) : (
                <StarOff className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-muted/50 p-2 rounded-lg">
            <div className="text-xs text-muted-foreground">APY</div>
            <div className="font-medium text-green-600">{apy24h}</div>
          </div>
          <div className="bg-muted/50 p-2 rounded-lg">
            <div className="text-xs text-muted-foreground">TVL</div>
            <div className="font-medium">{tvl}</div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">{days} days of data</div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Historical data available for {days} days</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              onDetailsClick?.()
            }}
          >
            Details
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
