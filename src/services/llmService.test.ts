import test from "node:test";
import assert from "node:assert/strict";
import { LLMService } from "./llmService";
import { env } from "../config/environment";

test("rerankCandidates preserves hybrid order when Groq is not configured", async () => {
  const originalApiKey = env.groqApiKey;
  env.groqApiKey = "";
  try {
    const service = new LLMService();
    const ranked = await service.rerankCandidates(
      "node.js backend engineer",
      [
        { resumeId: "1", snippet: "Frontend React developer" },
        {
          resumeId: "2",
          snippet: "Node.js backend engineer with MongoDB experience",
        },
      ],
      3,
    );

    assert.equal(ranked.results[0]?.resumeId, "1");
    assert.equal(ranked.results[1]?.resumeId, "2");
    assert.equal(ranked.rerankApplied, false);
    assert.ok(
      ranked.warnings.some((warning) => warning.includes("GROQ_API_KEY")),
    );
  } finally {
    env.groqApiKey = originalApiKey;
  }
});

test("rerankCandidates accepts only known IDs and verbatim resume evidence", async () => {
  const originalApiKey = env.groqApiKey;
  const originalFetch = globalThis.fetch;
  env.groqApiKey = "test-key";
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                results: [
                  {
                    resumeId: "2",
                    rerankScore: 92.5,
                    relevanceExplanation: "Strong Node backend match.",
                    evidence: ["Built Node.js services", "Invented credential"],
                  },
                  {
                    resumeId: "unknown",
                    rerankScore: 100,
                    relevanceExplanation: "Unknown",
                    evidence: [],
                  },
                  {
                    resumeId: "2",
                    rerankScore: 99,
                    relevanceExplanation: "Duplicate",
                    evidence: [],
                  },
                ],
              }),
            },
          },
        ],
      }),
      { status: 200 },
    )) as typeof fetch;

  try {
    const service = new LLMService();
    const ranked = await service.rerankCandidates(
      "Node backend engineer",
      [
        {
          resumeId: "1",
          snippet: "Frontend React developer",
          hybridScore: 0.8,
        },
        {
          resumeId: "2",
          snippet: "Built Node.js services using MongoDB",
          hybridScore: 0.6,
        },
      ],
      2,
    );

    assert.deepEqual(
      ranked.results.map((candidate) => candidate.resumeId),
      ["2", "1"],
    );
    assert.equal(ranked.results[0]?.hybridScore, 0.6);
    assert.equal(ranked.results[0]?.rerankScore, 92.5);
    assert.deepEqual(ranked.results[0]?.evidence, ["Built Node.js services"]);
    assert.equal(ranked.rerankApplied, true);
  } finally {
    globalThis.fetch = originalFetch;
    env.groqApiKey = originalApiKey;
  }
});

test("rerankCandidates limits resume context to stay within Groq token budgets", async () => {
  const originalApiKey = env.groqApiKey;
  const originalFetch = globalThis.fetch;
  let requestBody: Record<string, unknown> | undefined;
  env.groqApiKey = "test-key";
  globalThis.fetch = (async (_input, init) => {
    requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                results: [
                  {
                    resumeId: "candidate-0",
                    rerankScore: 80,
                    relevanceExplanation: "Relevant experience.",
                    evidence: [],
                  },
                ],
              }),
            },
          },
        ],
      }),
      { status: 200 },
    );
  }) as typeof fetch;

  try {
    const candidates = Array.from({ length: 15 }, (_, index) => ({
      resumeId: `candidate-${index}`,
      role: "Backend Engineer",
      skills: ["Node.js", "MongoDB"],
      snippet: "resume detail ".repeat(500),
    }));
    const ranked = await new LLMService().rerankCandidates(
      "backend engineer",
      candidates,
      10,
    );
    const messages = requestBody?.messages as Array<{
      content: string;
    }>;
    const submitted = JSON.parse(messages[1]!.content) as {
      candidates: Array<{ resumeExcerpt: string }>;
    };

    assert.equal(ranked.rerankApplied, true);
    assert.equal(submitted.candidates.length, 12);
    assert.ok(
      submitted.candidates.every(
        (candidate) => candidate.resumeExcerpt.length <= 600,
      ),
    );
    assert.equal(requestBody?.max_tokens, 1024);
    assert.equal(requestBody?.model, "openai/gpt-oss-20b");
  } finally {
    globalThis.fetch = originalFetch;
    env.groqApiKey = originalApiKey;
  }
});

test("rerankCandidates exposes Groq's safe error message and retains original results", async () => {
  const originalApiKey = env.groqApiKey;
  const originalFetch = globalThis.fetch;
  env.groqApiKey = "test-key";
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        error: { message: "The requested model has been decommissioned." },
      }),
      { status: 404 },
    )) as typeof fetch;

  try {
    const service = new LLMService();
    const ranked = await service.rerankCandidates("backend engineer", [
      { resumeId: "1", snippet: "Backend developer" },
    ]);

    assert.equal(ranked.rerankApplied, false);
    assert.equal(ranked.results[0]?.resumeId, "1");
    assert.ok(ranked.warnings[0]?.includes("HTTP 404"));
    assert.ok(ranked.warnings[0]?.includes("decommissioned"));
    assert.equal(ranked.warnings[0]?.includes("test-key"), false);
  } finally {
    globalThis.fetch = originalFetch;
    env.groqApiKey = originalApiKey;
  }
});

test("summarizeCandidateFit respects the configured max token budget", async () => {
  const service = new LLMService();
  const summary = await service.summarizeCandidateFit(
    "node backend engineer",
    {
      resumeId: "1",
      snippet:
        "A very experienced backend engineer with deep expertise in Node.js, TypeScript, MongoDB, and distributed systems for enterprise products",
    },
    { style: "short", maxTokens: 40 },
  );

  assert.ok(
    summary.length <= 120,
    "Expected the summary to be trimmed to the configured size budget",
  );
  assert.ok(
    summary.includes("Strong fit") || summary.includes("Candidate"),
    "Expected the summary to include a clear fit rationale",
  );
});

test("generateAnswer falls back to a deterministic response when no Groq key is configured", async () => {
  const service = new LLMService();
  const answer = await service.generateAnswer("backend engineer", [
    {
      resumeId: "1",
      name: "Ada",
      role: "Backend Engineer",
      snippet: "Node.js and MongoDB experience",
    },
  ]);

  assert.ok(
    answer.includes("backend engineer") ||
      answer.includes("Ada") ||
      answer.includes("candidate"),
    "Expected the answer to mention the query or strongest candidate",
  );
});
