'use client'

import Link from 'next/link'
import { Button, Text, Badge } from '@0xintuition/1ui'
import type { Entry } from '@/types'

interface EntryDisplayProps {
  entry: Entry
}

export default function EntryDisplay({ entry }: EntryDisplayProps) {
  return (
    <main className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/">
          <Button variant="secondary">← Back to Home</Button>
        </Link>
      </div>

      <article className="space-y-6">
        <div className="flex items-center justify-between">
          <Text variant="heading1">{entry.name}</Text>
          <div className="flex gap-2">
            <Badge variant="info">{entry.totalShares} Shares</Badge>
            <Badge variant="success">{entry.totalAssets} Assets</Badge>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {entry.description && <Text variant="body">{entry.description}</Text>}
          {entry.image && <img src={entry.image} alt={entry.name} className="max-w-full h-auto rounded-lg" />}
          {entry.url && (
            <div>
              <Link href={entry.url} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary">Visit External Link</Button>
              </Link>
            </div>
          )}
        </div>
      </article>
    </main>
  )
}
