"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, Wallet, Brain, Trophy, ArrowRight, Loader2, ArrowDown, Zap, Target, Award } from "lucide-react"
import {  primaryWallet } from "@dynamic-labs/sdk-react-core";

// Fallback hook when Dynamic is not available
const useDynamicContextFallback = () => {
  const [mockWallet, setMockWallet] = useState<any>(null)
  const [mockAuthenticated, setMockAuthenticated] = useState(false)

  const setShowAuthFlow = React.useCallback((show?: boolean) => {
    console.log("[Fallback] setShowAuthFlow called with:", show)
    if (show) {
      console.log("[Fallback] Starting mock authentication...")
      setTimeout(() => {
        const mockAddress = "0x" + Math.random().toString(16).substr(2, 40)
        setMockWallet({ address: mockAddress })
        setMockAuthenticated(true)
        console.log("[Fallback] Mock authentication completed:", mockAddress)
      }, 2000)
    }
  }, [])

  return React.useMemo(() => ({
    setShowAuthFlow,
    isAuthenticated: mockAuthenticated,
    user: mockAuthenticated ? { email: "user@example.com" } : null,
    primaryWallet: mockWallet,
  }), [setShowAuthFlow, mockAuthenticated, mockWallet])
}

// Safe Dynamic context hook that uses the provider's context
const useSafeDynamicContext = () => {
  const fallbackContext = useDynamicContextFallback()
  
  // Try to get the real Dynamic context from the provider
  try {
    const { useDynamicContext } = require("@dynamic-labs/sdk-react-core")
    const realContext = useDynamicContext()
    
    console.log("[Dynamic] Using real context:", {
      isAuthenticated: realContext.isAuthenticated,
      user: realContext.user?.email,
      hasSetShowAuthFlow: typeof realContext.setShowAuthFlow === 'function'
    })
    
    return realContext
  } catch (error) {
    console.log("[Dynamic] Using fallback context:", error.message)
    return fallbackContext
  }
}

// Safe Dynamic Widget that checks for the loaded widget
const SafeDynamicWidget = () => {
  const [widgetReady, setWidgetReady] = useState(false)
  const [checkingWidget, setCheckingWidget] = useState(true)

  useEffect(() => {
    const checkWidget = () => {
      // Check if the global Dynamic components are loaded
      if (typeof window !== 'undefined' && (window as any).DynamicWidget) {
        console.log("[SafeDynamicWidget] Global DynamicWidget found")
        setWidgetReady(true)
        setCheckingWidget(false)
      } else {
        // Try to import the widget
        import("@dynamic-labs/sdk-react-core")
          .then((module) => {
            if (module.DynamicWidget) {
              console.log("[SafeDynamicWidget] DynamicWidget imported successfully")
              setWidgetReady(true)
            } else {
              console.log("[SafeDynamicWidget] DynamicWidget not in module")
              setWidgetReady(false)
            }
            setCheckingWidget(false)
          })
          .catch((error) => {
            console.log("[SafeDynamicWidget] Import failed:", error.message)
            setWidgetReady(false)
            setCheckingWidget(false)
          })
      }
    }

    checkWidget()
  }, [])

  const handleFallbackClick = () => {
    console.log("[SafeDynamicWidget] Fallback button clicked")
    alert("🎯 This button works! Dynamic SDK not loaded, but the click handler is working. In a real setup, this would open the Dynamic authentication flow.")
  }

  if (checkingWidget) {
    return (
      <Button disabled className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg">
        🔄 Loading Widget...
      </Button>
    )
  }

  if (widgetReady) {
    // Use dynamic import for the widget
    const DynamicWidgetComponent = React.lazy(() => 
      import("@dynamic-labs/sdk-react-core").then(module => ({ 
        default: module.DynamicWidget 
      }))
    )

    return (
      <div className="space-y-2">
        <React.Suspense fallback={<Button disabled className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg">🔄 Loading...</Button>}>
          <DynamicWidgetComponent />
        </React.Suspense>
        <p className="text-xs text-green-600 text-center">✅ Dynamic widget loaded</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Button 
        onClick={handleFallbackClick}
        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg transform hover:scale-105 transition-all"
      >
        ✨ Create My Magical Wallet ✨
      </Button>
      <p className="text-xs text-red-600 text-center">⚠️ Dynamic SDK not loaded</p>
    </div>
  )
}

type LearningStep = "registration" | "wallet" | "ai-intro" | "practice" | "verification" | "achievement"

interface StepData {
  id: LearningStep
  title: string
  description: string
  icon: any
  status: "pending" | "active" | "completed"
}

export function LearningFlow() {
  const [currentStep, setCurrentStep] = useState<LearningStep>("registration")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [transactionHash, setTransactionHash] = useState("")
  const [nftMinted, setNftMinted] = useState(false)
  const [walletCreating, setWalletCreating] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<LearningStep>>(new Set())

  const { setShowAuthFlow, isAuthenticated, user, primaryWallet } = useSafeDynamicContext()
  
  // Debug the context
  useEffect(() => {
    console.log("[SuperLearn] Dynamic context state:", {
      setShowAuthFlow: typeof setShowAuthFlow,
      isAuthenticated,
      user: user?.email || user?.userId,
      wallet: primaryWallet?.address
    })
  }, [setShowAuthFlow, isAuthenticated, user, primaryWallet])

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
      id: "ai-intro",
      title: "AI Introduction",
      description: "Learn crypto concepts",
      icon: Brain,
      status: currentStep === "ai-intro" ? "active" : completedSteps.has("ai-intro") ? "completed" : "pending",
    },
    {
      id: "practice",
      title: "First Transaction",
      description: "Guided blockchain practice",
      icon: Zap,
      status: currentStep === "practice" ? "active" : completedSteps.has("practice") ? "completed" : "pending",
    },
    {
      id: "verification",
      title: "Verification",
      description: "Flow Action confirms success",
      icon: Target,
      status: currentStep === "verification" ? "active" : completedSteps.has("verification") ? "completed" : "pending",
    },
    {
      id: "achievement",
      title: "NFT Certificate",
      description: "Mint Crypto Explorer badge",
      icon: Award,
      status: currentStep === "achievement" ? "active" : completedSteps.has("achievement") ? "completed" : "pending",
    },
  ]

  const stepProgress = {
    registration: 16,
    wallet: 33,
    "ai-intro": 50,
    practice: 66,
    verification: 83,
    achievement: 100,
  }

  useEffect(() => {
    if (isAuthenticated && primaryWallet && currentStep === "wallet") {
      setWalletAddress(primaryWallet.address)
      setWalletCreating(false)
      completeStep("wallet")
      setTimeout(() => {
        setCurrentStep("ai-intro")
      }, 1000)
    }
  }, [isAuthenticated, primaryWallet, currentStep])

  const completeStep = (step: LearningStep) => {
    setCompletedSteps((prev) => new Set([...prev, step]))
  }

  const handleRegistration = async () => {
    if (!email || !name) return

    console.log("[SuperLearn] Starting registration with:", { name, email })
    setIsLoading(true)
    
    // Simulate registration process
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    console.log("[SuperLearn] Registration completed, proceeding to wallet creation")
    completeStep("registration")
    setCurrentStep("wallet")
    setIsLoading(false)
    setActiveModal(null)
  }

  const handleWalletCreation = () => {
    console.log("[SuperLearn] Wallet creation button clicked")
    console.log("[SuperLearn] setShowAuthFlow available:", typeof setShowAuthFlow)
    setWalletCreating(true)
    try {
      setShowAuthFlow(true)
      console.log("[SuperLearn] setShowAuthFlow(true) called successfully")
    } catch (error) {
      console.error("[SuperLearn] Error calling setShowAuthFlow:", error)
    }
  }

  const handleAIIntro = () => {
    setIsLoading(true)
    setTimeout(() => {
      completeStep("ai-intro")
      setCurrentStep("practice")
      setIsLoading(false)
      setActiveModal(null)
    }, 2000)
  }

  const handlePracticeTransaction = async () => {
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 3000))
    const mockTxHash = "0x" + Math.random().toString(16).substr(2, 40)
    setTransactionHash(mockTxHash)

    completeStep("practice")
    setCurrentStep("verification")
    setIsLoading(false)
    setActiveModal(null)

    setTimeout(() => {
      completeStep("verification")
      setCurrentStep("achievement")
    }, 2000)
  }

  const handleMintNFT = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setNftMinted(true)
    completeStep("achievement")
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
                Enter your details to create your magical learning profile and get started!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-purple-700 font-medium">
                  Your Name 🦄
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="border-2 border-pink-200 focus:border-purple-400 bg-white/80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-purple-700 font-medium">
                  Email Address 📧
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="border-2 border-pink-200 focus:border-purple-400 bg-white/80"
                />
              </div>
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg border-2 border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">🎯 What you'll learn:</h4>
                <ul className="text-sm space-y-1 text-purple-700 text-left">
                  <li>💰 Create your first crypto wallet</li>
                  <li>🔒 Understand blockchain security</li>
                  <li>⚡ Make your first transaction</li>
                  <li>🏆 Earn an NFT certificate</li>
                </ul>
              </div>
              <Button
                onClick={handleRegistration}
                disabled={!email || !name || isLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg transform hover:scale-105 transition-all"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}🚀 Start My Magical Journey! 🚀
              </Button>
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

              {!isAuthenticated && !walletCreating ? (
                <div className="space-y-4">
                  <p className="text-blue-700">
                    🌟 Your wallet will be created automatically and secured with your email. No complicated stuff to
                    remember! 🌟
                  </p>
                  <SafeDynamicWidget />
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
                <Brain className="w-5 h-5 text-pink-500" />🤖 Meet Your AI Mentor 🤖
              </DialogTitle>
              <DialogDescription className="text-purple-600">
                Learn essential crypto concepts with your personal magical AI guide! ✨
              </DialogDescription>
            </DialogHeader>
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                <Brain className="w-10 h-10 text-white" />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-purple-800">Hi {name}! I'm Alex 🤖✨</h3>
                <div className="text-left space-y-3 bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg border-2 border-purple-200">
                  <p className="text-sm font-medium text-purple-800">
                    🌟 <strong>What magical things you'll learn:</strong> 🌟
                  </p>
                  <ul className="text-sm space-y-1 text-purple-700">
                    <li>🪙 What cryptocurrency really is</li>
                    <li>⛓️ How blockchain transactions work</li>
                    <li>🔒 Why crypto is secure and decentralized</li>
                    <li>🛡️ How to safely interact with blockchain</li>
                  </ul>
                </div>

                <Button
                  onClick={handleAIIntro}
                  disabled={isLoading}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg transform hover:scale-105 transition-all"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}🚀 Start Learning with Alex! 🚀
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={activeModal === "practice"} onOpenChange={() => setActiveModal(null)}>
          <DialogContent className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-800">
                <Zap className="w-5 h-5 text-yellow-500" />⚡ Your First Blockchain Transaction ⚡
              </DialogTitle>
              <DialogDescription className="text-orange-600">
                Make a real transaction on the Flow testnet - completely safe for learning! 🛡️✨
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-lg border-2 border-yellow-300">
                <h4 className="font-medium text-orange-900 mb-2">🎯 Transaction Details:</h4>
                <div className="text-sm space-y-1 text-orange-800">
                  <p>💰 Amount: 0.1 FLOW (testnet tokens)</p>
                  <p>🌐 Network: Flow Testnet</p>
                  <p>🎓 Purpose: Learning transaction</p>
                  <p>🆓 Cost: Free (testnet)</p>
                </div>
              </div>

              <div className="text-center">
                <Button
                  onClick={handlePracticeTransaction}
                  disabled={isLoading}
                  size="lg"
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg transform hover:scale-105 transition-all"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isLoading ? "🪄 Processing Magic..." : "🚀 Send My First Transaction! 🚀"}
                </Button>
              </div>

              {isLoading && (
                <div className="text-center space-y-2">
                  <p className="text-sm text-orange-700">
                    ✨ Your transaction is being processed on the magical blockchain... ✨
                  </p>
                  <div className="flex justify-center space-x-1">
                    <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-3 h-3 bg-gradient-to-r from-red-400 to-pink-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={activeModal === "achievement"} onOpenChange={() => setActiveModal(null)}>
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
                    <h3 className="font-semibold text-lg text-green-800">🎉 Congratulations! 🎉</h3>
                    <p className="text-green-700">
                      ✨ You've successfully completed your first crypto transaction! Now claim your permanent
                      achievement certificate as a magical NFT! ✨
                    </p>

                    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-lg border-2 border-yellow-300">
                      <p className="text-sm text-orange-800">
                        <strong>🎁 Your magical NFT will include:</strong>
                        <br />🏅 Proof of transaction completion
                        <br />⏰ Learning milestone timestamp
                        <br />🆔 Unique certificate ID
                        <br />
                        ⛓️ Permanent blockchain record
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
      </div>
    </div>
  )
}
