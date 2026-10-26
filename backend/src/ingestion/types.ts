export interface ResumeParseResult {
  name: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  company: string;
  role: string;
  education: string;
  totalExperience?: number;
}

export interface ResumeIngestionDocument extends ResumeParseResult {
  fileName: string;
  rawText: string;
  text: string;
  embedding?: number[];
  embeddingModel?: string;
  embeddingDimension?: number;
  embeddingVersion?: number;
  createdAt: string;
  updatedAt: string;
}
