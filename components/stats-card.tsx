import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { ChevronUp, ChevronDown } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string
  description: string
  icon: LucideIcon
  trend?: "up" | "down" | "neutral"
  trendValue?: string
}

export function StatsCard({ title, value, description, icon: Icon, trend, trendValue }: StatsCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && trendValue && (
            <div
              className={`flex items-center text-xs ${
                trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"
              }`}
            >
              {trend === "up" ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : trend === "down" ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : null}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
