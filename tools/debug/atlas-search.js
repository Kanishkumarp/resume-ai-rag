const { connectDB } = require('./db');

const bm25Index = process.env.MONGODB_BM25_INDEX || 'BM25';
const vectorIndex = process.env.MONGODB_VECTOR_INDEX || 'vector_index';

async function bm25Search(query) {
  if (typeof query !== 'string' || query.trim().length === 0) {
    throw new Error('Query must be a non-empty string.');
  }

  const collection = await connectDB();
  const results = await collection.aggregate([
    {
      $search: {
        index: bm25Index,
        text: {
          query,
          path: ['currentTitle', 'currentOrganisation', 'certifications'],
        },
      },
    },
  ]).toArray();

  return results;
}

async function vectorSearch(queryEmbedding) {
  if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
    throw new Error('queryEmbedding must be a non-empty array.');
  }

  const collection = await connectDB();
  const results = await collection.aggregate([
    {
      $vectorSearch: {
        index: vectorIndex,
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit: 10,
      },
    },
  ]).toArray();

  return results;
}

module.exports = { bm25Search, vectorSearch };
