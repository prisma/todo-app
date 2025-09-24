#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

/**
 * Simple script to create a zip file from the project
 * Usage: node create-zip.js
 */

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PROJECT_NAME = "nextjs_with_prisma_and_better_auth";
const ZIP_NAME = `${PROJECT_NAME}.tgz`;
const DEST_DIR =
  process.env.DEST_DIR || "/Users/ankur/Work/claim_deployment_demo/templates";

// Ensure destination directory exists
if (!fs.existsSync(DEST_DIR)) {
  console.log(`📁 Creating destination directory: ${DEST_DIR}`);
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

// Read .gitignore file to get exclusion patterns
function getGitignorePatterns() {
  const gitignorePath = path.join(__dirname, ".gitignore");
  if (!fs.existsSync(gitignorePath)) {
    console.warn(
      "⚠️  Warning: .gitignore file not found, using default exclusions"
    );
    return [
      "node_modules",
      ".next",
      "src/generated",
      ".env*",
      ".DS_Store",
      "*.log",
      ".vercel",
      "*.tsbuildinfo",
    ];
  }

  const gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
  const patterns = gitignoreContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((pattern) => {
      // Remove trailing slashes for tar compatibility
      return pattern.endsWith("/") ? pattern.slice(0, -1) : pattern;
    })
    .filter((pattern) => pattern !== ""); // Remove empty patterns

  return patterns;
}

// Build tar exclusion arguments
function buildExclusionArgs(patterns) {
  const excludeArgs = [];

  patterns.forEach((pattern) => {
    excludeArgs.push("--exclude", pattern);

    // Also exclude pattern with wildcard for nested matches
    if (!pattern.includes("*")) {
      excludeArgs.push("--exclude", `**/${pattern}`);
    }
  });

  // Add some additional common exclusions
  const additionalExclusions = ["._*", "**/._*", ".git", "*.swp", "*.swo"];

  additionalExclusions.forEach((pattern) => {
    excludeArgs.push("--exclude", pattern);
  });

  return excludeArgs;
}

// Main function
function createZip() {
  console.log(`🚀 Creating zip file for ${PROJECT_NAME}...`);
  console.log(`📁 Destination: ${DEST_DIR}`);

  try {
    // Get gitignore patterns
    const patterns = getGitignorePatterns();
    console.log(
      `📋 Found ${patterns.length} exclusion patterns from .gitignore`
    );

    // Build exclusion arguments
    const excludeArgs = buildExclusionArgs(patterns);

    // Create the tar command with proper options
    const tarCommand = [
      "COPYFILE_DISABLE=1",
      "tar",
      "-czf",
      ZIP_NAME,
      "--exclude=node_modules",
      "--exclude=.next",
      "--exclude=.git",
      "--exclude=.DS_Store",
      "--exclude=._*",
      "--exclude=**/._*",
      ...excludeArgs,
      ".",
    ].join(" ");

    console.log(`📦 Creating archive with command: ${tarCommand}`);

    // Execute tar command
    execSync(tarCommand, {
      cwd: __dirname,
      stdio: "inherit",
    });

    // Check if zip was created successfully
    const zipPath = path.join(__dirname, ZIP_NAME);
    if (!fs.existsSync(zipPath)) {
      throw new Error("Zip file was not created successfully");
    }

    // Get file size
    const stats = fs.statSync(zipPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(
      `✅ Archive created successfully: ${ZIP_NAME} (${fileSizeInMB} MB)`
    );

    // Move to destination directory
    const destPath = path.join(DEST_DIR, ZIP_NAME);
    fs.renameSync(zipPath, destPath);

    console.log(`📁 Moved archive to: ${destPath}`);
    console.log(`🎉 Process completed successfully!`);
  } catch (error) {
    console.error("❌ Error creating zip file:", error.message);
    process.exit(1);
  }
}

// Run the script
createZip();
