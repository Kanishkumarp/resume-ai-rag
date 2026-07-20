import apiClient from './client';

export interface WorkspaceStatsResponse {
  totalCandidates: number;
  lastIngestionAt: string | null;
}

export async function getWorkspaceStats(): Promise<WorkspaceStatsResponse> {
  try {
    const response = await apiClient.get<WorkspaceStatsResponse>('/v1/health/workspace');
    return response.data;
  } catch {
    return { totalCandidates: 0, lastIngestionAt: null };
  }
}
