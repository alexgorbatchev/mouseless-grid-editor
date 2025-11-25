export type GridLevel = {
  letters: string;
  rows: number;
  columns: number;
};

export type GridLevels = {
  level1: GridLevel;
  level2: GridLevel;
  subgrid: GridLevel;
};

export type LetterGrid = string[][];
