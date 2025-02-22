import { NextResponse } from 'next/server'
import { getSubEntriesForEntry } from '@/server/subEntries'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const entryId = searchParams.get('entryId')
  const offset = parseInt(searchParams.get('offset') || '0')
  const limit = parseInt(searchParams.get('limit') || '10')

  if (!entryId) {
    return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 })
  }

  try {
    const subEntries = await getSubEntriesForEntry(BigInt(entryId), limit, offset)
    return NextResponse.json(subEntries, { status: 200 })
  } catch (error) {
    console.error('Failed to fetch subentries:', error)
    return NextResponse.json({ error: 'Failed to fetch subentries' }, { status: 500 })
  }
} 