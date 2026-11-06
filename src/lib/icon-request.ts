const CACHE_NAME = 'iconly';
const SVG_MEDIA_TYPE = 'image/svg+xml';

interface IconRequest {
    promise: Promise<string>;
    storedAt: number;
}

interface StoredIcon {
    text: string;
    storedAt: number;
}

const memory = new Map<string, IconRequest>();

function cacheAvailable(): boolean {
    return typeof window !== 'undefined' && 'caches' in window && window.isSecureContext;
}

function mediaType(header: string | null): string {
    return header?.split(';')[0]?.trim().toLowerCase() ?? '';
}

async function readStoredIcon(url: string, cacheTimeout: number): Promise<StoredIcon | null> {
    if (!cacheAvailable() || cacheTimeout <= 0) {
        return null;
    }

    try {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(url);

        if (!cached) {
            return null;
        }

        const timestamp = Number(cached.headers.get('X-Cache-Timestamp'));

        if (!Number.isFinite(timestamp) || Date.now() - timestamp >= cacheTimeout) {
            await cache.delete(url);
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

async function writeStoredIcon(url: string, text: string): Promise<void> {
    if (!cacheAvailable()) {
        return;
    }

    try {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(url, new Response(text, {
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

async function deleteStoredIcon(url: string): Promise<void> {
    if (!cacheAvailable()) {
        return;
    }

    try {
        const cache = await caches.open(CACHE_NAME);
        await cache.delete(url);
    }
    catch {
        // A failed delete still leaves the memory entry cleared by the caller.
    }
}

async function fetchSvg(url: string): Promise<string> {
    const response = await fetch(url, {
        cache: 'default',
        credentials: 'same-origin',
        redirect: 'error',
    });
    const type = mediaType(response.headers.get('content-type'));

    if (!response.ok || type !== SVG_MEDIA_TYPE) {
        throw new Error(`Icon ${url} could not be loaded`);
    }

    return response.text();
}

export function clearIconRequestMemory(): void {
    memory.clear();
}

export async function dropIconRequest(url: string): Promise<void> {
    memory.delete(url);
    await deleteStoredIcon(url);
}

export function loadIconText(url: string, cacheTimeout: number): Promise<string> {
    const existing = memory.get(url);
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
            const stored = await readStoredIcon(url, cacheTimeout);

            if (stored !== null && memory.get(url)?.promise === request.promise) {
                request.storedAt = stored.storedAt;
                return stored.text;
            }
        }

        const text = await fetchSvg(url);

        if (memory.get(url)?.promise !== request.promise) {
            return text;
        }

        if (cacheTimeout > 0) {
            await writeStoredIcon(url, text);
        }

        return text;
    })();

    memory.set(url, request);

    void request.promise.catch(() => {
        if (memory.get(url)?.promise === request.promise) {
            memory.delete(url);
        }
    });

    return request.promise;
}
