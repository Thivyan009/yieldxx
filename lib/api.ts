// DeFiLlama API service

import { chainLogos } from "./logos"

export interface YieldPool {
  chain: string
  project: string
  symbol: string
  tvlUsd: number
  apyBase: number
  apyReward: number
  apy: number
  rewardTokens: string[]
  pool: string
  apyPct1D: number
  apyPct7D: number
  apyPct30D: number
  stablecoin: boolean
  ilRisk: string
  exposure: string
  predictions: {
    predictedClass: string
    predictedProbability: number
    binnedConfidence: number
  }
  poolMeta: string | null
  mu: number
  sigma: number
  count: number
  outlier: boolean
  underlyingTokens: string[]
  il7d: number
  apyBase7d: number
  apyMean30d: number
  volumeUsd1d: number
  volumeUsd7d: number
  apyBaseInception: number
}

export interface YieldData {
  status: string
  data: YieldPool[]
}

export interface ChainInfo {
  id: string
  name: string
  logoURI?: string
  color: string
}

export const chains: Record<string, ChainInfo> = {
  ethereum: {
    id: "ethereum",
    name: "Ethereum",
    color: "bg-blue-500",
    logoURI: chainLogos.ethereum
  },
  arbitrum: {
    id: "arbitrum",
    name: "Arbitrum",
    color: "bg-blue-700",
    logoURI: chainLogos.arbitrum
  },
  optimism: {
    id: "optimism",
    name: "Optimism",
    color: "bg-red-500",
    logoURI: chainLogos.optimism
  },
  base: {
    id: "base",
    name: "Base",
    color: "bg-blue-400",
    logoURI: chainLogos.base
  },
  polygon: {
    id: "polygon",
    name: "Polygon",
    color: "bg-purple-500",
    logoURI: chainLogos.polygon
  },
  avalanche: {
    id: "avax",
    name: "Avalanche",
    color: "bg-red-600",
    logoURI: chainLogos.avalanche
  },
  bsc: {
    id: "bsc",
    name: "BNB Chain",
    color: "bg-yellow-500",
    logoURI: chainLogos.bsc
  },
  fantom: {
    id: "fantom",
    name: "Fantom",
    color: "bg-blue-800",
    logoURI: chainLogos.fantom
  },
  metis: {
    id: "metis",
    name: "Metis",
    color: "bg-teal-600",
    logoURI: chainLogos.metis
  },
  celo: {
    id: "celo",
    name: "Celo",
    color: "bg-green-500",
    logoURI: chainLogos.celo
  },
  solana: {
    id: "solana",
    name: "Solana",
    color: "bg-purple-600",
    logoURI: "https://assets.coingecko.com/coins/images/4128/small/solana.png"
  },
  tron: {
    id: "tron",
    name: "Tron",
    color: "bg-red-500",
    logoURI: "https://assets.coingecko.com/coins/images/1094/small/tron-logo.png"
  }
}

export async function fetchYieldData(): Promise<YieldPool[]> {
  try {
    // Call our server-side API route instead of directly calling the DeFiLlama API
    const response = await fetch("/api/yield-data")

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching yield data:", error)
    throw error
  }
}

export function formatAPY(apy: number | null | undefined): string {
  if (apy === null || apy === undefined) {
    return "N/A"
  }
  return `${apy.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
}

export function formatTVL(tvl: number | null | undefined): string {
  if (tvl === null || tvl === undefined) {
    return "N/A"
  }

  if (tvl >= 1e9) {
    return `$${Math.round(tvl / 1e9).toLocaleString()}B`
  } else if (tvl >= 1e6) {
    return `$${Math.round(tvl / 1e6).toLocaleString()}M`
  } else {
    return `$${Math.round(tvl).toLocaleString()}`
  }
}

export function getChainInfo(chainId: string): ChainInfo {
  const chainIdLower = chainId.toLowerCase()
  
  // Map common chain ID variations
  const chainIdMap: Record<string, string> = {
    'eth': 'ethereum',
    'avax': 'avalanche',
    'bnb': 'bsc'
  }
  
  const mappedChainId = chainIdMap[chainIdLower] || chainIdLower
  const chain = chains[mappedChainId]
  
  if (chain) {
    return chain
  }
  
  return {
    id: chainId,
    name: chainId.charAt(0).toUpperCase() + chainId.slice(1),
    color: "bg-gray-500",
  }
}
