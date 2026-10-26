import type { HTMLAttributes } from 'react';

export function Card(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={['rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-lg shadow-black/20', props.className].filter(Boolean).join(' ')} />;
}
