import { useEffect, useRef, useState } from "react";
import { PRESETS } from "../presets";
import type { GridLevels } from "../types";
import { generateMouselessGridYaml, parseMouselessGridYaml, updateMouselessConfigFile } from "../utils/yamlConfig";

type MouselessBarProps = {
  levels: GridLevels;
  activePresetId: string;
  onPresetChange: (presetId: string) => void;
  onLevelsChange: (levels: GridLevels) => void;
  onViewYaml: () => void;
};

type LocalApiState = {
  available: boolean;
  configExists: boolean;
  path: string;
};

export function MouselessBar({
  levels,
  activePresetId,
  onPresetChange,
  onLevelsChange,
  onViewYaml,
}: MouselessBarProps) {
  const [localApi, setLocalApi] = useState<LocalApiState>({
    available: false,
    configExists: false,
    path: "",
  });
  const [isCopied, setIsCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showStatus = (text: string, isError = false): void => {
    setStatusMessage({ text, isError });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  useEffect(() => {
    async function checkLocalApi(): Promise<void> {
      try {
        const response = await fetch("/api/config");
        if (response.ok) {
          const data = (await response.json()) as {
            success: boolean;
            exists: boolean;
            path: string;
          };
          if (data.success) {
            setLocalApi({
              available: true,
              configExists: data.exists,
              path: data.path || "",
            });
          }
        }
      } catch {
        // Running on static hosting or local API not available
        setLocalApi({ available: false, configExists: false, path: "" });
      }
    }
    void checkLocalApi();
  }, []);

  const handleCopyYaml = async (): Promise<void> => {
    try {
      const yaml = generateMouselessGridYaml(levels, activePresetId);
      await navigator.clipboard.writeText(yaml);
      setIsCopied(true);
      showStatus("✓ YAML copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      showStatus(`Failed to copy: ${message}`, true);
    }
  };

  const handleLoadFromMouseless = async (): Promise<void> => {
    try {
      const response = await fetch("/api/config");
      const data = (await response.json()) as {
        success: boolean;
        exists: boolean;
        path: string;
        content?: string;
        parsedLevels?: GridLevels | null;
        error?: string;
      };

      if (!data.success || !data.exists) {
        showStatus(data.error || "Mouseless config file not found", true);
        return;
      }

      if (data.parsedLevels) {
        onLevelsChange(data.parsedLevels);
        showStatus("✓ Loaded grid configuration from local Mouseless!");
      } else {
        showStatus("Could not find grid_configs section in config.yaml", true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      showStatus(`Failed to load from Mouseless: ${message}`, true);
    }
  };

  const handleSaveToMouseless = async (): Promise<void> => {
    try {
      const response = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          levels,
          presetName: activePresetId,
        }),
      });

      const data = (await response.json()) as {
        success: boolean;
        message?: string;
        error?: string;
      };

      if (data.success) {
        showStatus(`✓ ${data.message || "Saved to Mouseless!"}`);
      } else {
        showStatus(data.error || "Failed to save to Mouseless", true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      showStatus(`Failed to save: ${message}`, true);
    }
  };

  const handleOpenFilePicker = async (): Promise<void> => {
    // Check if browser File System Access API is supported
    if ("showOpenFilePicker" in window) {
      try {
        const picker = window.showOpenFilePicker as (options?: {
          types?: Array<{ description: string; accept: Record<string, string[]> }>;
        }) => Promise<FileSystemFileHandle[]>;

        const [handle] = await picker({
          types: [
            {
              description: "YAML Config Files",
              accept: { "text/yaml": [".yaml", ".yml"] },
            },
          ],
        });

        if (!handle) return;
        const file = await handle.getFile();
        const text = await file.text();
        const parsed = parseMouselessGridYaml(text);

        if (parsed) {
          setFileHandle(handle);
          onLevelsChange(parsed);
          showStatus(`✓ Loaded configuration from ${file.name}!`);
        } else {
          showStatus("Could not find grid_configs section in the selected file", true);
        }
      } catch (error) {
        if ((error as { name?: string }).name !== "AbortError") {
          const message = error instanceof Error ? error.message : String(error);
          showStatus(`Could not open file: ${message}`, true);
        }
      }
    } else {
      // Fallback to standard input
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = parseMouselessGridYaml(text);
      if (parsed) {
        onLevelsChange(parsed);
        showStatus(`✓ Loaded configuration from ${file.name}!`);
      } else {
        showStatus("Could not find grid_configs in selected file", true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      showStatus(`Failed reading file: ${message}`, true);
    }
    // Reset file input
    event.target.value = "";
  };

  const handleSaveToFile = async (): Promise<void> => {
    try {
      if (fileHandle && "createWritable" in fileHandle) {
        const file = await fileHandle.getFile();
        const currentText = await file.text();
        const updated = updateMouselessConfigFile(currentText, levels, activePresetId);
        const writable = await fileHandle.createWritable();
        await writable.write(updated);
        await writable.close();
        showStatus(`✓ Saved back to ${file.name}!`);
      } else {
        // Download generated YAML snippet
        const blob = new Blob([generateMouselessGridYaml(levels, activePresetId)], {
          type: "text/yaml;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "grid_configs.yaml";
        link.click();
        URL.revokeObjectURL(url);
        showStatus("✓ Downloaded grid_configs.yaml");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      showStatus(`Failed saving file: ${message}`, true);
    }
  };

  return (
    <div className="mb-6 p-4 bg-[#1e1e1e] rounded-lg border border-[#333]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Preset Selector */}
        <div className="flex items-center gap-3">
          <label htmlFor="preset-select" className="text-sm font-semibold text-gray-300">
            Preset:
          </label>
          <select
            id="preset-select"
            value={activePresetId}
            onChange={(e) => onPresetChange(e.target.value)}
            className="px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded text-sm text-white focus:border-[#646cff] outline-none cursor-pointer"
          >
            {PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
            <option value="custom">Custom Configuration</option>
          </select>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Copy YAML */}
          <button
            type="button"
            onClick={handleCopyYaml}
            className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#383838] border border-[#444] rounded text-xs font-medium text-white transition-colors cursor-pointer flex items-center gap-1.5"
            title="Copy grid_configs YAML to clipboard"
          >
            <span>{isCopied ? "✓" : "📋"}</span>
            <span>{isCopied ? "Copied!" : "Copy YAML"}</span>
          </button>

          {/* View Full YAML */}
          <button
            type="button"
            onClick={onViewYaml}
            className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#383838] border border-[#444] rounded text-xs font-medium text-white transition-colors cursor-pointer"
            title="View complete YAML snippet"
          >
            View YAML
          </button>

          {/* Local API integration if available */}
          {localApi.available && localApi.configExists ? (
            <>
              <button
                type="button"
                onClick={handleLoadFromMouseless}
                className="px-3 py-1.5 bg-[#1f3325] hover:bg-[#274630] border border-[#386b45] text-[#7de895] rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                title={`Load from ${localApi.path}`}
              >
                <span>📥</span>
                <span>Load from Mouseless</span>
              </button>
              <button
                type="button"
                onClick={handleSaveToMouseless}
                className="px-3 py-1.5 bg-[#3a2f1b] hover:bg-[#4f3f22] border border-[#785b2c] text-[#f7c874] rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                title={`Save directly to ${localApi.path} (with .bak backup)`}
              >
                <span>💾</span>
                <span>Save to Mouseless</span>
              </button>
            </>
          ) : (
            <>
              {/* File System Access API fallback */}
              <button
                type="button"
                onClick={handleOpenFilePicker}
                className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#383838] border border-[#444] rounded text-xs font-medium text-white transition-colors cursor-pointer flex items-center gap-1.5"
                title="Open and import a Mouseless config.yaml file"
              >
                <span>📂</span>
                <span>Open config.yaml</span>
              </button>
              <button
                type="button"
                onClick={handleSaveToFile}
                className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#383838] border border-[#444] rounded text-xs font-medium text-white transition-colors cursor-pointer flex items-center gap-1.5"
                title="Save back to config.yaml or download"
              >
                <span>💾</span>
                <span>Save to File</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".yaml,.yml"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </>
          )}
        </div>
      </div>

      {/* Local path info badge or file handle indicator */}
      <div className="mt-3 pt-2 border-t border-[#2a2a2a] flex flex-wrap items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2">
          {localApi.available && localApi.configExists ? (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
              <span>
                Connected to local config: <code className="text-gray-300 font-mono">{localApi.path}</code>
              </span>
            </>
          ) : fileHandle ? (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400" />
              <span>
                Bound to open file: <code className="text-gray-300 font-mono">{fileHandle.name}</code>
              </span>
            </>
          ) : (
            <span>
              Default config location:{" "}
              <code className="text-gray-300 font-mono">
                ~/Library/Application Support/Mouseless/configs/config.yaml
              </code>
            </span>
          )}
        </div>

        {statusMessage && (
          <span className={`font-medium ${statusMessage.isError ? "text-red-400" : "text-green-400"}`}>
            {statusMessage.text}
          </span>
        )}
      </div>
    </div>
  );
}
