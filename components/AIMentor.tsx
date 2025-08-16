import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

interface Message {
  id: string
  type: 'ai' | 'user'
  content: string
  timestamp: Date
}

interface AIMentorProps {
  userAddress: string
  userName: string
  currentStage: string
  onStageChange: (newStage: string) => void
  onTransactionRequest: (data: any) => void
}

export default function AIMentor({ 
  userAddress, 
  userName, 
  currentStage, 
  onStageChange, 
  onTransactionRequest 
}: AIMentorProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Start conversation when component mounts
    if (messages.length === 0) {
      initializeConversation()
    }
  }, [currentStage])

  const initializeConversation = async () => {
    try {
      setIsLoading(true)
      const response = await sendToAIMentor('', currentStage)
      if (response) {
        addAIMessage(response.message)
        handleNextAction(response.next_action, response.lesson_data)
      }
    } catch (error) {
      console.error('Failed to initialize conversation:', error)
      addAIMessage("Hi there! I'm your AI crypto mentor. Let's start learning about cryptocurrency together! What would you like to know first?")
    } finally {
      setIsLoading(false)
    }
  }

  const sendToAIMentor = async (input: string, stage: string) => {
    try {
      // For demo purposes, we'll simulate the AI mentor responses
      // In production, this would call the actual uAgent endpoint
      const simulatedResponse = await simulateAIMentorResponse(input, stage)
      return simulatedResponse
    } catch (error) {
      console.error('Error communicating with AI mentor:', error)
      return null
    }
  }

  const simulateAIMentorResponse = async (input: string, stage: string): Promise<any> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const responses = {
      intro: {
        message: input 
          ? "That's a great question! Cryptocurrency is like digital money that lives on the internet. It's super secure and no one can fake it. Ready to create your first digital wallet?"
          : "Hi " + userName + "! 🎉 I'm your AI crypto mentor. We're going to learn about cryptocurrency by actually using it safely. Think of crypto like digital coins that you can send to friends anywhere in the world instantly! Are you excited to get started?",
        next_action: input ? "create_wallet" : "wait_for_input",
        lesson_data: { stage: "intro" }
      },
      wallet: {
        message: "Amazing! Your digital wallet is like a special app that holds your crypto coins. The best part? You don't need to remember any long passwords - just your email! Think of it like your digital piggy bank. Ready to see some real crypto in action?",
        next_action: "send_transaction",
        lesson_data: { stage: "wallet" }
      },
      transaction: {
        message: "Now for the exciting part - your first crypto transaction! 🚀 We'll send 0.1 testnet FLOW tokens (that's practice money, so it's totally safe). This will show you exactly how crypto moves around the world in seconds. Ready to make history?",
        next_action: "send_transaction",
        lesson_data: { stage: "transaction" }
      },
      verification: {
        message: "🎊 CONGRATULATIONS! You just completed your first blockchain transaction! You're now officially a crypto explorer. Let's verify your new skills and mint your 'First Transaction Master' certificate as a special NFT that proves what you've learned!",
        next_action: "verify_skill",
        lesson_data: { stage: "verification" }
      }
    }

    return responses[stage as keyof typeof responses] || responses.intro
  }

  const addAIMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleNextAction = (action: string, lessonData: any) => {
    switch (action) {
      case 'create_wallet':
        onStageChange('wallet')
        break
      case 'send_transaction':
        onStageChange('transaction')
        break
      case 'verify_skill':
        onStageChange('verification')
        break
      case 'wait_for_input':
        // Stay in current stage, wait for user input
        break
    }
  }

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return

    const input = userInput.trim()
    setUserInput('')
    addUserMessage(input)
    setIsTyping(true)
    setIsLoading(true)

    try {
      // Simulate AI thinking time
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const response = await sendToAIMentor(input, currentStage)
      if (response) {
        addAIMessage(response.message)
        handleNextAction(response.next_action, response.lesson_data)
      }
    } catch (error) {
      addAIMessage("I'm having trouble understanding right now. Could you try asking that again?")
    } finally {
      setIsTyping(false)
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickResponses = {
    intro: [
      "What is cryptocurrency?",
      "Is it safe?",
      "Let's start!"
    ],
    wallet: [
      "How does it work?",
      "Create my wallet!",
      "What's next?"
    ],
    transaction: [
      "Send my first transaction!",
      "What happens next?",
      "Is this real money?"
    ],
    verification: [
      "Get my certificate!",
      "What did I learn?",
      "Show me more!"
    ]
  }

  return (
    <div className="crypto-card max-w-2xl mx-auto h-96 flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-white/20">
        <div className="w-10 h-10 bg-gradient-to-br from-crypto-green to-flow-blue rounded-full flex items-center justify-center">
          <span className="text-xl">🤖</span>
        </div>
        <div>
          <h3 className="font-bold">AI Crypto Mentor</h3>
          <p className="text-xs text-white/60">Your personal blockchain teacher</p>
        </div>
        <div className="ml-auto">
          <span className="text-xs text-crypto-green">● Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.type === 'ai' ? 'ai-message' : 'user-message'}
          >
            <div className="flex items-start space-x-2">
              {message.type === 'ai' && (
                <span className="text-lg mt-1">🤖</span>
              )}
              <div className="flex-1">
                <p className="text-sm leading-relaxed">{message.content}</p>
                <span className="text-xs text-white/50 mt-1 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              {message.type === 'user' && (
                <span className="text-lg mt-1">👤</span>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="ai-message">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🤖</span>
              <div className="typing-indicator">
                <span style={{'--delay': '0s'} as React.CSSProperties}></span>
                <span style={{'--delay': '0.2s'} as React.CSSProperties}></span>
                <span style={{'--delay': '0.4s'} as React.CSSProperties}></span>
              </div>
              <span className="text-sm text-white/60">AI mentor is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Responses */}
      {!isLoading && quickResponses[currentStage as keyof typeof quickResponses] && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {quickResponses[currentStage as keyof typeof quickResponses].map((response, index) => (
              <button
                key={index}
                onClick={() => {
                  setUserInput(response)
                  setTimeout(handleSendMessage, 100)
                }}
                className="text-xs bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 transition-colors"
              >
                {response}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask your AI mentor anything..."
          disabled={isLoading}
          className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm placeholder-white/50 focus:outline-none focus:border-crypto-blue"
        />
        <button
          onClick={handleSendMessage}
          disabled={!userInput.trim() || isLoading}
          className="crypto-button !py-2 !px-4 text-sm"
        >
          {isLoading ? '...' : '💬'}
        </button>
      </div>
    </div>
  )
}