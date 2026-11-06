# Development

This file is for working on the repository. It is not included in the published package.

## Setup

This repository needs Node `^20.19.0 || >=22.12.0`. Corepack installs the pnpm version from the `packageManager` field:

```bash
corepack enable
pnpm install
```

## Tests and build

```bash
pnpm test
pnpm run typecheck
pnpm run lint
pnpm run build
```

`pnpm test` runs Vitest. `pnpm run build` writes `dist/index.js` and `dist/index.d.ts`.

## Try a local build in another project

`pnpm link` replaces `yarn link`. Run it from the project that should consume Iconly, and pass the path to this repository. pnpm 12 does not link by package name from a global store.

Build here first. The package entry is `dist`, so an app imports the build, not `src`.

```bash
pnpm install
pnpm run build
```

From the other project:

```bash
pnpm link ../iconly
```

pnpm symlinks this repository into that project's `node_modules` and records a `link:` dependency. In a workspace it also adds an override in the root `pnpm-workspace.yaml`, so the local copy is used across the workspace. Import `@best-it/iconly` the same way as the published package.

After further changes, run `pnpm run build` again in this repository. The other project reads the updated `dist` through the symlink.

Stop using the local build from the other project:

```bash
pnpm unlink @best-it/iconly
```

That removes the symlink and the workspace override, then reinstalls the registry version when the dependency is still declared. If the `link:` entry was only for this trial, delete it and run `pnpm install`.

## Release

`pnpm run publish:public` refuses a prerelease version. `pnpm run publish:beta` publishes the current beta from this machine. The usual release path is the tag workflow below.

## GitHub Actions

Workflows in `.github/workflows` run after they are on GitHub. Both use `ubuntu-latest` and Node 24. `pnpm/action-setup` reads the `packageManager` pin.

1. Merge `.github/workflows/ci.yml` and `.github/workflows/publish.yml`.
2. In the repository, open Settings, then Actions, then General. Allow actions for this repository. Confirm the prompt on the Actions tab the first time.
3. CI runs on pull requests and on pushes to `release/next`. It installs with `pnpm install --frozen-lockfile`, then lints, typechecks, tests, builds, and runs publint. It needs no secrets. `pnpm audit` is a separate job. On the Actions tab, open CI, choose Run workflow, and run it once on `release/next` before the first release.
4. npm publish uses trusted publishing. On npmjs.com, open `@best-it/iconly`, then Settings, then Trusted Publisher. Connect GitHub organization `bestit`, repository `iconly`, and workflow filename `publish.yml`. The workflow permission is `id-token: write` and `contents: read`.
5. If trusted publishing is unavailable, create a granular npm token that can publish this package. Add it under GitHub Settings, then Secrets and variables, then Actions, as `NPM_TOKEN`. Leave that secret unset when trusted publishing is connected.
6. Pushing a tag such as `v2.0.0` or `v2.0.0-beta.1` starts the publish workflow. The tag has to match `package.json`. A version that contains a hyphen is published with the `beta` dist-tag. Limit who can push tags. Under Settings, then Branches, require the CI check before merging.
