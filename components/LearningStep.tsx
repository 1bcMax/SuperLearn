import { ReactNode } from 'react'

interface LearningStepProps {
  stepNumber: number
  title: string
  description: string
  icon: string
  isActive: boolean
  isCompleted: boolean
  children: ReactNode
  bgColor?: string
}

export default function LearningStep({
  stepNumber,
  title,
  description,
  icon,
  isActive,
  isCompleted,
  children,
  bgColor = "from-purple-200 to-blue-200"
}: LearningStepProps) {
  return (
    <div className={`
      bg-gradient-to-br ${bgColor} rounded-3xl p-8 shadow-2xl border-4 
      ${isActive ? 'border-yellow-400 scale-105' : 'border-white'}
      ${isCompleted ? 'border-green-400' : ''}
      transition-all duration-500 transform
      ${isActive ? 'animate-pulse' : ''}
    `}>
      {/* Step Header */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <div className={`
            w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl
            ${isCompleted ? 'bg-green-400' : isActive ? 'bg-yellow-400' : 'bg-gray-300'}
            ${isActive ? 'animate-bounce' : ''}
          `}>
            <span className="text-3xl">{isCompleted ? '🎉' : icon}</span>
          </div>
          
          {/* Step Number Badge */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 text-white text-sm font-bold rounded-full flex items-center justify-center">
            {stepNumber}
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-purple-800 mb-2">{title}</h3>
        <p className="text-purple-600 text-lg">{description}</p>
      </div>

      {/* Step Content */}
      <div className="space-y-4">
        {children}
      </div>

      {/* Step Status */}
      <div className="mt-6 text-center">
        <div className={`
          inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold
          ${isCompleted ? 'bg-green-500 text-white' : 
            isActive ? 'bg-yellow-500 text-white' : 
            'bg-gray-300 text-gray-600'}
        `}>
          <span>
            {isCompleted ? '✅' : isActive ? '🔥' : '🔒'}
          </span>
          <span>
            {isCompleted ? 'Completed!' : isActive ? 'Active Now' : 'Coming Up'}
          </span>
        </div>
      </div>
    </div>
  )
}