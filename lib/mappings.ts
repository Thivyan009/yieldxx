// Asset name mappings
export const assetNames: Record<string, string> = {
  // Stablecoins
  USDT: "Tether",
  USDC: "USD Coin",
  USDS: "Stasis USD",
  USDG: "USDG",
  DAI: "Dai",
  BUSD: "Binance USD",
  TUSD: "TrueUSD",
  FRAX: "Frax",
  LUSD: "Liquity USD",
  sUSD: "Synthetix USD",
  
  // Major cryptocurrencies
  ETH: "Ethereum",
  BTC: "Bitcoin",
  WETH: "Wrapped Ethereum",
  WBTC: "Wrapped Bitcoin",
  stETH: "Staked Ethereum",
  rETH: "Rocket Pool ETH",
  sETH: "Staked ETH",
  
  // Other common assets
  LINK: "Chainlink",
  UNI: "Uniswap",
  AAVE: "Aave",
  CRV: "Curve DAO",
  COMP: "Compound",
  MKR: "Maker",
  SNX: "Synthetix",
  YFI: "Yearn Finance",
  BAL: "Balancer",
  SUSHI: "SushiSwap",
  CAKE: "PancakeSwap",
  JOE: "Trader Joe",
  GMX: "GMX",
  GLP: "GMX LP",
  GHO: "Aave GHO",
  sUSDE: "Staked USDE"
}

// Platform name mappings
export const platformNames: Record<string, string> = {
  // Lending protocols
  aave: "Aave",
  "aave-v3": "Aave V3",
  compound: "Compound",
  morpho: "Morpho",
  euler: "Euler",
  radiant: "Radiant",
  silo: "Silo",
  flux: "Flux",
  ironbank: "Iron Bank",
  
  // DEXs
  uniswap: "Uniswap",
  "uniswap-v3": "Uniswap V3",
  curve: "Curve",
  balancer: "Balancer",
  pancakeswap: "PancakeSwap",
  sushiswap: "SushiSwap",
  "trader-joe": "Trader Joe",
  
  // Yield aggregators
  yearn: "Yearn",
  beefy: "Beefy",
  yieldyak: "Yield Yak",
  autofarm: "AutoFarm",
  
  // Other protocols
  lido: "Lido",
  rocketpool: "Rocket Pool",
  stargate: "Stargate",
  gmx: "GMX",
  gmxglp: "GMX GLP",
  ipor: "IPOR",
  fluid: "Fluid"
}

// Helper function to get asset name
export function getAssetName(symbol: string): string {
  return assetNames[symbol] || symbol
}

// Helper function to get platform name
export function getPlatformName(platform: string): string {
  const platformLower = platform.toLowerCase()
  return platformNames[platformLower] || platform
} 