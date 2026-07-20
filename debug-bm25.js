const { ResumeRepository } = require('./dist/repositories/resumeRepository');
const { Bm25SearchService } = require('./dist/services/search/bm25SearchService');

(async () => {
  const repo = new ResumeRepository();
  const docs = await repo.getSearchDocuments({});
  console.log(JSON.stringify(docs.map((d) => ({ id: d._id, text: d.text, skills: d.skills })), null, 2));
  const svc = new Bm25SearchService(repo);
  const result = await svc.search('python skills', {}, 3);
  console.log(JSON.stringify(result, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
