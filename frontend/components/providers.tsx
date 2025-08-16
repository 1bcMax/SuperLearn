"use client"

import type React from "react"
import { PrivyProvider } from '@privy-io/react-auth'

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        // Appearance configuration
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: 'https://your-logo-url.com/logo.png', // Optional: Add your logo
        },
        // Embedded wallet configuration  
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: true,
        },
        // Login methods
        loginMethods: ['email', 'sms', 'wallet'],
      }}
      onSuccess={(user) => {
        console.log('[Privy] ✅ Authentication successful:', user)
      }}
      onError={(error) => {
        console.error('[Privy] ❌ Authentication error:', error)
      }}
    >
      {children}
    </PrivyProvider>
  )
}
