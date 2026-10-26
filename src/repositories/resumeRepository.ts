import { Collection, Document, Filter, ObjectId } from "mongodb";
import { env } from "../config/environment";
import { getVectorSearchIndexDefinition } from "../config/vectorSearchIndex";
import { EmbeddingService } from "../services/embeddingService";
import { mongoConnection } from "./mongo";
import { getSampleResumeDocuments } from "./sampleResumeData";
import type { SearchFilters } from "../services/search/searchFilters";

export interface ResumeDocument extends Document {
  _id?: string | ObjectId;
  text?: string;
  name?: string;
  company?: string;
  role?: string;
  skills?: string | string[];
  embedding?: number[];
  embeddingVersion?: number;
  contentHash?: string;
  profileHashes?: string[];
  location?: string;
  education?: string | string[] | Record<string, unknown>;
  totalExperience?: number;
  relevantExperience?: number;
  [key: string]: unknown;
}

export class ResumeRepository {
  private readonly embeddingService = new EmbeddingService();

  async searchText(
    query: string,
    filters: SearchFilters = {},
    topK = 10,
  ): Promise<ResumeDocument[]> {
    const trimmedQuery = query?.trim() ?? "";
    if (!trimmedQuery) {
      return [];
    }

    const documents = await this.getDocuments();
    const normalizedQuery = this.normalize(trimmedQuery);
    const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

    return documents
      .map((document) => {
        const score = this.scoreResumeDocument(
          document,
          normalizedQuery,
          filters,
        );
        const rankBoost = queryTerms.some((term) =>
          this.normalize(this.stringifyValue(document.name)).includes(term),
        )
          ? 1.5
          : 0;
        return { ...document, _score: score + rankBoost } as ResumeDocument & {
          _score: number;
        };
      })
      .sort(
        (left, right) =>
          (right as ResumeDocument & { _score: number })._score -
          (left as ResumeDocument & { _score: number })._score,
      )
      .slice(0, topK);
  }

  async searchAtlas(query: string, topK = 10): Promise<ResumeDocument[]> {
    const trimmedQuery = query?.trim() ?? "";
    if (!trimmedQuery) {
      return [];
    }

    try {
      const collection = await this.getCollection();
      const normalizedQuery = this.normalize(trimmedQuery);
      const pipeline = [
        {
          $search: {
            index: env.mongoBm25Index || env.mongoVectorIndex || "bm25",
            text: {
              query: normalizedQuery,
              path: ["text", "skills", "name"],
              fuzzy: { maxEdits: 1 },
            },
          },
        },
        {
          $limit: topK,
        },
      ];

      const documents = await collection.aggregate(pipeline as any).toArray();
      return documents.map((document) =>
        this.normalizeDocument(document as ResumeDocument),
      );
    } catch {
      return [];
    }
  }

  async getSearchDocuments(
    filters: SearchFilters = {},
  ): Promise<ResumeDocument[]> {
    const documents = await this.getDocuments();
    return documents.filter((document) =>
      this.matchesFilters(document, filters),
    );
  }

  async getDocumentById(candidateId: string): Promise<ResumeDocument | null> {
    const trimmedId = candidateId?.trim() ?? "";
    if (!trimmedId) {
      return null;
    }

    const collection = await this.getCollection();
    const queries: Record<string, unknown>[] = [
      { resumeId: trimmedId },
      { _id: trimmedId },
    ];
    if (ObjectId.isValid(trimmedId)) {
      queries.unshift({ _id: new ObjectId(trimmedId) });
    }

    const document = await collection.findOne({
      $or: queries,
    } as Filter<Document>);
    if (document) {
      return this.normalizeDocument(document as ResumeDocument);
    }

    const fallbackDocument = this.getFallbackDocuments().find(
      (item) =>
        String(item._id) === trimmedId ||
        String((item as ResumeDocument).resumeId) === trimmedId,
    ) as ResumeDocument | undefined;

    return fallbackDocument ? this.normalizeDocument(fallbackDocument) : null;
  }

  async searchAtlasBm25(
    query: string,
    filters: SearchFilters = {},
    topK = 10,
  ): Promise<ResumeDocument[]> {
    const trimmedQuery = query?.trim() ?? "";
    if (!trimmedQuery) {
      return [];
    }

    try {
      const collection = await this.getCollection();
      const normalizedQuery = this.normalize(trimmedQuery);
      const searchPaths = ["skills", "text"];
      const atlasFilter = this.buildAtlasMetadataFilter(filters);
      const pipeline = [
        {
          $search: {
            index: env.mongoBm25Index || env.mongoVectorIndex || "bm25",
            text: {
              query: normalizedQuery,
              path: searchPaths,
            },
          },
        },
        ...(atlasFilter ? [{ $match: atlasFilter }] : []),
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
            location: 1,
            education: 1,
            embedding: 1,
            totalExperience: 1,
            relevantExperience: 1,
            total_Experience: 1,
            relevant_Experience: 1,
            score: { $meta: "searchScore" },
          },
        },
      ];

      const documents = await collection.aggregate(pipeline as any).toArray();
      const normalizedDocuments = documents.map((document) =>
        this.normalizeDocument(document as ResumeDocument),
      );
      return normalizedDocuments.filter((document) =>
        this.matchesFilters(document, filters),
      );
    } catch (error) {
      console.error("Atlas BM25 Error:", error);
      throw error;
    }
  }

  private buildAtlasMetadataFilter(
    filters: SearchFilters,
  ): Record<string, unknown> | null {
    const clauses: Record<string, unknown>[] = [];
    const experience = {
      $convert: {
        input: {
          $ifNull: [
            "$total_Experience",
            {
              $ifNull: [
                "$totalExperience",
                { $ifNull: ["$relevant_Experience", "$relevantExperience"] },
              ],
            },
          ],
        },
        to: "double",
        onError: null,
        onNull: null,
      },
    };

    if (
      filters.minYearsExperience !== undefined ||
      filters.maxYearsExperience !== undefined
    ) {
      const conditions: unknown[] = [{ $ne: [experience, null] }];
      if (filters.minYearsExperience !== undefined) {
        conditions.push({ $gte: [experience, filters.minYearsExperience] });
      }
      if (filters.maxYearsExperience !== undefined) {
        conditions.push({ $lte: [experience, filters.maxYearsExperience] });
      }
      clauses.push({ $expr: { $and: conditions } });
    }

    if (filters.skills?.length) {
      clauses.push({
        $or: filters.skills.flatMap((skill) => {
          const regex = { $regex: this.escapeRegex(skill), $options: "i" };
          return [{ skills: regex }, { text: regex }];
        }),
      });
    }

    if (filters.location) {
      const regex = {
        $regex: this.escapeRegex(filters.location),
        $options: "i",
      };
      clauses.push({ $or: [{ location: regex }, { text: regex }] });
    }
    if (filters.title) {
      const regex = { $regex: this.escapeRegex(filters.title), $options: "i" };
      clauses.push({
        $or: [{ role: regex }, { title: regex }, { text: regex }],
      });
    }
    if (filters.education) {
      const regex = {
        $regex: this.escapeRegex(filters.education),
        $options: "i",
      };
      clauses.push({
        $or: [
          { education: regex },
          { "education.degree": regex },
          { "education.institution": regex },
          { text: regex },
        ],
      });
    }

    if (clauses.length === 0) return null;
    return clauses.length === 1 ? clauses[0]! : { $and: clauses };
  }

  async searchByEmbedding(
    query: string,
    filters: SearchFilters = {},
    topK = 10,
  ): Promise<ResumeDocument[]> {
    const trimmedQuery = query?.trim() ?? "";
    if (!trimmedQuery) {
      return [];
    }

    const [documents, queryEmbedding] = await Promise.all([
      this.getDocuments(),
      this.embeddingService.generateEmbedding(trimmedQuery),
    ]);

    return documents
      .filter((document) => this.matchesFilters(document, filters))
      .map((document) => {
        const embedding = document.embedding;
        if (
          document.embeddingVersion !== 1 ||
          !Array.isArray(embedding) ||
          embedding.length !== queryEmbedding.embedding.length ||
          !embedding.every(Number.isFinite)
        ) {
          return null;
        }

        const score = this.scoreEmbeddingDocument(
          document,
          queryEmbedding.embedding,
          filters,
        );
        return score > 0
          ? ({ ...document, _score: score } as ResumeDocument & {
              _score: number;
            })
          : null;
      })
      .filter(
        (document): document is ResumeDocument & { _score: number } =>
          document !== null,
      )
      .sort((left, right) => right._score - left._score)
      .slice(0, topK);
  }

  private async getDocuments(): Promise<ResumeDocument[]> {
    try {
      const collection = await this.getCollection();
      const documents = await collection.find({}).toArray();

      if (documents.length === 0) {
        return this.getFallbackDocuments();
      }

      const normalizedDocuments = documents.map((document) => {
        const resumeDocument = document as unknown as ResumeDocument;
        return this.normalizeDocument(resumeDocument);
      }) as ResumeDocument[];

      const seenContentHashes = new Set<string>();
      const seenProfileHashes = new Set<string>();
      return normalizedDocuments.filter((document) => {
        const hash = document.contentHash?.trim();
        const profileHashes = Array.isArray(document.profileHashes)
          ? document.profileHashes.filter(
              (value): value is string => typeof value === "string" && value.length > 0,
            )
          : [];
        if (
          (hash && seenContentHashes.has(hash)) ||
          profileHashes.some((profileHash) =>
            seenProfileHashes.has(profileHash),
          )
        ) {
          return false;
        }
        if (hash) seenContentHashes.add(hash);
        profileHashes.forEach((profileHash) =>
          seenProfileHashes.add(profileHash),
        );
        return true;
      });
    } catch (error) {
      if (
        env.nodeEnv === "test" ||
        process.env.USE_SAMPLE_RESUMES === "true"
      ) {
        return this.getFallbackDocuments();
      }
      throw error;
    }
  }

  private getFallbackDocuments(): ResumeDocument[] {
    const shouldUseSampleData =
      env.nodeEnv === "test" || process.env.USE_SAMPLE_RESUMES === "true";
    if (!shouldUseSampleData) {
      return [];
    }

    return getSampleResumeDocuments().map((document) =>
      this.normalizeDocument(document as ResumeDocument),
    );
  }

  private async getCollection(): Promise<Collection<Document>> {
    return mongoConnection.getCollection(mongoConnection.getCollectionName());
  }

  private resolveAtlasSearchField(query: string): string {
    const normalizedQuery = this.normalize(query);
    const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

    if (queryTerms.some((term) => ["skill", "skills"].includes(term))) {
      return "skills";
    }

    if (
      queryTerms.some((term) =>
        ["summary", "experience", "profile"].includes(term),
      )
    ) {
      return "summary";
    }

    return "text";
  }

  async getVectorIndexConfig(): Promise<{ name: string; definition: unknown }> {
    return getVectorSearchIndexDefinition();
  }

  private scoreResumeDocument(
    document: ResumeDocument,
    query: string,
    filters: SearchFilters,
  ): number {
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
      [
        this.stringifyValue(document.totalExperience),
        this.stringifyValue(document.relevantExperience),
      ]
        .filter(Boolean)
        .join(" "),
    );

    if (skillsText.length > 0) {
      score +=
        queryTerms.filter((term) => skillsText.includes(term)).length * 2.5;
    }

    if (roleText.length > 0) {
      score += queryTerms.filter((term) => roleText.includes(term)).length * 2;
    }

    if (companyText.length > 0) {
      score +=
        queryTerms.filter((term) => companyText.includes(term)).length * 1.5;
    }

    if (nameText.length > 0) {
      score +=
        queryTerms.filter((term) => nameText.includes(term)).length * 1.2;
    }

    if (experienceSummary.length > 0) {
      score +=
        queryTerms.filter((term) => experienceSummary.includes(term)).length *
        0.8;
    }

    const experienceScore = this.matchExperience(document, filters);
    return score + experienceScore;
  }

  private scoreEmbeddingDocument(
    document: ResumeDocument,
    queryEmbedding: number[],
    filters: SearchFilters,
  ): number {
    const documentEmbedding = Array.isArray(document.embedding)
      ? document.embedding
      : [];
    if (documentEmbedding.length === 0 || queryEmbedding.length === 0) {
      return 0;
    }

    let dotProduct = 0;
    let magnitude = 0;
    let documentMagnitude = 0;

    for (
      let index = 0;
      index < Math.min(queryEmbedding.length, documentEmbedding.length);
      index += 1
    ) {
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

  private matchesFilters(
    document: ResumeDocument,
    filters: SearchFilters,
  ): boolean {
    const experienceValue =
      this.readNumber(document.totalExperience) ??
      this.readNumber(document.total_Experience) ??
      this.readNumber(document.relevantExperience) ??
      this.readNumber(document.relevant_Experience);
    if (
      (filters.minYearsExperience !== undefined ||
        filters.maxYearsExperience !== undefined) &&
      experienceValue === null
    ) {
      return false;
    }
    if (
      experienceValue !== null &&
      filters.minYearsExperience !== undefined &&
      experienceValue < filters.minYearsExperience
    ) {
      return false;
    }
    if (
      experienceValue !== null &&
      filters.maxYearsExperience !== undefined &&
      experienceValue > filters.maxYearsExperience
    ) {
      return false;
    }

    if (filters.skills?.length) {
      const documentSkills: string[] = Array.isArray(document.skills)
        ? document.skills.filter(
            (skill): skill is string => typeof skill === "string",
          )
        : this.stringifyValue(document.skills).split(/[,;\n]/);
      const normalizedSkills = documentSkills.map((skill) =>
        this.normalize(skill),
      );
      if (
        !filters.skills.some(
          (skill) =>
            normalizedSkills.some((value) =>
              value.includes(this.normalize(skill)),
            ) ||
            this.normalize(this.stringifyValue(document.text)).includes(
              this.normalize(skill),
            ),
        )
      ) {
        return false;
      }
    }

    if (
      filters.location &&
      !this.normalize(
        `${this.stringifyValue(document.location)} ${this.stringifyValue(document.text)}`,
      ).includes(this.normalize(filters.location))
    ) {
      return false;
    }

    if (
      filters.title &&
      !this.normalize(
        `${this.stringifyValue(document.role ?? document.title)} ${this.stringifyValue(document.text)}`,
      ).includes(this.normalize(filters.title))
    ) {
      return false;
    }

    if (
      filters.education &&
      !this.normalize(
        `${this.stringifyEducation(document.education)} ${this.stringifyValue(document.text)}`,
      ).includes(this.normalize(filters.education))
    ) {
      return false;
    }

    return true;
  }

  private matchExperience(
    document: ResumeDocument,
    filters: SearchFilters,
  ): number {
    const minYears = filters.minYearsExperience;
    if (minYears === undefined) {
      return 0;
    }

    const experienceValue =
      this.readNumber(document.totalExperience) ??
      this.readNumber(document.relevantExperience);
    if (experienceValue === null) {
      return 0;
    }

    return experienceValue >= minYears ? 2 : 0;
  }

  private readNumber(value: unknown): number | null {
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }

  private stringifyEducation(value: unknown): string {
    if (typeof value === "string") return value;
    if (Array.isArray(value))
      return value.map((item) => this.stringifyEducation(item)).join(" ");
    if (typeof value === "object" && value !== null) {
      return Object.values(value)
        .filter((item): item is string => typeof item === "string")
        .join(" ");
    }
    return "";
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  private normalizeDocument(document: ResumeDocument): ResumeDocument {
    const stringValues = this.extractStringValues(document);
    const stringifiedSkills = Array.isArray(document.skills)
      ? document.skills
      : this.stringifyValue(document.skills)
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean);

    return {
      ...document,
      text: this.stringifyValue(document.text || stringValues.join(" ")),
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
      .join(" ");
  }

  private extractStringValues(document: ResumeDocument): string[] {
    return Object.entries(document).flatMap(([key, value]) => {
      if (
        key === "_id" ||
        key === "embedding" ||
        key === "contentHash" ||
        key === "profileHashes" ||
        key === "dedupeKey" ||
        key === "dedupeKey" ||
        key === "embeddingVersion" ||
        key === "embeddingDimension"
      ) {
        return [];
      }

      if (typeof value === "string") {
        return value.trim().length > 0 ? [value] : [];
      }

      if (typeof value === "number" || typeof value === "boolean") {
        return [String(value)];
      }

      if (Array.isArray(value)) {
        return value.filter(
          (entry): entry is string =>
            typeof entry === "string" && entry.trim().length > 0,
        );
      }

      return [];
    });
  }

  private stringifyValue(value: unknown): string {
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    return "";
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
}
