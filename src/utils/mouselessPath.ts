import { homedir } from "node:os";

export function getMouselessConfigCandidatePaths(): string[] {
  const home = process.env.HOME || homedir();
  const localAppData = process.env.LOCALAPPDATA || "";
  const appData = process.env.APPDATA || "";

  const candidates: string[] = [];

  // macOS (v1.0 location and legacy sandbox location)
  if (home) {
    candidates.push(`${home}/Library/Application Support/Mouseless/configs/config.yaml`);
    candidates.push(`${home}/Library/Containers/net.sonuscape.mouseless/Data/.mouseless/configs/config.yaml`);
    // Linux Flatpak and standard XDG locations
    candidates.push(`${home}/.var/app/net.sonuscape.mouseless/data/mouseless/configs/config.yaml`);
    candidates.push(`${home}/.config/mouseless/configs/config.yaml`);
  }

  // Windows
  if (localAppData) {
    candidates.push(`${localAppData}/Mouseless/configs/config.yaml`);
  }
  if (appData) {
    candidates.push(`${appData}/Mouseless/configs/config.yaml`);
  }

  return candidates;
}

export async function findMouselessConfigPath(): Promise<{ path: string; exists: boolean }> {
  const candidates = getMouselessConfigCandidatePaths();

  for (const candidate of candidates) {
    const file = Bun.file(candidate);
    const exists = await file.exists();
    if (exists) {
      return { path: candidate, exists: true };
    }
  }

  const defaultPath = candidates[0] || `${homedir()}/Library/Application Support/Mouseless/configs/config.yaml`;
  return { path: defaultPath, exists: false };
}
