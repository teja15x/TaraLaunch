import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { roleSeedCollectionSchema } from '../src/lib/career-agent/knowledgeSchema';

const filePath = join(process.cwd(), 'src', 'data', 'knowledge', 'roles.seed.json');
const raw = readFileSync(filePath, 'utf-8');
const parsed = JSON.parse(raw);

const result = roleSeedCollectionSchema.safeParse(parsed);
if (!result.success) {
  console.error('roles.seed.json validation failed');
  for (const issue of result.error.issues) {
    console.error(`- ${issue.path.join('.')} :: ${issue.message}`);
  }
  process.exit(1);
}

const collection = result.data;
const count = collection.items.length;
const ids = new Set(collection.items.map((item) => item.id));

if (ids.size !== count) {
  console.error(`Duplicate IDs detected: ${count - ids.size}`);
  process.exit(1);
}

console.log(`roles.seed.json is valid. Entries: ${count}`);
if (count < collection.minTarget) {
  console.log(`Warning: below minTarget (${collection.minTarget}). Current: ${count}`);
} else {
  console.log(`Target met: ${count} >= ${collection.minTarget}`);
}
