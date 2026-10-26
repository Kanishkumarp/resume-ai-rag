import test from "node:test";
import assert from "node:assert/strict";
import { AxiosError, type AxiosResponse } from "axios";
import apiClient from "./client";
import { clearApiAccessToken } from "./accessToken";

test("re-prompts once and retries a protected request after token rejection", async () => {
  const originalAdapter = apiClient.defaults.adapter;
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const promptMessages: string[] = [];
  const authorizationHeaders: string[] = [];
  const promptAnswers = ["stale-token", "current-token"];
  let requests = 0;

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      prompt: (message: string) => {
        promptMessages.push(message);
        return promptAnswers.shift() ?? null;
      },
    },
  });

  apiClient.defaults.adapter = async (config) => {
    requests += 1;
    authorizationHeaders.push(String(config.headers.Authorization ?? ""));

    if (requests === 1) {
      const response: AxiosResponse = {
        data: { message: "Unauthorized." },
        status: 401,
        statusText: "Unauthorized",
        headers: {},
        config,
      };
      throw new AxiosError(
        "Unauthorized",
        AxiosError.ERR_BAD_REQUEST,
        config,
        undefined,
        response,
      );
    }

    return {
      data: { ok: true },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    };
  };

  clearApiAccessToken();
  try {
    const response = await apiClient.get("/v1/search/hybrid");

    assert.equal(response.status, 200);
    assert.deepEqual(authorizationHeaders, [
      "Bearer stale-token",
      "Bearer current-token",
    ]);
    assert.equal(promptMessages.length, 2);
    assert.match(promptMessages[1] ?? "", /previous token was rejected/i);
  } finally {
    apiClient.defaults.adapter = originalAdapter;
    clearApiAccessToken();
    if (originalWindow) {
      Object.defineProperty(globalThis, "window", originalWindow);
    } else {
      Reflect.deleteProperty(globalThis, "window");
    }
  }
});
