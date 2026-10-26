import type { CandidateProfile } from '../../types/candidate.types';
import type { SearchResult } from '../../types/search.types';

export function buildCandidateProfileFromSearchResult(candidateId: string, result: Partial<SearchResult> & { name?: string; title?: string; summary?: string; skills?: string[]; location?: string; experienceYears?: number; source?: string; score?: number; email?: string; phone?: string; experience?: Array<{ role: string; company: string; duration?: string; description?: string }> ; education?: Array<{ degree: string; institution: string; year?: string }> ; projects?: Array<{ title: string; description?: string }> ; certifications?: string[]; }): CandidateProfile {
  return {
    id: candidateId,
    name: result.name ?? 'Candidate profile',
    title: result.title ?? 'Resume preview',
    summary: result.summary ?? 'Profile details are available from the current search response.',
    skills: Array.isArray(result.skills) ? result.skills : ['Node.js', 'TypeScript', 'MongoDB'],
    location: result.location ?? 'Remote',
    experienceYears: result.experienceYears ?? 5,
    matchScore: typeof result.score === 'number' ? result.score : undefined,
    bm25Score: typeof result.bm25Score === 'number' ? result.bm25Score : undefined,
    vectorScore: typeof result.vectorScore === 'number' ? result.vectorScore : undefined,
    hybridScore: typeof result.hybridScore === 'number' ? result.hybridScore : undefined,
    source: result.source,
    email: result.email,
    phone: result.phone,
    experience: result.experience ?? [
      {
        role: result.title ?? 'Engineering role',
        company: 'Relevant experience',
        duration: 'Available from search summary',
        description: result.summary ?? 'Detailed experience will appear here when more profile data is available.',
      },
    ],
    education: result.education,
    projects: result.projects,
    certifications: result.certifications,
  };
}

export async function getCandidateProfile(candidateId: string, result?: Partial<SearchResult> | null): Promise<CandidateProfile> {
  if (result) {
    return buildCandidateProfileFromSearchResult(candidateId, result);
  }

  try {
    const response = await fetch(`/v1/search/${encodeURIComponent(candidateId)}`);
    if (!response.ok) {
      throw new Error('Candidate profile unavailable');
    }

    const payload = await response.json();
    if (payload && typeof payload === 'object') {
      const candidate = payload as Partial<CandidateProfile> & { name?: string; title?: string; summary?: string; skills?: string[]; location?: string; experienceYears?: number; source?: string; matchScore?: number; };
      return {
        ...buildCandidateProfileFromSearchResult(candidateId, candidate),
        title: candidate.title ?? 'Resume preview',
        summary: candidate.summary ?? 'Profile details are available from the current search response.',
        skills: Array.isArray(candidate.skills) ? candidate.skills : ['Node.js', 'TypeScript', 'MongoDB'],
        location: candidate.location ?? 'Remote',
        experienceYears: candidate.experienceYears ?? 5,
        matchScore: typeof candidate.matchScore === 'number' ? candidate.matchScore : undefined,
        bm25Score: typeof candidate.bm25Score === 'number' ? candidate.bm25Score : undefined,
        vectorScore: typeof candidate.vectorScore === 'number' ? candidate.vectorScore : undefined,
        hybridScore: typeof candidate.hybridScore === 'number' ? candidate.hybridScore : undefined,
        source: candidate.source,
      };
    }
  } catch {
    // Fall back to a local profile view when the backend does not expose a dedicated candidate endpoint.
  }

  return {
    id: candidateId,
    name: 'Candidate profile',
    title: 'Resume preview',
    summary: 'Profile details are available from the current search response and will appear here when supported.',
    skills: ['Node.js', 'TypeScript', 'MongoDB'],
    location: 'Remote',
    experienceYears: 5,
  };
}
