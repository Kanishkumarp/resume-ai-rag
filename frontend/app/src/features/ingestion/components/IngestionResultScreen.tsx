interface IngestionResultScreenProps {
  fileName?: string | null;
  duplicate?: boolean;
}

export function IngestionResultScreen({
  fileName,
  duplicate = false,
}: IngestionResultScreenProps) {
  const successLines = [
    duplicate
      ? 'Duplicate resume detected; existing record reused'
      : 'Resume uploaded successfully',
    ...(duplicate ? [] : ['Embedding generated successfully']),
    'MongoDB ingestion completed',
    'Vector search ready',
  ];

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg text-emerald-300">✓</span>
        <div>
          <h3 className="font-semibold text-text-primary">Ingestion complete</h3>
          <p className="text-sm text-text-muted">{fileName ? `Processed ${fileName}` : 'Your resume is ready for search.'}</p>
        </div>
      </div>

      <ul className="space-y-2 text-sm text-text-muted">
        {successLines.map((line) => (
          <li key={line}>• {line}</li>
        ))}
      </ul>
    </div>
  );
}
