#!/usr/bin/env node

/**
 * Taskmaster CLI launcher
 * 
 * This script launches the Taskmaster CLI from the project's scripts directory.
 * It ensures that the Taskmaster modules are loaded correctly.
 */

const path = require('path');
const { spawn } = require('child_process');

// Get the path to the Taskmaster CLI
const taskmasterCliPath = path.join(__dirname, '..', 'Taskmaster', 'cli.js');

// Spawn the CLI process
const child = spawn('node', [taskmasterCliPath], {
  stdio: 'inherit',
  shell: true
});

// Handle any errors
child.on('error', (error) => {
  console.error('Error running Taskmaster:', error.message);
  process.exit(1);
});

// Handle the exit code
child.on('close', (code) => {
  process.exit(code);
}); 