let accessToken: string | null = null;

export const getApiAccessToken = (
  promptMessage = "Enter the workspace API access token.",
): string => {
  if (accessToken) {
    return accessToken;
  }

  const enteredToken =
    typeof window === "undefined" ? null : window.prompt(promptMessage);
  if (!enteredToken?.trim()) {
    throw new Error("A workspace API access token is required.");
  }

  accessToken = enteredToken.trim();
  return accessToken;
};

export const clearApiAccessToken = (): void => {
  accessToken = null;
};
