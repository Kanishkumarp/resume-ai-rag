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
  skills?: string[];
  location?: string;
  source?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  bm25Score?: number;
  vectorScore?: number;
  hybridScore?: number;
};

const normalizeSkill = (value: string) => value.trim().replace(/^[•·-]\s*/, '').replace(/\s+/g, ' ');

export function extractCandidateMetadata(candidate: Partial<BackendCandidate>) {
  const text = [candidate.summary, candidate.content, candidate.snippet].filter((value): value is string => typeof value === 'string' && value.trim().length > 0).join(' ');
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/);
  const locationMatch = text.match(/(?:Chennai|Tamil Nadu|Remote|Hyderabad|Bengaluru|Bangalore|Pune|Mumbai|Delhi|Kolkata|Noida|Gurgaon|USA|India|US)/i);

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
    email: candidate.email ?? candidate.phoneNumber ?? emailMatch?.[0] ?? undefined,
    phone: candidate.phone ?? candidate.phoneNumber ?? phoneMatch?.[0] ?? undefined,
    location: candidate.location ?? locationMatch?.[0] ?? undefined,
    skills: uniqueSkills,
  };
}

export const normalizeCandidate = (candidate: unknown): SearchResult => {
  const item = candidate as BackendCandidate;
  const title = item.title ?? item.role ?? item.company ?? 'Candidate profile';
  const fallbackName = item.name ?? title;
  const metadata = extractCandidateMetadata(item);

  return {
    id: item.id ?? item.candidateId ?? item.resumeId ?? item._id ?? `candidate-${Math.random().toString(36).slice(2, 8)}`,
    name: fallbackName,
    title,
    score: Number(item.score ?? 0),
    summary: item.summary ?? item.content ?? item.snippet ?? 'Relevant candidate match from the search pipeline.',
    location: metadata.location ?? item.location,
    skills: metadata.skills.length > 0 ? metadata.skills : (Array.isArray(item.skills) ? item.skills : []),
    source: item.source,
    email: metadata.email,
    phone: metadata.phone,
    bm25Score: typeof item.bm25Score === 'number' ? item.bm25Score : undefined,
    vectorScore: typeof item.vectorScore === 'number' ? item.vectorScore : undefined,
    hybridScore: typeof item.hybridScore === 'number' ? item.hybridScore : undefined,
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
