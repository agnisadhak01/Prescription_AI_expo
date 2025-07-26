#!/usr/bin/env node

/**
 * Version Validation Script
 * 
 * Purpose: Validates version numbers, changelog updates, and release readiness
 * Usage: node scripts/validate-version.js [--check-only] [--version 1.0.7]
 * 
 * This script is referenced in development-workflow.mdc for automated version validation
 */

const fs = require('fs');
const path = require('path');

// Configuration
const APP_JSON_PATH = path.join(__dirname, '..', 'app.json');
const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');
const CHANGELOG_PATH = path.join(__dirname, '..', 'docs', 'TECHNICAL_CHANGELOG_v1.0.6.md');
const RELEASE_NOTES_PATH = path.join(__dirname, '..', 'docs', 'RELEASE_NOTES_v1.0.6.md');

// ANSI color codes for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ERROR: ${message}`, 'red');
  process.exit(1);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️  WARNING: ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Parse command line arguments
const args = process.argv.slice(2);
const checkOnly = args.includes('--check-only');
const versionArg = args.find(arg => arg.startsWith('--version='))?.split('=')[1];

// Read and parse JSON files
function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    error(`Failed to read ${filePath}: ${err.message}`);
  }
}

// Validate semantic versioning
function isValidSemanticVersion(version) {
  const semverRegex = /^\d+\.\d+\.\d+$/;
  return semverRegex.test(version);
}

// Compare versions
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    if (parts1[i] > parts2[i]) return 1;
    if (parts1[i] < parts2[i]) return -1;
  }
  return 0;
}

// Check if changelog exists for version
function checkChangelog(version) {
  const changelogFile = path.join(__dirname, '..', 'docs', `TECHNICAL_CHANGELOG_v${version}.md`);
  const releaseNotesFile = path.join(__dirname, '..', 'docs', `RELEASE_NOTES_v${version}.md`);
  
  const changelogExists = fs.existsSync(changelogFile);
  const releaseNotesExist = fs.existsSync(releaseNotesFile);
  
  if (!changelogExists) {
    warning(`Changelog file not found: docs/TECHNICAL_CHANGELOG_v${version}.md`);
  } else {
    success(`Changelog file exists: docs/TECHNICAL_CHANGELOG_v${version}.md`);
  }
  
  if (!releaseNotesExist) {
    warning(`Release notes file not found: docs/RELEASE_NOTES_v${version}.md`);
  } else {
    success(`Release notes file exists: docs/RELEASE_NOTES_v${version}.md`);
  }
  
  return changelogExists && releaseNotesExist;
}

// Main validation function
function validateVersion() {
  info('Starting version validation...');
  
  // Read configuration files
  const appJson = readJsonFile(APP_JSON_PATH);
  const packageJson = readJsonFile(PACKAGE_JSON_PATH);
  
  // Extract current versions
  const currentVersion = appJson.expo.version;
  const currentVersionCode = appJson.expo.android.versionCode;
  const packageVersion = packageJson.version;
  
  info(`Current app version: ${currentVersion} (versionCode: ${currentVersionCode})`);
  info(`Package version: ${packageVersion}`);
  
  // Validate semantic versioning
  if (!isValidSemanticVersion(currentVersion)) {
    error(`Invalid semantic version format: ${currentVersion}`);
  }
  
  if (!isValidSemanticVersion(packageVersion)) {
    error(`Invalid package version format: ${packageVersion}`);
  }
  
  // Check version consistency
  if (currentVersion !== packageVersion) {
    error(`Version mismatch: app.json (${currentVersion}) vs package.json (${packageVersion})`);
  }
  
  success('Version format validation passed');
  
  // Check versionCode is positive integer
  if (!Number.isInteger(currentVersionCode) || currentVersionCode <= 0) {
    error(`Invalid versionCode: ${currentVersionCode}. Must be a positive integer.`);
  }
  
  success('VersionCode validation passed');
  
  // Check documentation
  const docsExist = checkChangelog(currentVersion);
  
  // Summary
  log('\n📋 Validation Summary:', 'blue');
  success(`Version: ${currentVersion}`);
  success(`VersionCode: ${currentVersionCode}`);
  success(`Package version: ${packageVersion}`);
  
  if (docsExist) {
    success('Documentation files exist');
  } else {
    warning('Some documentation files are missing');
  }
  
  if (checkOnly) {
    info('Check-only mode: No files will be modified');
  }
  
  success('Version validation completed successfully!');
}

// Run validation
try {
  validateVersion();
} catch (err) {
  error(`Validation failed: ${err.message}`);
} 