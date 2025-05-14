#!/usr/bin/env node

/**
 * Wrapper script to run Playwright tests in an isolated environment
 * This avoids conflicts with Vitest's global environment
 * 
 * This script uses CommonJS format since it's a Node script
 * @license MIT
 */

/* eslint-disable */
'use strict';

const { spawn } = require('child_process');
const path = require('path');

// Check if we should run in UI mode
const isUIMode = process.argv.includes('--ui');

console.log('Starting Playwright tests in isolated environment...');

// Construct the command to run Playwright
const args = ['playwright', 'test'];
if (isUIMode) {
  args.push('--ui');
}

// Use spawn to create a new process for Playwright
const playwrightProcess = spawn('npx', args, {
  stdio: 'inherit', // Pipe all stdio to parent process
  env: {
    ...process.env,
    // Pass all environment variables, plus any additional ones needed
    PLAYWRIGHT_SKIP_VITEST_HOOKS: 'true'
  }
});

// Handle the process completion
playwrightProcess.on('close', (code) => {
  console.log(`Playwright process exited with code ${code}`);
  process.exit(code); // Exit with the same code
});

// Handle process errors
playwrightProcess.on('error', (err) => {
  console.error('Failed to start Playwright process:', err);
  process.exit(1);
}); 