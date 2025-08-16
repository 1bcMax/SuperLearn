"use client"

import type React from "react"
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core"
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum"
import { FlowWalletConnectors } from "@dynamic-labs/flow"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider
       settings={{
        environmentId: "4e598b41-f388-489b-a0b3-d24064b1d1ed",
        walletConnectors: [EthereumWalletConnectors, FlowWalletConnectors],
        overrides: {
          evmNetworks: [
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
       }}
    >
      {children}
    </DynamicContextProvider>
  )
}
