'use client'

import {
  Badge,
  Button,
  Text,
  PositionCard,
  PositionCardStaked,
  PositionCardOwnership,
  PositionCardFeesAccrued,
  PositionCardLastUpdated,
  PieChartVariant,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@0xintuition/1ui'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { AuthButton } from '@/components/AuthButton'
import { Entry } from '@/types'
import type { EntryListType } from '@/server/entries'
import debounce from 'lodash/debounce'

interface EntryFeedProps {
  initialEntries: Entry[]
}

export function EntryFeed({ initialEntries }: EntryFeedProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [entries, setEntries] = useState<Entry[]>(initialEntries)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Entry[]>([])

  const currentType = (searchParams?.get('type') as EntryListType) || 'RECENT'

  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([])
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (!response.ok) throw new Error('Search failed')
        const results = await response.json()
        setSearchResults(results)
      } catch (err) {
        console.error('Search error:', err)
        setError(err instanceof Error ? err.message : 'Search failed')
      } finally {
        setIsSearching(false)
      }
    }, 300),
    []
  )

  useEffect(() => {
    performSearch(searchQuery)
    return () => performSearch.cancel()
  }, [searchQuery, performSearch])

  const handleFilterChange = async (type: EntryListType) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('type', type)
    router.push(`/?${params.toString()}`)

    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/entries?type=${type}`)
      if (!response.ok) throw new Error('Failed to fetch entries')
      const data = await response.json()
      setEntries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch entries')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <Text variant="heading1">Intuition Market Template</Text>
          <Text variant="body" className="text-gray-600">
            The market platform app template, powered by Intuition Systems
          </Text>
        </div>
        <AuthButton />
      </header>

      {/* Authentication and Search Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Text variant="body"></Text>
            <Link href="/entry/new">
              <Button variant="primary">Create New Entry</Button>
            </Link>
          </div>

          <div className="h-px bg-gray-200 my-4" />

          <div>
            <Command className="rounded-lg border shadow-sm">
              <CommandInput placeholder="Search entries..." value={searchQuery} onValueChange={setSearchQuery} />
              <CommandList>
                {isSearching ? (
                  <CommandEmpty>Searching...</CommandEmpty>
                ) : searchQuery ? (
                  searchResults.length > 0 ? (
                    <CommandGroup heading="Search Results">
                      {searchResults.map((entry) => (
                        <CommandItem key={entry.id} onSelect={() => router.push(`/entry/${entry.id}`)}>
                          <div className="flex flex-col">
                            <Text variant="body">{entry.name}</Text>
                            {entry.description && entry.description !== entry.name && (
                              <Text variant="caption" className="text-gray-500">
                                {entry.description}
                              </Text>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ) : (
                    <CommandEmpty>No entries found.</CommandEmpty>
                  )
                ) : null}
              </CommandList>
            </Command>
          </div>
        </div>
      </div>

      {/* Entries Feed */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <Text variant="heading3">Markets</Text>
          <div className="flex gap-2">
            <Button
              variant={currentType === 'TRENDING' ? 'primary' : 'secondary'}
              onClick={() => handleFilterChange('TRENDING')}
            >
              Trending
            </Button>
            <Button
              variant={currentType === 'RECENT' ? 'primary' : 'secondary'}
              onClick={() => handleFilterChange('RECENT')}
            >
              Latest
            </Button>
            <Button variant={currentType === 'TOP' ? 'primary' : 'secondary'} onClick={() => handleFilterChange('TOP')}>
              Top
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-6">
            <Text variant="body">Loading...</Text>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-6">
            <Text variant="body" className="text-red-500">
              {error}
            </Text>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6">
            <Text variant="body">No entries yet. Be the first to create one!</Text>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Link key={entry.id} href={`/entry/${entry.id}`}>
                <PositionCard>
                  <div className="mb-4">
                    <Text variant="heading2">{entry.name}</Text>
                    {entry.description !== entry.name && (
                      <Text variant="body" className="mt-2">
                        {entry.description}
                      </Text>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <PositionCardStaked amount={parseFloat(entry.totalAssets)} />
                    <PositionCardOwnership
                      percentOwnership={parseFloat(entry.totalShares)}
                      variant={PieChartVariant.default}
                    />
                    <PositionCardFeesAccrued amount={0} />
                    <PositionCardLastUpdated timestamp={entry.createdAt} />
                  </div>
                  {entry.numSubEntries && entry.numSubEntries > 0 && (
                    <div className="mt-4">
                      <Badge variant="secondary">{entry.numSubEntries} sub-entries</Badge>
                    </div>
                  )}
                </PositionCard>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
