import { useState, useEffect } from 'react'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'

interface WalletConnectionProps {
  onWalletConnected: (address: string) => void
  onConnectionError: (error: string) => void
}

export default function WalletConnection({ onWalletConnected, onConnectionError }: WalletConnectionProps) {
  const { setShowAuthFlow, primaryWallet, user, isAuthenticated } = useDynamicContext()
  const [isConnecting, setIsConnecting] = useState(false)
  const [configError, setConfigError] = useState('')

  // Check if Dynamic is properly configured
  useEffect(() => {
    const envId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID
    if (!envId || envId === 'demo_env_id' || envId === 'your_dynamic_environment_id_here') {
      setConfigError('Dynamic wallet service not configured. Please set up your Dynamic environment ID.')
    } else {
      setConfigError('')
    }
  }, [])

  useEffect(() => {
    if (primaryWallet?.address) {
      onWalletConnected(primaryWallet.address)
    }
  }, [primaryWallet?.address, onWalletConnected])

  const handleConnect = async () => {
    if (configError) {
      onConnectionError(configError)
      return
    }

    try {
      setIsConnecting(true)
      setShowAuthFlow(true)
    } catch (error) {
      console.error('Wallet connection error:', error)
      onConnectionError('Failed to connect wallet. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      if (primaryWallet) {
        await primaryWallet.disconnect()
      }
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  }

  if (primaryWallet?.address) {
    return (
      <div className="crypto-card max-w-md mx-auto text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-crypto-green rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👛</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Wallet Connected!</h3>
          <p className="text-sm opacity-80 mb-2">
            {user?.email && `Signed in as: ${user.email}`}
          </p>
          <p className="text-xs font-mono bg-black/20 rounded p-2 break-all">
            {primaryWallet.address}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-2 text-sm">
            <span className="w-2 h-2 bg-crypto-green rounded-full animate-pulse"></span>
            <span>Ready for crypto learning!</span>
          </div>
          
          <button
            onClick={handleDisconnect}
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Disconnect Wallet
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4 floating-coins shadow-xl">
            <span className="text-4xl">🎒</span>
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
            <span className="text-sm">✨</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-purple-800 mb-2">Build Your Magic Wallet!</h3>
        <p className="text-purple-600 mb-4">
          Just like getting a backpack for school - but this one holds digital treasures! 🌟
        </p>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 mb-6 border-2 border-purple-200">
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-purple-700">
            <span className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center text-white font-bold">✓</span>
            <span className="font-medium">Super safe & secure</span>
          </div>
          <div className="flex items-center space-x-3 text-purple-700">
            <span className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center text-white font-bold">✓</span>
            <span className="font-medium">No passwords to forget</span>
          </div>
          <div className="flex items-center space-x-3 text-purple-700">
            <span className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center text-white font-bold">✓</span>
            <span className="font-medium">Ready in under 1 minute!</span>
          </div>
        </div>
      </div>

      {configError ? (
        <div className="space-y-4">
          <div className="bg-yellow-100 border-2 border-yellow-300 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-2">🔧</div>
            <p className="text-sm text-yellow-800 font-bold mb-2">Oops! Need a quick setup!</p>
            <p className="text-xs text-yellow-700">{configError}</p>
          </div>
          
          <div className="bg-blue-100 border-2 border-blue-300 rounded-2xl p-4">
            <h4 className="font-bold text-sm mb-3 text-blue-800 flex items-center">
              <span className="mr-2">🛠️</span>
              Super Quick Setup (2 minutes):
            </h4>
            <ol className="text-xs space-y-2 text-blue-700">
              <li className="flex items-start space-x-2">
                <span className="font-bold">1.</span>
                <span>Visit <a href="https://app.dynamic.xyz" target="_blank" className="underline font-medium hover:text-blue-900">app.dynamic.xyz</a></span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold">2.</span>
                <span>Make a free account (super quick!)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold">3.</span>
                <span>Copy your special Environment ID</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold">4.</span>
                <span>Update the .env.local file</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold">5.</span>
                <span>Restart and you're ready! 🎉</span>
              </li>
            </ol>
          </div>
          
          <div className="bg-gray-100 border-2 border-gray-300 rounded-2xl p-4 text-center">
            <div className="text-3xl mb-2">🚧</div>
            <button
              disabled={true}
              className="w-full bg-gray-300 text-gray-500 font-bold py-3 px-6 rounded-2xl cursor-not-allowed"
            >
              🎒 Setup Needed First
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 active:scale-95"
          >
            {isConnecting ? (
              <span className="flex items-center justify-center space-x-3">
                <span className="animate-spin text-2xl">⚡</span>
                <span className="text-lg">Building your wallet...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-3">
                <span className="text-2xl">🎒</span>
                <span className="text-lg">Create My Magic Wallet!</span>
              </span>
            )}
          </button>
          
          <p className="text-xs text-purple-600 mt-3 font-medium">
            ✨ Powered by Dynamic - Super safe & kid-friendly!
          </p>
        </div>
      )}
    </div>
  )
}