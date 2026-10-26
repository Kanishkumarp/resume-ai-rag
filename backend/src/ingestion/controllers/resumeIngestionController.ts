import { Request, Response, NextFunction } from 'express';
import { ResumeIngestionService } from '../services/resumeIngestionService';

interface ResumeRequestBody {
  rawText?: string;
  fileName?: string;
}

export class ResumeIngestionController {
  private readonly service = new ResumeIngestionService();

  async uploadResume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = this.getFile(req);
      if (!file) {
        res.status(400).json({ error: 'invalid_request', message: 'A PDF file is required', statusCode: 400 });
        return;
      }

      res.status(200).json({
        message: 'Resume file accepted',
        fileName: file.originalname,
        sizeBytes: file.size,
        mimeType: file.mimetype,
      });
    } catch (error) {
      next(error);
    }
  }

  async extractResume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = this.getInput(req);
      if (!input.rawText) {
        res.status(422).json({ error: 'extraction_failed', message: 'No text could be extracted from the uploaded PDF', statusCode: 422 });
        return;
      }

      const extracted = this.service.extractText(input);
      res.status(200).json({ message: 'Resume text extracted', fileName: extracted.fileName, rawText: extracted.rawText });
    } catch (error) {
      next(error);
    }
  }

  async cleanResume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = this.getInput(req);
      if (!input.rawText) {
        res.status(422).json({ error: 'extraction_failed', message: 'No text could be extracted from the uploaded PDF', statusCode: 422 });
        return;
      }

      const cleanedText = this.service.cleanText(input.rawText);
      res.status(200).json({ message: 'Resume text cleaned', cleanedText });
    } catch (error) {
      next(error);
    }
  }

  async parseResume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = this.getInput(req);
      if (!input.rawText) {
        res.status(422).json({ error: 'extraction_failed', message: 'No text could be extracted from the uploaded PDF', statusCode: 422 });
        return;
      }

      const parsed = this.service.parseResumeText(input.rawText);
      res.status(200).json({ message: 'Resume parsed successfully', parsed });
    } catch (error) {
      next(error);
    }
  }

  async detectSkills(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = this.getInput(req);
      if (!input.rawText) {
        res.status(422).json({ error: 'extraction_failed', message: 'No text could be extracted from the uploaded PDF', statusCode: 422 });
        return;
      }

      const skills = this.service.detectSkills(input.rawText);
      res.status(200).json({ message: 'Skills detected successfully', skills });
    } catch (error) {
      next(error);
    }
  }

  async llmParseResume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = this.getInput(req);
      if (!input.rawText) {
        res.status(422).json({ error: 'extraction_failed', message: 'No text could be extracted from the uploaded PDF', statusCode: 422 });
        return;
      }

      const parsed = this.service.parseResumeText(input.rawText);
      const useLlm = process.env.USE_LLM_PARSER === 'true';
      res.status(200).json({
        message: 'Resume parsing completed',
        mode: useLlm ? 'llm' : 'regex',
        parsed,
        note: useLlm ? 'LLM parser enabled via USE_LLM_PARSER' : 'LLM parser disabled; regex parser used',
      });
    } catch (error) {
      next(error);
    }
  }

  async embedResume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = this.getInput(req);
      if (!input.rawText) {
        res.status(422).json({ error: 'extraction_failed', message: 'No text could be extracted from the uploaded PDF', statusCode: 422 });
        return;
      }

      const parsed = this.service.parseResumeText(input.rawText);
      const embeddingText = this.service.buildEmbeddingText(parsed, input.rawText);
      const embeddingResult = await this.service.generateEmbedding(embeddingText);
      res.status(200).json({
        message: 'Embedding generated successfully',
        embedding: embeddingResult.embedding,
        model: embeddingResult.model,
        dimensions: embeddingResult.dimensions,
      });
    } catch (error) {
      next(error);
    }
  }

  async storeResume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = this.getInput(req);
      if (!input.rawText) {
        res.status(422).json({ error: 'extraction_failed', message: 'No text could be extracted from the uploaded PDF', statusCode: 422 });
        return;
      }

      const result = await this.service.storeResume(input);
      res.status(200).json({
        message: 'Resume stored successfully',
        id: result.id,
        parsed: result.parsed,
        warnings: result.warnings,
      });
    } catch (error) {
      next(error);
    }
  }

  async injectResume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = this.getInput(req);
      if (!input.rawText) {
        res.status(422).json({ error: 'extraction_failed', message: 'No text could be extracted from the uploaded PDF', statusCode: 422 });
        return;
      }

      const result = await this.service.ingestResume(input);
      res.status(200).json({
        message: 'Resume ingested successfully',
        id: result.id,
        parsed: result.parsed,
        warnings: result.warnings,
        status: 'completed',
      });
    } catch (error) {
      next(error);
    }
  }

  private getFile(req: Request): Express.Multer.File | undefined {
    return req.file as Express.Multer.File | undefined;
  }

  private getInput(req: Request): { fileName: string; rawText: string } {
    const body = req.body as ResumeRequestBody | undefined;
    const file = this.getFile(req);
    const rawText = (body?.rawText ?? '').trim();
    const fileName = body?.fileName ?? file?.originalname ?? 'resume.pdf';
    return { fileName, rawText };
  }
}
