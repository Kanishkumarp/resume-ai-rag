interface ScorePillProps {
  score: number;
}

export function ScorePill({ score }: ScorePillProps) {
  return <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs text-emerald-300">{score.toFixed(2)}</span>;
}
