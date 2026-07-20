import { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';
import { ingestionUpload } from '../config/multerConfig';

type PdfParseModule = {
  default?: (buffer: Buffer) => Promise<{ text?: string }>;
  PDFParse?: new (options: { data: Buffer }) => { getText(): Promise<{ text?: string }> };
};

const pdfParseModule = require('pdf-parse') as PdfParseModule;

const extractTextFromPdf = async (buffer: Buffer): Promise<string> => {
  if (pdfParseModule.PDFParse) {
    const parser = new pdfParseModule.PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text?.trim() ?? '';
  }

  if (typeof pdfParseModule.default === 'function') {
    const result = await pdfParseModule.default(buffer);
    return result.text?.trim() ?? '';
  }

  throw new Error('PDF parser is unavailable');
};

export const uploadMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  ingestionUpload.single('file')(req, res, async (err: unknown) => {
    if (err instanceof MulterError) {
      const statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      res.status(statusCode).json({
        error: err.code === 'LIMIT_FILE_SIZE' ? 'payload_too_large' : 'invalid_request',
        message: err.code === 'LIMIT_FILE_SIZE' ? 'File exceeds the 5MB limit' : err.message,
        statusCode,
      });
      return;
    }

    if (err instanceof Error) {
      res.status(400).json({
        error: 'invalid_request',
        message: err.message,
        statusCode: 400,
      });
      return;
    }

    const file = req.file as Express.Multer.File | undefined;
    if (!file) {
      res.status(400).json({
        error: 'invalid_request',
        message: 'A PDF file is required',
        statusCode: 400,
      });
      return;
    }

    try {
      const rawText = await extractTextFromPdf(file.buffer);
      req.body = {
        ...(req.body as Record<string, unknown> | undefined ?? {}),
        rawText,
        fileName: file.originalname,
      };
      next();
    } catch (error) {
      res.status(422).json({
        error: 'extraction_failed',
        message: error instanceof Error ? error.message : 'Unable to read PDF content',
        statusCode: 422,
      });
    }
  });
};
