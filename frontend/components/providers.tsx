"use client"

import type React from "react"
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum"
import { DynamicContextProvider, DynamicWidget } from "@dynamic-labs/sdk-react-core"
import { ExtensionHandler } from "./extension-handler"

// Dynamic configuration with Ethereum and Flow EVM support
const dynamicEnvironmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || ""

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ExtensionHandler />
      <DynamicContextProvider
        settings={{
          environmentId: dynamicEnvironmentId,
          walletConnectors: [EthereumWalletConnectors],
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
              }
            ]
          }
        }}
      >
        {children}
      </DynamicContextProvider>
    </>
  )
}

// Re-export Dynamic hooks directly
export { 
  useDynamicContext, 
  useUserWallets 
} from "@dynamic-labs/sdk-react-core"
