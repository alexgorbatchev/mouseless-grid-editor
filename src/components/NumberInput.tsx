type NumberInputProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

export function NumberInput({ label, value, onChange, min = 1, max }: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      onChange(min);
      return;
    }

    const num = parseInt(val, 10);
    if (Number.isNaN(num)) return;

    let clampedValue = Math.max(min, num);
    if (max !== undefined) {
      clampedValue = Math.min(max, clampedValue);
    }
    onChange(clampedValue);
  };

  return (
    <div className="flex-1">
      <label htmlFor={`input-${label}`} className="block text-sm mb-1">
        {label}:
      </label>
      <div className="flex gap-2">
        <input
          id={`input-${label}`}
          type="text"
          value={value}
          onChange={handleChange}
          className="flex-1 px-3 py-2 bg-[#2a2a2a] rounded border border-[#3a3a3a] focus:border-[#646cff] outline-none"
        />
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="px-3 py-2 bg-[#2a2a2a] rounded border border-[#3a3a3a] hover:border-[#646cff] hover:bg-[#3a3a3a]"
        >
          ▼
        </button>
        <button
          type="button"
          onClick={() => {
            const newValue = value + 1;
            onChange(max !== undefined ? Math.min(max, newValue) : newValue);
          }}
          className="px-3 py-2 bg-[#2a2a2a] rounded border border-[#3a3a3a] hover:border-[#646cff] hover:bg-[#3a3a3a]"
        >
          ▲
        </button>
      </div>
    </div>
  );
}
