#!/usr/bin/env bun
import { existsSync } from "fs";
import { writeFile } from "fs/promises";
import path from "path";
import { $ } from "bun";

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
📦 GitHub Pages Publisher

Usage: bun run publish.ts [options]

Options:
  --branch <name>         Git branch for GitHub Pages (default: "gh-pages")
  --repo <url>            Git repository URL (auto-detected from git remote)
  --message <msg>         Commit message (default: "Deploy to GitHub Pages")
  --cname <domain>        Custom domain for GitHub Pages
  --help, -h              Show this help message

Prerequisites:
  - Git repository initialized
  - GitHub repository set as remote origin
  - Built files in dist/ directory (run 'bun run build' first)

Example:
  bun run build.ts
  bun run publish.ts --cname example.com
`);
  process.exit(0);
}

const parseArgs = (): Record<string, string> => {
  const config: Record<string, string> = {};
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg?.startsWith("--")) continue;

    const nextArg = args[i + 1];
    if (arg.includes("=")) {
      const [key, value] = arg.slice(2).split("=", 2);
      if (key && value) config[key] = value;
    } else if (nextArg && !nextArg.startsWith("--")) {
      config[arg.slice(2)] = nextArg;
      i++;
    }
  }

  return config;
};

const args = parseArgs();
const branch = args.branch || "gh-pages";
const commitMessage = args.message || "Deploy to GitHub Pages";
const cname = args.cname;
const distDir = path.join(process.cwd(), "dist");

console.log("\n📦 Starting GitHub Pages publish process...\n");

// Verify dist directory exists
if (!existsSync(distDir)) {
  console.error("❌ Error: dist/ directory not found. Run 'bun run build' first.");
  process.exit(1);
}

try {
  // Get repository info
  console.log("🔍 Checking git repository...");
  const hasRemote = await $`git remote -v`.text();
  
  if (!hasRemote.includes("origin")) {
    console.error("❌ Error: No git remote 'origin' found. Add a remote first:");
    console.error("   git remote add origin <your-repo-url>");
    process.exit(1);
  }

  const currentBranch = await $`git rev-parse --abbrev-ref HEAD`.text();
  console.log(`✓ Current branch: ${currentBranch.trim()}`);

  // Check for uncommitted changes
  const status = await $`git status --porcelain`.text();
  if (status.trim()) {
    console.warn("⚠️  Warning: You have uncommitted changes in your working directory.");
  }

  // Create temporary directory for gh-pages
  const tempDir = path.join(process.cwd(), ".gh-pages-temp");
  console.log(`\n📁 Preparing ${branch} branch...`);

  // Check if gh-pages branch exists
  const branches = await $`git branch -a`.text();
  const branchExists = branches.includes(branch);

  if (branchExists) {
    // Clone existing gh-pages branch
    await $`git worktree add ${tempDir} ${branch}`.quiet();
    
    // Clean the directory but keep .git
    const files = await $`ls -A ${tempDir}`.text();
    const filesToRemove = files
      .split("\n")
      .filter((f) => f && f !== ".git")
      .map((f) => path.join(tempDir, f));
    
    if (filesToRemove.length > 0) {
      await $`rm -rf ${filesToRemove}`.quiet();
    }
  } else {
    // Create orphan branch
    console.log(`✓ Creating new ${branch} branch...`);
    await $`git worktree add --detach ${tempDir}`.quiet();
    process.chdir(tempDir);
    await $`git checkout --orphan ${branch}`.quiet();
    await $`git rm -rf . || true`.quiet();
    process.chdir("..");
  }

  // Copy dist contents to temp directory
  console.log("📋 Copying build files...");
  await $`cp -r ${distDir}/* ${tempDir}/`.quiet();

  // Add CNAME if specified
  if (cname) {
    console.log(`✓ Adding CNAME: ${cname}`);
    await writeFile(path.join(tempDir, "CNAME"), cname);
  }

  // Add .nojekyll to bypass Jekyll processing
  await writeFile(path.join(tempDir, ".nojekyll"), "");

  // Commit and push
  process.chdir(tempDir);
  await $`git add -A`.quiet();
  
  const hasChanges = await $`git diff --cached --quiet`.nothrow().quiet();
  
  if (hasChanges.exitCode !== 0) {
    console.log("💾 Committing changes...");
    await $`git commit -m ${commitMessage}`.quiet();
    
    console.log(`🚀 Pushing to ${branch}...`);
    await $`git push origin ${branch} --force`.quiet();
    
    console.log(`\n✅ Successfully published to GitHub Pages!`);
    
    // Get remote URL for display
    const remoteUrl = await $`git remote get-url origin`.text();
    const cleanUrl = remoteUrl.trim().replace(/\.git$/, "");
    
    console.log(`\n📍 Your site will be available at:`);
    if (cname) {
      console.log(`   https://${cname}`);
    } else {
      const urlMatch = cleanUrl.match(/github\.com[:/](.+?)\/(.+)/);
      if (urlMatch) {
        const [, owner, repo] = urlMatch;
        console.log(`   https://${owner}.github.io/${repo}/`);
      }
    }
    console.log(`\n💡 Note: It may take a few minutes for changes to appear.\n`);
  } else {
    console.log("ℹ️  No changes to publish.");
  }

  // Cleanup
  process.chdir("..");
  await $`git worktree remove ${tempDir} --force`.quiet();

} catch (error) {
  console.error("\n❌ Error during publish:", error);
  
  // Cleanup on error
  const tempDir = path.join(process.cwd(), ".gh-pages-temp");
  if (existsSync(tempDir)) {
    try {
      process.chdir(path.dirname(tempDir));
      await $`git worktree remove ${tempDir} --force`.nothrow().quiet();
    } catch {}
  }
  
  process.exit(1);
}
