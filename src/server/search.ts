import { createServerClient } from '@0xintuition/graphql'
import { getTypeTagAtomIds } from '@/server/appTags'

const client = createServerClient({})

const searchEntriesQuery = `
  query SearchEntries($searchStr: String!, $typePredicateId: numeric!, $entryOrSubEntryTypeId: numeric!) {
    atoms(
      where: {
        _or: [
          { data: { _ilike: $searchStr } },
          { label: { _ilike: $searchStr } },
          { value: { thing: { name: { _ilike: $searchStr } } } },
          { value: { thing: { description: { _ilike: $searchStr } } } }
        ],
        as_subject_triples: {
          predicate_id: { _eq: $typePredicateId },
          object_id: { _in: [$entryOrSubEntryTypeId] }
        }
      },
      limit: 5,
      order_by: { vault: { total_shares: desc } }
    ) {
      id
      data
      label
      type
      value {
        thing {
          name
          description
          image
          url
        }
      }
      as_subject_triples(where: { predicate_id: { _eq: $typePredicateId } }) {
        object_id
      }
      block_timestamp
      vault {
        total_shares
      }
    }
  }
`

interface AtomResult {
  id: number
  data: string
  label: string
  type: string
  value: {
    thing: {
      name: string
      description: string
      image: string
      url: string
    }
  }
  as_subject_triples: Array<{
    object_id: number
  }>
  block_timestamp: string
  vault: {
    total_shares: string
  }
}

interface SearchResponse {
  atoms: AtomResult[]
}

export interface SearchResult {
  id: string
  name: string
  description: string
  image: string
  url: string
  vault: {
    total_shares: string
  }
}

export async function searchEntries(searchStr: string): Promise<SearchResult[]> {
  const formattedStr = `%${searchStr}%`
  const { predicateId: typePredicateId, entryId: entryTypeId, /*subEntryTypeId: answerTypeId*/ } = await getTypeTagAtomIds()

  const result = await client.request<SearchResponse>(searchEntriesQuery, {
    searchStr: formattedStr,
    typePredicateId: typePredicateId.toString(),
    entryOrSubEntryTypeId: entryTypeId.toString()
  })

  // TODO: use total_shares elsewhere, since it seems to work.
  // for (const atom of result.atoms) {
  //   console.log("search atom: ", atom)
  // }

  return result.atoms.map((atom) => ({
    id: atom.id.toString(),
    name: atom.value.thing.name,
    description: atom.value.thing.description || atom.data || '',
    image: atom.value.thing.image,
    url: atom.value.thing.url,
    vault: atom.vault
  }))
} 
