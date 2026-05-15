import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';

const root = '/home/claude/rihlat-al-kalimat/content';
const dirs = ['words', 'persons', 'themes', 'books'];
let bad = 0;
for (const d of dirs) {
  let files;
  try { files = readdirSync(join(root, d)); } catch { continue; }
  for (const f of files) {
    if (!f.endsWith('.mdx')) continue;
    const p = join(root, d, f);
    const raw = readFileSync(p, 'utf8');
    const m = /^---\n([\s\S]*?)\n---/.exec(raw);
    if (!m) { console.log(`NOFM: ${p}`); continue; }
    try { yaml.load(m[1]); }
    catch (e) {
      bad++;
      console.log(`BAD : ${p}`);
      console.log(`     ${e.message}`);
    }
  }
}
console.log(`\n${bad} bad files`);
