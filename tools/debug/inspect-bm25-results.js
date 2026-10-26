const path = require('node:path');
const buildDirectory = path.resolve(__dirname, '..', '..', 'dist');
const { ResumeRepository } = require(path.join(buildDirectory, 'repositories/resumeRepository'));
const { Bm25SearchService } = require(path.join(buildDirectory, 'services/search/bm25SearchService'));

(async () => {
  const repo = new ResumeRepository();
  const docs = await repo.getSearchDocuments({});
  console.log(`Loaded ${docs.length} search documents.`);
  const svc = new Bm25SearchService(repo);
  const result = await svc.search('python skills', {}, 3);
  console.log(`BM25 search returned ${result.length} results.`);
})().catch((error) => {
  console.error('BM25 diagnostic failed.');
  console.error(error instanceof Error ? error.name : 'UnknownError');
  process.exit(1);
});
