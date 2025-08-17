"use client"

import { useState } from "react"
import { usePrivy, useWallets, useLogin } from './providers'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Wallet, Copy, Eye, EyeOff, Coins, ArrowUpRight, ArrowDownLeft, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface WalletWidgetProps {
  onWalletConnected?: () => void
  showBalance?: boolean
  className?: string
}

export function WalletWidget({ onWalletConnected, showBalance = true, className }: WalletWidgetProps) {
  const { ready, authenticated, user } = usePrivy()
  const { wallets } = useWallets()
  const { login } = useLogin()
  const primaryWallet = wallets[0]
  const [showAddress, setShowAddress] = useState(false)
  const [copied, setCopied] = useState(false)

  // Mock balance for demo - in real app this would come from blockchain
  const mockBalance = "0.5"
  const mockTestTokens = "100"

  const copyAddress = async () => {
    if (primaryWallet?.address) {
      await navigator.clipboard.writeText(primaryWallet.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!ready) {
    return (
      <Card className={cn("border-border", className)}>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="font-heading text-xl">Loading...</CardTitle>
          <CardDescription>
            Preparing your wallet connection...
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!authenticated) {
    return (
      <Card className={cn("border-border", className)}>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="font-heading text-xl">Get Your Ethereum & Flow Wallet</CardTitle>
          <CardDescription>
            Create your safe multi-chain wallet to start learning with real blockchain transactions on Ethereum and Flow EVM!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={login} className="w-full">
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Multi-chain wallet • Ethereum & Sepolia • Secure email login
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Wallet className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="font-heading text-lg">My Multi-Chain Wallet</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                  Connected
                </Badge>
                <span className="text-xs">Ethereum & Flow EVM</span>
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Wallet Address */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-heading font-semibold text-sm">Wallet Address</h4>
            <Button variant="ghost" size="sm" onClick={() => setShowAddress(!showAddress)} className="h-6 px-2">
              {showAddress ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </Button>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <code className="text-xs flex-1 font-mono">
              {showAddress && primaryWallet?.address
                ? primaryWallet.address
                : primaryWallet?.address
                  ? formatAddress(primaryWallet.address)
                  : "Loading..."}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyAddress}
              className="h-6 w-6 p-0"
              disabled={!primaryWallet?.address}
            >
              {copied ? <CheckCircle className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This is your unique wallet address - like your crypto mailbox!
          </p>
        </div>

        {/* Balance Section */}
        {showBalance && (
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-sm">My Crypto Balance</h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">ETH (Testnet)</span>
                </div>
                <p className="text-lg font-bold text-blue-900">{mockBalance}</p>
                <p className="text-xs text-blue-600">Ethereum Mainnet</p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-700">ETH (Flow)</span>
                </div>
                <p className="text-lg font-bold text-emerald-900">{mockTestTokens}</p>
                <p className="text-xs text-emerald-600">Flow EVM Testnet</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-2">
          <h4 className="font-heading font-semibold text-sm">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="justify-start bg-transparent">
              <ArrowDownLeft className="w-4 h-4 mr-2" />
              Receive
            </Button>
            <Button variant="outline" size="sm" className="justify-start bg-transparent">
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Multi-chain support: Ethereum Mainnet & Flow EVM Testnet
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
