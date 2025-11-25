import type { GridLevel, GridLevels, LetterGrid } from '../types';

export function buildLevelGrid(level: GridLevel, levelName: string): string[][] {
  const blocks: string[] = level.letters.trim().split(/\s+/);
  
  if (blocks.length === 0) {
    throw new Error(`${levelName} letters string cannot be empty`);
  }

  const letters: string = blocks.join('');
  const required: number = level.columns * level.rows;
  
  if (letters.length < required) {
    throw new Error(
      `${levelName} requires at least ${required} letters (${level.columns} cols × ${level.rows} rows), but only ${letters.length} provided`
    );
  }
  
  const letterCount: Map<string, number> = new Map();
  for (const letter of letters) {
    const count: number = letterCount.get(letter) || 0;
    letterCount.set(letter, count + 1);
  }
  
  const duplicates: string[] = [];
  for (const [letter, count] of letterCount) {
    if (count > 1) {
      duplicates.push(`"${letter}" (${count} times)`);
    }
  }
  
  if (duplicates.length > 0) {
    throw new Error(`${levelName} contains duplicate letters: ${duplicates.join(', ')}`);
  }
  
  const grid: string[][] = [];
  let index = 0;
  
  for (let row = 0; row < level.rows; row++) {
    const currentRow: string[] = [];
    
    for (let col = 0; col < level.columns; col++) {
      const letter: string | undefined = letters[index % letters.length];
      if (letter === undefined) {
        throw new Error(`${levelName} letter at index ${index} is undefined`);
      }
      currentRow.push(letter);
      index++;
    }
    
    grid.push(currentRow);
  }
  
  return grid;
}

export function createLetterGrid({ level1, level2 }: GridLevels): LetterGrid {
  const level1Grid: string[][] = buildLevelGrid(level1, 'Level 1');
  const level2Grid: string[][] = buildLevelGrid(level2, 'Level 2');

  const generatedPairs: Set<string> = new Set();

  const finalGrid: LetterGrid = [];
  const totalRows: number = level1.rows * level2.rows;
  const totalCols: number = level1.columns * level2.columns;
  
  for (let row = 0; row < totalRows; row++) {
    const currentRow: string[] = [];
    const level1Row: number = Math.floor(row / level2.rows);
    const level2Row: number = row % level2.rows;
    
    for (let col = 0; col < totalCols; col++) {
      const level1Col: number = Math.floor(col / level2.columns);
      const level2Col: number = col % level2.columns;
      
      const firstLetter = level1Grid[level1Row]?.[level1Col];
      const secondLetter = level2Grid[level2Row]?.[level2Col];
      
      if (firstLetter === undefined || secondLetter === undefined) {
        throw new Error(`Missing letter at position [${row}, ${col}]`);
      }
      
      const pair: string = firstLetter + secondLetter;
      
      if (generatedPairs.has(pair)) {
        throw new Error(`Duplicate pair detected: "${pair}" at position [${row}, ${col}]`);
      }
      
      generatedPairs.add(pair);
      currentRow.push(pair);
    }
    
    finalGrid.push(currentRow);
  }
  
  return finalGrid;
}
