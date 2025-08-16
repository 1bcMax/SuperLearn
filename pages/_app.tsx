import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import { FlowWalletConnectors } from '@dynamic-labs/flow'

const environmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || '';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId,
        walletConnectors: [FlowWalletConnectors],
        appName: 'SuperLearn',
        appLogoUrl: '/logo.png',
        initialAuthenticationMode: 'connect-only',
      }}
    >
      <Component {...pageProps} />
    </DynamicContextProvider>
  )
}