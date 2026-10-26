import { EmbeddingService } from '../../services/embeddingService';
import { ResumeParseResult } from '../types';
import { ResumeParserService } from './resumeParserService';
import { ResumeIngestionRepository } from '../repositories/resumeIngestionRepository';
import { cleanResumeText } from '../utils/textCleaner';
import { SKILL_NAMES } from '../utils/regexUtils';
import type { ResumeIngestionDocument } from '../types';

export interface IngestResumeInput {
  fileName: string;
  rawText: string;
}

interface ResumeIngestionStore {
  save(document: ResumeIngestionDocument): Promise<string>;
}

interface ResumeEmbeddingGenerator {
  generateEmbedding(
    input: string,
    model?: string,
  ): Promise<{ embedding: number[]; model: string; dimensions: number }>;
}

export class ResumeIngestionService {
  constructor(
    private readonly parser = new ResumeParserService(),
    private readonly embeddingService: ResumeEmbeddingGenerator = new EmbeddingService(),
    private readonly repository: ResumeIngestionStore = new ResumeIngestionRepository(),
  ) {}

  extractText(input: IngestResumeInput): { fileName: string; rawText: string } {
    return {
      fileName: input.fileName,
      rawText: input.rawText.trim(),
    };
  }

  cleanText(rawText: string): string {
    return cleanResumeText(rawText);
  }

  detectSkills(rawText: string): string[] {
    const normalized = rawText.toLowerCase();
    return SKILL_NAMES.filter((skill) => normalized.includes(skill.toLowerCase()));
  }

  parseResumeText(rawText: string): ResumeParseResult {
    return this.parser.parseResume(rawText);
  }

  buildEmbeddingText(parsed: ResumeParseResult, rawText: string): string {
    return [
      parsed.name,
      parsed.role,
      parsed.skills.join(','),
      parsed.company,
      rawText.slice(0, 20_000),
    ].filter(Boolean).join('\n');
  }

  async generateEmbedding(input: string): Promise<{ embedding: number[]; model: string; dimensions: number }> {
    return this.generateEmbeddingSafely(input);
  }

  async storeResume(input: IngestResumeInput): Promise<{
    id: string;
    parsed: ResumeParseResult;
    embedding?: number[];
    model?: string;
    dimensions?: number;
    warnings: string[];
  }> {
    const parsed = this.parseResumeText(input.rawText);
    const cleanedText = this.cleanText(input.rawText);
    const embeddingText = this.buildEmbeddingText(parsed, cleanedText);

    let embeddingResult: { embedding: number[]; model: string; dimensions: number } | undefined;
    const warnings: string[] = [];
    try {
      embeddingResult = await this.generateEmbedding(embeddingText);
    } catch {
      warnings.push(
        'Mistral embeddings are unavailable; this resume was stored for keyword search only.',
      );
    }

    const document = {
      fileName: input.fileName,
      rawText: input.rawText,
      text: cleanedText,
      ...parsed,
      ...(embeddingResult
        ? {
            embedding: embeddingResult.embedding,
            embeddingModel: embeddingResult.model,
            embeddingDimension: embeddingResult.dimensions,
            embeddingVersion: 1,
          }
        : {}),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const id = await this.repository.save(document);

    return {
      id,
      parsed,
      embedding: embeddingResult?.embedding,
      model: embeddingResult?.model,
      dimensions: embeddingResult?.dimensions,
      warnings,
    };
  }

  async ingestResume(input: IngestResumeInput): Promise<{
    id: string;
    parsed: ResumeParseResult;
    warnings: string[];
  }> {
    if (!input.rawText || input.rawText.trim().length === 0) {
      throw Object.assign(new Error('Resume extraction failed. No text was found.'), { status: 422 });
    }

    const result = await this.storeResume(input);
    return { id: result.id, parsed: result.parsed, warnings: result.warnings };
  }

  private async generateEmbeddingSafely(input: string): Promise<{ embedding: number[]; model: string; dimensions: number }> {
    return this.embeddingService.generateEmbedding(input);
  }
}
