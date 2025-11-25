import type { LetterGrid } from '../types';

type GridDisplayProps = {
  grid: LetterGrid;
  title: string;
  fullWidth?: boolean;
};

export function GridDisplay({ grid, title, fullWidth = false }: GridDisplayProps) {
  if (grid.length === 0) return null;

  const cols = grid[0]?.length || 0;
  const rows = grid.length;
  
  // Calculate cell size - account for borders (cols + 1 borders at 2px each)
  const borderWidth = (cols + 1) * 2;
  const cellSize = fullWidth ? `calc((98vw - ${borderWidth}px) / ${cols})` : '40px';

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div 
        className={`grid gap-0 border-2 border-[#646cff] inline-grid`}
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellSize})`,
          gridTemplateRows: `repeat(${rows}, ${cellSize})`
        }}
      >
        {grid.map((row, rowIndex) => 
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="flex items-center justify-center border border-[#3a3a3a] bg-[#1a1a1a]"
            >
              <span className="text-sm">{cell}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
