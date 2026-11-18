import { sanitizeSvg, type SanitizerMode } from './sanitize-svg.js';

const CACHE_NAME = 'iconly';
const SVG_MEDIA_TYPE = 'image/svg+xml';
const MAX_SVG_BYTES = 1_000_000;

interface IconRequest {
    promise: Promise<string>;
    storedAt: number;
}

interface StoredIcon {
    text: string;
    storedAt: number;
}

const memory = new Map<string, IconRequest>();

function requestKey(url: string, mode: SanitizerMode): string {
    return `${mode}\n${url}`;
}

function cacheUrl(url: string, mode: SanitizerMode): string {
    const parsed = new URL(url, typeof location !== 'undefined' ? location.href : 'http://localhost/');
    parsed.searchParams.set('iconly-sanitizer', mode);
    return parsed.href;
}

function cacheAvailable(): boolean {
    return typeof window !== 'undefined' && 'caches' in window && window.isSecureContext;
}

function mediaType(header: string | null): string {
    return header?.split(';')[0]?.trim().toLowerCase() ?? '';
}

async function readStoredIcon(url: string, cacheTimeout: number, mode: SanitizerMode): Promise<StoredIcon | null> {
    if (!cacheAvailable() || cacheTimeout <= 0) {
        return null;
    }

    const storedUrl = cacheUrl(url, mode);

    try {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(storedUrl);

        if (!cached) {
            return null;
        }

        const timestamp = Number(cached.headers.get('X-Cache-Timestamp'));

        if (!Number.isFinite(timestamp) || Date.now() - timestamp >= cacheTimeout) {
            await cache.delete(storedUrl);
            return null;
        }

        return {
            text: await cached.text(),
            storedAt: timestamp,
        };
    }
    catch {
        return null;
    }
}

async function writeStoredIcon(url: string, text: string, mode: SanitizerMode): Promise<void> {
    if (!cacheAvailable()) {
        return;
    }

    try {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(cacheUrl(url, mode), new Response(text, {
            headers: {
                'Content-Type': SVG_MEDIA_TYPE,
                'X-Cache-Timestamp': Date.now().toString(),
            },
        }));
    }
    catch {
        // The in-memory entry still dedupes this page when Cache Storage is unavailable.
    }
}

async function deleteStoredIcon(url: string, mode: SanitizerMode): Promise<void> {
    if (!cacheAvailable()) {
        return;
    }

    try {
        const cache = await caches.open(CACHE_NAME);
        await cache.delete(cacheUrl(url, mode));
    }
    catch {
        // A failed delete still leaves the memory entry cleared by the caller.
    }
}

async function readLimitedText(response: Response, url: string): Promise<string> {
    const declared = Number(response.headers.get('content-length'));

    if (Number.isFinite(declared) && declared > MAX_SVG_BYTES) {
        await response.body?.cancel();
        throw new Error(`Icon ${url} could not be loaded`);
    }

    if (response.body === null) {
        const text = await response.text();

        if (new TextEncoder().encode(text).byteLength > MAX_SVG_BYTES) {
            throw new Error(`Icon ${url} could not be loaded`);
        }

        return text;
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;

    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            break;
        }

        if (value === undefined) {
            continue;
        }

        total += value.byteLength;

        if (total > MAX_SVG_BYTES) {
            await reader.cancel();
            throw new Error(`Icon ${url} could not be loaded`);
        }

        chunks.push(value);
    }

    const body = new Uint8Array(total);
    let offset = 0;

    for (const chunk of chunks) {
        body.set(chunk, offset);
        offset += chunk.byteLength;
    }

    return new TextDecoder().decode(body);
}

function sanitizedMarkup(text: string, mode: SanitizerMode): string {
    const svg = sanitizeSvg(text, mode);

    if (svg === null) {
        throw new Error('Unsafe SVG was blocked');
    }

    return new XMLSerializer().serializeToString(svg);
}

async function fetchSvg(url: string, mode: SanitizerMode): Promise<string> {
    const response = await fetch(url, {
        cache: 'default',
        credentials: 'same-origin',
        redirect: 'error',
    });
    const type = mediaType(response.headers.get('content-type'));

    if (!response.ok || type !== SVG_MEDIA_TYPE) {
        throw new Error(`Icon ${url} could not be loaded`);
    }

    return sanitizedMarkup(await readLimitedText(response, url), mode);
}

export function clearIconRequestMemory(): void {
    memory.clear();
}

export async function dropIconRequest(url: string, mode: SanitizerMode = 'strict'): Promise<void> {
    memory.delete(requestKey(url, mode));
    await deleteStoredIcon(url, mode);
}

export function loadIconText(url: string, cacheTimeout: number, mode: SanitizerMode = 'strict'): Promise<string> {
    const key = requestKey(url, mode);
    const existing = memory.get(key);
    const fresh = existing !== undefined && (cacheTimeout <= 0 || Date.now() - existing.storedAt < cacheTimeout);

    if (existing !== undefined && fresh) {
        return existing.promise;
    }

    const request: IconRequest = {
        promise: Promise.resolve(''),
        storedAt: Date.now(),
    };

    request.promise = (async () => {
        if (cacheTimeout > 0) {
            const stored = await readStoredIcon(url, cacheTimeout, mode);

            if (stored !== null && memory.get(key)?.promise === request.promise) {
                request.storedAt = stored.storedAt;
                return stored.text;
            }
        }

        const text = await fetchSvg(url, mode);

        if (memory.get(key)?.promise !== request.promise) {
            return text;
        }

        if (cacheTimeout > 0) {
            await writeStoredIcon(url, text, mode);
        }

        return text;
    })();

    memory.set(key, request);

    void request.promise.catch(() => {
        if (memory.get(key)?.promise === request.promise) {
            memory.delete(key);
        }
    });

    return request.promise;
}
