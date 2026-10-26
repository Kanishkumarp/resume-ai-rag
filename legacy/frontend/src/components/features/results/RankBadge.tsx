interface RankBadgeProps {
  rank: number;
}

export function RankBadge({ rank }: RankBadgeProps) {
  return <span className="rounded-full bg-indigo-500/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-200">#{rank}</span>;
}
