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
        walletConnectors: [EthereumWalletConnectors, FlowWalletConnectors
        ]
       }}
    >
      {children}
    </DynamicContextProvider>
  )
}
