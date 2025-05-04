import { NextResponse } from "next/server"
import type { YieldData } from "@/lib/api"

export async function GET() {
  try {
    const API_KEY = process.env.DEFILLAMA_API_KEY

    if (!API_KEY) {
      console.error("DEFILLAMA_API_KEY is not set in environment variables")
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    console.log("Attempting to fetch data from DeFiLlama API...")
    const response = await fetch("https://yields.llama.fi/pools", {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`DeFiLlama API error: ${response.status} - ${errorText}`)
      throw new Error(`Failed to fetch data: ${response.status} - ${errorText}`)
    }

    const data: YieldData = await response.json()
    console.log(`Successfully fetched ${data.data.length} pools from DeFiLlama`)

    // Sort by APY (highest first)
    const sortedData = data.data.sort((a, b) => b.apy - a.apy)

    return NextResponse.json(sortedData)
  } catch (error) {
    console.error("Error fetching yield data:", error)
    return NextResponse.json({ 
      error: "Failed to fetch yield data",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
