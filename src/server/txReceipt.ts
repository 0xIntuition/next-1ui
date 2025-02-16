import { type TransactionReceipt, parseEventLogs } from 'viem'

const atomCreatedAbi = [{
  type: 'event',
  name: 'AtomCreated',
  inputs: [
    { type: 'address', name: 'creator', indexed: true },
    { type: 'address', name: 'atomWallet', indexed: true },
    { type: 'bytes', name: 'atomData' },
    { type: 'uint256', name: 'vaultID' }
  ]
}] as const

// Gets the atom ID that was created by a user given the TX Receipt
export function extractAtomIdFromReceipt(receipt: TransactionReceipt): bigint {
  const events = parseEventLogs({
    logs: receipt.logs,
    abi: atomCreatedAbi,
    eventName: 'AtomCreated'
  })

  if (events.length === 0) {
    throw new Error('No AtomCreated events found in receipt')
  }

  const vaultID = (events[0].args as { vaultID: bigint }).vaultID

  if (typeof vaultID !== 'bigint') {
    throw new Error('Invalid vaultID type in event arguments')
  }

  return vaultID
} 