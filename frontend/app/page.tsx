"use client"

import { useState, useEffect } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { LearningFlow } from "@/components/learning-flow"
import { AIAgentChat } from "@/components/ai-agent-chat"

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
        <h3 className="font-bold text-sm mb-2">🐛 Multi-Chain Debug</h3>
        <components.DynamicWidget />
        {isAuthenticated && (
          <div className="mt-2 text-xs space-y-1">
            <p>✅ User: {user?.email || user?.userId}</p>
            <p>💰 Wallet: {primaryWallet?.address?.slice(0, 8)}...</p>
            <p>🔗 Chain: {primaryWallet?.chain || 'Unknown'}</p>
            <p>🌐 Network: {primaryWallet?.network || 'Unknown'}</p>
          </div>
        )}
        <div className="mt-2 text-xs text-gray-500">
          <p>🌍 Supported: Ethereum + Flow</p>
        </div>
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
  const [currentView, setCurrentView] = useState<'learning' | 'ai-chat'>('learning')

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <DynamicDebugWidget />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="flex bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setCurrentView('learning')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  currentView === 'learning'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                📚 Learning Flow
              </button>
              <button
                onClick={() => setCurrentView('ai-chat')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  currentView === 'ai-chat'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                🤖 AI Agent Chat
              </button>
            </div>
          </div>
          
          {currentView === 'learning' ? <LearningFlow /> : <AIAgentChat />}
        </div>
      </div>
    </ErrorBoundary>
  )
}
