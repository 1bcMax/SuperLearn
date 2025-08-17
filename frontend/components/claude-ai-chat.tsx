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
      content: "Hey there! I'm Claude, your friendly crypto teacher! 🎮✨ I'm here to help you understand cool stuff like digital money, blockchain (it's like a super secure digital notebook!), and other awesome tech. I'll explain everything in a way that's easy to understand - like we're just chatting! What sounds fun to learn about today? 🚀",
      timestamp: new Date(),
      suggestions: [
        "What's blockchain? (Like Minecraft but for money!)",
        "How do digital wallets work?", 
        "Bitcoin vs Ethereum - What's the difference?",
        "What are smart contracts? (Robot agreements!)",
        "How does crypto mining work?",
        "What are NFTs? (Digital collectibles!)",
        "Give me a fun crypto quiz!",
        "Explain crypto like I'm 12"
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
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        }, 100)
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
      // Add context for kid-friendly responses
      const kidFriendlyPrompt = `Please explain this to a 12-year-old in a fun, engaging way. Use simple language, fun analogies (like video games, sports, or everyday things), and emojis. Keep it exciting but educational. User question: ${message}`
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: type === "chat" ? kidFriendlyPrompt : message,
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
      const kidFriendlyTopic = `Explain ${topic} to a 12-year-old using fun examples, games comparisons, and simple language. Make it exciting!`
      const response = await callClaudeAPI(kidFriendlyTopic, "learn", {
        topic,
        user_level: "Kid-Friendly",
        learning_style: learningStyle
      })
      return response
    } catch (error) {
      return `Hey! Let me tell you about ${topic} in a super cool way! 🎮 It's like when you're playing your favorite game... Want me to explain it differently or make a fun quiz about it? 🚀`
    }
  }

  const generateQuiz = async (topic: string, difficulty: string = "easy", numQuestions: number = 3) => {
    try {
      const kidFriendlyQuizPrompt = `Create a fun, age-appropriate quiz about ${topic} for a 12-year-old. Use simple language and fun scenarios.`
      const response = await callClaudeAPI(kidFriendlyQuizPrompt, "quiz", {
        topic,
        difficulty: "kid-friendly",
        num_questions: numQuestions
      })
      return response
    } catch (error) {
      return `Let's make a super fun quiz about ${topic}! 🎯 Hmm, I'm having a tiny problem making the questions right now. Want to try learning about ${topic} first, or pick something else cool to quiz on? 🎮`
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
      return ["What are smart contracts? (Robot helpers!)", "How does blockchain work like LEGO?", "Blockchain = Super secure diary?", "Fun blockchain quiz!"]
    } else if (lowerMessage.includes("bitcoin")) {
      return ["Bitcoin mining = Digital treasure hunt?", "How is Bitcoin like gold?", "Bitcoin vs video game coins", "Cool Bitcoin quiz!"]
    } else if (lowerMessage.includes("ethereum")) {
      return ["Smart contracts = Robot promises?", "What are gas fees? (Like delivery fees!)", "Ethereum = Computer for everyone?", "Ethereum quiz time!"]
    } else if (lowerMessage.includes("defi")) {
      return ["DeFi = Banks but cooler?", "How do crypto exchanges work?", "What's a liquidity pool? (Like a shared piggy bank!)", "DeFi quiz challenge!"]
    } else if (lowerMessage.includes("nft")) {
      return ["How to make NFTs? (Digital art!)", "NFTs = Pokemon cards but digital?", "Why are NFTs special?", "NFT quiz adventure!"]
    } else if (lowerMessage.includes("wallet")) {
      return ["Hot vs cold wallets (Like backpack vs safe!)", "What are private keys? (Secret passwords!)", "How to keep crypto safe?", "Wallet safety quiz!"]
    } else if (lowerMessage.includes("crypto") || lowerMessage.includes("cryptocurrency")) {
      return ["Bitcoin vs Ethereum (Like Xbox vs PlayStation!)", "What is staking? (Earning rewards!)", "How does crypto work?", "Crypto quiz challenge!"]
    } else if (lowerMessage.includes("ai") || lowerMessage.includes("artificial intelligence")) {
      return ["AI = Super smart robots?", "Fun AI quiz!", "How do computers learn?", "What can AI do?"]
    } else if (lowerMessage.includes("programming") || lowerMessage.includes("coding")) {
      return ["Python = Easy coding language!", "Coding quiz time!", "What are algorithms? (Recipe for computers!)", "How to start coding?"]
    } else {
      return ["What's blockchain? (Digital LEGO!)", "How do crypto wallets work?", "Bitcoin explained simply!", "Fun crypto quiz!"]
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
      <Card className="h-[calc(100vh-200px)] min-h-[500px] max-h-[700px] flex flex-col">
        <CardHeader className="border-b border-border pb-4 flex-shrink-0">
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

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea className="flex-1 h-full" ref={scrollAreaRef}>
            <div className="space-y-4 p-4">
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

          <div className="border-t border-border p-4 flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything! Like: What's Bitcoin? How do NFTs work? Or say 'quiz me!' 🎮"
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