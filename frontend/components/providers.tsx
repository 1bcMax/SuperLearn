"use client"

import type React from "react"
import { useState, useEffect } from "react"

const environmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "live_default"

// Multi-chain Components State
interface DynamicComponents {
  DynamicContextProvider: any
  EthereumWalletConnectors: any
  FlowWalletConnectors: any
  DynamicWidget: any
}

// Load Dynamic Components Asynchronously
const loadDynamicComponents = async (): Promise<DynamicComponents> => {
  console.log("[Dynamic] Loading multi-chain components...")
  
  try {
    // Load all modules in parallel
    const [coreModule, ethereumModule, flowModule] = await Promise.all([
      import("@dynamic-labs/sdk-react-core"),
      import("@dynamic-labs/ethereum"), 
      import("@dynamic-labs/flow")
    ])
    
    const components = {
      DynamicContextProvider: coreModule.DynamicContextProvider,
      EthereumWalletConnectors: ethereumModule.EthereumWalletConnectors,
      FlowWalletConnectors: flowModule.FlowWalletConnectors,
      DynamicWidget: coreModule.DynamicWidget
    }
    
    console.log("[Dynamic] Multi-chain components loaded:", {
      DynamicContextProvider: !!components.DynamicContextProvider,
      EthereumWalletConnectors: !!components.EthereumWalletConnectors,
      FlowWalletConnectors: !!components.FlowWalletConnectors,
      DynamicWidget: !!components.DynamicWidget
    })
    
    return components
  } catch (error) {
    console.error("[Dynamic] Multi-chain loading failed:", error)
    
    // Fallback to Ethereum only
    console.log("[Dynamic] Attempting Ethereum-only fallback...")
    const [coreModule, ethereumModule] = await Promise.all([
      import("@dynamic-labs/sdk-react-core"),
      import("@dynamic-labs/ethereum")
    ])
    
    return {
      DynamicContextProvider: coreModule.DynamicContextProvider,
      EthereumWalletConnectors: ethereumModule.EthereumWalletConnectors,
      FlowWalletConnectors: null,
      DynamicWidget: coreModule.DynamicWidget
    }
  }
}

function FallbackProvider({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [dynamicReady, setDynamicReady] = useState(false)
  const [dynamicComponents, setDynamicComponents] = useState<DynamicComponents | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    console.log("[Dynamic] Environment ID:", environmentId)
    
    // Load Dynamic components asynchronously
    const initializeDynamic = async () => {
      try {
        const components = await loadDynamicComponents()
        setDynamicComponents(components)
        setDynamicReady(true)
        console.log("[Dynamic] Multi-chain components loaded and ready!")
      } catch (error) {
        console.error("[Dynamic] Failed to load components:", error)
        setDynamicReady(false)
      }
    }
    
    initializeDynamic()
  }, [mounted])

  if (!mounted) {
    return <FallbackProvider>{children}</FallbackProvider>
  }

  if (!dynamicReady || !dynamicComponents) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading Dynamic SDK...</p>
        </div>
      </div>
    )
  }

  if (!dynamicComponents.DynamicContextProvider || (!dynamicComponents.EthereumWalletConnectors && !dynamicComponents.FlowWalletConnectors)) {
    console.log("[Dynamic] Components not available, using fallback")
    return <FallbackProvider>{children}</FallbackProvider>
  }

  // Build wallet connectors array with available chains
  const walletConnectors = []
  if (dynamicComponents.EthereumWalletConnectors) {
    walletConnectors.push(dynamicComponents.EthereumWalletConnectors)
    console.log("[Dynamic] Added Ethereum wallet connectors")
  }
  if (dynamicComponents.FlowWalletConnectors) {
    walletConnectors.push(dynamicComponents.FlowWalletConnectors)
    console.log("[Dynamic] Added Flow wallet connectors")
  }

  console.log("[Dynamic] Rendering with multi-chain Dynamic provider:", {
    chains: walletConnectors.length,
    ethereum: !!dynamicComponents.EthereumWalletConnectors,
    flow: !!dynamicComponents.FlowWalletConnectors
  })

  const { DynamicContextProvider } = dynamicComponents

  return (
    <DynamicContextProvider
      settings={{
        environmentId,
        walletConnectors,
        appName: "SuperLearn",
        initialAuthenticationMode: "connect-only",
        // Add Flow EVM network configuration
        evmNetworks: [
          {
            blockExplorerUrls: ['https://evm-testnet.flowscan.io'],
            chainId: 545, // Flow EVM Testnet
            chainName: 'Flow EVM Testnet',
            iconUrls: ['https://cryptologos.cc/logos/flow-flow-logo.png'],
            name: 'Flow EVM Testnet',
            nativeCurrency: {
              decimals: 18,
              name: 'Flow',
              symbol: 'FLOW',
            },
            networkId: 545,
            rpcUrls: ['https://testnet.evm.nodes.onflow.org'],
            vanityName: 'Flow Testnet',
          },
          {
            blockExplorerUrls: ['https://evm.flowscan.io'],
            chainId: 747, // Flow EVM Mainnet
            chainName: 'Flow EVM Mainnet',
            iconUrls: ['https://cryptologos.cc/logos/flow-flow-logo.png'],
            name: 'Flow EVM Mainnet',
            nativeCurrency: {
              decimals: 18,
              name: 'Flow',
              symbol: 'FLOW',
            },
            networkId: 747,
            rpcUrls: ['https://mainnet.evm.nodes.onflow.org'],
            vanityName: 'Flow Mainnet',
          }
        ],
        events: {
          onAuthSuccess: (event: any) => {
            console.log("[Dynamic] Multi-chain auth success:", event)
          },
          onLogout: (event: any) => {
            console.log("[Dynamic] Multi-chain logout:", event)
          },
          onAuthFailure: (event: any) => {
            console.log("[Dynamic] Multi-chain auth failure:", event)
          }
        }
      }}
    >
      {children}
    </DynamicContextProvider>
  )
}
