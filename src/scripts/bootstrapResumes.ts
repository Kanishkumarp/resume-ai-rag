import { env } from '../config/environment';
import { mongoConnection } from '../repositories/mongo';
import { getSampleResumeDocuments } from '../repositories/sampleResumeData';
import { EmbeddingService } from '../services/embeddingService';

const embeddingService = new EmbeddingService();

const buildResumeDocuments = async () => {
  const sampleDocuments = getSampleResumeDocuments();

  const documentsWithEmbeddings = [] as Array<Record<string, unknown>>;

  for (const document of sampleDocuments) {
    const textToEmbed = [document.text, document.name, document.company, document.role, document.skills?.join(', ')].filter(Boolean).join(' ');
    const embedding = await embeddingService.generateEmbedding(textToEmbed);

    documentsWithEmbeddings.push({
      ...document,
      embedding: embedding.embedding,
      createdAt: new Date().toISOString(),
    });
  }

  return documentsWithEmbeddings;
};

const main = async () => {
  try {
    const collection = await mongoConnection.getCollection(env.mongoCollectionName);
    const documents = await buildResumeDocuments();

    await collection.deleteMany({});
    await collection.insertMany(documents as any[]);

    console.log(`Inserted ${documents.length} resumes into ${env.mongoCollectionName}`);
  } catch (error) {
    console.error('Bootstrap failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await mongoConnection.close();
  }
};

void main();
