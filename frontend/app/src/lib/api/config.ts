const viteEnv = (
  typeof import.meta !== 'undefined' &&
  import.meta &&
  typeof import.meta.env !== 'undefined'
    ? import.meta.env
    : undefined
) as { VITE_API_BASE_URL?: string } | undefined;
const runtimeEnv =
  typeof globalThis !== 'undefined'
    ? (
        globalThis as typeof globalThis & {
          process?: { env?: Record<string, string | undefined> };
        }
      ).process?.env
    : undefined;

export const apiBaseUrl =
  viteEnv?.VITE_API_BASE_URL || runtimeEnv?.VITE_API_BASE_URL || "/";
