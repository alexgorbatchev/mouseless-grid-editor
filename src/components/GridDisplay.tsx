import type { LetterGrid } from "../types";

type GridDisplayProps = {
  grid: LetterGrid;
  title: string;
  cellWidth?: number;
  cellHeight?: number;
};

export function GridDisplay({ grid, title, cellWidth = 40, cellHeight = 40 }: GridDisplayProps) {
  if (grid.length === 0) return null;

  const cols = grid[0]?.length || 0;
  const rows = grid.length;

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div
        className="grid gap-0 border-2 border-[#646cff] inline-grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellWidth}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellHeight}px)`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="flex items-center justify-center border border-[#3a3a3a] bg-[#1a1a1a]"
              style={{ width: `${cellWidth}px`, height: `${cellHeight}px` }}
            >
              <span className="text-sm font-mono text-gray-200">{cell}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
