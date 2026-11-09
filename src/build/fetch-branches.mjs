// Reads the real branch structure of every case study's repository and writes
// src/build/data/branches.json, which the garden uses to grow one limb per branch.
//
//   npm run branches
//
// Uses git only (no API token): a bare, blob-less clone per repo in .cache/repos,
// so just the commit graph is downloaded. Re-run it to refresh the snapshot;
// commit the JSON. Repos that can't be read are skipped and keep their old entry.
//
// Private repos: the site is public, so their branch names are replaced with
// "private branch N" (structure, counts and dates stay real). Set
// SHOW_PRIVATE_BRANCHES=1 to publish the real names anyway.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects } from './data/projects.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const CACHE = join(ROOT, '.cache/repos');
const OUT = join(ROOT, 'src/build/data/branches.json');
mkdirSync(CACHE, { recursive: true });
const git = (dir, ...args) => execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 << 20 }).trim();
const old = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
const out = { ...old };

// true / false from GitHub; when GitHub won't say (rate limit, no network), keep the
// last known answer, and if there is none, assume private.
async function isPrivate(repo, previous) {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, { headers: { accept: 'application/vnd.github+json' } });
    if (res.status === 404) return true;
    if (res.ok) return !!(await res.json()).private;
  } catch (e) { /* fall through */ }
  return previous ?? true;
}

for (const p of projects) {
  const repo = p.log && p.log.repo;
  if (!repo) continue;
  const priv = await isPrivate(repo, old[p.slug] && old[p.slug].private);
  const hide = priv && !process.env.SHOW_PRIVATE_BRANCHES;
  const dir = join(CACHE, repo.replace('/', '__') + '.git');
  try {
    if (!existsSync(dir)) execFileSync('git', ['clone', '--bare', '--filter=blob:none', '--quiet', `https://github.com/${repo}`, dir], { stdio: 'inherit' });
    else git(dir, 'fetch', '--quiet', '--prune', 'origin', '+refs/heads/*:refs/heads/*');
    const head = git(dir, 'symbolic-ref', '--short', 'HEAD');
    const names = git(dir, 'for-each-ref', '--format=%(refname:short)', 'refs/heads').split('\n').filter(Boolean);
    // Positions on the default branch's first-parent line, oldest = 1
    const spine = git(dir, 'rev-list', '--first-parent', head).split('\n').reverse();
    const pos = new Map(spine.map((sha, i) => [sha, i + 1]));
    const branches = names.map(name => {
      const last = git(dir, 'log', '-1', '--format=%cI', name);
      if (name === head) return { name, default: true, commits: spine.length, last };
      // walk the branch's own first-parent line back to where it left the trunk
      const own = git(dir, 'rev-list', '--first-parent', name).split('\n');
      let n = 0, forkedAt = 0;
      for (const sha of own) { if (pos.has(sha)) { forkedAt = pos.get(sha); break; } n++; }
      const merged = git(dir, 'branch', '--merged', head, '--format=%(refname:short)').split('\n').includes(name);
      return { name, commits: n, forkedAt, merged, orphan: forkedAt === 0, last };
    });
    branches.sort((a, b) => (b.default ? 1 : 0) - (a.default ? 1 : 0) || a.forkedAt - b.forkedAt);
    if (hide) { let n = 0; for (const b of branches) if (!b.default) b.name = `private branch ${++n}`; }
    out[p.slug] = { repo, private: priv, fetched: new Date().toISOString().slice(0, 10), branches };
    console.log(`${p.slug}: ${branches.length} branches (${branches.filter(b => !b.default && !b.merged).length} open)`);
  } catch (e) {
    console.warn(`${p.slug}: skipped (${String(e.stderr || e.message).split('\n')[0]})`);
  }
}
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
