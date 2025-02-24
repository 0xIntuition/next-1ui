import { useState, useEffect } from 'react'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { isEthereumWallet } from '@dynamic-labs/ethereum'
import { encodeFunctionData, parseEther } from 'viem'
import { Button, Input, Text } from '@0xintuition/1ui'
import { formatValue } from '@/lib/formatValue'
import { MULTIVAULT_ABI } from '@/lib/contracts'
import { clientEnv } from '@/lib/env'

export type SwapType = 'deposit' | 'redeem'

interface SwapModalProps {
  type: SwapType
  atomId: string
  sharePrice: string
  userShares: string
  userEthBalance: string
  totalShares: string
  totalAssets: string
  onClose: () => void
  onSuccess: (txHash: `0x${string}`) => Promise<void>
}

const QUICK_AMOUNTS = ['0.01', '0.1', '1.0']

export function SwapModal({
  type,
  atomId,
  sharePrice,
  userShares,
  userEthBalance,
  totalShares,
  totalAssets,
  onClose,
  onSuccess,
}: SwapModalProps) {
  const { primaryWallet } = useDynamicContext()
  const [amount, setAmount] = useState('')
  const [estimatedOutput, setEstimatedOutput] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset values when type changes
  useEffect(() => {
    setAmount('')
    setEstimatedOutput(undefined)
    setError(null)
    updateEstimate('')
  }, [type])

  // Update estimate when amount changes
  useEffect(() => {
    if (!amount) {
      setEstimatedOutput(undefined)
      return
    }
    // Show loading state immediately
    setIsCalculating(true)
    setEstimatedOutput(undefined)
    // Start calculation right away
    updateEstimate(amount)
  }, [amount])

  async function updateEstimate(value: string) {
    if (!value || !primaryWallet || !isEthereumWallet(primaryWallet)) {
      setIsCalculating(false)
      setEstimatedOutput(undefined)
      return
    }

    try {
      const publicClient = await primaryWallet.getPublicClient()
      const assets = type === 'deposit' ? parseEther(value) : BigInt(0)
      const shares = type === 'redeem' ? BigInt(value) : BigInt(0)

      const estimate = await publicClient.readContract({
        address: clientEnv.MULTIVAULT_ADDRESS as `0x${string}`,
        abi: MULTIVAULT_ABI,
        functionName: type === 'deposit' ? 'previewDeposit' : 'previewRedeem',
        args: [type === 'deposit' ? assets : shares, BigInt(atomId)],
      })

      setEstimatedOutput(estimate.toString())
    } catch (err) {
      console.error('Error getting estimate:', err)
      setEstimatedOutput(undefined)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !primaryWallet || !isEthereumWallet(primaryWallet)) return

    setError(null)
    setIsSubmitting(true)

    try {
      const walletClient = await primaryWallet.getWalletClient()
      const publicClient = await primaryWallet.getPublicClient()

      // Prepare transaction data
      const fnData = encodeFunctionData({
        abi: MULTIVAULT_ABI,
        functionName: type === 'deposit' ? 'depositAtom' : 'redeemAtom',
        args:
          type === 'deposit'
            ? [walletClient.account.address, BigInt(atomId)]
            : [BigInt(amount), walletClient.account.address, BigInt(atomId)],
      })

      const txData = {
        to: clientEnv.MULTIVAULT_ADDRESS as `0x${string}`,
        data: fnData,
        value: type === 'deposit' ? parseEther(amount) : BigInt(0),
      }

      const hash = await walletClient.sendTransaction(txData)
      console.log('Transaction sent:', hash)

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('Transaction confirmed:', receipt)

      // Call onSuccess with the transaction hash
      await onSuccess(hash)
      onClose()
    } catch (err) {
      console.error('Swap failed:', err)
      setError(err instanceof Error ? err.message : 'Transaction failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const validateAmount = (value: string): boolean => {
    if (!value) return false
    const ethRegex = /^\d*\.?\d{0,18}$/
    if (!ethRegex.test(value)) return false
    const numValue = parseFloat(value)
    return !isNaN(numValue) && numValue > 0
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || validateAmount(value)) {
      setAmount(value)
      setError(null)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" style={{ background: '#000000' }}>
      <div className="flex justify-between items-center">
        <Text variant="h3">{type === 'deposit' ? 'Deposit ETH' : 'Redeem Shares'}</Text>
        <button type="button" onClick={onClose} className="text-white/50 hover:text-white">
          ✕
        </button>
      </div>

      {/* Input Section */}
      <div>
        <div className="flex justify-between mb-2">
          <Text variant="caption">Amount</Text>
          <Text variant="caption">
            Balance:{' '}
            {type === 'deposit' ? `${formatValue(BigInt(userEthBalance))} ETH` : formatValue(BigInt(userShares), true)}
          </Text>
        </div>

        {type === 'deposit' && (
          <div className="flex gap-2 mb-2">
            {QUICK_AMOUNTS.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => setAmount(quickAmount)}
                className="text-xs px-2 py-1 bg-gray-100/10 rounded hover:bg-gray-100/20"
              >
                {quickAmount}
              </button>
            ))}
          </div>
        )}

        {type === 'redeem' && (
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setAmount((BigInt(userShares) / BigInt(2)).toString())}
              className="text-xs px-2 py-1 bg-gray-100/10 rounded hover:bg-gray-100/20"
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => setAmount(userShares)}
              className="text-xs px-2 py-1 bg-gray-100/10 rounded hover:bg-gray-100/20"
            >
              100%
            </button>
          </div>
        )}

        <Input
          type="text"
          pattern="^\d*\.?\d{0,18}$"
          placeholder="0.0"
          value={amount}
          onChange={handleAmountChange}
          className="bg-gray-100/5 border-gray-100/20"
        />
        <div className="flex justify-center mt-1">
          <Text variant="caption">{type === 'deposit' ? 'ETH' : 'Shares'}</Text>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <Text variant="caption">↓</Text>
      </div>

      {/* Output Section */}
      <div>
        <Input
          type="text"
          readOnly
          value={
            isCalculating
              ? '...'
              : estimatedOutput
              ? type === 'deposit'
                ? formatValue(BigInt(estimatedOutput), true)
                : formatValue(BigInt(estimatedOutput))
              : '0.0'
          }
          className="bg-gray-100/5 border-gray-100/20"
        />
        <div className="flex justify-center mt-1">
          <Text variant="caption">{type === 'deposit' ? 'Shares' : 'ETH'}</Text>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-1 border-t border-white/20 pt-4">
        <div className="flex justify-between">
          <Text variant="caption">Current Share Price:</Text>
          <Text variant="caption">{formatValue(BigInt(sharePrice))} : 1</Text>
        </div>
        <div className="flex justify-between">
          <Text variant="caption">Assets In Pool:</Text>
          <Text variant="caption">{formatValue(BigInt(totalAssets))} ETH</Text>
        </div>
        <div className="flex justify-between">
          <Text variant="caption">Shares In Pool:</Text>
          <Text variant="caption">{formatValue(BigInt(totalShares), true)}</Text>
        </div>
      </div>

      {error && (
        <Text variant="caption" className="text-red-500 text-center">
          {error}
        </Text>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || isCalculating || !amount || !validateAmount(amount)}
        variant={type === 'deposit' ? 'primary' : 'secondary'}
      >
        {isSubmitting ? 'Processing...' : isCalculating ? 'Calculating...' : type === 'deposit' ? 'Deposit' : 'Redeem'}
      </Button>
    </form>
  )
}
