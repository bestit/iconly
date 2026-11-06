import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearIconRequestMemory, dropIconRequest, loadIconText } from '../src/lib/icon-request.js';

const svg = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
const hour = 60 * 60 * 1000;

function svgResponse(contentType = 'image/svg+xml'): Response {
    return new Response(svg, {
        status: 200,
        headers: { 'content-type': contentType },
    });
}

describe('loadIconText', () => {
    const store = new Map<string, { body: string; headers: Headers }>();

    afterEach(() => {
        clearIconRequestMemory();
        store.clear();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    function installCache(): void {
        Object.defineProperty(window, 'isSecureContext', { configurable: true, value: true });
        vi.stubGlobal('caches', {
            open: async () => ({
                async match(url: string) {
                    const entry = store.get(url);
                    if (entry === undefined) {
                        return undefined;
                    }
                    return new Response(entry.body, { headers: new Headers(entry.headers) });
                },
                async put(url: string, response: Response) {
                    store.set(url, {
                        body: await response.text(),
                        headers: new Headers(response.headers),
                    });
                },
                async delete(url: string) {
                    store.delete(url);
                    return true;
                },
            }),
        });
    }

    it('shares one fetch between concurrent and later callers', async () => {
        const fetchMock = vi.fn(async () => svgResponse());
        vi.stubGlobal('fetch', fetchMock);
        Object.defineProperty(window, 'isSecureContext', { configurable: true, value: false });

        const first = loadIconText('/icon.svg', hour);
        const second = loadIconText('/icon.svg', hour);
        await first;
        await loadIconText('/icon.svg', hour);

        expect(second).toBe(first);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('reuses a stored response for a new page load inside the hour', async () => {
        installCache();
        const fetchMock = vi.fn(async () => svgResponse('image/svg+xml; charset=utf-8'));
        vi.stubGlobal('fetch', fetchMock);

        await loadIconText('https://cdn.example/icon.svg', hour);
        clearIconRequestMemory();
        await loadIconText('https://cdn.example/icon.svg', hour);

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('fetches again after the stored copy is older than cacheTimeout', async () => {
        installCache();
        const fetchMock = vi.fn(async () => svgResponse());
        vi.stubGlobal('fetch', fetchMock);
        const start = Date.now();
        vi.spyOn(Date, 'now').mockImplementation(() => start);

        await loadIconText('/icon.svg', hour);
        clearIconRequestMemory();
        vi.spyOn(Date, 'now').mockImplementation(() => start + hour + 1);
        await loadIconText('/icon.svg', hour);

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('fetches again on the next page load when cacheTimeout is 0', async () => {
        installCache();
        const fetchMock = vi.fn(async () => svgResponse());
        vi.stubGlobal('fetch', fetchMock);

        await loadIconText('/icon.svg', 0);
        await loadIconText('/icon.svg', 0);
        clearIconRequestMemory();
        await loadIconText('/icon.svg', 0);

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(store.size).toBe(0);
    });

    it('drops a url so the next caller fetches it', async () => {
        installCache();
        const fetchMock = vi.fn(async () => svgResponse());
        vi.stubGlobal('fetch', fetchMock);
        const url = new URL('/icon.svg', window.location.href).href;

        await loadIconText(url, hour);
        await dropIconRequest(url);
        await loadIconText(url, hour);

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('rejects a response that is not an svg', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => new Response('<html></html>', {
            status: 200,
            headers: { 'content-type': 'text/html' },
        })));
        Object.defineProperty(window, 'isSecureContext', { configurable: true, value: false });

        await expect(loadIconText('/icon.svg', hour)).rejects.toThrow(/could not be loaded/);
    });
});
