# Changelog

## 2.0.0-beta.1

The package is focused on loading an icon into one custom element. `src` can point at a full icon URL. Lazy loading is the default. Flip, rotate, and the old library helpers are gone.

Icons that share a URL are requested once and kept for an hour. The SVG is reduced to graphic elements before it is inserted. Symbol values cannot escape the icon directory, and only `http:` and `https:` URLs are fetched.

The published package is ESM-only, with types next to the bundle. The repository uses pnpm, tests, and GitHub Actions for checks and npm publish.

## 1.2.1-beta.1

Repeated requests for the same icon are cached. The build also publishes a minified bundle.

## 1.2.0

The package build is modern ESM. The ES5, UMD, and CommonJS outputs are gone, and so is the webpack dev server.

## 1.1.1

Package exports are adjusted so Vite can import the package. The runtime is unchanged.

## 1.1.0

Dependencies are updated to clear security advisories. This is the stable release of the Spryker integration work.

## 1.0.6-beta.5

The custom element module is part of the package exports, so Spryker can import it directly.

## 1.0.6-beta.3

Element setup and icon fetching are adjusted for the Spryker integration.

## 1.0.5

Republished without code changes.

## 1.0.4

`createElement` can register an element without defining it in `customElements`. The published package includes the TypeScript source.

## 1.0.3

Development dependencies are updated to address security advisories.

## 1.0.2

The package name in the readme and the published version number are corrected.

## 1.0.1

The project is renamed to Iconly and published as `@best-it/iconly`. One page can register several elements, each with its own config and handlers. Icons can load when they enter the viewport, and load and error events bubble with the element data. Builds are produced for both ES5 and modern bundles.

## 1.0.0

First release. A custom element inlines an SVG icon from a configured source.
