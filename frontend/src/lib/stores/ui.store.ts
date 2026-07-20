type UiState = {
  isLoading: boolean;
  selectedCandidateId: string | null;
  toast: string | null;
};

const state: UiState = {
  isLoading: false,
  selectedCandidateId: null,
  toast: null,
};

export const uiStore = {
  getState: () => ({ ...state }),
  setLoading: (value: boolean) => {
    state.isLoading = value;
  },
  selectCandidate: (candidateId: string | null) => {
    state.selectedCandidateId = candidateId;
  },
  setToast: (toast: string | null) => {
    state.toast = toast;
  },
};
