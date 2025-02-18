import { createTriple as createTripleContract, getTripleCost } from '../services/contracts.server'

export interface CreateTripleInput {
  subjectId: bigint
  predicateId: bigint
  objectId: bigint
}

export async function createTriple(input: CreateTripleInput): Promise<bigint> {
  // 1. Get triple cost
  const tripleCost = await getTripleCost()

  // 2. Create triple via contract
  return createTripleContract(
    input.subjectId,
    input.predicateId,
    input.objectId,
    tripleCost
  )
}

export interface GetTriplesInput {
  subjectId?: string
  predicateId?: string
  objectId?: string
  limit?: number
  offset?: number
}

export interface Triple {
  id: string
  subjectId: string
  predicateId: string
  objectId: string
  createdAt: string
  creator: string
  stakeAmount: string
}