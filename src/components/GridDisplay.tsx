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
  
  // Calculate cell size for fullWidth grids
  const cellSize = fullWidth ? `calc(100vw / ${cols})` : '40px';

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div 
        className={`grid gap-0 border-2 border-[#646cff] ${fullWidth ? 'w-screen -ml-8' : 'inline-grid'}`}
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
