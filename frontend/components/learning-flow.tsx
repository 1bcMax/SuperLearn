"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, Wallet, Brain, Trophy, ArrowRight, Loader2, ArrowDown, Zap, Target, Award } from "lucide-react"

const useDynamicContext = () => {
  const [mockWallet, setMockWallet] = useState<any>(null)
  const [mockAuthenticated, setMockAuthenticated] = useState(false)

  const dynamicContext = () => ({
    setShowAuthFlow: () => {
      setTimeout(() => {
        const mockAddress = "0x" + Math.random().toString(16).substr(2, 40)
        setMockWallet({ address: mockAddress })
        setMockAuthenticated(true)
      }, 2000)
    },
    isAuthenticated: mockAuthenticated,
    user: mockAuthenticated ? { email: "user@example.com" } : null,
    primaryWallet: mockWallet,
  })

  return dynamicContext()
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

  const { setShowAuthFlow, isAuthenticated, user, primaryWallet } = useDynamicContext()

  const steps: StepData[] = [
    {
      id: "registration",
      title: "Quick Start",
      description: "Register with email",
      icon: ArrowRight,
      status: currentStep === "registration" ? "active" : completedSteps.has("registration") ? "completed" : "pending",
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

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    completeStep("registration")
    setCurrentStep("wallet")
    setIsLoading(false)
    setActiveModal(null)
  }

  const handleWalletCreation = () => {
    setWalletCreating(true)
    setShowAuthFlow()
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
    if (stepId === currentStep || completedSteps.has(stepId)) {
      setActiveModal(stepId)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-xl">SuperLearn</span>
          </div>
          <h1 className="font-heading font-bold text-3xl">Your Crypto Learning Journey</h1>
          <Progress value={stepProgress[currentStep]} className="w-full max-w-md mx-auto" />
          <p className="text-muted-foreground">Click on any step to see details and take action</p>
        </div>

        {/* Visual Flow Diagram */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isClickable = step.id === currentStep || completedSteps.has(step.id)

              return (
                <div key={step.id} className="relative">
                  <Card
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      step.status === "active"
                        ? "ring-2 ring-primary shadow-lg"
                        : step.status === "completed"
                          ? "bg-green-50 border-green-200"
                          : "opacity-60"
                    } ${isClickable ? "hover:scale-105" : "cursor-not-allowed"}`}
                    onClick={() => isClickable && openStepModal(step.id)}
                  >
                    <CardContent className="p-4 text-center space-y-3">
                      <div
                        className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                          step.status === "active"
                            ? "bg-primary text-primary-foreground"
                            : step.status === "completed"
                              ? "bg-green-500 text-white"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {step.status === "completed" ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{step.title}</h3>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                      {step.status === "active" && (
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      )}
                      {step.status === "completed" && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          Complete
                        </Badge>
                      )}
                    </CardContent>
                  </Card>

                  {/* Connection Arrow */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}

                  {/* Mobile Connection Arrow */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center mt-2">
                      <ArrowDown className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Floating Action Modals */}

        {/* Registration Modal */}
        <Dialog open={activeModal === "registration"} onOpenChange={() => setActiveModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5" />
                Quick Start Registration
              </DialogTitle>
              <DialogDescription>Enter your details to create your learning profile and get started</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <Button onClick={handleRegistration} disabled={!email || !name || isLoading} className="w-full">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Start My Journey
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Wallet Modal */}
        <Dialog open={activeModal === "wallet"} onOpenChange={() => setActiveModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Create Your Crypto Wallet
              </DialogTitle>
              <DialogDescription>
                We'll create a secure embedded wallet for you using Dynamic's technology
              </DialogDescription>
            </DialogHeader>
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Wallet className="w-10 h-10 text-primary" />
              </div>

              {!isAuthenticated && !walletCreating ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Your wallet will be created automatically and secured with your email. No seed phrases to remember!
                  </p>
                  <Button onClick={handleWalletCreation} size="lg" className="w-full">
                    Create My Wallet
                  </Button>
                </div>
              ) : walletCreating ? (
                <div className="space-y-4">
                  <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
                  <div>
                    <p className="font-medium">Creating your secure wallet...</p>
                    <p className="text-sm text-muted-foreground">This will take just a moment</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                  <div>
                    <p className="font-medium text-green-700">Wallet Created Successfully!</p>
                    <p className="text-sm text-muted-foreground">Address: {walletAddress?.substring(0, 15)}...</p>
                    <Badge variant="secondary" className="mt-2">
                      Ready for transactions
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Introduction Modal */}
        <Dialog open={activeModal === "ai-intro"} onOpenChange={() => setActiveModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Meet Your AI Mentor
              </DialogTitle>
              <DialogDescription>Learn essential crypto concepts with your personal AI guide</DialogDescription>
            </DialogHeader>
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Brain className="w-10 h-10 text-white" />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Hi {name}! I'm Alex 🤖</h3>
                <div className="text-left space-y-3 bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm">
                    <strong>What you'll learn:</strong>
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• What cryptocurrency really is</li>
                    <li>• How blockchain transactions work</li>
                    <li>• Why crypto is secure and decentralized</li>
                    <li>• How to safely interact with blockchain</li>
                  </ul>
                </div>

                <Button onClick={handleAIIntro} disabled={isLoading} size="lg" className="w-full">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Start Learning with Alex
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Practice Transaction Modal */}
        <Dialog open={activeModal === "practice"} onOpenChange={() => setActiveModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Your First Blockchain Transaction
              </DialogTitle>
              <DialogDescription>
                Make a real transaction on the Flow testnet - completely safe for learning
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Transaction Details:</h4>
                <div className="text-sm space-y-1 text-blue-800">
                  <p>• Amount: 0.1 FLOW (testnet tokens)</p>
                  <p>• Network: Flow Testnet</p>
                  <p>• Purpose: Learning transaction</p>
                  <p>• Cost: Free (testnet)</p>
                </div>
              </div>

              <div className="text-center">
                <Button onClick={handlePracticeTransaction} disabled={isLoading} size="lg" className="w-full">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isLoading ? "Processing Transaction..." : "Send My First Transaction"}
                </Button>
              </div>

              {isLoading && (
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Your transaction is being processed on the blockchain...
                  </p>
                  <div className="flex justify-center space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Achievement Modal */}
        <Dialog open={activeModal === "achievement"} onOpenChange={() => setActiveModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Earn Your NFT Certificate
              </DialogTitle>
              <DialogDescription>Mint your permanent "Crypto Explorer" achievement on the blockchain</DialogDescription>
            </DialogHeader>
            <div className="text-center space-y-6">
              {!nftMinted ? (
                <>
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <Trophy className="w-12 h-12 text-white" />
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Congratulations! 🎉</h3>
                    <p className="text-muted-foreground">
                      You've successfully completed your first crypto transaction. Now claim your permanent achievement
                      certificate as an NFT!
                    </p>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        <strong>Your NFT will include:</strong>
                        <br />• Proof of transaction completion
                        <br />• Learning milestone timestamp
                        <br />• Unique certificate ID
                        <br />• Permanent blockchain record
                      </p>
                    </div>

                    <Button onClick={handleMintNFT} disabled={isLoading} size="lg" className="w-full">
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Mint My NFT Certificate
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Trophy className="w-16 h-16 text-white" />
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-xl text-green-700">NFT Minted Successfully!</h3>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-900">Crypto Explorer Certificate</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Your achievement is now permanently recorded on the Flow blockchain
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Achievement Unlocked
                    </Badge>
                  </div>

                  <Button variant="outline" className="w-full bg-transparent">
                    Continue Your Crypto Journey
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
