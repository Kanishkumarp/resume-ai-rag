import * as fs from "node:fs";
import * as path from "node:path";
import * as dotenv from "dotenv";

const findDotEnvPath = (): string => {
  const startDirs = [process.cwd(), __dirname];

  for (const baseDir of startDirs) {
    let currentDir = path.resolve(baseDir);

    for (let depth = 0; depth < 10; depth += 1) {
      const candidate = path.join(currentDir, ".env");
      if (fs.existsSync(candidate)) {
        return candidate;
      }

      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) {
        break;
      }
      currentDir = parentDir;
    }
  }

  return path.resolve(process.cwd(), ".env");
};

const dotenvResult = dotenv.config({
  path: findDotEnvPath(),
  override: false,
});

const getEnv = (key: string, fallback = ""): string =>
  String(process.env[key] ?? fallback).trim();

const runtimePort = process.env.PORT ?? process.env.VITE_PORT ?? "";
const nodeEnv = getEnv("NODE_ENV", "development");
const apiAccessToken =
  nodeEnv === "development" &&
  dotenvResult.parsed &&
  Object.prototype.hasOwnProperty.call(dotenvResult.parsed, "API_ACCESS_TOKEN")
    ? (dotenvResult.parsed.API_ACCESS_TOKEN?.trim() ?? "")
    : getEnv("API_ACCESS_TOKEN", "");

const loadEnv = () => ({
  port: Number(runtimePort || getEnv("PORT", "3000")),
  nodeEnv,
  appName: getEnv("APP_NAME", "resume-ai-rag"),
  appVersion: getEnv("APP_VERSION", "0.1.0"),
  mongoUri: getEnv("MONGODB_URI", "").trim(),
  apiAccessToken,
  mongoDbName: getEnv("MONGODB_DB_NAME", "").trim(),
  mongoCollectionName: getEnv("MONGODB_COLLECTION_NAME", "").trim(),
  mongoBm25Index: getEnv("MONGODB_BM25_INDEX", "").trim(),
  mongoVectorIndex: getEnv("MONGODB_VECTOR_INDEX", "").trim(),
  mistralEmbeddingModel: getEnv(
    "MISTRAL_EMBEDDING_MODEL",
    "mistral-embed",
  ).trim(),
  mistralApiKey: getEnv("MISTRAL_API_KEY", "").trim(),
  groqApiKey: getEnv("GROQ_API_KEY", "").trim(),
  groqLlmModel: getEnv("GROQ_LLM_MODEL", "").trim(),
  embeddingDim: Number(getEnv("EMBEDDING_DIM", "1024")),
  requestMaxBytes: Number(getEnv("REQUEST_MAX_BYTES", "1048576")),
  summarizeDefaultStyle: getEnv("SUMMARIZE_DEFAULT_STYLE", "short"),
  summarizeDefaultMaxTokens: Number(
    getEnv("SUMMARIZE_DEFAULT_MAX_TOKENS", "220"),
  ),
  ingestionMaxFileSizeBytes: Number(
    getEnv("INGESTION_MAX_FILE_SIZE_BYTES", "5242880"),
  ),
});

export const env = loadEnv();
