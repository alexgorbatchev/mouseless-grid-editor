import { describe, expect, it } from "bun:test";
import { findMouselessConfigPath, getMouselessConfigCandidatePaths } from "../utils/mouselessPath";

describe("mouselessPath", () => {
  it("returns platform candidate paths", () => {
    const candidates = getMouselessConfigCandidatePaths();
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.some((p) => p.includes("Mouseless/configs/config.yaml"))).toBe(true);
  });

  it("finds local config path if installed", async () => {
    const result = await findMouselessConfigPath();
    expect(result.path).toBeDefined();
    expect(typeof result.exists).toBe("boolean");
  });
});
