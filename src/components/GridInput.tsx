import type { GridLevel } from '../types';

type GridInputProps = {
  label: string;
  level: GridLevel;
  onChange: (level: GridLevel) => void;
  error?: string | null;
};

export function GridInput({ label, level, onChange, error }: GridInputProps) {
  return (
    <div className="mb-6 p-4 bg-[#1a1a1a] rounded-lg">
      <h3 className="text-xl font-semibold mb-3">{label}</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Letters:</label>
          <input
            type="text"
            value={level.letters}
            onChange={(e) => onChange({ ...level, letters: e.target.value })}
            className="w-full px-3 py-2 bg-[#2a2a2a] rounded border border-[#3a3a3a] focus:border-[#646cff] outline-none"
            placeholder="Enter letters separated by spaces"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm mb-1">Columns:</label>
            <input
              type="number"
              min="1"
              value={level.columns}
              onChange={(e) => onChange({ ...level, columns: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 bg-[#2a2a2a] rounded border border-[#3a3a3a] focus:border-[#646cff] outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1">Rows:</label>
            <input
              type="number"
              min="1"
              value={level.rows}
              onChange={(e) => onChange({ ...level, rows: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 bg-[#2a2a2a] rounded border border-[#3a3a3a] focus:border-[#646cff] outline-none"
            />
          </div>
        </div>
      </div>
      {error && (
        <div className="mt-3 p-3 bg-red-600 rounded">
          <p className="text-white text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
