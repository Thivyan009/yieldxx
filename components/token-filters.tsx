import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getTokenLogo } from "@/lib/token-logos"
import { RotateCcw } from "lucide-react"

interface TokenFiltersProps {
  selectedTokens: string[]
  onTokenToggle: (token: string) => void
  onReset: () => void
}

const tokens = [
  { 
    symbol: "USDT", 
    name: "Tether"
  },
  { 
    symbol: "USDC", 
    name: "USD Coin"
  },
  { 
    symbol: "USDS", 
    name: "Stasis USD"
  },
  { 
    symbol: "USDG", 
    name: "USDG"
  },
]

export function TokenFilters({ selectedTokens, onTokenToggle, onReset }: TokenFiltersProps) {
  const hasActiveFilters = selectedTokens.length > 0

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tokens.map((token) => (
        <Button
          key={token.symbol}
          variant={selectedTokens.includes(token.symbol) ? "default" : "outline"}
          size="sm"
          className={`h-8 px-2 flex-shrink-0 ${
            selectedTokens.includes(token.symbol) 
              ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300" 
              : ""
          }`}
          onClick={() => onTokenToggle(token.symbol)}
        >
          <Avatar className="h-5 w-5 mr-1">
            <AvatarImage src={getTokenLogo(token.symbol)} alt={token.name} />
            <AvatarFallback>{token.symbol.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <span className="text-xs">{token.symbol}</span>
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        className={`h-8 px-2 flex-shrink-0 ${
          selectedTokens.includes("OTHER_STABLECOINS")
            ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
            : ""
        }`}
        onClick={() => onTokenToggle("OTHER_STABLECOINS")}
      >
        <span className="text-xs">All Other Stablecoins</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 px-2 flex-shrink-0 ${
          hasActiveFilters
            ? "text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={onReset}
      >
        <RotateCcw className="h-3.5 w-3.5 mr-1" />
        <span className="text-xs">Reset</span>
      </Button>
    </div>
  )
} 