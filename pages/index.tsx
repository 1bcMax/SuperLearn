import { useState, useEffect } from 'react'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import WalletConnection from '../components/WalletConnection'
import AIMentor from '../components/AIMentor'
import FlowTransaction from '../components/FlowTransaction'
import SkillVerification from '../components/SkillVerification'
import LearningStep from '../components/LearningStep'
import AdventureCharacter from '../components/AdventureCharacter'

type LearningStage = 'intro' | 'wallet' | 'transaction' | 'verification' | 'complete'

export default function Home() {
  const { primaryWallet, user } = useDynamicContext()
  const [currentStage, setCurrentStage] = useState<LearningStage>('intro')
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('Crypto Explorer')
  const [transactionId, setTransactionId] = useState('')
  const [certificateId, setCertificateId] = useState('')
  const [error, setError] = useState('')
  const [characterMood, setCharacterMood] = useState<'excited' | 'thinking' | 'celebrating' | 'encouraging'>('excited')
  const [characterMessage, setCharacterMessage] = useState('')

  useEffect(() => {
    if (user?.email) {
      setUserId(user.email.split('@')[0])
      setUserName(user.firstName || user.email.split('@')[0])
    }
  }, [user])

  useEffect(() => {
    if (primaryWallet?.address && currentStage === 'intro') {
      setCurrentStage('wallet')
    }
  }, [primaryWallet?.address, currentStage])

  // Update character based on current stage
  useEffect(() => {
    switch (currentStage) {
      case 'intro':
        setCharacterMood('excited')
        setCharacterMessage("Hi! I'm Crypto Bot! Ready for an awesome adventure? 🚀")
        break
      case 'wallet':
        setCharacterMood('encouraging')
        setCharacterMessage("Great job! Now let's chat with your AI mentor! 🤖")
        break
      case 'transaction':
        setCharacterMood('thinking')
        setCharacterMessage("Time for your first crypto transaction! Don't worry, I'll help! 💫")
        break
      case 'verification':
        setCharacterMood('celebrating')
        setCharacterMessage("Amazing! You're earning your certificate! 🏆")
        break
      case 'complete':
        setCharacterMood('celebrating')
        setCharacterMessage("Woohoo! You're now a Crypto Explorer! 🎉")
        break
    }
  }, [currentStage])

  const handleWalletConnected = (address: string) => {
    setCurrentStage('wallet')
    setError('')
  }

  const handleConnectionError = (errorMsg: string) => {
    setError(errorMsg)
  }

  const handleStageChange = (newStage: string) => {
    setCurrentStage(newStage as LearningStage)
  }

  const handleTransactionComplete = (txId: string) => {
    setTransactionId(txId)
    setCurrentStage('verification')
  }

  const handleTransactionError = (errorMsg: string) => {
    setError(errorMsg)
  }

  const handleVerificationComplete = (certId: string) => {
    setCertificateId(certId)
    setCurrentStage('complete')
  }

  const resetDemo = () => {
    setCurrentStage('intro')
    setTransactionId('')
    setCertificateId('')
    setError('')
  }

  const progressSteps = [
    { key: 'intro', title: 'Introduction', icon: '👋' },
    { key: 'wallet', title: 'Create Wallet', icon: '👛' },
    { key: 'transaction', title: 'First Transaction', icon: '💸' },
    { key: 'verification', title: 'Get Certificate', icon: '🏆' },
    { key: 'complete', title: 'Complete!', icon: '🎉' }
  ]

  const getCurrentStepIndex = () => {
    return progressSteps.findIndex(step => step.key === currentStage)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-400 overflow-hidden">
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl animate-bounce">🌟</div>
        <div className="absolute top-40 right-20 text-4xl animate-pulse">🚀</div>
        <div className="absolute bottom-20 left-20 text-5xl floating-coins">💎</div>
        <div className="absolute bottom-40 right-10 text-3xl animate-bounce" style={{animationDelay: '1s'}}>⭐</div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl">🎓</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">SuperLearn</h1>
                <p className="text-white/90 text-sm font-medium">Your Crypto Adventure Starts Here! 🌈</p>
              </div>
            </div>
            
            {primaryWallet?.address && (
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/30">
                  <p className="text-white/80 text-xs">🎒 Wallet Ready!</p>
                  <p className="font-mono text-xs text-white">{primaryWallet.address.slice(0, 8)}...{primaryWallet.address.slice(-4)}</p>
                </div>
                <button
                  onClick={resetDemo}
                  className="bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 text-white text-sm font-medium transition-all duration-200 backdrop-blur-md border border-white/30"
                >
                  🔄 Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Adventure Map */}
      <div className="relative z-10 px-4 mb-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-4 border-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-purple-800 mb-2">🗺️ Your Crypto Adventure Map</h2>
              <p className="text-lg text-purple-600">Follow the path to become a Crypto Explorer!</p>
            </div>
            
            {/* Adventure Path */}
            <div className="relative">
              {/* Connecting Path */}
              <div className="absolute top-1/2 left-0 right-0 h-2 bg-gradient-to-r from-yellow-300 via-green-400 to-blue-500 rounded-full transform -translate-y-1/2 z-0"></div>
              
              {/* Adventure Steps */}
              <div className="relative z-10 flex justify-between items-center">
                {progressSteps.map((step, index) => {
                  const isCompleted = index < getCurrentStepIndex()
                  const isCurrent = index === getCurrentStepIndex()
                  const isLocked = index > getCurrentStepIndex()
                  
                  return (
                    <div key={step.key} className="flex flex-col items-center group">
                      {/* Step Island */}
                      <div className={`
                        relative w-20 h-20 rounded-full flex items-center justify-center border-4 mb-3 transition-all duration-500 transform
                        ${isCompleted ? 'bg-green-400 border-green-500 shadow-lg scale-110' : ''}
                        ${isCurrent ? 'bg-yellow-400 border-yellow-500 shadow-xl animate-pulse scale-125' : ''}
                        ${isLocked ? 'bg-gray-300 border-gray-400 opacity-60' : ''}
                        ${!isLocked ? 'hover:scale-110 cursor-pointer' : ''}
                      `}>
                        {/* Step Number Badge */}
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {index + 1}
                        </div>
                        
                        {/* Step Icon */}
                        <span className="text-2xl">
                          {isCompleted ? '🎉' : step.icon}
                        </span>
                        
                        {/* Current Step Indicator */}
                        {isCurrent && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                          </div>
                        )}
                      </div>
                      
                      {/* Step Info */}
                      <div className="text-center">
                        <h4 className={`font-bold text-sm mb-1 ${
                          isCompleted ? 'text-green-700' : 
                          isCurrent ? 'text-yellow-700' : 
                          'text-gray-600'
                        }`}>
                          {step.title}
                        </h4>
                        
                        {/* Step Status */}
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          isCompleted ? 'bg-green-100 text-green-700' :
                          isCurrent ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {isCompleted ? '✅ Done!' : isCurrent ? '🔥 Active' : '🔒 Locked'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Current Mission Box */}
            <div className="mt-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-6 border-2 border-purple-300">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">🎯</span>
                <h3 className="text-xl font-bold text-purple-800">Current Mission</h3>
              </div>
              <p className="text-purple-700 text-lg font-medium">
                {currentStage === 'intro' && "🚀 Welcome, Explorer! Let's create your magical crypto wallet!"}
                {currentStage === 'wallet' && "🎒 Time to build your digital treasure chest!"}
                {currentStage === 'transaction' && "💫 Send your first magical crypto coins!"}
                {currentStage === 'verification' && "🏆 Claim your Explorer Badge - you earned it!"}
                {currentStage === 'complete' && "🎊 Mission Complete! You're now a certified Crypto Explorer!"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-6 mb-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4 text-center">
              <p className="text-red-200">{error}</p>
              <button 
                onClick={() => setError('')}
                className="mt-2 text-xs text-red-300 hover:text-red-100"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Learning Station */}
          {(currentStage === 'intro' || !primaryWallet?.address) && (
            <div className="relative z-10 max-w-6xl mx-auto">
              {/* Welcome Hero */}
              <div className="text-center mb-12">
                <div className="inline-block relative">
                  <div className="text-8xl mb-4 animate-bounce">🎮</div>
                  <div className="absolute -top-2 -right-2 text-3xl animate-spin">✨</div>
                </div>
                <h2 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
                  Welcome to Crypto Land! 🌈
                </h2>
                <p className="text-2xl text-white/90 max-w-4xl mx-auto mb-8 font-medium">
                  Ready for an amazing adventure? Learn about digital money by actually using it! 
                  It's like a video game, but everything you learn is real! 🎯
                </p>
              </div>

              {/* Main Learning Interface */}
              <div className="grid lg:grid-cols-2 gap-8 items-start">
                {/* Wallet Creation Station */}
                <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-4 border-purple-200">
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">🎒</div>
                    <h3 className="text-2xl font-bold text-purple-800 mb-2">Step 1: Get Your Magic Wallet!</h3>
                    <p className="text-purple-600 text-lg">Every explorer needs a special bag to carry their treasures!</p>
                  </div>
                  
                  <WalletConnection 
                    onWalletConnected={handleWalletConnected}
                    onConnectionError={handleConnectionError}
                  />
                </div>

                {/* Learning Guide */}
                <div className="space-y-6">
                  {/* Adventure Preview */}
                  <div className="bg-gradient-to-br from-yellow-200 to-orange-200 rounded-3xl p-6 shadow-xl border-3 border-yellow-300">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-3xl">🎯</span>
                      <h3 className="text-xl font-bold text-orange-800">Your Amazing Journey</h3>
                    </div>
                    <div className="space-y-3">
                      {[
                        { icon: '🎒', text: 'Create your magic wallet (super easy!)' },
                        { icon: '💫', text: 'Send sparkly digital coins to friends' },
                        { icon: '🏆', text: 'Earn a special certificate NFT' },
                        { icon: '🎉', text: 'Become a certified Crypto Explorer!' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 text-orange-700">
                          <span className="text-xl">{item.icon}</span>
                          <span className="font-medium">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Safety First */}
                  <div className="bg-gradient-to-br from-green-200 to-teal-200 rounded-3xl p-6 shadow-xl border-3 border-green-300">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-3xl">🛡️</span>
                      <h3 className="text-xl font-bold text-green-800">100% Safe & Fun</h3>
                    </div>
                    <div className="space-y-2 text-green-700">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">🌟</span>
                        <span>We use "practice money" - not real money!</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">🤖</span>
                        <span>AI helper guides you step by step</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">🔒</span>
                        <span>Super secure and parent-approved</span>
                      </div>
                    </div>
                  </div>

                  {/* Fun Facts */}
                  <div className="bg-gradient-to-br from-blue-200 to-purple-200 rounded-3xl p-6 shadow-xl border-3 border-blue-300">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-3xl">🧠</span>
                      <h3 className="text-xl font-bold text-blue-800">Cool Crypto Facts!</h3>
                    </div>
                    <div className="space-y-2 text-blue-700 text-sm">
                      <p>💡 Digital money is like email, but for sending value!</p>
                      <p>🌍 People all over the world use crypto every day</p>
                      <p>🔮 Learning crypto now prepares you for the future!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Mentor Chat */}
          {primaryWallet?.address && currentStage !== 'verification' && currentStage !== 'complete' && (
            <div className="mb-8">
              <AIMentor
                userAddress={primaryWallet.address}
                userName={userName}
                currentStage={currentStage}
                onStageChange={handleStageChange}
                onTransactionRequest={(data) => {
                  // Handle transaction request from AI
                  setCurrentStage('transaction')
                }}
              />
            </div>
          )}

          {/* Transaction Interface */}
          {currentStage === 'transaction' && primaryWallet?.address && (
            <div className="mb-8">
              <FlowTransaction
                userAddress={primaryWallet.address}
                onTransactionComplete={handleTransactionComplete}
                onTransactionError={handleTransactionError}
              />
            </div>
          )}

          {/* Skill Verification */}
          {currentStage === 'verification' && transactionId && (
            <div className="mb-8">
              <SkillVerification
                userAddress={primaryWallet.address || ''}
                userId={userId}
                transactionId={transactionId}
                onVerificationComplete={handleVerificationComplete}
              />
            </div>
          )}

          {/* Completion Celebration */}
          {currentStage === 'complete' && (
            <div className="text-center space-y-8">
              <div className="crypto-card max-w-2xl mx-auto celebration">
                <div className="text-8xl mb-6">🎊</div>
                <h2 className="text-3xl font-bold mb-4">Mission Complete!</h2>
                <p className="text-lg text-white/90 mb-6">
                  You've successfully completed your crypto learning journey and earned 
                  your first blockchain-verified certificate!
                </p>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-crypto-green/20 border border-crypto-green/40 rounded-lg p-4">
                    <div className="text-2xl mb-2">👛</div>
                    <h4 className="font-semibold">Wallet Created</h4>
                    <p className="text-sm text-white/70">Secure digital wallet without seed phrases</p>
                  </div>
                  <div className="bg-crypto-blue/20 border border-crypto-blue/40 rounded-lg p-4">
                    <div className="text-2xl mb-2">💸</div>
                    <h4 className="font-semibold">Transaction Sent</h4>
                    <p className="text-sm text-white/70">Real blockchain transaction completed</p>
                  </div>
                  <div className="bg-crypto-purple/20 border border-crypto-purple/40 rounded-lg p-4">
                    <div className="text-2xl mb-2">🏆</div>
                    <h4 className="font-semibold">Certificate Earned</h4>
                    <p className="text-sm text-white/70">NFT proof of your new skills</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-flow-blue/10 border border-flow-blue/30 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">🚀 What's Next?</h4>
                    <p className="text-sm text-white/80">
                      Continue your crypto education with advanced topics like DeFi, 
                      NFTs, and smart contracts. Each skill you learn gets verified 
                      on-chain and added to your digital portfolio!
                    </p>
                  </div>

                  <button 
                    onClick={resetDemo}
                    className="crypto-button"
                  >
                    Try Demo Again
                  </button>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="crypto-card text-center">
                  <div className="text-2xl font-bold text-crypto-green">100%</div>
                  <div className="text-sm text-white/70">Success Rate</div>
                </div>
                <div className="crypto-card text-center">
                  <div className="text-2xl font-bold text-crypto-blue">~2min</div>
                  <div className="text-sm text-white/70">Completion Time</div>
                </div>
                <div className="crypto-card text-center">
                  <div className="text-2xl font-bold text-crypto-purple">3</div>
                  <div className="text-sm text-white/70">Technologies Used</div>
                </div>
                <div className="crypto-card text-center">
                  <div className="text-2xl font-bold text-flow-blue">1</div>
                  <div className="text-sm text-white/70">NFT Certificate</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Adventure Character */}
      <AdventureCharacter
        mood={characterMood}
        message={characterMessage}
        onMessageClick={() => setCharacterMessage('')}
      />

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/20 py-6 px-6 mt-12 bg-black/10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto text-center text-sm text-white/80">
          <p className="mb-2 font-medium">
            🎮 Built with Dynamic (wallet), Fetch.ai uAgents (AI), and Flow Actions (verification)
          </p>
          <p>
            SuperLearn Demo - Making crypto education fun for everyone! 🌟
          </p>
        </div>
      </footer>
    </div>
  )
}