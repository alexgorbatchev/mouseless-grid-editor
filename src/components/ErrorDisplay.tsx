type ErrorDisplayProps = {
  error: string | null;
};

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg">
      <p className="text-red-300 font-mono text-sm">{error}</p>
    </div>
  );
}
