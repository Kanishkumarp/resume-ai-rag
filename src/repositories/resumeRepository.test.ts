import test from 'node:test';
import assert from 'node:assert/strict';
import { ResumeRepository } from './resumeRepository';
import { mongoConnection } from './mongo';

test('searchAtlasBm25 applies experience filters inside the aggregation pipeline', async () => {
  const originalGetCollection = mongoConnection.getCollection;
  const pipelineSeen: Array<Record<string, unknown>> = [];

  (mongoConnection as typeof mongoConnection & { getCollection: typeof mongoConnection.getCollection }).getCollection = async () => ({
    aggregate: (pipeline: unknown[]) => ({
      toArray: async () => {
        pipelineSeen.push(...(pipeline as Array<Record<string, unknown>>));
        return [];
      },
    }),
  }) as never;

  try {
    const repository = new ResumeRepository();
    await repository.searchAtlasBm25('java', { minYearsExperience: 3 }, 5);

    const matchStage = pipelineSeen.find((stage) => '$match' in stage) as { $match?: Record<string, unknown> } | undefined;
    assert.ok(matchStage, 'Expected the aggregation pipeline to include a $match stage');
    assert.deepEqual(matchStage?.$match, {
      $expr: {
        $or: [
          { $gte: [{ $toDouble: '$total_Experience' }, 3] },
          { $gte: [{ $toDouble: '$relevant_Experience' }, 3] },
        ],
      },
    });
  } finally {
    (mongoConnection as typeof mongoConnection & { getCollection: typeof mongoConnection.getCollection }).getCollection = originalGetCollection;
  }
});
