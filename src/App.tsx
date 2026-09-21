import { useEffect, useState } from "react";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { GridDisplay } from "./components/GridDisplay";
import { GridInput } from "./components/GridInput";
import { MouselessBar } from "./components/MouselessBar";
import { YamlModal } from "./components/YamlModal";
import { DEFAULT_PRESET, PRESETS } from "./presets";
import type { GridLevels } from "./types";
import { buildLevelGrid, createLetterGrid, resolveGridLevel } from "./utils/gridGenerator";
import { generateMouselessGridYaml } from "./utils/yamlConfig";
import "./index.css";

const STORAGE_KEY = "mouseless-grid-levels";
const STORAGE_PRESET_KEY = "mouseless-grid-preset-id";

function loadFromStorage(): GridLevels {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
  }
  return DEFAULT_PRESET.levels;
}

function loadPresetIdFromStorage(): string {
  try {
    const stored = localStorage.getItem(STORAGE_PRESET_KEY);
    if (stored) {
      return stored;
    }
  } catch (error) {
    console.error("Failed to load preset id from localStorage:", error);
  }
  return DEFAULT_PRESET.id;
}

function saveToStorage(levels: GridLevels, presetId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
    localStorage.setItem(STORAGE_PRESET_KEY, presetId);
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

export function App() {
  const [levels, setLevels] = useState<GridLevels>(loadFromStorage);
  const [activePresetId, setActivePresetId] = useState<string>(loadPresetIdFromStorage);
  const [primaryGrid, setPrimaryGrid] = useState<string[][]>([]);
  const [subgridData, setSubgridData] = useState<string[][]>([]);
  const [level1Error, setLevel1Error] = useState<string | null>(null);
  const [level2Error, setLevel2Error] = useState<string | null>(null);
  const [subgridError, setSubgridError] = useState<string | null>(null);
  const [gridError, setGridError] = useState<string | null>(null);
  const [isYamlModalOpen, setIsYamlModalOpen] = useState(false);

  const handleLevelsChange = (newLevels: GridLevels, newPresetId = "custom"): void => {
    setLevels(newLevels);
    setActivePresetId(newPresetId);
    saveToStorage(newLevels, newPresetId);
  };

  const handlePresetSelect = (presetId: string): void => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setLevels(preset.levels);
      setActivePresetId(preset.id);
      saveToStorage(preset.levels, preset.id);
    } else {
      setActivePresetId("custom");
    }
  };

  const handleReset = (): void => {
    handlePresetSelect(DEFAULT_PRESET.id);
  };

  useEffect(() => {
    setLevel1Error(null);
    setLevel2Error(null);
    setSubgridError(null);
    setGridError(null);

    try {
      const primary = createLetterGrid(levels);
      setPrimaryGrid(primary);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An error occurred";
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
      const resolvedSubgrid = resolveGridLevel(levels.subgrid, levels.level1);
      const subgrid = buildLevelGrid(resolvedSubgrid, "Subgrid");
      setSubgridData(subgrid);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An error occurred";
      setSubgridData([]);
      setSubgridError(errorMsg);
    }
  }, [levels]);

  const activePreset = PRESETS.find((p) => p.id === activePresetId);
  const currentYaml = generateMouselessGridYaml(levels, activePresetId);

  return (
    <div className="w-full p-8">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-4xl font-bold">Mouseless Grid Editor</h1>
        <div className="flex gap-2">
          <a
            href="https://github.com/alexgorbatchev/mouseless-grid-editor"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-[#2a2a2a] rounded border border-[#3a3a3a] hover:border-[#646cff] hover:bg-[#3a3a3a] transition-colors flex items-center justify-center"
            aria-label="View source on GitHub"
          >
            <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" role="img">
              <title>GitHub</title>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-[#646cff] rounded border border-[#646cff] hover:bg-[#535bf2] transition-colors font-medium cursor-pointer text-sm"
          >
            Reset to Default
          </button>
        </div>
      </div>

      <p className="mb-6 text-gray-400">
        Custom visual grid helper for{" "}
        <a
          href="https://mouseless.click/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline font-medium"
        >
          Mouseless v1.0
        </a>
        , a keyboard-driven mouse navigation tool.
      </p>

      {/* Preset & Sync Bar */}
      <MouselessBar
        levels={levels}
        activePresetId={activePresetId}
        onPresetChange={handlePresetSelect}
        onLevelsChange={(newLevels) => handleLevelsChange(newLevels, "custom")}
        onViewYaml={() => setIsYamlModalOpen(true)}
      />

      {activePreset && (
        <p className="text-xs text-gray-400 mb-6 italic">
          ℹ️ {activePreset.name}: {activePreset.description}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <GridInput
          label="Level 1"
          level={levels.level1}
          onChange={(level1) => handleLevelsChange({ ...levels, level1 })}
          error={level1Error}
        />
        <GridInput
          label="Level 2"
          level={levels.level2}
          onChange={(level2) => handleLevelsChange({ ...levels, level2 })}
          error={level2Error}
          fallbackLetters={levels.level1.letters}
        />
      </div>

      {gridError && <ErrorDisplay error={gridError} />}

      <div className="mb-8">
        <GridDisplay grid={primaryGrid} title="Primary Grid" cellWidth={80} cellHeight={40} />
      </div>

      <div className="mb-8">
        <GridInput
          label="Subgrid"
          level={levels.subgrid}
          onChange={(subgrid) => handleLevelsChange({ ...levels, subgrid })}
          error={subgridError}
          fallbackLetters={levels.level1.letters}
        />
      </div>

      <div className="mb-8">
        <GridDisplay grid={subgridData} title="Subgrid" />
      </div>

      <YamlModal isOpen={isYamlModalOpen} onClose={() => setIsYamlModalOpen(false)} yamlContent={currentYaml} />
    </div>
  );
}

export default App;
