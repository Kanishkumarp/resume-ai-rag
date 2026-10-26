import type { CandidateProfile } from '../../../../../src/types/candidate.types';
import type { SearchResult } from '../../../../../src/types/search.types';
import apiClient from './client';

export function buildCandidateProfileFromSearchResult(candidateId: string, result: Partial<SearchResult> & { name?: string; title?: string; summary?: string; skills?: string[]; location?: string; experienceYears?: number; source?: string; score?: number; email?: string; phone?: string; experience?: Array<{ role: string; company: string; duration?: string; description?: string }> ; education?: Array<{ degree: string; institution: string; year?: string }> ; projects?: Array<{ title: string; description?: string }> ; certifications?: string[]; }): CandidateProfile {
  return {
    id: candidateId,
    name: result.name ?? 'Candidate profile',
    title: result.title ?? 'Resume preview',
    company: result.company,
    summary: result.summary,
    skills: Array.isArray(result.skills) ? result.skills : [],
    location: result.location,
    experienceYears: typeof result.experienceYears === 'number' ? result.experienceYears : undefined,
    matchScore: typeof result.score === 'number' ? result.score : undefined,
    bm25Score: typeof result.bm25Score === 'number' ? result.bm25Score : undefined,
    vectorScore: typeof result.vectorScore === 'number' ? result.vectorScore : undefined,
    hybridScore: typeof result.hybridScore === 'number' ? result.hybridScore : undefined,
    source: result.source,
    email: result.email,
    phone: result.phone,
    experience: result.experience,
    education: result.education,
    projects: result.projects,
    certifications: result.certifications,
  };
}

const fetchCandidateProfileFromBackend = async (candidateId: string): Promise<Partial<CandidateProfile> | null> => {
  const response = await apiClient.get<Partial<CandidateProfile>>(`/v1/candidate/${encodeURIComponent(candidateId)}`);
  return response.data && typeof response.data === 'object' ? response.data : null;
};

export async function getCandidateProfile(candidateId: string, result?: Partial<SearchResult> | null): Promise<CandidateProfile> {
  const backendCandidate = await fetchCandidateProfileFromBackend(candidateId);
  if (!backendCandidate) {
    throw new Error('The candidate profile response was empty.');
  }

  const profile = buildCandidateProfileFromSearchResult(candidateId, {
    ...result,
    ...backendCandidate,
  });
  return {
    ...profile,
    ...backendCandidate,
    id: candidateId,
    name: backendCandidate.name ?? result?.name ?? profile.name,
    title: backendCandidate.title ?? result?.title ?? backendCandidate.company ?? result?.company,
    summary: backendCandidate.summary ?? result?.summary,
    skills: backendCandidate.skills ?? result?.skills ?? [],
    location: backendCandidate.location ?? result?.location,
    matchScore: result?.score,
    bm25Score: result?.bm25Score,
    vectorScore: result?.vectorScore,
    hybridScore: result?.hybridScore,
  };
}
