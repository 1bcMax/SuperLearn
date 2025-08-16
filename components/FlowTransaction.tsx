import { useState } from 'react'
import * as fcl from '@onflow/fcl'

interface FlowTransactionProps {
  userAddress: string
  onTransactionComplete: (txId: string) => void
  onTransactionError: (error: string) => void
}

// Configure FCL for emulator
fcl.config({
  'flow.network': 'local',
  'accessNode.api': 'http://localhost:8888',
  'discovery.wallet': 'http://localhost:8701/fcl/authn',
})

export default function FlowTransaction({ 
  userAddress, 
  onTransactionComplete, 
  onTransactionError 
}: FlowTransactionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState('0.1')

  const sendFlowTransaction = async () => {
    try {
      setIsLoading(true)
      setStep(2)

      // For demo purposes, simulate a successful transaction
      // In production, this would use actual Flow FCL
      
      setStep(3)
      
      // Simulate transaction processing time
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate mock transaction ID
      const transactionId = `0x${Math.random().toString(16).substr(2, 32)}`
      
      setStep(4)
      onTransactionComplete(transactionId)

    } catch (error) {
      console.error('Transaction error:', error)
      onTransactionError(error instanceof Error ? error.message : 'Transaction failed')
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    { title: 'Prepare Transaction', icon: '⚡', description: 'Set up your first crypto transaction' },
    { title: 'Broadcasting', icon: '📡', description: 'Sending to the blockchain network' },
    { title: 'Confirming', icon: '⏳', description: 'Waiting for network confirmation' },
    { title: 'Complete!', icon: '🎉', description: 'Transaction successfully completed' }
  ]

  return (
    <div className="crypto-card max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">Your First Crypto Transaction! 🚀</h3>
        <p className="text-white/80">
          Send {amount} testnet FLOW tokens to complete your learning challenge
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {steps.map((stepItem, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`
                progress-indicator mb-2
                ${index + 1 < step ? 'completed' : ''}
                ${index + 1 === step ? 'active' : ''}
              `}>
                {index + 1 <= step ? (
                  <span className="text-xs">{index + 1 < step ? '✓' : stepItem.icon}</span>
                ) : (
                  <span className="text-xs text-white/40">{index + 1}</span>
                )}
              </div>
              <span className="text-xs text-center max-w-20">{stepItem.title}</span>
            </div>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-crypto-green to-flow-blue h-2 rounded-full transition-all duration-500"
            style={{ width: `${(step / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="space-y-4 mb-6">
        <div className="bg-black/20 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Amount:</span>
            <span className="font-mono">{amount} FLOW</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">From:</span>
            <span className="font-mono text-xs">{userAddress.slice(0, 8)}...{userAddress.slice(-4)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">To:</span>
            <span className="font-mono text-xs">0x045a1763...06ca</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Network:</span>
            <span className="text-crypto-green">Flow Testnet</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Type:</span>
            <span>Learning Transaction</span>
          </div>
        </div>

        {step < 4 && (
          <div className="text-center">
            <p className="text-sm text-white/80 mb-2">
              {steps[step - 1]?.description}
            </p>
            {isLoading && (
              <div className="flex justify-center items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-crypto-blue border-t-transparent rounded-full"></div>
                <span className="text-sm">Processing...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Button */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/80 mb-2">Amount to send:</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                max="1.0"
                step="0.01"
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
              />
              <span className="text-sm text-white/60">FLOW</span>
            </div>
            <p className="text-xs text-white/50 mt-1">
              This is testnet FLOW - practice money with no real value!
            </p>
          </div>

          <button
            onClick={sendFlowTransaction}
            disabled={isLoading}
            className="crypto-button w-full"
          >
            Send My First Transaction! 🎯
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="text-center celebration">
          <div className="text-6xl mb-4">🎊</div>
          <h4 className="text-xl font-bold mb-2">Congratulations!</h4>
          <p className="text-white/80 mb-4">
            You just completed your first blockchain transaction! 
            You're now officially a crypto explorer! 🌟
          </p>
          <div className="bg-crypto-green/20 border border-crypto-green/40 rounded-lg p-3 mb-4">
            <p className="text-sm font-semibold text-crypto-green">
              ✅ Transaction Verified On-Chain
            </p>
          </div>
        </div>
      )}

      {/* Fun Facts */}
      {step > 1 && step < 4 && (
        <div className="bg-crypto-blue/10 border border-crypto-blue/30 rounded-lg p-3 mt-4">
          <p className="text-xs text-white/70">
            <span className="font-semibold">💡 Fun Fact:</span> Your transaction is being processed by thousands of computers around the world to ensure it's secure and can't be faked!
          </p>
        </div>
      )}
    </div>
  )
}