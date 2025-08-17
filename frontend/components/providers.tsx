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

// Privy configuration
const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cmeep9fyr01myjx0cmvbug65n"

// Log the app ID for debugging (remove in production)
if (typeof window !== 'undefined') {
  console.log('[Privy] App ID:', privyAppId ? 'Set' : 'Missing')
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ExtensionHandler />
      <PrivyProvider
        appId={privyAppId}
        config={{
          // Appearance configuration
          appearance: {
            theme: 'light',
            accentColor: '#676FFF',
            logo: 'https://i.imgur.com/JscDmDe.png',
          },
          // Login methods
          loginMethods: ['email', 'wallet', 'google'],
          // Chain configuration
          defaultChain: sepolia,
          supportedChains: [mainnet, sepolia],
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
    </>
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