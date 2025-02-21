import Link from 'next/link'
import { Button, Text, Badge } from '@0xintuition/1ui'

interface EntryPageProps {
  params: {
    id: string
  }
}

export default function EntryPage({ params }: EntryPageProps) {
  return (
    <main className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/">
          <Button variant="secondary">← Back to Home</Button>
        </Link>
      </div>

      <article className="space-y-6">
        <div className="flex items-center justify-between">
          <Text variant="heading1">Entry {params.id}</Text>
          <Badge variant="info">Draft</Badge>
        </div>

        <div className="mt-4 space-y-4">
          <Text variant="body">
            This is a placeholder for entry content. The actual content will be loaded based on the entry ID:{' '}
            {params.id}
          </Text>
        </div>

        <div className="flex gap-4 mt-6">
          <Link href={`/entry/${params.id}/edit`}>
            <Button variant="secondary">Edit Entry</Button>
          </Link>
          <Button variant="destructive">Delete Entry</Button>
        </div>
      </article>
    </main>
  )
}
