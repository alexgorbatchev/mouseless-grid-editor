import type { GridLevels } from "./types";

export type GridPreset = {
  id: string;
  name: string;
  description: string;
  levels: GridLevels;
};

export const PRESETS: readonly GridPreset[] = [
  {
    id: "position_based_columns",
    name: "Position Based Columns (v1.0 Default)",
    description: "Mouseless v1.0 default: 10 horizontal columns with 30 vertical sub-keys matching keyboard rows.",
    levels: {
      level1: {
        letters: "ASDFG HJKL;",
        columns: 10,
        rows: 1,
      },
      level2: {
        letters: "QWERT YUIOP ASDFG HJKL; ZXCVB NM,./",
        columns: 1,
        rows: 30,
      },
      subgrid: {
        letters: "QWERT YUIOP ASDFG HJKL; ZXCVB NM,./",
        columns: 10,
        rows: 3,
      },
    },
  },
  {
    id: "position_based_16_9",
    name: "Position Based 16:9",
    description: "Optimized for widescreen: 5x6 blocks (left hand top, right hand bottom), inherits keys for level 2.",
    levels: {
      level1: {
        letters: "QWERT ASDFG ZXCVB YUIOP HJKL; NM,./",
        columns: 5,
        rows: 6,
      },
      level2: {
        letters: "", // Inherits from Level 1
        columns: 5,
        rows: 6,
      },
      subgrid: {
        letters: "QWERT YUIOP ASDFG HJKL; ZXCVB NM,./",
        columns: 10,
        rows: 3,
      },
    },
  },
  {
    id: "classic",
    name: "Classic Template (Legacy)",
    description: "5x5 Level 1, 6x4 Level 2, 5x5 Subgrid.",
    levels: {
      level1: {
        letters: "QY WP OE RT UI AS DF GH JN ZM XL CV B",
        columns: 5,
        rows: 5,
      },
      level2: {
        letters: "QWERT ASDFG ZXCVB YUIOP HJKLN",
        columns: 6,
        rows: 4,
      },
      subgrid: {
        letters: "YUIOP HJKLN QWERT ASDFG ZXCVB",
        columns: 5,
        rows: 5,
      },
    },
  },
];

export const DEFAULT_PRESET: GridPreset = PRESETS[0]!;
