"use client"

import { useState } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { LearningFlow } from "@/components/learning-flow"
import { ClaudeAIChat } from "@/components/claude-ai-chat"
import { usePrivy, useWallets } from '@/components/providers'

type LearningStep = "wallet" | "ai-intro" | "quiz" | "nft-reward"

// Privy Debug Widget
const PrivyDebugWidget = () => {
  const { ready, authenticated, user } = usePrivy()
  const { wallets } = useWallets()
  
  const primaryWallet = wallets[0]

  return (
    <div className="fixed top-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg border max-w-sm">
      <h3 className="font-bold text-sm mb-2">🐛 Privy Debug</h3>
      
      <div className="text-xs space-y-1">
        <p>SDK Loaded: {ready ? '✅' : '⏳'}</p>
        <p>Authenticated: {authenticated ? '✅' : '❌'}</p>
        <p>Wallets: {wallets.length}</p>
      </div>
      
      {authenticated && (
        <div className="text-xs space-y-1 border-t pt-2 mt-2">
          <p>✅ User: {user?.email?.address || user?.google?.email || 'Connected'}</p>
          {primaryWallet && (
            <>
              <p>💰 Wallet: {primaryWallet.address?.slice(0, 8)}...</p>
              <p>🔗 Type: {primaryWallet.walletClientType || 'Embedded'}</p>
              <p>🌐 Chain: {primaryWallet.chainId || 'Unknown'}</p>
            </>
          )}
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-500 border-t pt-2">
        <p>🌍 Supported: Ethereum + Sepolia</p>
        <p>📧 Login: Email, Google, Wallet</p>
      </div>
    </div>
  )
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
  
  // Persistent learning flow state
  const [currentStep, setCurrentStep] = useState<LearningStep>("wallet")
  const [completedSteps, setCompletedSteps] = useState<Set<LearningStep>>(new Set())
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [quizScore, setQuizScore] = useState(0)
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [nftMinted, setNftMinted] = useState(false)

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <PrivyDebugWidget />
      
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
          
          {currentView === 'learning' ? (
            <LearningFlow 
              onSwitchToAIChat={() => setCurrentView('ai-chat')}
              // Pass persistent state
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              completedSteps={completedSteps}
              setCompletedSteps={setCompletedSteps}
              email={email}
              setEmail={setEmail}
              name={name}
              setName={setName}
              quizScore={quizScore}
              setQuizScore={setQuizScore}
              currentQuizQuestion={currentQuizQuestion}
              setCurrentQuizQuestion={setCurrentQuizQuestion}
              quizCompleted={quizCompleted}
              setQuizCompleted={setQuizCompleted}
              nftMinted={nftMinted}
              setNftMinted={setNftMinted}
            />
          ) : (
            <ClaudeAIChat />
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}