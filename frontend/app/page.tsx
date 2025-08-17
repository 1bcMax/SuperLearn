"use client"

import { useState } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { LearningFlow } from "@/components/learning-flow"
import { ClaudeAIChat } from "@/components/claude-ai-chat"
import { usePrivy, useWallets } from '@/components/providers'
import { Brain } from "lucide-react"

type LearningStep = "wallet" | "ai-intro" | "quiz" | "nft-reward"

// Privy Debug Widget (hidden by default, show with ?debug=true in URL)
const PrivyDebugWidget = () => {
  const { ready, authenticated, user } = usePrivy()
  const { wallets } = useWallets()
  
  const primaryWallet = wallets[0]
  const showDebug = typeof window !== 'undefined' && window.location.search.includes('debug=true')
  
  if (!showDebug) return null

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">
      <div className="text-center space-y-4 bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-xl font-bold text-purple-900">Something went wrong</h2>
        <p className="text-purple-600">Please refresh the page to try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
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
      
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 via-blue-50 via-green-50 to-yellow-100 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-10 left-10 text-6xl animate-bounce opacity-50">🦄</div>
        <div className="absolute top-20 right-20 text-4xl animate-pulse opacity-50">🌈</div>
        <div className="absolute bottom-20 left-20 text-5xl animate-bounce opacity-50" style={{ animationDelay: "1s" }}>⭐</div>
        <div className="absolute bottom-10 right-10 text-4xl animate-pulse opacity-50" style={{ animationDelay: "0.5s" }}>🎉</div>
        <div className="absolute top-1/2 left-5 text-3xl animate-bounce opacity-50" style={{ animationDelay: "2s" }}>🌟</div>
        <div className="absolute top-1/3 right-5 text-3xl animate-pulse opacity-50" style={{ animationDelay: "1.5s" }}>🎈</div>
        
        {/* Main content container */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
              <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3 sm:gap-0">
                {/* Logo */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                    <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="font-heading font-bold text-xl sm:text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    SuperLearn
                  </span>
                </div>
                
                {/* Navigation Tabs */}
                <div className="flex bg-white rounded-lg p-1 shadow-sm border border-purple-200">
                  <button
                    onClick={() => setCurrentView('learning')}
                    className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-md transition-all font-medium text-sm sm:text-base ${
                      currentView === 'learning'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-purple-500 hover:bg-purple-50'
                    }`}
                  >
                    <span className="hidden sm:inline">📚 </span>Learning<span className="hidden sm:inline"> Flow</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('ai-chat')}
                    className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-md transition-all font-medium text-sm sm:text-base ${
                      currentView === 'ai-chat'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-purple-500 hover:bg-purple-50'
                    }`}
                  >
                    <span className="hidden sm:inline">🤖 </span>AI Mentor
                  </button>
                </div>
              </div>
            </div>
          </header>
          
          {/* Main Content Area */}
          <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-7xl mx-auto">
              {currentView === 'learning' ? (
                <LearningFlow 
                  onSwitchToAIChat={() => setCurrentView('ai-chat')}
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
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6">
                  <ClaudeAIChat />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}