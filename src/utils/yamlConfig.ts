import type { GridLevels } from "../types";

function formatKeysValue(keys: string): string {
  const trimmed = keys.trim();
  if (trimmed === "") {
    return "''";
  }
  return trimmed;
}

export function generateMouselessGridYaml(levels: GridLevels, name = "custom_grid"): string {
  const subgridKeys = levels.subgrid.letters.trim() || levels.level1.letters.trim();
  const level1Keys = formatKeysValue(levels.level1.letters);
  const level2Keys = formatKeysValue(levels.level2.letters);

  return `grid_configs:
- name: ${name}
  always_show_subgrid: false
  hold_subgrid_key_for_nudge: false
  nudges_per_cell: 4
  strategy: subgrid
  subgrid_dims:
  - ${levels.subgrid.columns}
  - ${levels.subgrid.rows}
  subgrid_mouse_action_keys: ${subgridKeys}
  grid_defn:
  - border_width: 0.0
    callback: build_cell_strings
    keys: ${level1Keys}
    num_cells_x: ${levels.level1.columns}
    num_cells_y: ${levels.level1.rows}
  - border_width: 1.0
    callback: build_cell_strings
    keys: ${level2Keys}
    num_cells_x: ${levels.level2.columns}
    num_cells_y: ${levels.level2.rows}
  - border_width: 0.0
    callback: apply_strings_and_subgrid_to_cells
    keys: ''
    num_cells_x: 2
    num_cells_y: 1
`;
}

function cleanYamlScalar(val: string): string {
  let cleaned = val.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.trim();
}

function extractGridConfigsSection(yamlText: string): string {
  const lines = yamlText.split("\n");
  const startIndex = lines.findIndex((line) => /^grid_configs:\s*$/.test(line.trimEnd()));
  if (startIndex === -1) {
    return yamlText;
  }

  let endIndex = lines.length;
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line !== undefined && /^[a-zA-Z0-9_]+:\s*(?:$|[^\s])/.test(line)) {
      endIndex = i;
      break;
    }
  }

  return lines.slice(startIndex, endIndex).join("\n");
}

export function parseMouselessGridYaml(yamlText: string): GridLevels | null {
  const targetText = extractGridConfigsSection(yamlText);

  // Parse grid_defn items
  const gridDefnMatch = targetText.match(
    /grid_defn:\s*\n([\s\S]*?)(?=\n\s*(?:subgrid_dims|subgrid_mouse_action_keys|hold_subgrid_key_for_nudge|name|nudges_per_cell|strategy|always_show_subgrid):|$)/i
  );
  if (!gridDefnMatch?.[1]) {
    return null;
  }

  const defnItems = gridDefnMatch[1].split(/\n\s*-\s+/).filter((item) => item.trim() !== "");
  if (defnItems.length < 2) {
    return null;
  }

  const parseItem = (itemText: string): { keys: string; cols: number; rows: number } => {
    const keysMatch = itemText.match(/keys:\s*([^\n]*)/i);
    const colsMatch = itemText.match(/num_cells_x:\s*(\d+)/i);
    const rowsMatch = itemText.match(/num_cells_y:\s*(\d+)/i);

    const rawKeys = keysMatch?.[1] ? cleanYamlScalar(keysMatch[1]) : "";
    const cols = colsMatch?.[1] ? Number.parseInt(colsMatch[1], 10) : 5;
    const rows = rowsMatch?.[1] ? Number.parseInt(rowsMatch[1], 10) : 5;

    return { keys: rawKeys, cols, rows };
  };

  const level1Data = parseItem(defnItems[0]!);
  const level2Data = parseItem(defnItems[1]!);

  // Parse subgrid
  const subgridDimsMatch = targetText.match(/subgrid_dims:\s*\n\s*-\s*(\d+)\s*\n\s*-\s*(\d+)/i);
  const subgridKeysMatch = targetText.match(/subgrid_mouse_action_keys:\s*([^\n]*)/i);

  const subgridCols = subgridDimsMatch?.[1] ? Number.parseInt(subgridDimsMatch[1], 10) : 10;
  const subgridRows = subgridDimsMatch?.[2] ? Number.parseInt(subgridDimsMatch[2], 10) : 3;
  const subgridLetters = subgridKeysMatch?.[1] ? cleanYamlScalar(subgridKeysMatch[1]) : level1Data.keys;

  return {
    level1: {
      letters: level1Data.keys,
      columns: level1Data.cols,
      rows: level1Data.rows,
    },
    level2: {
      letters: level2Data.keys,
      columns: level2Data.cols,
      rows: level2Data.rows,
    },
    subgrid: {
      letters: subgridLetters,
      columns: subgridCols,
      rows: subgridRows,
    },
  };
}

export function updateMouselessConfigFile(fullYaml: string, newLevels: GridLevels, presetName = "custom_grid"): string {
  const newGridYaml = generateMouselessGridYaml(newLevels, presetName).trim();
  const lines = fullYaml.split("\n");

  const startIndex = lines.findIndex((line) => /^grid_configs:\s*$/.test(line.trimEnd()));
  if (startIndex === -1) {
    return `${fullYaml.trim()}\n\n${newGridYaml}\n`;
  }

  let endIndex = lines.length;
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line !== undefined && /^[a-zA-Z0-9_]+:\s*(?:$|[^\s])/.test(line)) {
      endIndex = i;
      break;
    }
  }

  const before = lines.slice(0, startIndex).join("\n");
  const after = lines.slice(endIndex).join("\n");

  const prefix = before.length > 0 ? `${before}\n` : "";
  const suffix = after.length > 0 ? `\n${after}` : "";

  return `${prefix}${newGridYaml}${suffix}\n`;
}
