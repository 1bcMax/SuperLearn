"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Message {
  id: string
  type: 'user' | 'agent'
  content: string
  timestamp: Date
}

interface LearningResponse {
  explanation: string
  key_points: string[]
  next_steps: string[]
  resources: string[]
}

interface QuizQuestion {
  question: string
  options: string[]
  correct: number
  explanation: string
}

export function AIAgentChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'agent',
      content: 'Hello! I\'m your AI learning assistant powered by Fetch.ai uAgents. I can help you learn new topics and create personalized quizzes. What would you like to explore today?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentMode, setCurrentMode] = useState<'chat' | 'learn' | 'quiz'>('chat')
  const [learningLevel, setLearningLevel] = useState('Beginner')
  const [learningStyle, setLearningStyle] = useState('Visual')
  const [agentStatus, setAgentStatus] = useState<'online' | 'offline' | 'unknown'>('unknown')

  // Check agent status on component mount
  useState(() => {
    checkAgentStatus()
  })

  const checkAgentStatus = async () => {
    try {
      const response = await fetch('http://localhost:8001/agent-status')
      const data = await response.json()
      setAgentStatus(data.agent_running ? 'online' : 'offline')
    } catch {
      setAgentStatus('offline')
    }
  }

  const addMessage = (content: string, type: 'user' | 'agent') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const sendChatMessage = async () => {
    if (!inputMessage.trim()) return

    addMessage(inputMessage, 'user')
    const userInput = inputMessage
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput })
      })

      const data = await response.json()
      
      if (data.success) {
        addMessage(data.response, 'agent')
      } else {
        addMessage('Sorry, I encountered an error. Please try again.', 'agent')
      }
    } catch (error) {
      addMessage('Unable to connect to the AI agent. Please check if the bridge server is running on port 8001.', 'agent')
    }

    setIsLoading(false)
  }

  const sendLearningRequest = async () => {
    if (!inputMessage.trim()) return

    addMessage(`I'd like to learn about: ${inputMessage}`, 'user')
    const topic = inputMessage
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8001/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          user_level: learningLevel,
          learning_style: learningStyle
        })
      })

      const data = await response.json()
      
      if (data.success) {
        const learningData: LearningResponse = data.data
        
        let formattedResponse = `📚 **Learning about ${topic}**\n\n`
        formattedResponse += `${learningData.explanation}\n\n`
        formattedResponse += `**Key Points:**\n${learningData.key_points.map(point => `• ${point}`).join('\n')}\n\n`
        formattedResponse += `**Next Steps:**\n${learningData.next_steps.map(step => `• ${step}`).join('\n')}\n\n`
        formattedResponse += `**Resources:**\n${learningData.resources.map(resource => `• ${resource}`).join('\n')}`
        
        addMessage(formattedResponse, 'agent')
      } else {
        addMessage('Sorry, I couldn\'t generate learning content for that topic. Please try again.', 'agent')
      }
    } catch (error) {
      addMessage('Unable to connect to the AI agent. Please check if the bridge server is running on port 8001.', 'agent')
    }

    setIsLoading(false)
  }

  const sendQuizRequest = async () => {
    if (!inputMessage.trim()) return

    addMessage(`Generate a quiz about: ${inputMessage}`, 'user')
    const topic = inputMessage
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8001/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          difficulty: 'medium',
          num_questions: 3
        })
      })

      const data = await response.json()
      
      if (data.success) {
        const quizData = data.data
        
        let formattedQuiz = `🧠 **Quiz: ${quizData.topic}**\n\n`
        
        quizData.questions.forEach((q: QuizQuestion, index: number) => {
          formattedQuiz += `**Question ${index + 1}:** ${q.question}\n`
          q.options.forEach((option, optIndex) => {
            const marker = optIndex === q.correct ? '✅' : '❌'
            formattedQuiz += `${String.fromCharCode(65 + optIndex)}) ${option} ${optIndex === q.correct ? marker : ''}\n`
          })
          formattedQuiz += `\n*Explanation:* ${q.explanation}\n\n`
        })
        
        addMessage(formattedQuiz, 'agent')
      } else {
        addMessage('Sorry, I couldn\'t generate a quiz for that topic. Please try again.', 'agent')
      }
    } catch (error) {
      addMessage('Unable to connect to the AI agent. Please check if the bridge server is running on port 8001.', 'agent')
    }

    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    switch (currentMode) {
      case 'chat':
        await sendChatMessage()
        break
      case 'learn':
        await sendLearningRequest()
        break
      case 'quiz':
        await sendQuizRequest()
        break
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              🤖 AI Learning Assistant
              <Badge variant={agentStatus === 'online' ? 'default' : 'destructive'}>
                {agentStatus === 'online' ? 'Online' : agentStatus === 'offline' ? 'Offline' : 'Checking...'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Powered by Fetch.ai uAgents - Your personalized learning companion
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={checkAgentStatus}>
            Refresh Status
          </Button>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Select value={currentMode} onValueChange={(value: any) => setCurrentMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chat">Chat</SelectItem>
              <SelectItem value="learn">Learn</SelectItem>
              <SelectItem value="quiz">Quiz</SelectItem>
            </SelectContent>
          </Select>
          
          {currentMode === 'learn' && (
            <>
              <Select value={learningLevel} onValueChange={setLearningLevel}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={learningStyle} onValueChange={setLearningStyle}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Visual">Visual</SelectItem>
                  <SelectItem value="Auditory">Auditory</SelectItem>
                  <SelectItem value="Reading">Reading</SelectItem>
                  <SelectItem value="Kinesthetic">Hands-on</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-sm text-gray-600">AI Agent is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                currentMode === 'chat' 
                  ? "Ask me anything..." 
                  : currentMode === 'learn'
                  ? "What topic would you like to learn about?"
                  : "What topic should I create a quiz for?"
              }
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !inputMessage.trim()}>
              {currentMode === 'chat' ? 'Send' : currentMode === 'learn' ? 'Learn' : 'Quiz'}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}