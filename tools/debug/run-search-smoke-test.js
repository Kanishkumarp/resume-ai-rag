const { bm25Search, vectorSearch } = require('./search');

(async () => {
  try {
    const keywordQuery = process.env.SEARCH_QUERY || 'React Developer';
    const keywordResults = await bm25Search(keywordQuery);
    console.log('BM25 results:', keywordResults.length);

    const embeddingInput = process.env.VECTOR_QUERY_EMBEDDING || '[0.12, -0.34, 0.56, 0.78, -0.91]';
    const vectorResults = await vectorSearch(JSON.parse(embeddingInput));
    console.log('Vector results:', vectorResults.length);
  } catch (error) {
    console.error('Search demo failed:', error.message || error);
    process.exitCode = 1;
  }
})();
