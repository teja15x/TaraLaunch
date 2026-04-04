import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const root = process.cwd();
const promptPath = resolve(root, 'src/lib/career-agent/prompt.ts');
const goldenPath = resolve(root, 'src/lib/career-agent/prompt.golden.ts');
const lockPath = resolve(root, 'src/lib/career-agent/prompt.lock.json');

function sha256(text) {
  return createHash('sha256').update(text).digest('hex').toUpperCase();
}

const promptContent = readFileSync(promptPath, 'utf8');
const hash = sha256(promptContent);

writeFileSync(goldenPath, promptContent, 'utf8');

const lock = {
  file: 'src/lib/career-agent/prompt.ts',
  algorithm: 'SHA256',
  hash,
  lockedAt: new Date().toISOString(),
};

writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`, 'utf8');

console.log(`Prompt brain locked: ${hash}`);
