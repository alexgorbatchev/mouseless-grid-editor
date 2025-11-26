import { useEffect, useState } from "react";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { GridDisplay } from "./components/GridDisplay";
import { GridInput } from "./components/GridInput";
import type { GridLevels } from "./types";
import { buildLevelGrid, createLetterGrid } from "./utils/gridGenerator";
import "./index.css";

const DEFAULT_GRID: GridLevels = {
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
};

export function App() {
  const [levels, setLevels] = useState<GridLevels>(DEFAULT_GRID);
  const [primaryGrid, setPrimaryGrid] = useState<string[][]>([]);
  const [subgridData, setSubgridData] = useState<string[][]>([]);
  const [level1Error, setLevel1Error] = useState<string | null>(null);
  const [level2Error, setLevel2Error] = useState<string | null>(null);
  const [subgridError, setSubgridError] = useState<string | null>(null);
  const [gridError, setGridError] = useState<string | null>(null);

  useEffect(() => {
    setLevel1Error(null);
    setLevel2Error(null);
    setSubgridError(null);
    setGridError(null);

    try {
      const primary = createLetterGrid(levels);
      setPrimaryGrid(primary);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setPrimaryGrid([]);

      if (errorMsg.includes("Level 1")) {
        setLevel1Error(errorMsg);
      } else if (errorMsg.includes("Level 2")) {
        setLevel2Error(errorMsg);
      } else {
        setGridError(errorMsg);
      }
    }

    try {
      const subgrid = buildLevelGrid(levels.subgrid, "Subgrid");
      setSubgridData(subgrid);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setSubgridData([]);
      setSubgridError(errorMsg);
    }
  }, [levels]);

  return (
    <div className="w-full p-8">
      <h1 className="text-4xl font-bold mb-8">Mouseless Grid Editor</h1>

      <div className="mb-8">
        <GridInput
          label="Level 1"
          level={levels.level1}
          onChange={(level1) => setLevels({ ...levels, level1 })}
          error={level1Error}
        />
        <GridInput
          label="Level 2"
          level={levels.level2}
          onChange={(level2) => setLevels({ ...levels, level2 })}
          error={level2Error}
        />
      </div>

      {gridError && <ErrorDisplay error={gridError} />}

      <div className="mb-8">
        <GridDisplay grid={primaryGrid} title="Primary Grid" fullWidth />
      </div>

      <div className="mb-8">
        <GridInput
          label="Subgrid"
          level={levels.subgrid}
          onChange={(subgrid) => setLevels({ ...levels, subgrid })}
          error={subgridError}
        />
      </div>

      <div>
        <GridDisplay grid={subgridData} title="Subgrid" />
      </div>
    </div>
  );
}

export default App;
