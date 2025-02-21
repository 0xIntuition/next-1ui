import { createServerClient } from '@0xintuition/graphql'
import type { SearchResult } from '../types'
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
          object_id: { _in: [$entryOrSubEntryTypeId }
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
}

interface SearchResponse {
  atoms: AtomResult[]
}

export async function searchEntries(searchStr: string): Promise<SearchResult[]> {
  const formattedStr = `%${searchStr}%`
  const { predicateId: typePredicateId, entryTypeId: entryTypeId, /*subEntryTypeId: answerTypeId*/ } = await getTypeTagAtomIds()

  const result = await client.request<SearchResponse>(searchQuestionsQuery, {
    searchStr: formattedStr,
    typePredicateId: typePredicateId.toString(),
    questionOrAnswerTypeId: questionTypeId.toString()
  })

  // TODO: use total_shares elsewhere, since it seems to work.
  // for (const atom of result.atoms) {
  //   console.log("search atom: ", atom)
  // }

  return result.atoms.map((atom) => ({
    id: atom.id,
    title: atom.value.thing.name || atom.label || '',
    description: atom.value.thing.description || atom.data || '',
    type: atom.as_subject_triples[0]?.object_id === Number(questionTypeId) ? 'Question' : 'Answer',
    timestamp: atom.block_timestamp
  }))
} 
