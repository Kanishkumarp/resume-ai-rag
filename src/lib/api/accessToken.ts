let accessToken: string | null = null;

export const getApiAccessToken = (): string => {
  if (accessToken) {
    return accessToken;
  }

  const enteredToken = typeof window === 'undefined'
    ? null
    : window.prompt('Enter the workspace API access token.');
  if (!enteredToken?.trim()) {
    throw new Error('A workspace API access token is required.');
  }

  accessToken = enteredToken.trim();
  return accessToken;
};

export const clearApiAccessToken = (): void => {
  accessToken = null;
};
