import { findOrCreateAtom } from "@/server/atoms";
import { createTriple } from "@/server/triples";

// Tag atom definitions
export const APP_TAG = {
  predicate: {
    name: "Is Used By",
    description: "Predicate for linking content to applications",
  },
  object: {
    name: "Intuition Market Template App",
    description: "A template application for developers to create their own market apps using Intuition Systems.",
    // Feel free to add fields for:
    // image, // url to the logo for your application
    // url, // url for your application
  },
};

export const TYPE_TAG = {
  predicate: {
    name: "Is Type",
    description: "Predicate for marking content type",
  },
  entryObject: {
    name: "Entry",
    description: "An Entry in the Intuition Market Template App",
  },
  subEntryObject: {
    name: "Sub-Entry",
    description: "A Sub-Entry in the Intuition Market Template App",
  },
};

export const SUBENTRY_TAG = {
  predicate: {
    name: "Is Sub-Entry Of",
    description: "Predicate for linking Sub-Entries to Entries",
  },
};

// Cache for tag atom IDs
let predicateId: bigint | null = null;
let objectId: bigint | null = null;
let typePredicateId: bigint | null = null;
let entryTypeId: bigint | null = null;
let subEntryTypeId: bigint | null = null;
let subEntryOfPredicateTypeId: bigint | null = null;

/**
 * Gets the IDs of the app tag atoms, creating them if they don't exist
 */
export async function getAppTagAtomIds(): Promise<{
  predicateId: bigint;
  objectId: bigint;
}> {
  if (predicateId && objectId) {
    return { predicateId, objectId };
  }

  // Get or create predicate atom
  predicateId = await findOrCreateAtom(APP_TAG.predicate);

  // Get or create object atom
  objectId = await findOrCreateAtom(APP_TAG.object);

  return { predicateId, objectId };
}

/**
 * Tags an atom as belonging to the Market Template app
 * This creates a triple: [Atom ID] "Is Used By" [This App]
 */
export async function tagAtomAsAppContent(atomId: bigint): Promise<void> {
  const { predicateId, objectId } = await getAppTagAtomIds();

  // Create the triple linking the atom to the app
  await createTriple({
    subjectId: atomId,
    predicateId,
    objectId,
  });
}

/**
 * Gets the IDs of the type tag atoms, creating them if they don't exist
 */
export async function getTypeTagAtomIds(): Promise<{
  predicateId: bigint;
  entryId: bigint;
  subEntryId: bigint;
}> {
  if (typePredicateId && entryTypeId && subEntryTypeId) {
    return {
      predicateId: typePredicateId,
      entryId: entryTypeId,
      subEntryId: subEntryTypeId,
    };
  }

  // Get or create predicate atom
  // Can optimize this easily, these values can be stored
  // After they are created.
  typePredicateId = await findOrCreateAtom(TYPE_TAG.predicate);
  entryTypeId = await findOrCreateAtom(TYPE_TAG.entryObject);
  subEntryTypeId = await findOrCreateAtom(TYPE_TAG.subEntryObject);

  return {
    predicateId: typePredicateId,
    entryId: entryTypeId,
    subEntryId: subEntryTypeId,
  };
}

/**
 * Gets the ID of the isSubEntryOfEntry predicate atom, creating it if it doesn't exist
 */
export async function getIsSubEntryOfPredicateId(): Promise<bigint> {
  if (subEntryOfPredicateTypeId) {
    return subEntryOfPredicateTypeId;
  }

  subEntryOfPredicateTypeId = await findOrCreateAtom(SUBENTRY_TAG.predicate);
  return subEntryOfPredicateTypeId
}

/**
 * Tags an atom as being an Entry
 * This creates a triple: [Atom ID] "Is Type" [Entry]
 */
export async function tagAtomAsEntry(atomId: bigint): Promise<void> {
  const { predicateId, entryId } = await getTypeTagAtomIds();

  await createTriple({
    subjectId: atomId,
    predicateId,
    objectId: entryId,
  });
}

/**
 * Tags an answer atom as being an answer to a specific question
 * This creates two triples:
 * 1. [Atom ID] "Is Type" [SubEntry]
 * 2. [Atom ID] "Is Sub-Entry Of" [Entry ID]
 * Thus, we know that the atom belongs to our app, and that it's associated with another atom.
*/
export async function tagAtomAsSubEntryToEntry(
  subEntryId: bigint,
  entryId: bigint
): Promise<void> {
  // Tag as sub-entry type
  const { predicateId, subEntryId: subEntryTypeId } = await getTypeTagAtomIds();
  await createTriple({
    subjectId: subEntryId,
    predicateId,
    objectId: subEntryTypeId,
  });

  // Link to entry
  const subEntryOfPredicateId = await getIsSubEntryOfPredicateId();
  await createTriple({
    subjectId: subEntryId,
    predicateId: subEntryOfPredicateId,
    objectId: entryId,
  });
}

