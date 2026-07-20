interface IngestionStepIndicatorProps {
  currentStep: number;
}

const steps = [
  'Resume Upload',
  'PDF Processing',
  'Resume Parsing',
  'Embedding Generation',
  'MongoDB Ingestion',
  'Completed',
];

function getState(index: number, currentStep: number): 'complete' | 'active' | 'pending' {
  if (index < currentStep) return 'complete';
  if (index === currentStep) return 'active';
  return 'pending';
}

export function IngestionStepIndicator({ currentStep }: IngestionStepIndicatorProps) {
  const safeCurrentStep = Math.min(Math.max(currentStep, 0), steps.length - 1);

  return (
    <div className="rounded-xl border border-white/[0.07] bg-bg-surface p-4">
      <div className="flex flex-wrap gap-2">
        {steps.map((step, index) => {
          const state = getState(index, safeCurrentStep);
          const baseClasses = 'rounded-full border px-3 py-2 text-sm';
          const stateClasses =
            state === 'complete'
              ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
              : state === 'active'
                ? 'border-indigo-400/30 bg-indigo-500/10 text-indigo-300'
                : 'border-white/[0.07] bg-bg-card text-text-muted';

          return (
            <div key={step} className={`${baseClasses} ${stateClasses}`}>
              {step}
            </div>
          );
        })}
      </div>
    </div>
  );
}
