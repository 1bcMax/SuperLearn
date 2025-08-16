import { useState, useEffect } from 'react'

interface AdventureCharacterProps {
  mood: 'excited' | 'thinking' | 'celebrating' | 'encouraging'
  message?: string
  onMessageClick?: () => void
}

export default function AdventureCharacter({ 
  mood, 
  message, 
  onMessageClick 
}: AdventureCharacterProps) {
  const [currentExpression, setCurrentExpression] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)

  const expressions = {
    excited: ['🤖', '😊', '🎉', '✨'],
    thinking: ['🤖', '🤔', '💭', '🧠'],
    celebrating: ['🤖', '🎊', '🏆', '🌟'],
    encouraging: ['🤖', '👍', '💪', '🚀']
  }

  useEffect(() => {
    const expressionList = expressions[mood]
    let index = 0
    
    const interval = setInterval(() => {
      setCurrentExpression(expressionList[index])
      index = (index + 1) % expressionList.length
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 300)
    }, 2000)

    return () => clearInterval(interval)
  }, [mood])

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Character */}
      <div className={`
        w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full 
        flex items-center justify-center shadow-xl border-4 border-white
        transition-all duration-300 transform hover:scale-110 cursor-pointer
        ${isAnimating ? 'animate-bounce' : 'animate-pulse'}
      `}>
        <span className="text-2xl">{currentExpression || '🤖'}</span>
      </div>

      {/* Speech Bubble */}
      {message && (
        <div 
          className="absolute bottom-20 right-0 max-w-xs bg-white rounded-2xl p-4 shadow-xl border-2 border-purple-300 cursor-pointer transform transition-all duration-300 hover:scale-105"
          onClick={onMessageClick}
        >
          <div className="text-purple-800 text-sm font-medium">
            {message}
          </div>
          
          {/* Speech bubble tail */}
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r-2 border-b-2 border-purple-300 transform rotate-45"></div>
        </div>
      )}
    </div>
  )
}