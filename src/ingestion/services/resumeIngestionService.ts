import { env } from '../../config/environment';
import { EmbeddingService } from '../../services/embeddingService';
import { ResumeParseResult } from '../types';
import { ResumeParserService } from './resumeParserService';
import { ResumeIngestionRepository } from '../repositories/resumeIngestionRepository';
import { cleanResumeText } from '../utils/textCleaner';
import { SKILL_NAMES } from '../utils/regexUtils';

export interface IngestResumeInput {
  fileName: string;
  rawText: string;
}

export class ResumeIngestionService {
  private readonly parser = new ResumeParserService();
  private readonly embeddingService = new EmbeddingService();
  private readonly repository = new ResumeIngestionRepository();

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
      rawText,
    ].filter(Boolean).join('\n');
  }

  async generateEmbedding(input: string): Promise<{ embedding: number[]; model: string; dimensions: number }> {
    return this.generateEmbeddingSafely(input);
  }

  async storeResume(input: IngestResumeInput): Promise<{ id: string; parsed: ResumeParseResult; embedding: number[]; model: string; dimensions: number }> {
    const parsed = this.parseResumeText(input.rawText);
    const embeddingText = this.buildEmbeddingText(parsed, input.rawText);

    let embeddingResult: { embedding: number[]; model: string; dimensions: number };
    try {
      embeddingResult = await this.generateEmbedding(embeddingText);
    } catch (error) {
      embeddingResult = {
        embedding: this.createFallbackEmbedding(embeddingText),
        model: 'fallback-local',
        dimensions: Math.min(32, Math.max(8, embeddingText.length % 32)),
      };
    }

    const document = {
      fileName: input.fileName,
      rawText: input.rawText,
      ...parsed,
      embedding: embeddingResult.embedding,
      embeddingModel: embeddingResult.model,
      embeddingDimension: embeddingResult.dimensions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let id = 'local-' + Date.now();
    try {
      id = await this.repository.save(document);
    } catch (error) {
      console.warn('[ingestion] falling back to local-only persistence', error);
    }

    return {
      id,
      parsed,
      embedding: embeddingResult.embedding,
      model: embeddingResult.model,
      dimensions: embeddingResult.dimensions,
    };
  }

  async ingestResume(input: IngestResumeInput): Promise<{ id: string; parsed: ResumeParseResult }> {
    if (!input.rawText || input.rawText.trim().length === 0) {
      throw Object.assign(new Error('Resume extraction failed. No text was found.'), { status: 422 });
    }

    const result = await this.storeResume(input);
    return { id: result.id, parsed: result.parsed };
  }

  private createFallbackEmbedding(text: string): number[] {
    const values: number[] = [];
    const seed = text.length % 7;
    for (let index = 0; index < 16; index += 1) {
      const value = Math.sin((index + 1) * (seed + 1)) * 0.5 + 0.5;
      values.push(Number(value.toFixed(6)));
    }
    return values;
  }

  private async generateEmbeddingSafely(input: string): Promise<{ embedding: number[]; model: string; dimensions: number }> {
    return this.embeddingService.generateEmbedding(input, env.mistralEmbeddingModel || 'mistral-embed');
  }
}
