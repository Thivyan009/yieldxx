import { TrendingUp } from "lucide-react"

export function Logo({ size = "default" }: { size?: "default" | "small" }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`bg-gradient-to-br from-blue-600 to-blue-800 rounded-md ${size === "small" ? "p-1" : "p-1.5"} flex items-center justify-center`}>
        <TrendingUp className={`${size === "small" ? "h-4 w-4" : "h-5 w-5"} text-white`} />
      </div>
      <span className={`${size === "small" ? "text-sm" : "text-xl"} font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent`}>YieldMax</span>
    </div>
  )
}
