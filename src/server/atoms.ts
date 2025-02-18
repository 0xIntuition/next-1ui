import { stringToHex } from 'viem'
import { pinThing, queryAtomByName } from '../lib/graphql'
import { createAtom as createAtomContract, getAtomCost } from './contracts.server'
import type { PinThingInput } from '../lib/graphql'

export interface CreateAtomInput {
  name: string
  description?: string
  image?: string
  url?: string
}

export async function createAtom(input: CreateAtomInput): Promise<bigint> {
  // 1. Pin content to IPFS
  const metadata: PinThingInput = {
    name: input.name,
    description: input.description || '',
    image: input.image || '',
    url: input.url || ''
  }

  const pinResult = await pinThing(metadata)
  const uriBytes = stringToHex(pinResult.pinThing.uri)

  // 2. Get atom cost
  const atomCost = await getAtomCost()

  // 3. Create atom via contract
  return createAtomContract(uriBytes, atomCost)
}

export async function findOrCreateAtom(input: CreateAtomInput): Promise<bigint> {
  // 1. Try to find existing atom
  const existingId = await queryAtomByName(input.name)
  if (existingId) {
    return existingId
  }

  // 2. Create new atom if not found
  return createAtom(input)
}

export interface GetAtomInput {
  id: string
}

export interface Atom {
  id: string
  name: string
  description: string
  type: string
  content?: string
  image?: string
  url?: string
  createdAt: string
  creator: string
  stakeAmount: string
}