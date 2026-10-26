export const getApiAccessToken = (
  promptMessage = 'Enter the workspace API access token.',
): string => {
  const enteredToken =
    typeof window === 'undefined' ? null : window.prompt(promptMessage);
  if (!enteredToken?.trim()) {
    throw new Error('A workspace API access token is required.');
  }

  return enteredToken.trim();
};
