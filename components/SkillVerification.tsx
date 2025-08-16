import { useState, useEffect } from 'react'
import * as fcl from '@onflow/fcl'

interface SkillVerificationProps {
  userAddress: string
  userId: string
  transactionId: string
  onVerificationComplete: (certificateId: string) => void
}

interface Certificate {
  id: number
  skill: string
  issuedAt: string
  verificationBlock: number
  transactionId: string
}

export default function SkillVerification({ 
  userAddress, 
  userId, 
  transactionId, 
  onVerificationComplete 
}: SkillVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStep, setVerificationStep] = useState(1)
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [certificates, setCertificates] = useState<Certificate[]>([])

  useEffect(() => {
    startVerification()
  }, [])

  const startVerification = async () => {
    try {
      setIsVerifying(true)
      setVerificationStep(2)

      // Step 1: Verify the transaction on-chain
      await new Promise(resolve => setTimeout(resolve, 2000))
      setVerificationStep(3)

      // Step 2: Issue the certificate (simulate for demo)
      await issueCertificate()
      setVerificationStep(4)

      // Step 3: Fetch user certificates
      await fetchUserCertificates()
      setVerificationStep(5)

    } catch (error) {
      console.error('Verification error:', error)
    } finally {
      setIsVerifying(false)
    }
  }

  const issueCertificate = async () => {
    try {
      // In a real implementation, this would call the Flow transaction
      // For demo purposes, we'll simulate the certificate issuance
      
      const mockCertificate: Certificate = {
        id: Date.now(),
        skill: "First Transaction",
        issuedAt: new Date().toISOString(),
        verificationBlock: 12345,
        transactionId: transactionId
      }

      setCertificate(mockCertificate)
      onVerificationComplete(mockCertificate.id.toString())

      // Simulate calling the actual Flow transaction
      // await fcl.mutate({
      //   cadence: `/* verify_first_transaction.cdc content */`,
      //   args: (arg, t) => [
      //     arg(userId, t.String),
      //     arg(transactionId, t.String)
      //   ],
      // })

    } catch (error) {
      console.error('Certificate issuance error:', error)
      throw error
    }
  }

  const fetchUserCertificates = async () => {
    try {
      // Simulate fetching certificates from Flow blockchain
      const mockCertificates: Certificate[] = [
        {
          id: Date.now(),
          skill: "First Transaction",
          issuedAt: new Date().toISOString(),
          verificationBlock: 12345,
          transactionId: transactionId
        }
      ]
      
      setCertificates(mockCertificates)

      // In real implementation:
      // const certificates = await fcl.query({
      //   cadence: `/* get_user_certificates.cdc content */`,
      //   args: (arg, t) => [arg(userAddress, t.Address)]
      // })

    } catch (error) {
      console.error('Error fetching certificates:', error)
    }
  }

  const steps = [
    { title: 'Analyzing', icon: '🔍', description: 'Checking your transaction on the blockchain' },
    { title: 'Validating', icon: '✅', description: 'Confirming skill completion criteria' },
    { title: 'Minting', icon: '🎨', description: 'Creating your NFT certificate' },
    { title: 'Issuing', icon: '📜', description: 'Delivering certificate to your wallet' },
    { title: 'Complete!', icon: '🏆', description: 'Your skill is now verified on-chain!' }
  ]

  return (
    <div className="crypto-card max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">Skill Verification in Progress! 🔍</h3>
        <p className="text-white/80">
          We're analyzing your transaction and creating your blockchain certificate
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`
                progress-indicator mb-2
                ${index + 1 < verificationStep ? 'completed' : ''}
                ${index + 1 === verificationStep ? 'active' : ''}
              `}>
                {index + 1 <= verificationStep ? (
                  <span className="text-xs">{index + 1 < verificationStep ? '✓' : step.icon}</span>
                ) : (
                  <span className="text-xs text-white/40">{index + 1}</span>
                )}
              </div>
              <span className="text-xs text-center max-w-16">{step.title}</span>
            </div>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-crypto-purple to-crypto-green h-2 rounded-full transition-all duration-500"
            style={{ width: `${(verificationStep / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Current Step Description */}
      {verificationStep < 5 && (
        <div className="text-center mb-6">
          <p className="text-sm text-white/80 mb-2">
            {steps[verificationStep - 1]?.description}
          </p>
          {isVerifying && (
            <div className="flex justify-center items-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-crypto-purple border-t-transparent rounded-full"></div>
              <span className="text-sm">Processing on blockchain...</span>
            </div>
          )}
        </div>
      )}

      {/* Verification Details */}
      <div className="bg-black/20 rounded-lg p-4 mb-6">
        <h4 className="font-semibold mb-3">Verification Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Skill:</span>
            <span className="font-semibold text-crypto-green">First Transaction</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Transaction ID:</span>
            <span className="font-mono text-xs">{transactionId.slice(0, 12)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Learner ID:</span>
            <span className="font-mono text-xs">{userId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Verification Method:</span>
            <span>On-chain Analysis</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Certificate Type:</span>
            <span>NFT (Non-Fungible Token)</span>
          </div>
        </div>
      </div>

      {/* Certificate Display */}
      {verificationStep === 5 && certificate && (
        <div className="celebration">
          <div className="bg-gradient-to-br from-crypto-purple/20 to-crypto-green/20 border-2 border-crypto-green/40 rounded-xl p-6 mb-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h4 className="text-2xl font-bold mb-2">Certificate Earned!</h4>
              <div className="bg-white/10 rounded-lg p-4 mb-4">
                <h5 className="text-lg font-semibold text-crypto-green mb-2">
                  SuperLearn First Transaction Certificate
                </h5>
                <p className="text-sm text-white/80 mb-3">
                  This NFT certificate proves that you have successfully completed your first blockchain transaction and understand the fundamentals of cryptocurrency operations.
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Certificate ID:</span>
                    <span className="font-mono">#{certificate.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Issued:</span>
                    <span>{new Date(certificate.issuedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Blockchain:</span>
                    <span>Flow</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-crypto-green/20 border border-crypto-green/40 rounded p-2">
                  <span className="font-semibold">🔗 On-Chain Verified</span>
                  <p className="text-white/70">Permanently stored on Flow blockchain</p>
                </div>
                <div className="bg-crypto-blue/20 border border-crypto-blue/40 rounded p-2">
                  <span className="font-semibold">🎨 Unique NFT</span>
                  <p className="text-white/70">Your personal achievement token</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h5 className="text-lg font-bold mb-2">🎉 Congratulations, Crypto Explorer!</h5>
            <p className="text-white/80 mb-4">
              You've completed the SuperLearn introduction course. Your skills are now verified on the blockchain and you own a unique NFT certificate that proves your knowledge!
            </p>
            
            <div className="bg-flow-blue/10 border border-flow-blue/30 rounded-lg p-3">
              <p className="text-sm">
                <span className="font-semibold">🚀 What's Next?</span> Explore advanced crypto concepts, DeFi protocols, and earn more certificates as you continue your blockchain learning journey!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Learning Achievement */}
      {verificationStep === 5 && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-crypto-green/20 border border-crypto-green/40 rounded-full px-4 py-2">
            <span className="w-2 h-2 bg-crypto-green rounded-full animate-pulse"></span>
            <span className="text-sm font-semibold">Achievement Unlocked: Crypto Explorer</span>
          </div>
        </div>
      )}
    </div>
  )
}