import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
  override: true,
});

const getEnv = (key: string, fallback = ''): string => String(process.env[key] ?? fallback).trim();

const runtimePort = process.env.PORT ?? process.env.VITE_PORT ?? '';

const loadEnv = () => ({
  port: Number(runtimePort || getEnv('PORT', '3000')),
  nodeEnv: getEnv('NODE_ENV', 'development'),
  appName: getEnv('APP_NAME', 'resume-ai-rag'),
  appVersion: getEnv('APP_VERSION', '0.1.0'),
  mongoUri: getEnv('MONGODB_URI', '').trim(),
  mongoDbName: getEnv('MONGODB_DB_NAME', '').trim(),
  mongoCollectionName: getEnv('MONGODB_COLLECTION_NAME', '').trim(),
  mongoBm25Index: getEnv('MONGODB_BM25_INDEX', '').trim(),
  mongoVectorIndex: getEnv('MONGODB_VECTOR_INDEX', '').trim(),
  mistralEmbeddingModel: getEnv('MISTRAL_EMBEDDING_MODEL', 'mistral-embed').trim(),
  mistralApiKey: getEnv('MISTRAL_API_KEY', '').trim(),
  groqApiKey: getEnv('GROQ_API_KEY', '').trim(),
  groqLlmModel: getEnv('GROQ_LLM_MODEL', '').trim(),
  embeddingDim: Number(getEnv('EMBEDDING_DIM', '1024')),
  requestMaxBytes: Number(getEnv('REQUEST_MAX_BYTES', '1048576')),
  summarizeDefaultStyle: getEnv('SUMMARIZE_DEFAULT_STYLE', 'short'),
  summarizeDefaultMaxTokens: Number(getEnv('SUMMARIZE_DEFAULT_MAX_TOKENS', '220')),
  ingestionMaxFileSizeBytes: Number(getEnv('INGESTION_MAX_FILE_SIZE_BYTES', '5242880')),
});

export const env = loadEnv();
