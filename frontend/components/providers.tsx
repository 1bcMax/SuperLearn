"use client"

import type React from "react"
import { PrivyProvider } from "@privy-io/react-auth"
import { WagmiProvider, createConfig } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { mainnet, sepolia } from "viem/chains"
import { http } from "viem"
import { ExtensionHandler } from "./extension-handler"

// Create wagmi config
const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

// Create query client
const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  // Using user's app ID from env
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cmeep9fyr01myjx0cmvbug65n"
  
  console.log('[Privy] Initializing with App ID:', privyAppId)

  return (
    <div>
      <ExtensionHandler />
      <PrivyProvider
        appId={privyAppId}
        config={{
          // Appearance
          appearance: {
            theme: 'light',
            accentColor: '#676FFF',
          },
          // Login methods - simplified
          loginMethods: ['email', 'wallet'],
          // Embedded wallets
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={config}>
            {children}
          </WagmiProvider>
        </QueryClientProvider>
      </PrivyProvider>
    </div>
  )
}

// Re-export Privy hooks
export { 
  usePrivy,
  useWallets,
  useLogin,
  useLogout,
} from "@privy-io/react-auth"

// Re-export wagmi hooks from the correct package
export {
  useAccount,
  useConnect,
  useDisconnect,
} from "wagmi"