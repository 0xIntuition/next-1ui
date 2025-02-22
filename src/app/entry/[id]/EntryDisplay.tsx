'use client'

import Link from 'next/link'
import { Button, Text, Card } from '@0xintuition/1ui'
import type { Entry } from '@/types'
import { EntryCard } from '@/components/EntryCard'

interface EntryDisplayProps {
  entry: Entry
}

export default function EntryDisplay({ entry }: EntryDisplayProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <Text variant="heading1">Intuition Market Template</Text>
          <Text variant="body" className="text-gray-600">
            The market platform app template, powered by Intuition Systems
          </Text>
        </div>
      </header>

      <div className="mb-8">
        <Link href="/">
          <Button variant="secondary">← Back to Home</Button>
        </Link>
      </div>

      <div className="space-y-8">
        {/* Main Entry Card */}
        <EntryCard entry={entry} />

        {/* Subentries Section */}
        {entry.subEntries && entry.subEntries.length > 0 && (
          <div className="space-y-4">
            <Text variant="heading2">Sub-Entries ({entry.numSubEntries})</Text>
            <div className="space-y-4">
              {entry.subEntries.map((subEntry) => (
                <Card key={subEntry.id} className="p-4">
                  <EntryCard entry={subEntry} />
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
