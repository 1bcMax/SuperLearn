"use client"

import type React from "react"
import { useState, useEffect } from "react"

const environmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "live_default"

// Dynamic imports with better error handling
const loadDynamicSDK = async () => {
  try {
    console.log("[Dynamic] Loading SDK modules...")
    
    // Load modules one by one to better isolate issues
    const coreModule = await import("@dynamic-labs/sdk-react-core")
    console.log("[Dynamic] Core module loaded:", Object.keys(coreModule))
    
    const ethereumModule = await import("@dynamic-labs/ethereum")
    console.log("[Dynamic] Ethereum module loaded:", Object.keys(ethereumModule))
    
    return {
      DynamicContextProvider: coreModule.DynamicContextProvider,
      EthereumWalletConnectors: ethereumModule.EthereumWalletConnectors,
      DynamicWidget: coreModule.DynamicWidget,
    }
  } catch (error) {
    console.error("[Dynamic] Failed to load SDK:", error)
    throw error
  }
}

function FallbackProvider({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [dynamicComponents, setDynamicComponents] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    console.log("[Dynamic] Environment ID:", environmentId)
    
    loadDynamicSDK()
      .then((components) => {
        console.log("[Dynamic] SDK loaded successfully!")
        setDynamicComponents(components)
      })
      .catch((err) => {
        console.error("[Dynamic] SDK loading failed:", err)
        setError(err.message)
      })
  }, [mounted])

  if (!mounted) {
    return <FallbackProvider>{children}</FallbackProvider>
  }

  if (error) {
    console.log("[Dynamic] Using fallback due to error:", error)
    return <FallbackProvider>{children}</FallbackProvider>
  }

  if (!dynamicComponents) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading Dynamic SDK...</p>
        </div>
      </div>
    )
  }

  const { DynamicContextProvider, EthereumWalletConnectors } = dynamicComponents

  return (
    <DynamicContextProvider
      settings={{
        environmentId,
        walletConnectors: [EthereumWalletConnectors],
        appName: "SuperLearn",
        initialAuthenticationMode: "connect-only",
        events: {
          onAuthSuccess: (event: any) => {
            console.log("[Dynamic] Auth success:", event)
          },
          onLogout: (event: any) => {
            console.log("[Dynamic] Logout:", event)
          },
          onAuthFailure: (event: any) => {
            console.log("[Dynamic] Auth failure:", event)
          }
        }
      }}
    >
      {children}
    </DynamicContextProvider>
  )
}
