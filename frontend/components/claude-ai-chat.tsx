"use client"

import { useState, useRef, useEffect } from "react"
import { usePrivy, useWallets } from './providers'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, Send, Lightbulb, Coins, Shield, Trophy, Loader2, Zap, BookOpen, GraduationCap } from "lucide-react"

interface Message {
  id: string
  type: "user" | "claude"
  content: string
  timestamp: Date
  isTyping?: boolean
  suggestions?: string[]
  messageType?: "chat" | "learning" | "quiz"
  data?: any
}

interface ClaudeAIChatProps {
  childName?: string
}

export function ClaudeAIChat({ childName = "there" }: ClaudeAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "claude",
      content: "Hello! I'm Claude, your AI learning assistant! 🎓✨ I can help you learn about blockchain, cryptocurrency, AI, programming, and many other topics. I can also create personalized quizzes to test your knowledge. What would you like to explore today?",
      timestamp: new Date(),
      suggestions: [
        "What is blockchain technology?",
        "How do cryptocurrency wallets work?", 
        "Explain Bitcoin vs Ethereum",
        "What are smart contracts?",
        "How does crypto mining work?",
        "What is DeFi?",
        "Generate a crypto quiz",
        "What are NFTs?"
      ],
      messageType: "chat"
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
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

  const simulateTyping = async (content: string, messageType: "chat" | "learning" | "quiz" = "chat", data?: any, suggestions?: string[]) => {
    setIsTyping(true)

    // Add typing indicator
    const typingMessage: Message = {
      id: `typing-${Date.now()}`,
      type: "claude",
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
          id: `claude-${Date.now()}`,
          type: "claude",
          content,
          timestamp: new Date(),
          suggestions,
          messageType,
          data,
        },
      ]
    })

    setIsTyping(false)
  }

  const callClaudeAPI = async (message: string, type: string = "chat", options?: any) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          type,
          ...options
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "API request failed")
      }
      
      return data.response
    } catch (error) {
      console.error("Claude API Error:", error)
      throw error
    }
  }

  const generateLearningContent = async (topic: string, userLevel: string = "Beginner", learningStyle: string = "Visual") => {
    try {
      const response = await callClaudeAPI(topic, "learn", {
        topic,
        user_level: userLevel,
        learning_style: learningStyle
      })
      return response
    } catch (error) {
      return `I'd be happy to help you learn about ${topic}! This is an exciting field with many practical applications. Let me know if you'd like me to explain any specific aspects or create a quiz about it.`
    }
  }

  const generateQuiz = async (topic: string, difficulty: string = "medium", numQuestions: number = 3) => {
    try {
      const response = await callClaudeAPI(topic, "quiz", {
        topic,
        difficulty,
        num_questions: numQuestions
      })
      return response
    } catch (error) {
      return `I'd be happy to create a quiz about ${topic}! Unfortunately, I'm having some trouble generating the questions right now. Would you like to try a different topic or ask me to explain ${topic} concepts instead?`
    }
  }

  const handleSendMessage = async (content: string, type: "chat" | "learn" | "quiz" = "chat", additionalData?: any) => {
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

    try {
      let response: string
      let messageType: "chat" | "learning" | "quiz" = "chat"
      let suggestions: string[] = []

      if (type === "learn") {
        response = await generateLearningContent(content, additionalData?.level || "Beginner", additionalData?.style || "Visual")
        messageType = "learning"
        suggestions = [
          "Generate a quiz on this topic",
          "Learn something else", 
          "Ask a follow-up question",
          "Explain a specific concept"
        ]
      } else if (type === "quiz") {
        response = await generateQuiz(content, additionalData?.difficulty || "medium", additionalData?.numQuestions || 3)
        messageType = "quiz"
        suggestions = [
          "Generate another quiz",
          "Learn more about this topic",
          "Try a different subject",
          "Explain the concepts"
        ]
      } else {
        // Regular chat
        response = await callClaudeAPI(content, "chat")
        suggestions = getSmartSuggestions(content)
      }

      await simulateTyping(response, messageType, null, suggestions)
    } catch (error) {
      await simulateTyping("I'm sorry, I'm having trouble processing your request right now. Please try again or rephrase your question.", "chat")
    }
  }

  const getSmartSuggestions = (message: string): string[] => {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes("blockchain")) {
      return ["What are smart contracts?", "How does consensus work?", "Explain blockchain nodes", "Generate a blockchain quiz"]
    } else if (lowerMessage.includes("bitcoin")) {
      return ["How does Bitcoin mining work?", "What is proof of work?", "Bitcoin vs other cryptos", "Generate a Bitcoin quiz"]
    } else if (lowerMessage.includes("ethereum")) {
      return ["What are smart contracts?", "Explain gas fees", "What is proof of stake?", "Generate an Ethereum quiz"]
    } else if (lowerMessage.includes("defi")) {
      return ["What is yield farming?", "How do DEXs work?", "Explain liquidity pools", "Generate a DeFi quiz"]
    } else if (lowerMessage.includes("nft")) {
      return ["How are NFTs created?", "NFT marketplaces explained", "NFT vs fungible tokens", "Generate an NFT quiz"]
    } else if (lowerMessage.includes("wallet")) {
      return ["Hot vs cold wallets", "How do private keys work?", "Multi-signature wallets", "Generate a wallet security quiz"]
    } else if (lowerMessage.includes("crypto") || lowerMessage.includes("cryptocurrency")) {
      return ["Bitcoin vs Ethereum", "What is staking?", "Crypto trading basics", "Generate a crypto quiz"]
    } else if (lowerMessage.includes("ai") || lowerMessage.includes("artificial intelligence")) {
      return ["Learn about machine learning", "Generate an AI quiz", "Explain neural networks", "What is deep learning?"]
    } else if (lowerMessage.includes("programming") || lowerMessage.includes("coding")) {
      return ["Learn about Python", "Generate a programming quiz", "Explain algorithms", "What are data structures?"]
    } else {
      return ["What is blockchain?", "How do wallets work?", "Explain Bitcoin", "Generate a crypto quiz"]
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion.includes("Learn about") || suggestion.includes("Explain")) {
      const topic = suggestion.replace("Learn about ", "").replace("Explain ", "")
      handleSendMessage(topic, "learn")
    } else if (suggestion.includes("Generate") && suggestion.includes("quiz")) {
      const topic = suggestion.replace("Generate a ", "").replace("Generate an ", "").replace(" quiz", "")
      handleSendMessage(topic, "quiz")
    } else {
      handleSendMessage(suggestion, "chat")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(inputValue)
  }

  const getMessageIcon = (messageType?: string) => {
    switch (messageType) {
      case "learning":
        return <BookOpen className="w-4 h-4 text-blue-500" />
      case "quiz":
        return <Trophy className="w-4 h-4 text-purple-500" />
      default:
        return <Brain className="w-4 h-4 text-green-500" />
    }
  }

  const getMessageTypeLabel = (messageType?: string) => {
    switch (messageType) {
      case "learning":
        return "Educational Content"
      case "quiz":
        return "Quiz Generated"
      default:
        return "AI Chat"
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src="/claude-avatar.png" alt="Claude AI" />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <GraduationCap className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-lg">Claude - AI Learning Assistant</h3>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Ready to help you learn!
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Brain className="w-3 h-3 mr-1" />
                AI Learning
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                <Zap className="w-3 h-3 mr-1" />
                Claude AI
              </Badge>
            </div>
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
                  {message.type === "claude" && (
                    <Avatar className="w-8 h-8 mt-1">
                      <AvatarImage src="/claude-avatar.png" alt="Claude" />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                        <GraduationCap className="w-4 h-4" />
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
                          <span className="text-sm">Claude is thinking...</span>
                        </div>
                      ) : (
                        <div className="text-sm leading-relaxed whitespace-pre-line">{message.content}</div>
                      )}
                    </div>

                    {message.messageType && !message.isTyping && (
                      <div className="flex items-center gap-2 mt-2 ml-2">
                        {getMessageIcon(message.messageType)}
                        <span className="text-xs text-muted-foreground">{getMessageTypeLabel(message.messageType)}</span>
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

                    <div className="text-xs text-muted-foreground mt-1 ml-2">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
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
                placeholder="Ask me about blockchain, Bitcoin, Ethereum, DeFi, NFTs, wallets, or request a quiz..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button type="submit" size="sm" disabled={isTyping || !inputValue.trim()}>
                <Send className="w-4 h-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </form>

            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3" />
                <span>Powered by Claude AI (Anthropic)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Connected</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}