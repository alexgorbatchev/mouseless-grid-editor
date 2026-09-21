import { describe, expect, it } from "bun:test";
import { PRESETS } from "../presets";
import { generateMouselessGridYaml, parseMouselessGridYaml, updateMouselessConfigFile } from "../utils/yamlConfig";

describe("generateMouselessGridYaml", () => {
  it("generates valid yaml for position_based_columns", () => {
    const preset = PRESETS[0]!;
    const yaml = generateMouselessGridYaml(preset.levels, "position_based_columns");

    expect(yaml).toContain("grid_configs:");
    expect(yaml).toContain("name: position_based_columns");
    expect(yaml).toContain("keys: ASDFG HJKL;");
    expect(yaml).toContain("num_cells_x: 10");
    expect(yaml).toContain("num_cells_y: 1");
    expect(yaml).toContain("num_cells_y: 30");
    expect(yaml).toContain("subgrid_dims:\n  - 10\n  - 3");
  });

  it("handles blank level2 keys with empty string quote", () => {
    const preset = PRESETS[1]!; // position_based_16_9
    const yaml = generateMouselessGridYaml(preset.levels, "position_based_16_9");

    expect(yaml).toContain("keys: ''");
    expect(yaml).toContain("name: position_based_16_9");
  });
});

describe("parseMouselessGridYaml", () => {
  it("parses generated yaml back into GridLevels", () => {
    const preset = PRESETS[0]!;
    const yaml = generateMouselessGridYaml(preset.levels, "position_based_columns");
    const parsed = parseMouselessGridYaml(yaml);

    expect(parsed).not.toBeNull();
    expect(parsed?.level1.columns).toBe(10);
    expect(parsed?.level1.rows).toBe(1);
    expect(parsed?.level1.letters).toBe("ASDFG HJKL;");
    expect(parsed?.level2.columns).toBe(1);
    expect(parsed?.level2.rows).toBe(30);
    expect(parsed?.level2.letters).toBe("QWERT YUIOP ASDFG HJKL; ZXCVB NM,./");
    expect(parsed?.subgrid.columns).toBe(10);
    expect(parsed?.subgrid.rows).toBe(3);
    expect(parsed?.subgrid.letters).toBe("QWERT YUIOP ASDFG HJKL; ZXCVB NM,./");
  });

  it("parses yaml with empty level2 keys properly", () => {
    const preset = PRESETS[1]!; // position_based_16_9
    const yaml = generateMouselessGridYaml(preset.levels, "position_based_16_9");
    const parsed = parseMouselessGridYaml(yaml);

    expect(parsed).not.toBeNull();
    expect(parsed?.level2.letters).toBe("");
  });
});

describe("updateMouselessConfigFile", () => {
  it("replaces grid_configs without getting truncated by letters like Z", () => {
    const originalYaml = `app_version: 1.0.0
grid_configs:
- name: old_grid
  grid_defn:
  - keys: ASDFG HJKL;
    num_cells_x: 10
    num_cells_y: 1
  - keys: QWERT YUIOP ASDFG HJKL; ZXCVB NM,./
    num_cells_x: 1
    num_cells_y: 30
  - keys: ''
    num_cells_x: 2
    num_cells_y: 1
keyboard_layout:
  id: com.apple.keylayout.US
keymaps:
  name: mac
`;
    const preset = PRESETS[0]!;
    const updated = updateMouselessConfigFile(originalYaml, preset.levels, "position_based_columns");

    expect(updated).toContain("keyboard_layout:\n  id: com.apple.keylayout.US");
    expect(updated).toContain("keymaps:\n  name: mac");
    expect(updated).not.toContain("name: old_grid");
    // Ensure grid_defn[2] appears exactly once and has not been duplicated or mangled
    const countDefn2 = (updated.match(/callback: apply_strings_and_subgrid_to_cells/g) || []).length;
    expect(countDefn2).toBe(1);
  });
});
