import { useSearchStore } from "../../../lib/stores/search.store";
import {
  getScoreBreakdown,
  getScoreDisplayMeta,
} from "../../../lib/utils/searchScore";
import type { SearchMode, SearchResult } from "../../../types/search.types";

interface ResultCardProps {
  result: SearchResult;
  selected?: boolean;
  mode?: SearchMode;
}

export function ResultCard({ result, selected, mode }: ResultCardProps) {
  const activeMode = useSearchStore((state) => state.mode);
  const resolvedMode = mode ?? activeMode;
  const scoreMeta = getScoreDisplayMeta(result, resolvedMode);
  const showBreakdown = resolvedMode === "hybrid";
  const breakdown = getScoreBreakdown(result, resolvedMode);
  const label =
    resolvedMode === "bm25"
      ? "BM25"
      : resolvedMode === "vector"
        ? "Vector"
        : scoreMeta.label;
  const breakdownText =
    resolvedMode === "hybrid"
      ? `Hybrid blend ${breakdown.hybrid?.toFixed(3) ?? "0.000"} • BM25 norm ${breakdown.bm25?.toFixed(3) ?? "0.000"} • Vector norm ${breakdown.vector?.toFixed(3) ?? "0.000"}`
      : `${label} ${scoreMeta.value.toFixed(3)}`;
  const badgeClasses = "border-red-400/15 bg-red-500/[0.07] text-red-200";

  return (
    <div
      className={`rounded-2xl border p-4 transition hover:border-red-400/20 hover:shadow-lg ${selected ? "border-red-400/30 bg-red-500/[0.05]" : "border-white/[0.08] bg-[#121211]"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold tracking-tight text-white">
            {result.name}
          </p>
          <p className="mt-1 text-xs text-slate-400">{result.title}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${badgeClasses}`}
          >
            {scoreMeta.value.toFixed(3)} {label}
          </span>
          {showBreakdown ? (
            <span className="text-[11px] text-slate-400">{breakdownText}</span>
          ) : null}
          {typeof result.rerankScore === "number" ? (
            <span
              className="text-[11px] text-emerald-300"
              title="Groq model relevance score on an arbitrary scale; not a probability or suitability percentage."
            >
              LLM rerank score {result.rerankScore.toFixed(1)}
            </span>
          ) : null}
        </div>
      </div>
      <p className="mt-3 line-clamp-3 text-sm text-slate-300">
        {result.summary}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        {result.location ? (
          <span className="rounded-full border border-white/10 px-2.5 py-1">
            {result.location}
          </span>
        ) : null}
        {result.skills?.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-white/10 px-2.5 py-1"
          >
            {skill}
          </span>
        ))}
        {typeof result.experienceYears === "number" ? (
          <span className="rounded-full border border-white/10 px-2.5 py-1">
            {result.experienceYears} years experience
          </span>
        ) : null}
        {result.educationSummary ? (
          <span className="rounded-full border border-white/10 px-2.5 py-1">
            {result.educationSummary}
          </span>
        ) : null}
      </div>
      {typeof result.bm25RawScore === "number" ||
      typeof result.vectorRawScore === "number" ? (
        <p className="mt-3 text-[11px] text-slate-500">
          Raw retrieval scores
          {typeof result.bm25RawScore === "number"
            ? ` · BM25 ${result.bm25RawScore.toFixed(3)}`
            : ""}
          {typeof result.vectorRawScore === "number"
            ? ` · Vector ${result.vectorRawScore.toFixed(3)}`
            : ""}
        </p>
      ) : null}
      {result.relevanceExplanation ? (
        <p className="mt-3 text-xs leading-5 text-slate-300">
          {result.relevanceExplanation}
        </p>
      ) : null}
      {result.evidence && result.evidence.length > 0 ? (
        <div className="mt-3 border-l-2 border-emerald-400/30 pl-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Resume evidence
          </p>
          {result.evidence.map((quote, index) => (
            <p
              key={`${index}-${quote}`}
              className="mt-1 text-xs italic leading-5 text-slate-400"
            >
              “{quote}”
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
