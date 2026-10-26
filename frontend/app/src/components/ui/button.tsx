import type { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';

export function Button(props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) {
  return <button {...props} className={['rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white', props.className].filter(Boolean).join(' ')} />;
}
