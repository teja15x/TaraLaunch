import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const root = process.cwd();
const promptPath = resolve(root, 'src/lib/career-agent/prompt.ts');
const goldenPath = resolve(root, 'src/lib/career-agent/prompt.golden.ts');
const lockPath = resolve(root, 'src/lib/career-agent/prompt.lock.json');

function sha256(text) {
  return createHash('sha256').update(text).digest('hex').toUpperCase();
}

function fail(message) {
  console.error(`Prompt integrity check failed: ${message}`);
  process.exit(1);
}

if (!existsSync(promptPath)) fail('Missing src/lib/career-agent/prompt.ts');
if (!existsSync(goldenPath)) fail('Missing src/lib/career-agent/prompt.golden.ts');
if (!existsSync(lockPath)) fail('Missing src/lib/career-agent/prompt.lock.json');

const promptContent = readFileSync(promptPath, 'utf8');
const goldenContent = readFileSync(goldenPath, 'utf8');
const lockRaw = readFileSync(lockPath, 'utf8').replace(/^\uFEFF/, '');
const lock = JSON.parse(lockRaw);

const currentHash = sha256(promptContent);
const goldenHash = sha256(goldenContent);

if (typeof lock.hash !== 'string' || !lock.hash.trim()) {
  fail('Lock file hash is missing or invalid.');
}

const lockedHash = lock.hash.trim().toUpperCase();

if (currentHash !== lockedHash) {
  fail(
    `prompt.ts hash mismatch.\nExpected(lock): ${lockedHash}\nActual(current): ${currentHash}\nIf intentional, regenerate lock and golden file explicitly.`
  );
}

if (goldenHash !== lockedHash) {
  fail(
    `prompt.golden.ts hash mismatch.\nExpected(lock): ${lockedHash}\nActual(golden): ${goldenHash}\nGolden copy drifted.`
  );
}

console.log('Prompt integrity check passed.');
