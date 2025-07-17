import { type HandlerInterface } from '../classes/icon-handler.js';
import { CustomElement } from '../classes/custom-element.js';

export abstract class AbstractHandler implements HandlerInterface {
    private priority: number = 0;

    constructor(priority: number) {
        this.priority = priority;
    }

    public abstract supports(
        element: CustomElement
    ): boolean;

    public abstract getIcon(
        element: CustomElement
    ): Promise<string | undefined>;

    public getPriority(): number {
        return this.priority;
    }

    public setPriority(priority: number): void {
        this.priority = priority;
    }

    private isFresh(timestamp: string, cacheTimeout: number) {
        const now = Date.now();
        const cachedTime = parseInt(timestamp);
        return now - cachedTime < cacheTimeout;
    }

    private async clearExpiredCacheEntries(cache: Cache, cacheTimeout: number): Promise<void> {
        const all = await cache.keys();

        for (const request of all) {
            const cachedResponse = await cache.match(request.url);

            if (cachedResponse) {
                const timestamp = cachedResponse.headers.get('X-Cache-Timestamp');

                if (timestamp && !this.isFresh(timestamp, cacheTimeout)) {
                    await cache.delete(request.url);
                }
            }
        }
    }

    /**
     * @throws {Error}
     */
    public async fetchSvg(url: string, element: CustomElement): Promise<string> {
        const rejectMessage = `Icon ${url} could not be loaded`;
        const contentType = 'image/svg+xml';

        try {
            const cacheTimeout = element.getElementData().getConfig().cacheTimeout;

            if (!window?.caches || !window?.isSecureContext || !cacheTimeout) {
                const networkResponse = await fetch(url);

                if (!networkResponse.ok || networkResponse.headers.get('content-type') !== contentType) {
                    return Promise.reject(rejectMessage);
                }

                return networkResponse.text();
            }

            const cache = await caches.open('iconly');

            await this.clearExpiredCacheEntries(cache, cacheTimeout);

            const cachedResponse = await cache.match(url);

            if (cachedResponse) {
                const timestamp = cachedResponse.headers.get('X-Cache-Timestamp');

                if (timestamp && this.isFresh(timestamp, cacheTimeout)) {
                    return cachedResponse.text();
                }
            }

            const networkResponse = await fetch(url);

            if (!networkResponse.ok || networkResponse.headers.get('content-type') !== contentType) {
                return Promise.reject(rejectMessage);
            }

            const tempResponse = networkResponse.clone();
            const newResponse = new Response(tempResponse.body, {
                headers: {
                    ...Object.fromEntries(tempResponse.headers.entries()),
                    'X-Cache-Timestamp': Date.now().toString(),
                },
            });

            await cache.put(url, newResponse);

            return networkResponse.text();
        }
        catch (error) {
            throw new Error(rejectMessage, {
                cause: error,
            });
        }
    }
}
