default:
    @just --list

# Install the locked development dependencies
setup:
    bun install --frozen-lockfile

# Start the development preview
run *args:
    bun run dev {{ args }}
