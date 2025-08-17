"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { usePrivy } from './providers'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, Send, Lightbulb, Coins, Shield, Trophy, Loader2 } from "lucide-react"
import { WalletWidget } from "./wallet-widget"

interface Message {
  id: string
  type: "user" | "mentor"
  content: string
  timestamp: Date
  isTyping?: boolean
  suggestions?: string[]
  lessonType?: "concept" | "practice" | "achievement"
  showWallet?: boolean
}

interface AIMentorChatProps {
  childName?: string
  onLessonComplete?: (lessonId: string) => void
}

const lessonResponses = {
  "what is cryptocurrency": {
    content:
      "Great question! Cryptocurrency is like digital money that exists only on computers. But here's the exciting part - we can also create 'smart contracts' which are like digital agreements that run automatically! Want to learn how to deploy your very own smart contract?",
    lessonType: "concept" as const,
    suggestions: ["What's a smart contract?", "How do I deploy one?", "Let's start the tutorial!"],
  },
  "what's a smart contract": {
    content:
      "A smart contract is like a digital robot that follows rules automatically! Imagine you made a deal with a friend: 'If I give you $5, you give me your trading card.' A smart contract does this automatically - no one can cheat! Ready to create and deploy your first smart contract?",
    lessonType: "concept" as const,
    suggestions: ["Yes, let's deploy one!", "How does deployment work?", "What tools do I need?"],
  },
  "yes, let's deploy one": {
    content:
      "Awesome! Let's deploy your first smart contract step by step! We'll create a simple 'Hello World' contract on the Flow blockchain. This is the same process real developers use! First, let me set up your development environment...",
    lessonType: "practice" as const,
    suggestions: ["I'm ready!", "What's Flow blockchain?", "Continue tutorial"],
    showWallet: true,
  },
  "let's start the tutorial": {
    content:
      "Perfect! Welcome to the Smart Contract Deployment Tutorial! 🚀 We'll go through 5 easy steps:\n\n1️⃣ Set up your wallet\n2️⃣ Write a simple contract\n3️⃣ Compile the contract\n4️⃣ Deploy to testnet\n5️⃣ Interact with your contract\n\nReady to become a blockchain developer?",
    lessonType: "practice" as const,
    suggestions: ["Step 1: Setup wallet", "Show me the contract code", "I'm ready to start!"],
    showWallet: true,
  },
  "step 1: setup wallet": {
    content:
      "Step 1: Wallet Setup ✅\n\nGreat! Your wallet is being prepared. This wallet will:\n• Hold test FLOW tokens for deployment\n• Store your deployed contracts\n• Let you interact with the blockchain\n\nOnce connected, we'll move to Step 2: Writing your smart contract code!",
    lessonType: "practice" as const,
    suggestions: ["Step 2: Write contract", "What's FLOW?", "Continue tutorial"],
    showWallet: true,
  },
  "step 2: write contract": {
    content:
      "Step 2: Writing Your Smart Contract 📝\n\nHere's your first smart contract in Cadence (Flow's language):\n\n```cadence\npub contract HelloWorld {\n    pub var greeting: String\n    \n    init() {\n        self.greeting = \"Hello, World!\"\n    }\n    \n    pub fun changeGreeting(newGreeting: String) {\n        self.greeting = newGreeting\n    }\n}\n```\n\nThis contract stores a greeting message that anyone can read or change!",
    lessonType: "practice" as const,
    suggestions: ["Step 3: Compile", "Explain the code", "What's Cadence?"],
  },
  "step 3: compile": {
    content:
      "Step 3: Compiling Your Contract ⚙️\n\nCompiling means translating your human-readable code into blockchain language! Think of it like translating English to computer language.\n\n✅ Checking syntax...\n✅ Validating contract structure...\n✅ Generating bytecode...\n\nCompilation successful! Your contract is ready for deployment!",
    lessonType: "practice" as const,
    suggestions: ["Step 4: Deploy!", "What's bytecode?", "Continue deployment"],
  },
  "step 4: deploy": {
    content:
      "Step 4: Deploying to Blockchain 🚀\n\nThis is the exciting part! We're putting your contract on the Flow testnet:\n\n🔄 Connecting to Flow testnet...\n🔄 Submitting transaction...\n🔄 Waiting for confirmation...\n✅ Contract deployed successfully!\n\nContract Address: 0x1234...abcd\nTransaction ID: 0xabcd...1234\n\nCongratulations! Your smart contract is now live on the blockchain!",
    lessonType: "achievement" as const,
    suggestions: ["Step 5: Interact", "View on explorer", "Deploy another contract!"],
  },
  "step 5: interact": {
    content:
      "Step 5: Interacting with Your Contract 🎯\n\nNow let's use your deployed contract!\n\n📖 Reading current greeting: 'Hello, World!'\n\nLet's change it! I'll call the changeGreeting function...\n\n✅ Transaction sent!\n✅ New greeting set to: 'Hello from SuperLearn!'\n\nAmazing! You've successfully deployed AND used your first smart contract! You're now a blockchain developer! 🎉",
    lessonType: "achievement" as const,
    suggestions: ["Get my certificate!", "Deploy another contract", "What's next?"],
  },
  "get my certificate": {
    content:
      "🏆 CONGRATULATIONS! 🏆\n\nYou've completed the Smart Contract Deployment Tutorial! You've learned:\n\n✅ Smart contract basics\n✅ Cadence programming\n✅ Contract compilation\n✅ Blockchain deployment\n✅ Contract interaction\n\nYour 'Smart Contract Developer' NFT certificate is being minted right now! This proves you can deploy real smart contracts!",
    lessonType: "achievement" as const,
    suggestions: ["View my NFT", "Learn advanced contracts", "Share my achievement!"],
  },
  "how does deployment work": {
    content:
      "Great question! Deploying a smart contract is like publishing a book that everyone can read forever! Here's what happens:\n\n1. You write your contract code\n2. The blockchain checks if it's valid\n3. You pay a small fee (gas) to store it\n4. It gets a permanent address\n5. Anyone can interact with it!\n\nWant to try deploying one yourself?",
    lessonType: "concept" as const,
    suggestions: ["Yes, let's deploy!", "What's gas?", "Start tutorial"],
  },
  "what tools do i need": {
    content:
      "For smart contract deployment, you need:\n\n🔧 A wallet (we'll set this up!)\n💰 Test tokens (free for learning!)\n📝 Contract code (I'll help you write it!)\n🌐 Blockchain connection (Flow testnet)\n\nDon't worry - I'll guide you through everything! The best part? It's all free for learning!",
    lessonType: "concept" as const,
    suggestions: ["Let's start!", "What's Flow testnet?", "Begin tutorial"],
  },
}

const initialMessages: Message[] = [
  {
    id: "1",
    type: "mentor",
    content:
      "Hi there! I'm Alex, your AI blockchain mentor! 🚀 I'm here to teach you how to deploy your very first smart contract step by step. It's easier than you think, and by the end, you'll be a real blockchain developer! What should I call you?",
    timestamp: new Date(),
    suggestions: ["Hi Alex!", "Let's deploy a smart contract!", "What's a smart contract?"],
  },
]

export function AIMentorChat({ childName = "there", onLessonComplete }: AIMentorChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showWallet, setShowWallet] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { authenticated } = usePrivy()

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const simulateTyping = async (
    content: string,
    lessonType?: "concept" | "practice" | "achievement",
    suggestions?: string[],
    showWalletWidget?: boolean,
  ) => {
    setIsTyping(true)

    // Add typing indicator
    const typingMessage: Message = {
      id: `typing-${Date.now()}`,
      type: "mentor",
      content: "",
      timestamp: new Date(),
      isTyping: true,
    }

    setMessages((prev) => [...prev, typingMessage])

    // Simulate typing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Remove typing indicator and add real message
    setMessages((prev) => {
      const filtered = prev.filter((msg) => !msg.isTyping)
      return [
        ...filtered,
        {
          id: `mentor-${Date.now()}`,
          type: "mentor",
          content,
          timestamp: new Date(),
          suggestions,
          lessonType,
          showWallet: showWalletWidget,
        },
      ]
    })

    if (showWalletWidget) {
      setShowWallet(true)
    }

    setIsTyping(false)

    // Trigger lesson completion if it's an achievement
    if (lessonType === "achievement" && onLessonComplete) {
      setTimeout(() => onLessonComplete("first-transaction"), 2000)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    // Find appropriate response
    const lowerContent = content.toLowerCase()
    const response = Object.entries(lessonResponses).find(([key]) => lowerContent.includes(key))?.[1]

    if (response) {
      await simulateTyping(response.content, response.lessonType, response.suggestions, response.showWallet)
    } else {
      // Default encouraging response
      const encouragingResponses = [
        "That's a great question! Let me help you understand that better. Cryptocurrency is all about learning step by step.",
        "I love your curiosity! Keep asking questions - that's how we learn best. What would you like to explore next?",
        "You're doing amazing! Learning about crypto can seem complex, but you're getting it. What interests you most?",
      ]

      const randomResponse = encouragingResponses[Math.floor(Math.random() * encouragingResponses.length)]
      await simulateTyping(randomResponse, "concept", [
        "Tell me about blockchain",
        "What's a wallet?",
        "How do I start?",
      ])
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(inputValue)
  }

  const handleWalletConnected = () => {
    const walletMessage: Message = {
      id: `mentor-wallet-${Date.now()}`,
      type: "mentor",
      content:
        "Perfect! Your development wallet is ready! 🎉 You now have:\n\n✅ Flow testnet connection\n✅ Test FLOW tokens for deployment\n✅ Contract deployment capabilities\n\nYour wallet address: 0x1234...abcd\nBalance: 100 FLOW (testnet)\n\nReady to deploy your first smart contract?",
      timestamp: new Date(),
      suggestions: ["Step 2: Write contract", "Deploy Hello World contract", "What's next?"],
      lessonType: "achievement",
    }

    setMessages((prev) => [...prev, walletMessage])
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Chat Interface */}
      <div className="lg:col-span-2">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/ai-mentor-avatar.png" alt="Alex the AI Mentor" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Brain className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-lg">Alex - Your AI Mentor</h3>
                <p className="text-sm text-muted-foreground">Online • Ready to teach!</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Learning Mode
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.type === "mentor" && (
                      <Avatar className="w-8 h-8 mt-1">
                        <AvatarImage src="/ai-mentor-avatar.png" alt="Alex" />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          <Brain className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className={`max-w-[80%] ${message.type === "user" ? "order-first" : ""}`}>
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          message.type === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"
                        }`}
                      >
                        {message.isTyping ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Alex is typing...</span>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        )}
                      </div>

                      {message.lessonType && !message.isTyping && (
                        <div className="flex items-center gap-2 mt-2 ml-2">
                          {message.lessonType === "concept" && <Lightbulb className="w-4 h-4 text-yellow-500" />}
                          {message.lessonType === "practice" && <Coins className="w-4 h-4 text-blue-500" />}
                          {message.lessonType === "achievement" && <Trophy className="w-4 h-4 text-purple-500" />}
                          <span className="text-xs text-muted-foreground capitalize">{message.lessonType} Lesson</span>
                        </div>
                      )}

                      {message.suggestions && !message.isTyping && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs h-7 rounded-full bg-transparent"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mt-1 ml-2">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    {message.type === "user" && (
                      <Avatar className="w-8 h-8 mt-1">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                          {childName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t border-border p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask Alex anything about crypto..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button type="submit" size="sm" disabled={isTyping || !inputValue.trim()}>
                  <Send className="w-4 h-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </form>

              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Shield className="w-3 h-3" />
                <span>Safe learning environment • All conversations are educational</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Widget */}
      <div className="lg:col-span-1">
        {showWallet && <WalletWidget onWalletConnected={handleWalletConnected} className="sticky top-4" />}
      </div>
    </div>
  )
}
