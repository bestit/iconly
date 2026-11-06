# Iconly

Iconly registers a custom element that loads an SVG icon and inlines it. After the icon is in the page you can style it, animate it, or change the SVG with script.

The package is ESM-only. Shopware, Nuxt, and a plain HTML module script all import it. `require('@best-it/iconly')` is not supported.

## Installation

```bash
pnpm add @best-it/iconly
```

```bash
npm install @best-it/iconly
```

## Use it

Register the element once in the browser. `createElement` touches `window`, so call it from client code.

Nuxt:

```ts
// plugins/iconly.client.ts
import { Iconly } from '@best-it/iconly';

export default defineNuxtPlugin(() => {
    Iconly.createElement('iconly', {
        fetchPattern: '/icons/%NAMESPACE%/%PACK%/%SYMBOL%.svg',
    });
});
```

Shopware administration and storefront plugins use the same import from the plugin entry:

```ts
import { Iconly } from '@best-it/iconly';

Iconly.createElement('iconly', {
    fetchPattern: '/icons/%NAMESPACE%/%PACK%/%SYMBOL%.svg',
});
```

Plain HTML can load the built file directly. The bundle has no bare imports:

```html
<script type="module">
    import { Iconly } from './index.js';

    Iconly.createElement('iconly', {
        fetchPattern: '/icons/%NAMESPACE%/%PACK%/%SYMBOL%.svg',
    });
</script>

<iconly symbol="my-icon"></iconly>
```

`namespace` and `pack` fall back to `storefront` and `default`:

```html
<iconly symbol="my-icon" pack="default" namespace="storefront"></iconly>
<iconly symbol="my-icon"></iconly>
```

An absolute or same-origin URL skips the pattern:

```html
<iconly src="https://cdn.example/icon.svg"></iconly>
```

Read or replace the config after registration:

```ts
const element = Iconly.getElement('iconly');

element?.setConfig({
    fetchPattern: '/icons/%NAMESPACE%/%PACK%/%SYMBOL%.svg',
    defaultPack: 'YOUR_PACK',
    defaultNamespace: 'YOUR_NAMESPACE',
});

element?.getConfig();
```

`setConfig` accepts any subset of the config and fills the rest from the defaults.

### Loading

`loading` defaults to `lazy`. The icon is requested when it enters the viewport. `eager` requests it immediately. If the browser has no `IntersectionObserver`, a lazy icon loads immediately.

```html
<iconly symbol="my-icon" loading="eager"></iconly>
<iconly symbol="my-icon" loading="lazy"></iconly>
```

The viewport check uses one shared observer. Pass its options as `intersectionObserver`:

```ts
Iconly.createElement('iconly', {
    fetchPattern: '/icons/%SYMBOL%.svg',
    intersectionObserver: {
        rootMargin: '100px',
    },
});
```

### Requests and updates

Several elements that ask for the same icon share one `fetch`. DevTools shows one row for that URL. The response is kept for one hour (`cacheTimeout`), including across reloads. After the hour, the next element makes one new request and the page shares it.

Set a shorter `cacheTimeout` in milliseconds when icons change more often. `0` skips the stored copy: each page load calls `fetch` once for that URL, and the other icons on the page still share it.

```ts
Iconly.createElement('iconly', {
    fetchPattern: '/icons/%SYMBOL%.svg',
    cacheTimeout: 60 * 60 * 1000,
});
```

A host can send `Cache-Control: public, max-age=3600` so the hourly request itself can come from the browser disk cache.

Iconly does not register a service worker. An app that already has one should precache the same URLs Iconly requests and answer with status 200 and `Content-Type: image/svg+xml`. Use a Cache Storage name other than `iconly`. Inside the hour, Iconly answers from its own copy and does not call `fetch`. On the first request, after the hour, and when `cacheTimeout` is `0`, `fetch` goes through the page's service worker, which can respond while offline. Set `cacheTimeout: 0` when that worker should be asked on every page load.

Dispatch `<tag>-reload` to drop the saved copy and request the icon again:

```js
document.querySelector('iconly')?.dispatchEvent(new CustomEvent('iconly-reload'));
```

### Security

`namespace`, `pack`, and `symbol` are encoded and cannot contain `/`, `\`, or `..`. Only `http:` and `https:` URLs are requested. Set `allowedOrigins` to refuse any other origin. Leave it unset to allow the URLs you pass in `src`.

```ts
Iconly.createElement('iconly', {
    allowedOrigins: [window.location.origin],
});
```

The SVG is parsed as XML and reduced to graphic elements and geometry attributes before it is inserted. Script, event handlers, `foreignObject`, `use`, links, and external URLs are removed. `svgDisallowed` is an extra denylist on top of that allowlist. An empty list does not turn the allowlist off.

### Events

`iconly-loaded` and `iconly-error` bubble. The detail is typed as `IconlyLoadedDetail` or `IconlyErrorDetail`.

```ts
import type { IconlyLoadedDetail } from '@best-it/iconly';

element.addEventListener('iconly-loaded', (event) => {
    const detail = (event as CustomEvent<IconlyLoadedDetail>).detail;
    detail.fetch({ symbol: 'other-icon' });
});
```

### Handlers

Iconly picks the first handler that supports the element, highest priority first:

- `SymbolHandler` uses `fetchPattern` with `symbol`, `pack`, and `namespace`.
- `SrcHandler` uses `src`.
- `NullHandler` matches everything else and leaves the element's content alone.

```ts
import type { HandlerInterface } from '@best-it/iconly';

const handlers = Iconly.getElement('iconly')?.getIconHandler();

handlers?.getHandlerList();
handlers?.getHandler(0)?.setPriority(99);
handlers?.order();

class CustomHandler implements HandlerInterface {
    public supports(): boolean {
        return false;
    }

    public getIcon(): Promise<string | undefined> {
        return Promise.resolve(undefined);
    }

    public getPriority(): number {
        return 10;
    }

    public setPriority(): void {}
}

handlers?.addHandler(new CustomHandler());
handlers?.removeHandler(0);
handlers?.setHandlerList([new CustomHandler()]);
```
