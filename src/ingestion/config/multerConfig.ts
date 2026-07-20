import * as multer from 'multer';
import { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { env } from '../../config/environment';

const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
    cb(null, true);
    return;
  }

  cb(new Error('Only PDF files are allowed'));
};

export const ingestionUploadConfig = {
  storage,
  limits: {
    files: 1,
    fileSize: env.ingestionMaxFileSizeBytes,
  },
  fileFilter,
};

export const ingestionUpload = multer(ingestionUploadConfig);
