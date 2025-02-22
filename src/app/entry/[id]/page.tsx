import { getEntryById } from '@/server/entries'
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

  return <EntryDisplay entry={entry} />
}
