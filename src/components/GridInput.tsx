import type { GridLevel } from "../types";
import { NumberInput } from "./NumberInput";

type GridInputProps = {
  label: string;
  level: GridLevel;
  onChange: (level: GridLevel) => void;
  error?: string | null;
  fallbackLetters?: string;
};

export function GridInput({ label, level, onChange, error, fallbackLetters }: GridInputProps) {
  const isInheriting = level.letters.trim() === "" && Boolean(fallbackLetters?.trim());

  return (
    <div className="mb-6 p-4 bg-[#1a1a1a] rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-semibold">{label}</h3>
        {isInheriting && (
          <span className="text-xs px-2 py-0.5 rounded bg-[#2e3c54] text-[#8ca8ff] border border-[#405680]">
            Inheriting Level 1 keys
          </span>
        )}
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor={`${label}-letters`} className="block text-sm">
              Letters:
            </label>
            {fallbackLetters && !isInheriting && (
              <button
                type="button"
                onClick={() => onChange({ ...level, letters: "" })}
                className="text-xs text-[#888] hover:text-[#bbb] underline cursor-pointer"
              >
                Clear to inherit Level 1
              </button>
            )}
          </div>
          <input
            id={`${label}-letters`}
            type="text"
            value={level.letters}
            onChange={(e) => onChange({ ...level, letters: e.target.value })}
            className={`w-full px-3 py-2 bg-[#2a2a2a] rounded border ${
              isInheriting ? "border-dashed border-[#555] text-[#aaa]" : "border-[#3a3a3a]"
            } focus:border-[#646cff] outline-none font-mono text-sm`}
            placeholder={
              fallbackLetters
                ? `Leave empty to inherit Level 1 (${fallbackLetters.slice(0, 20)}...)`
                : "Enter letters separated by spaces"
            }
          />
        </div>
        <div className="flex gap-4">
          <NumberInput label="Columns" value={level.columns} onChange={(columns) => onChange({ ...level, columns })} />
          <NumberInput label="Rows" value={level.rows} onChange={(rows) => onChange({ ...level, rows })} />
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
