'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { Badge, Text, Card, PieChart, Button, Separator } from '@0xintuition/1ui'
import { Entry } from '@/types'
import { formatValue } from '@/lib/formatValue'

type EntryStats = {
  userState: {
    shares: string
    assets: string
  }
  vaultTotals: {
    totalShares: string
    totalAssets: string
  }
  sharePrice: string
}

interface EntryCardProps {
  entry: Entry & { stats?: EntryStats }
}

export function EntryCard({ entry }: EntryCardProps) {
  const [imageError, setImageError] = useState(false)
  const [stats, setStats] = useState<EntryStats | undefined>(entry.stats)
  const { primaryWallet } = useDynamicContext()

  useEffect(() => {
    async function fetchStats() {
      if (!primaryWallet?.address) return

      try {
        const response = await fetch(`/api/atom-stats?atomId=${entry.id}&userAddress=${primaryWallet.address}`)
        if (!response.ok) throw new Error('Failed to fetch atom stats')
        const data = await response.json()
        console.log('Fetched atom stats:', data)
        setStats(data)
      } catch (err) {
        console.error('Error fetching atom stats:', err)
      }
    }

    fetchStats()
  }, [entry.id, primaryWallet?.address])

  const handleImageError = () => {
    setImageError(true)
  }

  // Calculate ownership percentage
  const ownershipPercentage = stats?.userState
    ? (Number(stats.userState.shares) / Number(stats.vaultTotals.totalShares)) * 100
    : 0

  return (
    <div
      className="w-full rounded-xl p-2 border border-white/20"
      style={{
        background: `linear-gradient(to top, transparent 0%, rgba(251, 255, 0, 0.07) 100%, transparent 5%),
          linear-gradient(to right, transparent 0%, rgba(70, 70, 70, 0.05) 100%, transparent 5%),
          linear-gradient(to bottom, transparent 0%, rgba(77, 77, 77, 0.05) 100%, transparent 5%),
          linear-gradient(to left, transparent 0%, rgba(144, 155, 207, 0.12) 100%, transparent 5%)`,
      }}
    >
      {/* Main grid container with 3:1:1 ratio */}
      <div className="grid w-full" style={{ gridTemplateColumns: '3fr 1fr', gap: '2rem' }}>
        {/* Left column - Atom Info Section */}
        <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/20" style={{ background: '#000000' }}>
          {!imageError && entry.image && (
            <div className="w-16 aspect-square border border-white/20 rounded-lg overflow-hidden">
              <Image
                src={entry.image}
                alt={entry.name}
                width={64}
                height={64}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                onError={handleImageError}
              />
            </div>
          )}
          <h1>{entry.name}</h1>
          {entry.description && <p>{entry.description}</p>}
          {entry.url && (
            <div className="mt-auto pt-2" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="md"
                className="w-fit"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  window.open(
                    entry.url.startsWith('http') ? entry.url : `https://${entry.url}`,
                    '_blank',
                    'noopener,noreferrer'
                  )
                }}
              >
                {entry.url} ↗
              </Button>
            </div>
          )}
        </div>

        {/* Middle column - Combined Economics */}
        <Card className="p-4 relative" style={{ background: '#000000' }}>
          <Text variant="h3" className="mb-2">
            Vault Overview
          </Text>
          <Separator
            orientation="vertical"
            decorative
            className="absolute inset-y-0"
            style={{
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'white',
              opacity: '1',
              width: '1px',
              top: '0',
              bottom: '0',
            }}
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Text variant="caption">Total Assets</Text>
              <Text variant="body">
                {formatValue(BigInt(stats?.vaultTotals?.totalAssets || '0'), false, false)} ETH
              </Text>
              <Text variant="caption">Total Shares</Text>
              <Text variant="body">{formatValue(BigInt(stats?.vaultTotals?.totalShares || '0'), true, false)}</Text>
              <Text variant="caption">Share Price</Text>
              <Text variant="body">{formatValue(BigInt(stats?.sharePrice || '0'), false, false)} ETH</Text>
            </div>
            <div className="text-right">
              <Text variant="caption">Your Assets</Text>
              <Text variant="body">{formatValue(BigInt(stats?.userState?.assets || '0'), false, false)} ETH</Text>
              <Text variant="caption">Your Shares</Text>
              <Text variant="body">{formatValue(BigInt(stats?.userState?.shares || '0'), true, false)}</Text>
              <Text variant="caption">Your Ownership</Text>
              <Text variant="body">{ownershipPercentage.toFixed(2)}%</Text>
            </div>
          </div>

          <div className="flex justify-between items-center w-full mt-4">
            <div className="flex items-center gap-2">
              <Text variant="caption">Shares</Text>
              <PieChart variant="forVsAgainst" size="sm" percentage={ownershipPercentage} />
            </div>
            <div className="flex items-center gap-2">
              <PieChart variant="forVsAgainst" size="sm" percentage={ownershipPercentage} />
              <Text variant="caption">Assets</Text>
            </div>
          </div>

          <div className="flex justify-between gap-2 mt-4">
            <Button variant="primary" size="md">
              Deposit
            </Button>
            <Button variant="secondary" size="md">
              Redeem
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
