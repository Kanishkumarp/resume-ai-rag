import test from "node:test";
import assert from "node:assert/strict";
import { ResumeRepository } from "./resumeRepository";
import { mongoConnection } from "./mongo";
import { env } from "../config/environment";

test("searchAtlasBm25 applies experience filters inside the aggregation pipeline", async () => {
  const originalGetCollection = mongoConnection.getCollection;
  const pipelineSeen: Array<Record<string, unknown>> = [];

  (
    mongoConnection as typeof mongoConnection & {
      getCollection: typeof mongoConnection.getCollection;
    }
  ).getCollection = async () =>
    ({
      aggregate: (pipeline: unknown[]) => ({
        toArray: async () => {
          pipelineSeen.push(...(pipeline as Array<Record<string, unknown>>));
          return [];
        },
      }),
    }) as never;

  try {
    const repository = new ResumeRepository();
    await repository.searchAtlasBm25("java", { minYearsExperience: 3 }, 5);

    const matchStage = pipelineSeen.find((stage) => "$match" in stage) as
      { $match?: Record<string, unknown> } | undefined;
    assert.ok(
      matchStage,
      "Expected the aggregation pipeline to include a $match stage",
    );
    const matchText = JSON.stringify(matchStage?.$match);
    assert.ok(matchText.includes("$gte"));
    assert.ok(matchText.includes('"to":"double"'));
    assert.ok(matchText.includes('"3"') || matchText.includes(",3"));
  } finally {
    (
      mongoConnection as typeof mongoConnection & {
        getCollection: typeof mongoConnection.getCollection;
      }
    ).getCollection = originalGetCollection;
  }
});

test("getSearchDocuments applies all available metadata filters and excludes unknown experience", async () => {
  const originalGetCollection = mongoConnection.getCollection;
  const documents = [
    {
      _id: "candidate-1",
      text: "Built Node.js services for distributed systems",
      name: "Ada",
      role: "Backend Engineer",
      skills: ["Node.js", "MongoDB"],
      location: "Bengaluru",
      totalExperience: 6,
      education: { degree: "BSc Computer Science" },
    },
    {
      _id: "candidate-2",
      text: "Python developer",
      role: "Data Engineer",
      skills: ["Python"],
      location: "Pune",
    },
  ];
  (
    mongoConnection as typeof mongoConnection & {
      getCollection: typeof mongoConnection.getCollection;
    }
  ).getCollection = async () =>
    ({
      find: () => ({ toArray: async () => documents }),
    }) as never;

  try {
    const repository = new ResumeRepository();
    const matches = await repository.getSearchDocuments({
      skills: ["MongoDB"],
      minYearsExperience: 5,
      maxYearsExperience: 7,
      location: "Bengaluru",
      title: "Backend Engineer",
      education: "Computer Science",
    });

    assert.deepEqual(
      matches.map((document) => document._id),
      ["candidate-1"],
    );
  } finally {
    (
      mongoConnection as typeof mongoConnection & {
        getCollection: typeof mongoConnection.getCollection;
      }
    ).getCollection = originalGetCollection;
  }
});

test("semantic retrieval uses real query vectors and ignores incompatible stored vectors", async () => {
  const originalGetCollection = mongoConnection.getCollection;
  const originalFetch = globalThis.fetch;
  const previousApiKey = env.mistralApiKey;
  const previousDimensions = env.embeddingDim;
  env.mistralApiKey = "test-key";
  env.embeddingDim = 3;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({ data: [{ embedding: [1, 0, 0] }] }),
      { status: 200 },
    );
  (
    mongoConnection as typeof mongoConnection & {
      getCollection: typeof mongoConnection.getCollection;
    }
  ).getCollection = async () =>
    ({
      find: () => ({
        toArray: async () => [
          { _id: "semantic-match", text: "Relevant", contentHash: "same-content", profileHashes: ["profile-email-hash"], embedding: [1, 0, 0], embeddingVersion: 1 },
          { _id: "semantic-match-duplicate", text: "Relevant duplicate", contentHash: "different-content", profileHashes: ["profile-email-hash"], embedding: [1, 0, 0], embeddingVersion: 1 },
          { _id: "wrong-dimensions", text: "Invalid", embedding: [1, 0], embeddingVersion: 1 },
          { _id: "negative-match", text: "Opposite", embedding: [-1, 0, 0], embeddingVersion: 1 },
          { _id: "unversioned-vector", text: "Possibly fabricated", embedding: [1, 0, 0] },
        ],
      }),
    }) as never;

  try {
    const results = await new ResumeRepository().searchByEmbedding("query", {}, 10);

    assert.deepEqual(results.map((result) => result._id), ["semantic-match"]);
    assert.equal(results[0]?._score, 1);
  } finally {
    env.mistralApiKey = previousApiKey;
    env.embeddingDim = previousDimensions;
    globalThis.fetch = originalFetch;
    (
      mongoConnection as typeof mongoConnection & {
        getCollection: typeof mongoConnection.getCollection;
      }
    ).getCollection = originalGetCollection;
  }
});

test("semantic retrieval surfaces missing embedding configuration", async () => {
  const originalGetCollection = mongoConnection.getCollection;
  const previousApiKey = env.mistralApiKey;
  env.mistralApiKey = "";
  (
    mongoConnection as typeof mongoConnection & {
      getCollection: typeof mongoConnection.getCollection;
    }
  ).getCollection = async () =>
    ({
      find: () => ({ toArray: async () => [] }),
    }) as never;

  try {
    await assert.rejects(
      new ResumeRepository().searchByEmbedding("query", {}, 10),
      /MISTRAL_API_KEY is not configured/,
    );
  } finally {
    env.mistralApiKey = previousApiKey;
    (
      mongoConnection as typeof mongoConnection & {
        getCollection: typeof mongoConnection.getCollection;
      }
    ).getCollection = originalGetCollection;
  }
});
