'use client'

import { useAtomsWithTagsQuery } from '@/lib/graphql'
import { Input } from '@0xintuition/1ui'
import { useCallback, useState } from 'react'
import TagFilter, { TAG_OPTIONS } from '@/components/TagFilter'
/**
 * The following query demonstrates querying atoms with multiple querying parameters that can be optionally combined to narrow down the results
 * 1. Querying atoms used within triples
 * 2. Querying atoms with a sub-query checking if a specific address has a position on the atom
 * 3. Querying atoms that have specific tags.
 *
 * Please reference `lib/graphql/queries/atoms.ts` for the full query.
 */

const SELECTED_ADDRESS = '0x6877daca5e6934982a5c511d85bf12a71a25ac1d'

export default function Home() {
  const [selectedTags, setSelectedTags] = useState<string[]>(['all'])
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleTagChange = useCallback((tags: string[]) => {
    setSelectedTags(tags)
  }, [])

  const {
    data: atomsData,
    error,
    isLoading,
  } = useAtomsWithTagsQuery(
    {
      where: {
        _and: [
          {
            as_subject_triples: {
              predicate_id: { _eq: '3' },
              object_id: { _eq: '16763' },
            },
          },
          searchQuery
            ? {
                _or: [
                  { label: { _ilike: `%${searchQuery}%` } },
                  { value: { thing: { name: { _ilike: `%${searchQuery}%` } } } },
                ],
              }
            : {},
          selectedTags.length > 0 && !selectedTags.includes('all')
            ? {
                as_subject_triples: {
                  object: {
                    vault_id: { _in: selectedTags },
                  },
                },
              }
            : {},
        ],
      },
      tagPredicateIds: ['3'], // dev - has tag predicate ID
      orderBy: [{ vault: { total_shares: 'desc' } }],
      verifiedPositionAddress: SELECTED_ADDRESS,
    },
    {
      queryKey: ['AtomsWithTags', SELECTED_ADDRESS, selectedTags, searchQuery],
    }
  )

  console.log('Query Parameters:', {
    selectedTags,
    searchQuery,
    address: SELECTED_ADDRESS,
    hasAllTag: selectedTags.includes('all'),
  })

  console.log(atomsData)

  if (error) {
    console.error('GraphQL Error:', error)
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Welcome to Intuition Next.js Template</h1>
      </div>
    )
  }

  const atomsCount = atomsData?.atoms?.length || 0

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to Intuition Next.js Template</h1>

      {/* Search and filter controls */}
      <div className="mb-6 space-y-4">
        <div>
          <Input
            id="search"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search atoms..."
            className="w-full border border-gray-300 rounded"
          />
        </div>
        <TagFilter selectedTags={selectedTags} onTagChange={handleTagChange} />
      </div>
      {isLoading ? (
        <div className="text-white">Loading data...</div>
      ) : (
        <div className="mb-4">
          <p className="text-lg">Found {atomsCount} atoms</p>
        </div>
      )}
      {atomsCount > 0 ? (
        <div className="text-white">
          <pre className="overflow-auto p-4 bg-gray-800 rounded">{JSON.stringify(atomsData, null, 2)}</pre>
        </div>
      ) : (
        <div className="text-yellow-500">
          No atoms found with the current filters. Try changing your search criteria.
        </div>
      )}
      {error ? (
        <div className="text-red-500 mt-4 p-3 bg-red-100 rounded">
          Error loading data: {error instanceof Error ? error.message : String(error)}
        </div>
      ) : null}
    </div>
  )
}
