import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const mode = process.argv[2];
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const prerelease = manifest.version.includes('-');

if (mode === 'public' && prerelease) {
    console.error(`Refusing to publish ${manifest.version} as latest. Use pnpm run publish:beta.`);
    process.exit(1);
}

const build = spawnSync('pnpm', ['run', 'build'], { stdio: 'inherit' });

if (build.status !== 0) {
    process.exit(build.status ?? 1);
}

const args = ['publish', '--access', 'public', '--no-git-checks'];

if (mode === 'dry') {
    args.push('--dry-run');
}

if (mode === 'beta' || prerelease) {
    args.push('--tag', 'beta');
}

const publish = spawnSync('pnpm', args, { stdio: 'inherit' });
process.exit(publish.status ?? 1);
