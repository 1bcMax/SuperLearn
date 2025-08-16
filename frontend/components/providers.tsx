"use client"

import type React from "react"

// Temporary Dynamic provider mock until packages are installed
interface DynamicContextProviderProps {
  children: React.ReactNode
  settings: {
    environmentId: string
    walletConnectors: any[]
    overrides?: {
      evmNetworks?: any[]
    }
  }
}

// Mock Dynamic provider for now
function DynamicContextProvider({ children, settings }: DynamicContextProviderProps) {
  console.log('[Dynamic] Configuration:', settings)
  return <div>{children}</div>
}

// Dynamic configuration with Ethereum and Flow EVM support
const dynamicEnvironmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || ""

const dynamicSettings = {
  environmentId: dynamicEnvironmentId,
  walletConnectors: [
    // Will add EthereumWalletConnectors and FlowWalletConnectors when packages are installed
  ],
  overrides: {
    evmNetworks: [
      // Ethereum Mainnet
      {
        chainId: 1,
        networkId: 1,
        rpcUrls: ["https://mainnet.infura.io/v3/"],
        blockExplorerUrls: ['https://etherscan.io'],
        name: "Ethereum Mainnet",
        nativeCurrency: {
          name: "Ethereum",
          symbol: "ETH",
          decimals: 18
        },
        iconUrls: ["https://cryptologos.cc/logos/ethereum-eth-logo.png"]
      },
      // Flow EVM Testnet
      {
        chainId: 545,
        networkId: 545,
        rpcUrls: ["https://testnet.evm.nodes.onflow.org"],
        blockExplorerUrls: ['https://evm-testnet.flowscan.io'],
        name: "Flow EVM Testnet",
        nativeCurrency: {
          name: "Ethereum",
          symbol: "ETH",
          decimals: 18
        },
        iconUrls: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNM0vktSb8boTsIfga-aHzrzqVlGnEzewXPA&s"]
      }
    ]
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider settings={dynamicSettings}>
      {children}
    </DynamicContextProvider>
  )
}

// Mock Dynamic hooks until packages are installed
export function useDynamicContext() {
  return {
    isAuthenticated: false,
    user: null,
    primaryWallet: null,
    setShowAuthFlow: () => {
      console.log('[Dynamic] Mock: Opening auth flow')
    },
    handleLogOut: () => {
      console.log('[Dynamic] Mock: Logging out')
    },
  }
}

export function useUserWallets() {
  return []
}
