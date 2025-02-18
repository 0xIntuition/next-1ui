import { findOrCreateAtom } from "@/server/atoms";
import { createTriple } from "@/server/triples";

// Tag atom definitions
export const APP_TAG = {
  predicate: {
    name: "Is Used By",
    description: "Predicate for linking content to applications",
  },
  object: {
    name: "Info Market POC",
    description: "The Info Market POC application",
  },
};

export const TYPE_TAG = {
  predicate: {
    name: "Is Type",
    description: "Predicate for marking content type",
  },
  questionObject: {
    name: "Question",
    description: "A question in the Info Market",
  },
  answerObject: {
    name: "Answer",
    description: "An answer in the Info Market",
  },
};

export const ANSWER_TAG = {
  predicate: {
    name: "Answers",
    description: "Predicate for linking answers to questions",
  },
};

// Cache for tag atom IDs
let predicateId: bigint | null = null;
let objectId: bigint | null = null;
let typePredicateId: bigint | null = null;
let questionTypeId: bigint | null = null;
let answerTypeId: bigint | null = null;
let answersPredicateId: bigint | null = null;

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
 * Tags an atom as belonging to the Info Market POC app
 * This creates a triple: [Atom ID] "Is Used By" [Info Market POC]
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
  questionId: bigint;
  answerId: bigint;
}> {
  if (typePredicateId && questionTypeId && answerTypeId) {
    return {
      predicateId: typePredicateId,
      questionId: questionTypeId,
      answerId: answerTypeId,
    };
  }

  // Get or create predicate atom
  // Can optimize this easily, these values can be stored
  // After they are created.
  typePredicateId = await findOrCreateAtom(TYPE_TAG.predicate);
  questionTypeId = await findOrCreateAtom(TYPE_TAG.questionObject);
  answerTypeId = await findOrCreateAtom(TYPE_TAG.answerObject);

  return {
    predicateId: typePredicateId,
    questionId: questionTypeId,
    answerId: answerTypeId,
  };
}

/**
 * Gets the ID of the answers predicate atom, creating it if it doesn't exist
 */
export async function getAnswersPredicateId(): Promise<bigint> {
  if (answersPredicateId) {
    return answersPredicateId;
  }

  answersPredicateId = await findOrCreateAtom(ANSWER_TAG.predicate);
  return answersPredicateId;
}

/**
 * Tags an atom as being a question
 * This creates a triple: [Atom ID] "Is Type" [Question]
 */
export async function tagAtomAsQuestion(atomId: bigint): Promise<void> {
  const { predicateId, questionId } = await getTypeTagAtomIds();

  await createTriple({
    subjectId: atomId,
    predicateId,
    objectId: questionId,
  });
}

/**
 * Tags an answer atom as being an answer to a specific question
 * This creates two triples:
 * 1. [Answer ID] "Is Type" [Answer]
 * 2. [Answer ID] "Answers" [Question ID]
 */
export async function tagAtomAsAnswerToQuestion(
  answerId: bigint,
  questionId: bigint
): Promise<void> {
  // Tag as answer type
  const { predicateId, answerId: answerTypeId } = await getTypeTagAtomIds();
  await createTriple({
    subjectId: answerId,
    predicateId,
    objectId: answerTypeId,
  });

  // Link to question
  const answersPredicateId = await getAnswersPredicateId();
  await createTriple({
    subjectId: answerId,
    predicateId: answersPredicateId,
    objectId: questionId,
  });
}

