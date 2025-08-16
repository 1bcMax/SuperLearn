"use client"

import { useState, useEffect } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { LearningFlow } from "@/components/learning-flow"

// Dynamic Debug Widget with safer imports
const DynamicDebugWidget = () => {
  const [dynamicLoaded, setDynamicLoaded] = useState(false)
  const [components, setComponents] = useState<any>(null)

  useEffect(() => {
    const loadComponents = async () => {
      try {
        const core = await import("@dynamic-labs/sdk-react-core")
        setComponents({ 
          DynamicWidget: core.DynamicWidget, 
          useDynamicContext: core.useDynamicContext 
        })
        setDynamicLoaded(true)
      } catch (error) {
        console.log("[Debug] Dynamic components failed to load:", error)
      }
    }
    loadComponents()
  }, [])

  if (!dynamicLoaded || !components) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-yellow-100 p-2 rounded text-xs border">
        🔄 Loading Dynamic...
      </div>
    )
  }

  const DebugComponent = () => {
    const { user, primaryWallet, isAuthenticated } = components.useDynamicContext()
    return (
      <div className="fixed top-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg border max-w-sm">
        <h3 className="font-bold text-sm mb-2">🐛 Dynamic Debug</h3>
        <components.DynamicWidget />
        {isAuthenticated && (
          <div className="mt-2 text-xs">
            <p>✅ User: {user?.email || user?.userId}</p>
            <p>💰 Wallet: {primaryWallet?.address?.slice(0, 8)}...</p>
          </div>
        )}
      </div>
    )
  }

  return <DebugComponent />
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground">Please refresh the page to try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Refresh Page
        </button>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <DynamicDebugWidget />
      <LearningFlow />
    </ErrorBoundary>
  )
}
