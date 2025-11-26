# Mouseless Grid Editor

🔗 **[Live Demo](https://alexgorbatchev.github.io/mouseless-grid-editor/)**

A visual helper tool for customizing grid layouts in [Mouseless](https://mouseless.click) - a keyboard-driven mouse control application. 

## About

Mouseless allows you to control your mouse cursor using keyboard shortcuts and grid overlays. This editor helps you visualize and experiment with different grid configurations before applying them to your Mouseless config file.

### What you can customize:
- **Grid dimensions**: Number of columns and rows at each level
- **Grid keys**: The keyboard keys used to select cells
- **Monitor assignments**: How grids map to different monitors
- **Visual appearance**: Colors, styling, and layout options

For more information about customizing Mouseless, see the [official documentation](https://mouseless.click/docs/customizing_mouseless.html).

## Usage

To install dependencies:

```bash
bun install
```

To start a development server:

```bash
bun dev
```

To run for production:

```bash
bun start
```

## Publishing to GitHub Pages

To build and publish the project to GitHub Pages:

```bash
# Build and publish in one command
bun run deploy

# Or build and publish separately
bun run build
bun run publish
```

### Publishing Options

```bash
# Publish with a custom domain
bun run publish --cname yourdomain.com

# Use a different branch
bun run publish --branch main

# Custom commit message
bun run publish --message "Update site"
```

The publish script will:
- Create or update a `gh-pages` branch
- Copy the built files from `dist/`
- Add a `.nojekyll` file to bypass Jekyll processing
- Push to your GitHub repository
- Display the published URL

