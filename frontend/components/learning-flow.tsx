"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, Wallet, Brain, Trophy, ArrowRight, Loader2, ArrowDown, Target, Award } from "lucide-react"
import { useDynamicContext, useDynamicWaas, useConnectWithOtp, useIsLoggedIn, useUserUpdateRequest, useDynamicModals, DynamicMultiWalletPromptsWidget } from '@dynamic-labs/sdk-react-core'

// Dynamic authentication hook
const useDynamicAuth = () => {
  const { user, primaryWallet } = useDynamicContext()
  const isAuthenticated = useIsLoggedIn()
  const { createWalletAccount } = useDynamicWaas()
  const { connectWithEmail, verifyOneTimePassword } = useConnectWithOtp()
  
  console.log("[Dynamic] Auth state:", {
    isAuthenticated,
    user: user?.email,
    wallet: primaryWallet?.address
  })
    
  return {
    ready: true, // Dynamic is always ready
    authenticated: isAuthenticated,
    user,
    primaryWallet,
    connectWithEmail,
    verifyOneTimePassword,
    createWalletAccount
  }
}

// Headless Email Authentication Component
const HeadlessEmailAuth = () => {
  const { connectWithEmail, verifyOneTimePassword } = useDynamicAuth()
  const isAuthenticated = useIsLoggedIn()
  const { updateUser } = useUserUpdateRequest()
  const [emailInput, setEmailInput] = useState("")
  const [otpInput, setOtpInput] = useState("")
  const [nameInput, setNameInput] = useState("")
  const [authStep, setAuthStep] = useState<'email' | 'otp' | 'name'>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput) return
    
    setIsLoading(true)
    setError("")
    try {
      await connectWithEmail(emailInput)
      setAuthStep('otp')
    } catch (error) {
      setError("Failed to send OTP. Please try again.")
      console.error("Email auth error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpInput) return
    
    setIsLoading(true)
    setError("")
    try {
      await verifyOneTimePassword(otpInput)
      // After authentication, go to name step
      setAuthStep('name')
    } catch (error) {
      setError("Invalid OTP. Please try again.")
      console.error("OTP verification error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameInput) return
    
    setIsLoading(true)
    setError("")
    try {
      await updateUser({ alias: nameInput })
      // Name update complete, the useEffect will handle progression
    } catch (error) {
      setError("Failed to update name. Please try again.")
      console.error("Name update error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthenticated && authStep !== 'name') {
    return (
      <div className="text-center space-y-4">
        <div className="text-6xl">🎉</div>
        <p className="text-green-700 font-medium">✨ You're authenticated! ✨</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {authStep === 'email' ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="auth-email" className="text-purple-700 font-medium">
              Email Address 📧
            </Label>
            <Input
              id="auth-email"
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter your email"
              className="border-2 border-pink-200 focus:border-purple-400 bg-white/80"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button
            type="submit"
            disabled={!emailInput || isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg transform hover:scale-105 transition-all"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            🚀 Send Magic Link 🚀
          </Button>
        </form>
      ) : authStep === 'otp' ? (
        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="auth-otp" className="text-purple-700 font-medium">
              Enter Code 🔐
            </Label>
            <Input
              id="auth-otp"
              type="text"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              placeholder="Enter 6-digit code"
              className="border-2 border-pink-200 focus:border-purple-400 bg-white/80"
              maxLength={6}
              required
            />
          </div>
          <p className="text-sm text-purple-600">
            We sent a code to {emailInput}. Check your email! 📧
          </p>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="space-y-2">
            <Button
              type="submit"
              disabled={!otpInput || isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg transform hover:scale-105 transition-all"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              ✨ Verify Code ✨
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAuthStep('email')
                setOtpInput("")
                setError("")
              }}
              className="w-full"
            >
              ← Back to Email
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleNameSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="auth-name" className="text-purple-700 font-medium">
              Your Name 🦄
            </Label>
            <Input
              id="auth-name"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter your first name"
              className="border-2 border-pink-200 focus:border-purple-400 bg-white/80"
              required
            />
          </div>
          <p className="text-sm text-purple-600">
            Almost done! What should we call you? 🌟
          </p>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button
            type="submit"
            disabled={!nameInput || isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg transform hover:scale-105 transition-all"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            🚀 Complete Registration! 🚀
          </Button>
        </form>
      )}
    </div>
  )
}

type LearningStep = "registration" | "wallet" | "link-wallet" | "ai-intro" | "quiz" | "nft-reward"

interface StepData {
  id: LearningStep
  title: string
  description: string
  icon: any
  status: "pending" | "active" | "completed"
}

interface LearningFlowProps {
  onSwitchToAIChat?: () => void
  // Persistent state props
  currentStep: LearningStep
  setCurrentStep: (step: LearningStep) => void
  completedSteps: Set<LearningStep>
  setCompletedSteps: (steps: Set<LearningStep>) => void
  email: string
  setEmail: (email: string) => void
  name: string
  setName: (name: string) => void
  quizScore: number
  setQuizScore: (score: number) => void
  currentQuizQuestion: number
  setCurrentQuizQuestion: (question: number) => void
  quizCompleted: boolean
  setQuizCompleted: (completed: boolean) => void
  nftMinted: boolean
  setNftMinted: (minted: boolean) => void
}

export function LearningFlow({ 
  onSwitchToAIChat,
  currentStep,
  setCurrentStep,
  completedSteps,
  setCompletedSteps,
  email,
  setEmail,
  name,
  setName,
  quizScore,
  setQuizScore,
  currentQuizQuestion,
  setCurrentQuizQuestion,
  quizCompleted,
  setQuizCompleted,
  nftMinted,
  setNftMinted
}: LearningFlowProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")

  const [walletCreating, setWalletCreating] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)

  const { sdkHasLoaded, user, primaryWallet } = useDynamicContext()
  const authenticated = useIsLoggedIn()

  const { createWalletAccount } = useDynamicWaas()
  const { setShowLinkNewWalletModal } = useDynamicModals()
  
  // Quiz questions data
  const quizQuestions = [
    {
      question: "What is a cryptocurrency wallet?",
      options: [
        "A physical wallet for coins",
        "A digital tool to store and manage crypto",
        "A type of cryptocurrency",
        "A bank account"
      ],
      correct: 1,
      explanation: "A cryptocurrency wallet is a digital tool that stores your private keys and allows you to manage your crypto assets."
    },
    {
      question: "What does 'blockchain' mean?",
      options: [
        "A type of chain jewelry",
        "A chain of connected data blocks",
        "A block of ice",
        "A computer chain"
      ],
      correct: 1,
      explanation: "Blockchain is a chain of connected data blocks, where each block contains transaction data and is linked to the previous block."
    },
    {
      question: "What is Ethereum?",
      options: [
        "A type of internet",
        "A cryptocurrency only",
        "A blockchain platform for smart contracts",
        "A company name"
      ],
      correct: 2,
      explanation: "Ethereum is a blockchain platform that supports smart contracts and decentralized applications, with ETH as its native cryptocurrency."
    }
  ]
  
  // Debug the context
  useEffect(() => {
    console.log("[SuperLearn] Dynamic auth state:", {
      sdkHasLoaded,
      authenticated,
      user: user?.email,
      wallet: primaryWallet?.address
    })
  }, [sdkHasLoaded, authenticated, user, primaryWallet])

  const steps: StepData[] = [
    {
      id: "registration",
      title: "Quick Start",
      description: "Register with email",
      icon: ArrowRight,
      status: currentStep === "registration" ? "active" : user ? "completed" : "pending",
    },
    {
      id: "wallet",
      title: "Create Wallet",
      description: "Dynamic embedded wallet",
      icon: Wallet,
      status: currentStep === "wallet" ? "active" : completedSteps.has("wallet") ? "completed" : "pending",
    },
    {
      id: "link-wallet",
      title: "Link Wallet",
      description: "Connect external wallet",
      icon: Wallet,
      status: currentStep === "link-wallet" ? "active" : completedSteps.has("link-wallet") ? "completed" : "pending",
    },
    {
      id: "ai-intro",
      title: "AI Crypto Guide",
      description: "Chat with AI mentor to learn",
      icon: Brain,
      status: currentStep === "ai-intro" ? "active" : completedSteps.has("ai-intro") ? "completed" : "pending",
    },
    {
      id: "quiz",
      title: "Crypto Quiz",
      description: "Test your knowledge",
      icon: Target,
      status: currentStep === "quiz" ? "active" : completedSteps.has("quiz") ? "completed" : "pending",
    },
    {
      id: "nft-reward",
      title: "Win NFT",
      description: "Earn your crypto badge",
      icon: Award,
      status: currentStep === "nft-reward" ? "active" : completedSteps.has("nft-reward") ? "completed" : "pending",
    },
  ]

  const stepProgress = {
    registration: 16,
    wallet: 33,
    "link-wallet": 50,
    "ai-intro": 66,
    quiz: 83,
    "nft-reward": 100,
  }

  // Handle authentication completion - progress from registration to wallet step
  useEffect(() => {
    if (authenticated && user?.alias && currentStep === "registration") {
      completeStep("registration")
      setCurrentStep("wallet")
      setActiveModal(null) // Close the registration modal
    }
  }, [authenticated, user?.alias, currentStep])

  // Handle wallet creation completion - progress from wallet to link-wallet step
  useEffect(() => {
    if (authenticated && primaryWallet && currentStep === "wallet" && walletCreating) {
      setWalletAddress(primaryWallet.address)
      setWalletCreating(false)
      completeStep("wallet")
      setTimeout(() => {
        setCurrentStep("link-wallet")
      }, 1000)
    }
  }, [authenticated, primaryWallet, currentStep, walletCreating])

  const completeStep = (step: LearningStep) => {
    setCompletedSteps(new Set([...completedSteps, step]))
  }

  const handleLinkWallet = () => {
    console.log("[SuperLearn] Link wallet button clicked")
    setShowLinkNewWalletModal(true)
    // Complete the step immediately since the modal handles the linking
    completeStep("link-wallet")
    setTimeout(() => {
      setCurrentStep("ai-intro")
    }, 500)
  }





  const handleAIIntro = () => {
    // Switch to AI chat tab and mark step as complete
    completeStep("ai-intro")
    setCurrentStep("quiz")
    setActiveModal(null)
    
    // Switch to AI chat tab
    if (onSwitchToAIChat) {
      onSwitchToAIChat()
    }
  }

  const handleQuizAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleNextQuestion = () => {
    if (selectedAnswer !== null) {
      if (selectedAnswer === quizQuestions[currentQuizQuestion].correct) {
        setQuizScore(quizScore + 1)
      }
      
      if (currentQuizQuestion < quizQuestions.length - 1) {
        setCurrentQuizQuestion(currentQuizQuestion + 1)
        setSelectedAnswer(null)
      } else {
        // Quiz completed
        const finalScore = selectedAnswer === quizQuestions[currentQuizQuestion].correct ? quizScore + 1 : quizScore
        setQuizCompleted(true)
        
        // Need at least 2/3 correct to pass
        if (finalScore >= 2) {
          handleQuizCompletion(true)
        } else {
          handleQuizCompletion(false)
        }
      }
    }
  }

  const resetQuiz = () => {
    setCurrentQuizQuestion(0)
    setQuizScore(0)
    setSelectedAnswer(null)
    setQuizCompleted(false)
  }

  const handleQuizCompletion = (passed: boolean) => {
    if (passed) {
      completeStep("quiz")
      setCurrentStep("nft-reward")
      setActiveModal("nft-reward")
    } else {
      // Allow retaking the quiz
      resetQuiz()
      setActiveModal("quiz")
    }
  }

  const handleMintNFT = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setNftMinted(true)
    completeStep("nft-reward")
    setIsLoading(false)
    setActiveModal(null)
  }

  const openStepModal = (stepId: LearningStep) => {
    console.log("[SuperLearn] Opening step modal:", stepId, "currentStep:", currentStep, "completed:", completedSteps.has(stepId))
    if (stepId === currentStep || completedSteps.has(stepId)) {
      setActiveModal(stepId)
      console.log("[SuperLearn] Modal set to:", stepId)
    } else {
      console.log("[SuperLearn] Step not clickable - step:", stepId, "current:", currentStep)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 via-blue-50 via-green-50 to-yellow-100 p-4 relative overflow-hidden">
      <div className="absolute top-10 left-10 text-6xl animate-bounce">🦄</div>
      <div className="absolute top-20 right-20 text-4xl animate-pulse">🌈</div>
      <div className="absolute bottom-20 left-20 text-5xl animate-bounce" style={{ animationDelay: "1s" }}>
        ⭐
      </div>
      <div className="absolute bottom-10 right-10 text-4xl animate-pulse" style={{ animationDelay: "0.5s" }}>
        🎉
      </div>
      <div className="absolute top-1/2 left-5 text-3xl animate-bounce" style={{ animationDelay: "2s" }}>
        🌟
      </div>
      <div className="absolute top-1/3 right-5 text-3xl animate-pulse" style={{ animationDelay: "1.5s" }}>
        🎈
      </div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              SuperLearn
            </span>
          </div>
          <h1 className="font-heading font-bold text-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            🦄 Your Magical Crypto Journey 🌈
          </h1>
          <div className="w-full max-w-md mx-auto bg-white/50 rounded-full p-1 shadow-lg">
            <div
              className="h-3 bg-gradient-to-r from-pink-400 via-purple-400 via-blue-400 to-green-400 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${stepProgress[currentStep]}%` }}
            />
          </div>
          <p className="text-purple-700 font-medium">✨ Click on any step to see the magic happen! ✨</p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isClickable = step.id === currentStep || completedSteps.has(step.id)

              return (
                <div key={step.id} className="relative">
                  <Card
                    className={`cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
                      step.status === "active"
                        ? "ring-4 ring-pink-300 shadow-2xl bg-gradient-to-br from-pink-50 to-purple-50"
                        : step.status === "completed"
                          ? "bg-gradient-to-br from-green-100 to-emerald-100 border-green-300 shadow-lg"
                          : "opacity-70 bg-white/80"
                    } ${isClickable ? "hover:scale-110" : "cursor-not-allowed"} backdrop-blur-sm border-2`}
                    onClick={() => isClickable && openStepModal(step.id)}
                  >
                    <CardContent className="p-4 text-center space-y-3">
                      <div
                        className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center shadow-lg ${
                          step.status === "active"
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white animate-pulse"
                            : step.status === "completed"
                              ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                              : "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600"
                        }`}
                      >
                        {step.status === "completed" ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-purple-800">{step.title}</h3>
                        <p className="text-xs text-purple-600">{step.description}</p>
                      </div>
                      {step.status === "active" && (
                        <Badge className="text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 shadow-md">
                          ✨ Active ✨
                        </Badge>
                      )}
                      {step.status === "completed" && (
                        <Badge className="text-xs bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-md">
                          🎉 Complete 🎉
                        </Badge>
                      )}
                    </CardContent>
                  </Card>

                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-purple-400 drop-shadow-lg" />
                    </div>
                  )}

                  {index < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center mt-2">
                      <ArrowDown className="w-6 h-6 text-purple-400 drop-shadow-lg" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <Dialog open={activeModal === "registration"} onOpenChange={() => setActiveModal(null)}>
          <DialogContent className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-purple-800">
                <ArrowRight className="w-5 h-5 text-pink-500" />🌟 Quick Start Registration 🌟
              </DialogTitle>
              <DialogDescription className="text-purple-600">
                Enter your email to get started with your magical crypto learning journey!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg border-2 border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">🎯 What you'll learn:</h4>
                <ul className="text-sm space-y-1 text-purple-700 text-left">
                  <li>💰 Create your first crypto wallet</li>
                  <li>🔒 Understand blockchain security</li>
                  <li>⚡ Make your first transaction</li>
                  <li>🏆 Earn an NFT certificate</li>
                </ul>
              </div>
              
              <HeadlessEmailAuth />
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={activeModal === "wallet"} onOpenChange={() => setActiveModal(null)}>
          <DialogContent className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-blue-800">
                <Wallet className="w-5 h-5 text-cyan-500" />💎 Create Your Crypto Wallet 💎
              </DialogTitle>
              <DialogDescription className="text-blue-600">
                We'll create a secure magical wallet for you using Dynamic's technology! ✨
              </DialogDescription>
            </DialogHeader>
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                <Wallet className="w-10 h-10 text-white" />
              </div>

              {!primaryWallet && !walletCreating ? (
                <div className="space-y-4">
                  <p className="text-blue-700">
                    🌟 Create your secure embedded wallet! No seed phrases to remember, secured with your email. 🌟
                  </p>  
                  <Button
                    onClick={async () => {
                      setWalletCreating(true)
                      try {
                        await createWalletAccount(["EVM"])
                      } catch (error) {
                        console.error("Wallet creation error:", error)
                        setWalletCreating(false)
                      }
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg transform hover:scale-105 transition-all"
                  >
                    ✨ Create My Magical Wallet ✨
                  </Button>
                </div>
              ) : walletCreating ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-cyan-500" />
                    <div className="absolute inset-0 w-8 h-8 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-20 animate-ping"></div>
                  </div>
                  <div>
                    <p className="font-medium text-blue-800">🪄 Creating your secure wallet...</p>
                    <p className="text-sm text-blue-600">Magic is happening! ✨</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-6xl animate-bounce">🎉</div>
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                  <div>
                    <p className="font-medium text-green-700">🎊 Wallet Created Successfully! 🎊</p>
                    <p className="text-sm text-green-600">Address: {walletAddress?.substring(0, 15)}...</p>
                    <Badge className="mt-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0">
                      🚀 Ready for adventures! 🚀
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={activeModal === "ai-intro"} onOpenChange={() => setActiveModal(null)}>
          <DialogContent className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-purple-800">
                <Brain className="w-5 h-5 text-pink-500" />🤖 Chat with AI Mentor 🤖
              </DialogTitle>
              <DialogDescription className="text-purple-600">
                Learn crypto concepts by chatting with your AI guide! ✨
              </DialogDescription>
            </DialogHeader>
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                <Brain className="w-10 h-10 text-white" />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-purple-800">
                  Hi {user?.alias || 'there'}! Time to Learn with AI! 🤖✨
                </h3>
                <div className="text-left space-y-3 bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg border-2 border-purple-200">
                  <p className="text-sm font-medium text-purple-800">
                    🌟 <strong>You'll be taken to the AI chat where you can:</strong> 🌟
                  </p>
                  <ul className="text-sm space-y-1 text-purple-700">
                    <li>🪙 Ask questions about cryptocurrency</li>
                    <li>⛓️ Learn how blockchain works</li>
                    <li>🔒 Understand crypto security</li>
                    <li>🎓 Get ready for your quiz!</li>
                  </ul>
                </div>

                <Button
                  onClick={handleAIIntro}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg transform hover:scale-105 transition-all"
                >
                  🚀 Start Chatting with AI Mentor!
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={activeModal === "quiz"} onOpenChange={() => setActiveModal(null)}>
          <DialogContent className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-blue-800">
                <Target className="w-5 h-5 text-cyan-500" />🧠 Crypto Knowledge Quiz 🧠
              </DialogTitle>
              <DialogDescription className="text-blue-600">
                Test what you learned! Get 2/3 correct to win an NFT! 🏆✨
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {!quizCompleted ? (
                <>
                  <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-4 rounded-lg border-2 border-blue-300">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-blue-900">Question {currentQuizQuestion + 1} of {quizQuestions.length}</h4>
                      <Badge variant="secondary">Score: {quizScore}/{currentQuizQuestion}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">{quizQuestions[currentQuizQuestion].question}</h3>
                    
                    <div className="space-y-3">
                      {quizQuestions[currentQuizQuestion].options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuizAnswer(index)}
                          className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                            selectedAnswer === index
                              ? 'border-blue-500 bg-blue-100 text-blue-900'
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          {String.fromCharCode(65 + index)}. {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <Button
                      onClick={handleNextQuestion}
                      disabled={selectedAnswer === null}
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg"
                    >
                      {currentQuizQuestion < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'} ➡️
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-bold text-blue-800">Quiz Complete! 🎉</h3>
                  <p className="text-blue-700">Final Score: {quizScore}/{quizQuestions.length}</p>
                  {quizScore >= 2 ? (
                    <p className="text-green-600 font-semibold">🏆 Congratulations! You passed! Time to claim your NFT! 🏆</p>
                  ) : (
                    <>
                      <p className="text-orange-600">📚 Keep learning and try again!</p>
                      <Button onClick={resetQuiz} className="mt-4">Try Again</Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={activeModal === "nft-reward"} onOpenChange={() => setActiveModal(null)}>
          <DialogContent className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-800">
                <Award className="w-5 h-5 text-emerald-500" />🏆 Earn Your NFT Certificate 🏆
              </DialogTitle>
              <DialogDescription className="text-green-600">
                Mint your permanent "Crypto Explorer" achievement on the blockchain! 🎖️✨
              </DialogDescription>
            </DialogHeader>
            <div className="text-center space-y-6">
              {!nftMinted ? (
                <>
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-2xl animate-pulse">
                    <Trophy className="w-12 h-12 text-white" />
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-green-800">🎉 Quiz Master! 🎉</h3>
                    <p className="text-green-700">
                      ✨ You've successfully passed the crypto knowledge quiz! Now claim your permanent
                      "Crypto Explorer" certificate as a magical NFT! ✨
                    </p>

                    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-lg border-2 border-yellow-300">
                      <p className="text-sm text-orange-800">
                        <strong>🎁 Your magical NFT will include:</strong>
                        <br />🏅 Proof of crypto knowledge mastery
                        <br />🧠 Quiz completion with score: {quizScore}/{quizQuestions.length}
                        <br />⏰ Learning milestone timestamp
                        <br />🆔 Unique certificate ID
                        <br />⛓️ Permanent blockchain record
                      </p>
                    </div>

                    <Button
                      onClick={handleMintNFT}
                      disabled={isLoading}
                      size="lg"
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg transform hover:scale-105 transition-all"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}✨ Mint My Magical NFT
                      Certificate! ✨
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="relative">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-2xl animate-bounce">
                      <Trophy className="w-16 h-16 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 text-4xl animate-spin">✨</div>
                    <div className="absolute -bottom-2 -left-2 text-3xl animate-bounce">🎉</div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-xl text-green-700">🎊 NFT Minted Successfully! 🎊</h3>
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-lg border-2 border-green-300">
                      <h4 className="font-medium text-green-900">🏆 Crypto Explorer Certificate 🏆</h4>
                      <p className="text-sm text-green-700 mt-1">
                        ✨ Your achievement is now permanently recorded on the Flow blockchain! ✨
                      </p>
                    </div>
                    <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-lg">
                      🎖️ Achievement Unlocked! 🎖️
                    </Badge>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg transform hover:scale-105 transition-all">
                    🚀 Continue Your Magical Crypto Journey! 🚀
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={activeModal === "link-wallet"} onOpenChange={() => setActiveModal(null)}>
          <DialogContent className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-indigo-800">
                <Wallet className="w-5 h-5 text-purple-500" />🔗 Link External Wallet 🔗
              </DialogTitle>
              <DialogDescription className="text-indigo-600">
                Connect your existing wallet (MetaMask, WalletConnect, etc.) for additional options! 🌟
              </DialogDescription>
            </DialogHeader>
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                <Wallet className="w-10 h-10 text-white" />
              </div>

              <div className="space-y-4">
                <p className="text-indigo-700">
                  🔗 You can link an external wallet alongside your embedded wallet for more flexibility!
                </p>
                
                <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-4 rounded-lg border-2 border-indigo-200">
                  <h4 className="font-medium text-indigo-900 mb-2">✨ Benefits of linking:</h4>
                  <ul className="text-sm space-y-1 text-indigo-800 text-left">
                    <li>🔄 Use both embedded and external wallets</li>
                    <li>💰 Access tokens from your existing wallet</li>
                    <li>🛡️ Enhanced security options</li>
                    <li>🚀 More connection flexibility</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleLinkWallet}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg transform hover:scale-105 transition-all"
                  >
                    🔗 Link External Wallet
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      completeStep("link-wallet")
                      setCurrentStep("ai-intro")
                      setActiveModal(null)
                    }}
                    className="w-full"
                  >
                    ⏭️ Skip for now
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <DynamicMultiWalletPromptsWidget />
      </div>
    </div>
  )
}
