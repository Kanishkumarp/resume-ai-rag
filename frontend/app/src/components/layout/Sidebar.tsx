import { useChatStore } from "../../lib/stores/chat.store";
import { useSearchStore } from "../../lib/stores/search.store";
import { ResumeUploadCard } from "../../features/ingestion/components/ResumeUploadCard";
import { BrandAvatar } from "./BrandAvatar";
import { ClearChatButton } from "./ClearChatButton";
import { HybridWeightPanel } from "./HybridWeightPanel";
import { ResultsLimitSelect } from "./ResultsLimitSelect";
import { SearchModeNav } from "./SearchModeNav";
import { RotateCcw, Settings2 } from "lucide-react";

export function Sidebar() {
  const mode = useSearchStore((state) => state.mode);
  const filters = useSearchStore((state) => state.filters);
  const setFilters = useSearchStore((state) => state.setFilters);
  const reset = useSearchStore((state) => state.reset);
  const clearMessages = useChatStore((state) => state.clearMessages);
  const updateFilters = (values: Partial<typeof filters>) =>
    setFilters({ ...filters, ...values });

  const handleReset = () => {
    reset();
    clearMessages();
  };

  return (
    <aside className="w-full shrink-0 rounded-3xl border border-white/[0.09] bg-[#0e0e0d]/95 p-4 shadow-2xl shadow-black/30 backdrop-blur lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:w-full lg:overflow-y-auto">
      <div className="space-y-5">
        <BrandAvatar />

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Retrieval mode
            </p>
            <Settings2 size={14} className="text-slate-600" />
          </div>
          <SearchModeNav
            activeMode={mode}
            onChange={(value) => useSearchStore.getState().setMode(value)}
          />
        </div>

        {mode === "hybrid" ? <HybridWeightPanel /> : null}

        <details className="group rounded-2xl border border-white/[0.07] bg-white/[0.025]">
          <summary className="flex cursor-pointer list-none items-center justify-between px-3.5 py-3 text-xs font-semibold text-white [&::-webkit-details-marker]:hidden">
            Candidate filters
            <span className="text-[10px] font-normal text-slate-500">
              Optional
            </span>
          </summary>
          <div className="space-y-3 border-t border-white/[0.06] px-3.5 py-3.5">
            <label className="block text-[10px] font-medium text-slate-400">
              Skills <span className="text-slate-600">· any match</span>
              <input
                type="text"
                value={filters.skills?.join(", ") ?? ""}
                onChange={(event) =>
                  updateFilters({
                    skills: event.target.value
                      .split(",")
                      .map((skill) => skill.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="React, Python, AWS"
                className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-black/20 px-2.5 py-2 text-xs text-white outline-none placeholder:text-slate-600 focus:border-red-400/30"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-[10px] font-medium text-slate-400">
                Min. years
                <input
                  type="number"
                  min="0"
                  max="80"
                  value={filters.minYearsExperience ?? ""}
                  onChange={(event) =>
                    updateFilters({
                      minYearsExperience: event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    })
                  }
                  className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-black/20 px-2.5 py-2 text-xs text-white outline-none focus:border-red-400/30"
                />
              </label>
              <label className="block text-[10px] font-medium text-slate-400">
                Max. years
                <input
                  type="number"
                  min="0"
                  max="80"
                  value={filters.maxYearsExperience ?? ""}
                  onChange={(event) =>
                    updateFilters({
                      maxYearsExperience: event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    })
                  }
                  className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-black/20 px-2.5 py-2 text-xs text-white outline-none focus:border-red-400/30"
                />
              </label>
            </div>
            {(
              [
                ["location", "Location", "e.g. Bengaluru"],
                ["title", "Job title", "e.g. Backend Engineer"],
                ["education", "Education", "e.g. Computer Science"],
              ] as const
            ).map(([field, label, placeholder]) => (
              <label
                key={field}
                className="block text-[10px] font-medium text-slate-400"
              >
                {label}
                <input
                  type="text"
                  value={filters[field] ?? ""}
                  onChange={(event) =>
                    updateFilters({ [field]: event.target.value })
                  }
                  placeholder={placeholder}
                  className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-black/20 px-2.5 py-2 text-xs text-white outline-none placeholder:text-slate-600 focus:border-red-400/30"
                />
              </label>
            ))}
          </div>
        </details>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5">
          <div className="mb-3">
            <p className="text-sm font-semibold text-white">
              Result preferences
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Tune how many profiles appear.
            </p>
          </div>
          <ResultsLimitSelect />
        </div>

        <section aria-label="Resume ingestion">
          <ResumeUploadCard variant="compact" />
        </section>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2.5 text-xs font-medium text-slate-400 transition hover:border-red-400/25 hover:text-white"
          >
            <RotateCcw size={13} /> Reset filters
          </button>
          <ClearChatButton />
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-400/10 bg-emerald-500/[0.035] p-3">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
          <p className="text-[11px] leading-5 text-slate-500">
            Search filters are applied to the available resume metadata.
          </p>
        </div>
      </div>
    </aside>
  );
}
