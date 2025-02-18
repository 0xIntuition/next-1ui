import type { SubEntry } from '@/types'
import { client } from '@/server/graphql'
import { getSubEntriesPredicateId } from './tagging.server'
import { getVaultTotals } from '../services/contracts.server'

export async function getNumAnswersForQuestion(questionId: string): Promise<number> {
  const predicateId = await getAnswersPredicateId()

  const query = `
    query GetAnswersCount($predicateId: numeric!, $questionId: numeric!) {
      triples_aggregate(
        where: {
          predicate_id: { _eq: $predicateId },
          object_id: { _eq: $questionId }
        }
      ) {
        aggregate {
          count
        }
      }
    }
  `

  try {
    const result = await client.request<{
      triples_aggregate: {
        aggregate: {
          count: number
        }
      }
    }>(query, {
      predicateId: predicateId.toString(),
      questionId: parseInt(questionId)
    })

    return result.triples_aggregate.aggregate.count
  } catch (error) {
    console.error('Failed to fetch answer count:', error)
    return 0
  }
}

type GetAnswersResponse = {
  triples: Array<{
    subject: {
      id: string
      value: {
        thing: {
          name: string
          description: string
        }
      }
      creator_id: string
      block_timestamp: string
      signals_aggregate: {
        aggregate: {
          sum: {
            delta: number
          }
        }
      }
    }
  }>
}

export async function getAnswersForQuestion(questionId: bigint, page: number = 1): Promise<Answer[]> {
  const predicateId = await getAnswersPredicateId()


  const query = `
    query GetAnswers($predicateId: numeric!, $questionId: numeric!, $limit: Int!, $offset: Int!) {
      triples(
        where: {
          predicate_id: { _eq: $predicateId },
          object_id: { _eq: $questionId }
        },
        limit: $limit,
        offset: $offset,
        order_by: [{ subject: { vault: { total_shares: desc } } }]
      ) {
        subject {
          id
          value {
            thing {
              name
              description
            }
          }
          creator_id
          block_timestamp
          vault {
            total_shares
          }
        }
      }
    }
  `

  try {
    const result = await client.request<GetAnswersResponse>(query, {
      predicateId: predicateId.toString(),
      questionId: questionId.toString(),
      limit: 10,
      offset: (page - 1) * 10
    })

    console.log("Got answer result", result)

    const answers = await Promise.all(result.triples.map(async triple => {
      const atom = triple.subject
      if (!atom.value?.thing) {
        console.log("Invalid atom", atom)
        return null
      }

      const totals = await getVaultTotals(BigInt(atom.id))
      const answer: Answer = {
        id: atom.id,
        content: atom.value.thing.name,
        explanation: atom.value.thing.description || undefined,
        totalShares: totals.totalShares.toString(),
        totalAssets: totals.totalAssets.toString(),
        createdAt: new Date(parseInt(atom.block_timestamp) * 1000).toISOString(),
        creator: atom.creator_id
      }

      return answer
    }))
    return answers.filter((answer): answer is Answer => answer !== null)
  } catch (error) {
    console.error('Failed to fetch answers:', error)
    return []
  }
}

// Note: think about optimizing this.  We should only ever get a question ID or answer ID once it's created in our app
// So we should be able to display it before our tag is confirmed and we are able to filter.
// Just to make the experience faster and more fluid.
export async function getAnswerById(id: string): Promise<Answer | null> {
  const query = `
    query GetAnswer($id: numeric!) {
      atom(id: $id) {
        id
        value {
          thing {
            name
            description
          }
        }
        creator_id
        block_timestamp
        vault {
          total_shares
        }
      }
    }
  `

  try {
    const result = await client.request<{
      atom: {
        id: string
        value: {
          thing: {
            name: string
            description: string
          }
        }
        creator_id: string
        block_timestamp: string
        vault: {
          total_shares: string
        }
      }
    }>(query, { id: parseInt(id) })

    if (!result.atom?.value?.thing) return null

    const totals = await getVaultTotals(BigInt(result.atom.id))

    return {
      id: result.atom.id,
      content: result.atom.value.thing.name,
      explanation: result.atom.value.thing.description || undefined,
      totalShares: totals.totalShares.toString(),
      totalAssets: totals.totalAssets.toString(),
      createdAt: new Date(parseInt(result.atom.block_timestamp) * 1000).toISOString(),
      creator: result.atom.creator_id
    }
  } catch (error) {
    console.error('Failed to fetch answer:', error)
    return null
  }
}