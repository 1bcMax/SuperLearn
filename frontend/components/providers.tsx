"use client"

import type React from "react"
import { useState, useEffect } from "react"

let DynamicContextProvider: any = null
let EthereumWalletConnectors: any = null

try {
  const dynamicCore = require("@dynamic-labs/sdk-react-core")
  const dynamicEthereum = require("@dynamic-labs/ethereum")
  DynamicContextProvider = dynamicCore.DynamicContextProvider
  EthereumWalletConnectors = dynamicEthereum.EthereumWalletConnectors
} catch (error) {
  console.log("[v0] Dynamic SDK not available, using fallback")
}

const environmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "live_default"

function FallbackProvider({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <FallbackProvider>{children}</FallbackProvider>
  }

  if (!DynamicContextProvider || !EthereumWalletConnectors) {
    console.log("[v0] Using fallback provider due to Dynamic SDK import issues")
    return <FallbackProvider>{children}</FallbackProvider>
  }

  return (
    <DynamicContextProvider
      settings={{
        environmentId,
        walletConnectors: [EthereumWalletConnectors],
        appName: "SuperLearn",
        appLogoUrl: "/ai-mentor-avatar.png",
        // Kid-friendly settings
        initialAuthenticationMode: "connect-only",
        // Enable embedded wallets for seamless onboarding
        walletConnectorExtensions: [],
      }}
    >
      {children}
    </DynamicContextProvider>
  )
}
