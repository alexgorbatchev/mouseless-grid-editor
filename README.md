Mouseless Grid Editor is an interactive visual editor and configuration manager for [Mouseless](https://mouseless.click), a keyboard-driven mouse control application for macOS, Windows, and Linux. It allows you to experiment with multi-level grid dimensions, key sequences, and subgrid mappings with real-time visual feedback, and sync grid layouts directly to your local Mouseless configuration.

🔗 **[Live Demo](https://alexgorbatchev.github.io/mouseless-grid-editor/)**

# What It Does

- **Visual Grid Modeling**: Renders full-width primary grid composites (Level 1 + Level 2) and subgrids in real time.
- **Mouseless v1.0 Presets**: Includes built-in presets such as `position_based_columns` (v1.0 default) and `position_based_16_9` for widescreen layouts.
- **Key Inheritance**: Automatically falls back to Level 1 keys when Level 2 or Subgrid keys are omitted, matching Mouseless native behavior.
- **Direct Configuration Sync**: Automatically detects and updates your active `config.yaml` file via local server API or browser File System Access API.
- **YAML Export**: Generates exact, copy-pasteable `grid_configs` YAML blocks ready for insertion into `config.yaml`.
- **Automatic Backups**: Creates a `.bak` backup copy of your existing `config.yaml` before applying modifications.

# How It Works

1. **Select a Preset or Customize**: Choose an official preset from the dropdown or configure custom dimensions and key sequences for Level 1, Level 2, and Subgrid.
2. **Preview Layouts**: Inspect the primary grid (combining Level 1 and Level 2) and the dedicated subgrid preview with custom cell dimensions.
3. **Apply to Mouseless**:
   - When running locally, click **Save to Mouseless** to write the configuration directly to your local `config.yaml`.
   - On the web, click **Copy YAML** to copy the generated configuration block to your clipboard, or **Save to File** to write to an opened file handle.

# How it Really Works

- **Config Path Resolution**: The local backend inspects platform-specific config directories in order:
  - **macOS**: `~/Library/Application Support/Mouseless/configs/config.yaml` (with fallback to the legacy container directory)
  - **Linux**: `~/.var/app/net.sonuscape.mouseless/data/mouseless/configs/config.yaml` or `~/.config/mouseless/configs/config.yaml`
  - **Windows**: `%LOCALAPPDATA%\Mouseless\configs\config.yaml`
- **Safe Section Replacement**: When saving to an existing `config.yaml`, only the `grid_configs` block is replaced. Keymaps, behavior configurations, display scaling, and style settings remain intact.
- **Automatic Pre-write Backups**: When updating an existing file on disk, the local API writes the current content to `config.yaml.bak` before saving changes.
- **Fallback Resolution**: When Level 2 letters are left empty or containing only whitespace, the grid builder resolves Level 2 using Level 1 letters, rendering the composite grid without validation errors.

# Prerequisites

- [Bun](https://bun.sh) (v1.0.0 or later) to run the local server and development tools.
- Modern web browser with File System Access API support for in-browser file syncing.

# Installation

Clone the repository and install dependencies using Bun:

```bash
bun install
```

# Quick Start

Start the local development server:

```bash
bun dev
```

Open [http://localhost:3100](http://localhost:3100) in your browser. The application will connect to the local server API and display your active Mouseless configuration status.

To start for production:

```bash
bun start
```

# Configuration

### Mouseless Config File Locations

| Platform | Path |
| :--- | :--- |
| **macOS** | `~/Library/Application Support/Mouseless/configs/config.yaml` |
| **Linux (Flatpak)** | `~/.var/app/net.sonuscape.mouseless/data/mouseless/configs/config.yaml` |
| **Linux (Native)** | `~/.config/mouseless/configs/config.yaml` |
| **Windows** | `%LOCALAPPDATA%\Mouseless\configs\config.yaml` |

### Built-in Grid Presets

| Preset | Level 1 | Level 2 | Subgrid | Description |
| :--- | :--- | :--- | :--- | :--- |
| `position_based_columns` | 10×1 (`ASDFG HJKL;`) | 1×30 (30 keys) | 10×3 (30 keys) | Mouseless v1.0 default columns preset |
| `position_based_16_9` | 5×6 (30 keys) | 5×6 (inherited) | 10×3 (30 keys) | Widescreen position-based layout |
| `classic` | 5×5 (25 keys) | 6×4 (24 keys) | 5×5 (25 keys) | Legacy 3-tier template |

# License

[MIT](LICENSE)
