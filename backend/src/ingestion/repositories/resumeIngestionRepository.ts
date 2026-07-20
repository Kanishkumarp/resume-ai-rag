import { env } from '../../config/environment';
import { mongoConnection } from '../../repositories/mongo';
import { ResumeIngestionDocument } from '../types';

export class ResumeIngestionRepository {
  async save(document: ResumeIngestionDocument): Promise<string> {
    const collectionName = env.mongoCollectionName || 'resume';
    const collection = await mongoConnection.getCollection(collectionName);
    const result = await collection.insertOne(document);
    console.log(`[ingestion] inserted resume into collection "${collectionName}" with id ${result.insertedId.toString()}`);
    return result.insertedId.toString();
  }
}
