// ESM script to run Playwright tests isolated from Vitest
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Whether to run in UI mode
const isUIMode = process.argv.includes('--ui');

// Command to run Playwright directly
const command = `cross-env FORCE_COLOR=1 PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npx playwright test${isUIMode ? ' --ui' : ''}`;

console.log(`Running command: ${command}`);

// Execute the command
const child = exec(command, {
  env: { 
    ...process.env,
    // Important: disable Vitest hooks
    PLAYWRIGHT_SKIP_VITEST_HOOKS: 'true'
  }
});

// Forward stdout and stderr to parent process
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

// Handle process completion
child.on('close', (code) => {
  process.exit(code || 0);
}); 