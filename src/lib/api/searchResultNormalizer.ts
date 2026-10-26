import type { SearchMode, SearchResult } from '../../types/search.types';

type BackendCandidate = {
  resumeId?: string;
  id?: string;
  candidateId?: string;
  _id?: string;
  name?: string;
  title?: string;
  role?: string;
  company?: string;
  score?: number;
  snippet?: string;
  summary?: string;
  content?: string;
  text?: string;
  skills?: string[];
  location?: string;
  source?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  bm25Score?: number;
  vectorScore?: number;
  bm25RawScore?: number;
  vectorRawScore?: number;
  hybridScore?: number;
  rerankScore?: number;
  relevanceExplanation?: string;
  evidence?: string[];
  experienceYears?: number;
  education?: string;
};

const normalizeSkill = (value: string) => value.trim().replace(/^[•·-]\s*/, '').replace(/\s+/g, ' ');

export function extractCandidateMetadata(candidate: Partial<BackendCandidate>) {
  const text = [candidate.summary, candidate.content, candidate.snippet, candidate.text].filter((value): value is string => typeof value === 'string' && value.trim().length > 0).join(' ');
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/);
  const locationMatch = text.match(/\b(Chennai|Hyderabad|Bengaluru|Bangalore|Pune|Mumbai|Delhi|Kolkata|Noida|Gurgaon|USA|India|US)(?:,?\s*(Tamil Nadu|Karnataka|Maharashtra|West Bengal|Uttar Pradesh|Delhi|India|USA|US))?\b/i);

  const skillCandidates = [
    ...(Array.isArray(candidate.skills) ? candidate.skills : []),
    ...(text.match(/Python/gi) ? ['Python'] : []),
    ...(text.match(/Node\.js|Nodejs|Node JS/gi) ? ['Node.js'] : []),
    ...(text.match(/MongoDB|Mongo/gi) ? ['MongoDB'] : []),
    ...(text.match(/LangChain|LangGraph/gi) ? ['LangChain'] : []),
    ...(text.match(/REST API|REST APIs|API/gi) ? ['REST APIs'] : []),
    ...(text.match(/Java/gi) ? ['Java'] : []),
    ...(text.match(/TypeScript/gi) ? ['TypeScript'] : []),
    ...(text.match(/AWS|Cloud/gi) ? ['AWS'] : []),
    ...(text.match(/Selenium/gi) ? ['Selenium'] : []),
  ];

  const uniqueSkills = Array.from(new Set(skillCandidates.map(normalizeSkill).filter(Boolean))).slice(0, 8);

  return {
    email: candidate.email ?? emailMatch?.[0] ?? undefined,
    phone: candidate.phone ?? candidate.phoneNumber ?? phoneMatch?.[0] ?? undefined,
    location: candidate.location ?? locationMatch?.[0] ?? undefined,
    skills: uniqueSkills,
  };
}

export const normalizeCandidate = (candidate: unknown): SearchResult => {
  const item = candidate as BackendCandidate;
  const candidateId = item.id ?? item.candidateId ?? item.resumeId ?? item._id;
  if (candidateId === undefined || candidateId === null || String(candidateId).trim().length === 0) {
    throw new Error('Search result is missing a candidate ID.');
  }
  const title = item.title ?? item.role ?? item.company ?? 'Candidate profile';
  const fallbackName = item.name ?? title;
  const metadata = extractCandidateMetadata(item);

  return {
    id: String(candidateId),
    name: fallbackName,
    title,
    company: typeof item.company === 'string' ? item.company : undefined,
    score: Number(item.score ?? 0),
    summary: item.summary ?? item.content ?? item.snippet ?? item.text ?? '',
    location: metadata.location ?? item.location,
    skills: metadata.skills.length > 0 ? metadata.skills : (Array.isArray(item.skills) ? item.skills : []),
    source: item.source,
    email: metadata.email,
    phone: metadata.phone,
    bm25Score: typeof item.bm25Score === 'number' ? item.bm25Score : undefined,
    vectorScore: typeof item.vectorScore === 'number' ? item.vectorScore : undefined,
    bm25RawScore: typeof item.bm25RawScore === 'number' ? item.bm25RawScore : undefined,
    vectorRawScore: typeof item.vectorRawScore === 'number' ? item.vectorRawScore : undefined,
    hybridScore: typeof item.hybridScore === 'number' ? item.hybridScore : undefined,
    rerankScore: typeof item.rerankScore === 'number' ? item.rerankScore : undefined,
    relevanceExplanation: typeof item.relevanceExplanation === 'string' ? item.relevanceExplanation : undefined,
    evidence: Array.isArray(item.evidence) ? item.evidence.filter((quote): quote is string => typeof quote === 'string') : undefined,
    experienceYears: typeof item.experienceYears === 'number' ? item.experienceYears : undefined,
    educationSummary: typeof item.education === 'string' ? item.education : undefined,
  };
};

export const normalizeResults = (payload: unknown): SearchResult[] => {
  if (Array.isArray(payload)) {
    return payload.map(normalizeCandidate);
  }

  if (payload && typeof payload === 'object') {
    const container = payload as Record<string, unknown>;
    const candidateLists = [
      container.results,
      container.hybridResults,
      container.bm25Results,
      container.vectorResults,
      container.matches,
      container.candidates,
    ];

    for (const list of candidateLists) {
      if (Array.isArray(list)) {
        return list.map(normalizeCandidate);
      }
    }
  }

  return [];
};

export const getSearchMode = (requestMode?: SearchMode): SearchMode => requestMode ?? 'hybrid';
