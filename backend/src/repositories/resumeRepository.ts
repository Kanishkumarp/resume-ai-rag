import { Collection, Document, Filter, ObjectId } from 'mongodb';
import { env } from '../config/environment';
import { getVectorSearchIndexDefinition } from '../config/vectorSearchIndex';
import { EmbeddingService } from '../services/embeddingService';
import { mongoConnection } from './mongo';
import { getSampleResumeDocuments } from './sampleResumeData';

export interface ResumeDocument extends Document {
  _id?: string | ObjectId;
  text?: string;
  name?: string;
  company?: string;
  role?: string;
  skills?: string | string[];
  embedding?: number[];
  totalExperience?: number;
  relevantExperience?: number;
  [key: string]: unknown;
}

export class ResumeRepository {
  private readonly embeddingService = new EmbeddingService();

  async searchText(query: string, filters: Record<string, unknown> = {}, topK = 10): Promise<ResumeDocument[]> {
    const trimmedQuery = query?.trim() ?? '';
    if (!trimmedQuery) {
      return [];
    }

    const documents = await this.getDocuments();
    const normalizedQuery = this.normalize(trimmedQuery);
    const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

    return documents
      .map((document) => {
        const score = this.scoreResumeDocument(document, normalizedQuery, filters);
        const rankBoost = queryTerms.some((term) => this.normalize(this.stringifyValue(document.name)).includes(term)) ? 1.5 : 0;
        return { ...document, _score: score + rankBoost } as ResumeDocument & { _score: number };
      })
      .sort((left, right) => (right as ResumeDocument & { _score: number })._score - (left as ResumeDocument & { _score: number })._score)
      .slice(0, topK);
  }

  async searchAtlas(query: string, topK = 10): Promise<ResumeDocument[]> {
    const trimmedQuery = query?.trim() ?? '';
    if (!trimmedQuery) {
      return [];
    }

    try {
      const collection = await this.getCollection();
      const normalizedQuery = this.normalize(trimmedQuery);
      const pipeline = [
        {
          $search: {
            index: env.mongoBm25Index || env.mongoVectorIndex || 'bm25',
            text: {
              query: normalizedQuery,
              path: ['text', 'skills', 'name'],
              fuzzy: { maxEdits: 1 },
            },
          },
        },
        {
          $limit: topK,
        },
      ];

      const documents = await collection.aggregate(pipeline as any).toArray();
      return documents.map((document) => this.normalizeDocument(document as ResumeDocument));
    } catch {
      return [];
    }
  }

  async getSearchDocuments(filters: Record<string, unknown> = {}): Promise<ResumeDocument[]> {
    const documents = await this.getDocuments();
    return documents.filter((document) => this.matchesFilters(document, filters));
  }

  async searchAtlasBm25(query: string, filters: Record<string, unknown> = {}, topK = 10): Promise<ResumeDocument[]> {
    const trimmedQuery = query?.trim() ?? '';
    if (!trimmedQuery) {
      return [];
    }

    try {
      const collection = await this.getCollection();
      const normalizedQuery = this.normalize(trimmedQuery);
      const searchPaths = ['skills', 'text'];
      const pipeline = [
        {
          $search: {
            index: env.mongoBm25Index || env.mongoVectorIndex || 'bm25',
            text: {
              query: normalizedQuery,
              path: searchPaths,
            },
          },
        },
        ...(this.buildAtlasExperienceFilter(filters) ? [{ $match: this.buildAtlasExperienceFilter(filters) }] : []),
        {
          $limit: topK,
        },
        {
          $project: {
            _id: 1,
            text: 1,
            name: 1,
            company: 1,
            role: 1,
            skills: 1,
            embedding: 1,
            totalExperience: 1,
            relevantExperience: 1,
            score: { $meta: 'searchScore' },
          },
        },
      ];

      const documents = await collection.aggregate(pipeline as any).toArray();
      const normalizedDocuments = documents.map((document) => this.normalizeDocument(document as ResumeDocument));
      return normalizedDocuments.filter((document) => this.matchesFilters(document, filters));
    } catch (error) {
      console.error('Atlas BM25 Error:', error);
      throw error;
    }
  }

  private buildAtlasExperienceFilter(filters: Record<string, unknown>): Record<string, unknown> | null {
    const minYears = this.readNumber(filters.minYearsExperience);
    if (minYears === null) {
      return null;
    }

    return {
      $expr: {
        $or: [
          { $gte: [{ $toDouble: { $ifNull: ['$totalExperience', 0] } }, minYears] },
          { $gte: [{ $toDouble: { $ifNull: ['$relevantExperience', 0] } }, minYears] },
        ],
      },
    };
  }

  async searchByEmbedding(query: string, filters: Record<string, unknown> = {}, topK = 10): Promise<ResumeDocument[]> {
    const trimmedQuery = query?.trim() ?? '';
    if (!trimmedQuery) {
      return [];
    }

    const documents = await this.getDocuments();
    const normalizedQuery = this.normalize(trimmedQuery);

    let embeddingVector: number[] = [];
    try {
      const embeddingResult = await this.embeddingService.generateEmbedding(trimmedQuery);
      embeddingVector = embeddingResult.embedding;
    } catch {
      embeddingVector = [];
    }

    return documents
      .map((document) => {
        const score = this.scoreEmbeddingDocument(document, embeddingVector, filters);
        return { ...document, _score: score } as ResumeDocument & { _score: number };
      })
      .sort((left, right) => (right as ResumeDocument & { _score: number })._score - (left as ResumeDocument & { _score: number })._score)
      .slice(0, topK);
  }

  private async getDocuments(): Promise<ResumeDocument[]> {
    try {
      const collection = await this.getCollection();
      const documents = await collection.find({}).limit(100).toArray();

      if (documents.length === 0) {
        return this.getFallbackDocuments();
      }

      const normalizedDocuments = documents.map((document) => {
        const resumeDocument = document as unknown as ResumeDocument;
        return this.normalizeDocument(resumeDocument);
      }) as ResumeDocument[];

      return this.ensureEmbeddings(normalizedDocuments, collection);
    } catch {
      return this.getFallbackDocuments();
    }
  }

  private getFallbackDocuments(): ResumeDocument[] {
    const shouldUseSampleData = env.nodeEnv === 'test' || process.env.USE_SAMPLE_RESUMES === 'true';
    if (!shouldUseSampleData) {
      return [];
    }

    return getSampleResumeDocuments().map((document) => this.normalizeDocument(document as ResumeDocument));
  }

  private async ensureEmbeddings(documents: ResumeDocument[], collection: Collection<Document>): Promise<ResumeDocument[]> {
    const documentsToUpdate = [] as ResumeDocument[];

    for (const document of documents) {
      const existingEmbedding = Array.isArray(document.embedding) ? document.embedding : [];
      if (existingEmbedding.length === 0) {
        const textToEmbed = this.stringifyValue(this.buildSnippet(document));
        if (textToEmbed.trim().length > 0) {
          try {
            const embeddingResponse = await this.embeddingService.generateEmbedding(textToEmbed);
            documentsToUpdate.push({ ...document, embedding: embeddingResponse.embedding } as ResumeDocument);
          } catch {
            // Skip embedding generation failures and rely on text-based search.
          }
        }
      }
    }

    if (documentsToUpdate.length > 0) {
      await Promise.all(
        documentsToUpdate.map(async (document) => {
          const id = document._id;
          if (id !== undefined) {
            const filter = { _id: id } as Filter<Document>;
            await collection.updateOne(filter, { $set: { embedding: document.embedding } });
          }
        }),
      );
    }

    return documents.map((document) => ({ ...document, embedding: Array.isArray(document.embedding) && document.embedding.length > 0 ? document.embedding : [] })) as ResumeDocument[];
  }

  private async getCollection(): Promise<Collection<Document>> {
    return mongoConnection.getCollection(mongoConnection.getCollectionName());
  }

  private resolveAtlasSearchField(query: string): string {
    const normalizedQuery = this.normalize(query);
    const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

    if (queryTerms.some((term) => ['skill', 'skills'].includes(term))) {
      return 'skills';
    }

    if (queryTerms.some((term) => ['summary', 'experience', 'profile'].includes(term))) {
      return 'summary';
    }

    return 'text';
  }

  async getVectorIndexConfig(): Promise<{ name: string; definition: unknown }> {
    return getVectorSearchIndexDefinition();
  }

  private scoreResumeDocument(document: ResumeDocument, query: string, filters: Record<string, unknown>): number {
    const text = this.normalize(this.buildSnippet(document));
    const queryTerms = query.split(/\s+/).filter(Boolean);
    let score = 0;

    queryTerms.forEach((term) => {
      if (text.includes(term)) {
        score += 4;
      }
    });

    const skillsText = this.normalize(this.stringifyValue(document.skills));
    const roleText = this.normalize(this.stringifyValue(document.role));
    const companyText = this.normalize(this.stringifyValue(document.company));
    const nameText = this.normalize(this.stringifyValue(document.name));
    const experienceSummary = this.normalize(
      [this.stringifyValue(document.totalExperience), this.stringifyValue(document.relevantExperience)].filter(Boolean).join(' '),
    );

    if (skillsText.length > 0) {
      score += queryTerms.filter((term) => skillsText.includes(term)).length * 2.5;
    }

    if (roleText.length > 0) {
      score += queryTerms.filter((term) => roleText.includes(term)).length * 2;
    }

    if (companyText.length > 0) {
      score += queryTerms.filter((term) => companyText.includes(term)).length * 1.5;
    }

    if (nameText.length > 0) {
      score += queryTerms.filter((term) => nameText.includes(term)).length * 1.2;
    }

    if (experienceSummary.length > 0) {
      score += queryTerms.filter((term) => experienceSummary.includes(term)).length * 0.8;
    }

    const experienceScore = this.matchExperience(document, filters);
    return score + experienceScore;
  }

  private scoreEmbeddingDocument(document: ResumeDocument, queryEmbedding: number[], filters: Record<string, unknown>): number {
    const documentEmbedding = Array.isArray(document.embedding) ? document.embedding : [];
    if (documentEmbedding.length === 0 || queryEmbedding.length === 0) {
      return 0;
    }

    let dotProduct = 0;
    let magnitude = 0;
    let documentMagnitude = 0;

    for (let index = 0; index < Math.min(queryEmbedding.length, documentEmbedding.length); index += 1) {
      const left = Number(queryEmbedding[index]) || 0;
      const right = Number(documentEmbedding[index]) || 0;
      dotProduct += left * right;
      magnitude += left * left;
      documentMagnitude += right * right;
    }

    if (magnitude === 0 || documentMagnitude === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(magnitude) * Math.sqrt(documentMagnitude));
  }

  private matchesFilters(document: ResumeDocument, filters: Record<string, unknown>): boolean {
    const minYears = this.readNumber(filters.minYearsExperience);
    if (minYears === null) {
      return true;
    }

    const experienceValue = this.readNumber(document.totalExperience) ?? this.readNumber(document.relevantExperience);
    if (experienceValue === null) {
      return false;
    }

    return experienceValue >= minYears;
  }

  private matchExperience(document: ResumeDocument, filters: Record<string, unknown>): number {
    const minYears = this.readNumber(filters.minYearsExperience);
    if (minYears === null) {
      return 0;
    }

    const experienceValue = this.readNumber(document.totalExperience) ?? this.readNumber(document.relevantExperience);
    if (experienceValue === null) {
      return 0;
    }

    return experienceValue >= minYears ? 2 : 0;
  }

  private readNumber(value: unknown): number | null {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }

  private normalizeDocument(document: ResumeDocument): ResumeDocument {
    const stringValues = this.extractStringValues(document);
    const stringifiedSkills = Array.isArray(document.skills)
      ? document.skills
      : this.stringifyValue(document.skills).split(',').map((value) => value.trim()).filter(Boolean);

    return {
      ...document,
      text: this.stringifyValue(document.text || stringValues.join(' ')),
      name: this.stringifyValue(document.name),
      company: this.stringifyValue(document.company),
      role: this.stringifyValue(document.role),
      skills: stringifiedSkills,
    } as ResumeDocument;
  }

  private buildSnippet(document: ResumeDocument): string {
    const fieldValues = this.extractStringValues(document);
    return fieldValues
      .map((value) => this.stringifyValue(value))
      .filter((value) => value.trim().length > 0)
      .join(' ');
  }

  private extractStringValues(document: ResumeDocument): string[] {
    return Object.entries(document)
      .flatMap(([key, value]) => {
        if (key === '_id' || key === 'embedding') {
          return [];
        }

        if (typeof value === 'string') {
          return value.trim().length > 0 ? [value] : [];
        }

        if (typeof value === 'number' || typeof value === 'boolean') {
          return [String(value)];
        }

        if (Array.isArray(value)) {
          return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
        }

        return [];
      });
  }

  private stringifyValue(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return '';
  }

  private normalize(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }
}
