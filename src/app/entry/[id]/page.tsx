import { getEntryById } from '@/server/entries'
import { getNumSubEntriesForEntry, getSubEntriesForEntry } from '@/server/subEntries'
import { notFound } from 'next/navigation'
import EntryDisplay from '@/app/entry/[id]/EntryDisplay'

interface EntryPageProps {
  params: {
    id: string
  }
}

export default async function EntryPage({ params }: EntryPageProps) {
  const entry = await getEntryById(params.id)

  if (!entry) {
    notFound()
  }

  // Get subentries count and data
  const numSubEntries = await getNumSubEntriesForEntry(params.id)
  const subEntries = await getSubEntriesForEntry(BigInt(params.id), 10, 0)

  return <EntryDisplay entry={{ ...entry, numSubEntries, subEntries }} />
}
