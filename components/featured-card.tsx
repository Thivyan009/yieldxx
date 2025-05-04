"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Star, StarOff } from "lucide-react"
import { useState } from "react"
import { platformLogos } from "@/lib/logos"

interface FeaturedCardProps {
  platform: string
  description: string
  apy24h: string
  apyLifetime: string
  tvl: string
  days: number
}

export function FeaturedCard({ platform, description, apy24h, apyLifetime, tvl, days }: FeaturedCardProps) {
  const [isWatchlisted, setIsWatchlisted] = useState(false)
  const platformLogo = platformLogos[platform.toLowerCase()] || "/placeholder-logo.svg"

  return (
    <Card className="min-w-[300px] shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={platformLogo} alt={`${platform} logo`} />
              <AvatarFallback>{platform.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{platform}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsWatchlisted(!isWatchlisted)}>
            {isWatchlisted ? (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            ) : (
              <StarOff className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <p className="text-xs text-muted-foreground">24h APY</p>
            <p className="text-lg font-semibold text-green-600">{apy24h}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Lifetime APY</p>
            <p className="text-lg font-semibold">{apyLifetime}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">TVL</p>
            <p className="text-lg font-semibold">{tvl}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Operating</p>
            <p className="text-lg font-semibold">{days} days</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full gap-1">
          <span>View Details</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
