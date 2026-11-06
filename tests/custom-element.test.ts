import { afterEach, describe, expect, it, vi } from 'vitest';
import { Iconly } from '../src/index.js';
import { clearIconRequestMemory } from '../src/lib/icon-request.js';

const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0h10v10z"/></svg>';
let sequence = 0;

function nextTag(): string {
    sequence += 1;
    return `iconly-spec-${sequence}`;
}

function svgResponse(body = svg): Response {
    return new Response(body, {
        status: 200,
        headers: { 'content-type': 'image/svg+xml' },
    });
}

async function flush(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 20));
}

describe('custom element', () => {
    afterEach(() => {
        clearIconRequestMemory();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('uses the default namespace and pack and shares one request', async () => {
        const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
            void input;
            return svgResponse();
        });
        vi.stubGlobal('fetch', fetchMock);
        const tag = nextTag();

        Iconly.createElement(tag, {
            fetchPattern: '/icons/%NAMESPACE%/%PACK%/%SYMBOL%.svg',
            createIntersectionObserver: false,
        });

        const first = document.createElement(tag);
        const second = document.createElement(tag);
        first.setAttribute('symbol', 'cart');
        second.setAttribute('symbol', 'cart');
        document.body.append(first, second);
        await flush();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/icons/storefront/default/cart.svg');
        expect(first.querySelector('path')).not.toBeNull();
        expect(second.querySelector('path')).not.toBeNull();
    });

    it('keeps one request when another element connects after the first response', async () => {
        const fetchMock = vi.fn(async () => svgResponse());
        vi.stubGlobal('fetch', fetchMock);
        const tag = nextTag();

        Iconly.createElement(tag, {
            fetchPattern: '/icons/%SYMBOL%.svg',
            createIntersectionObserver: false,
        });

        const first = document.createElement(tag);
        first.setAttribute('symbol', 'cart');
        document.body.append(first);
        await flush();

        const second = document.createElement(tag);
        second.setAttribute('symbol', 'cart');
        document.body.append(second);
        await flush();

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('ignores a stale response when the symbol changes', async () => {
        let resolveFirst: ((response: Response) => void) | undefined;
        const fetchMock = vi.fn((input: RequestInfo | URL) => {
            const url = String(input);
            if (url.includes('first.svg')) {
                return new Promise<Response>((resolve) => {
                    resolveFirst = resolve;
                });
            }
            return Promise.resolve(svgResponse('<svg xmlns="http://www.w3.org/2000/svg"><path id="second" d="M1 1"/></svg>'));
        });
        vi.stubGlobal('fetch', fetchMock);
        const tag = nextTag();

        Iconly.createElement(tag, {
            fetchPattern: '/icons/%SYMBOL%.svg',
            createIntersectionObserver: false,
        });

        const element = document.createElement(tag);
        element.setAttribute('symbol', 'first');
        document.body.append(element);
        await flush();
        element.setAttribute('symbol', 'second');
        await flush();
        resolveFirst?.(svgResponse('<svg xmlns="http://www.w3.org/2000/svg"><path id="first" d="M0 0"/></svg>'));
        await flush();

        expect(element.querySelector('#second')).not.toBeNull();
        expect(element.querySelector('#first')).toBeNull();
    });

    it('loads a lazy icon when IntersectionObserver is missing', async () => {
        const fetchMock = vi.fn(async () => svgResponse());
        vi.stubGlobal('fetch', fetchMock);
        const original = window.IntersectionObserver;
        Object.defineProperty(window, 'IntersectionObserver', { configurable: true, value: undefined });
        const tag = nextTag();

        Iconly.createElement(tag, { fetchPattern: '/icons/%SYMBOL%.svg' });
        const element = document.createElement(tag);
        element.setAttribute('symbol', 'cart');
        document.body.append(element);
        await flush();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        Object.defineProperty(window, 'IntersectionObserver', { configurable: true, value: original });
    });

    it('fetches again when the element reloads', async () => {
        const fetchMock = vi.fn(async () => svgResponse());
        vi.stubGlobal('fetch', fetchMock);
        const tag = nextTag();

        Iconly.createElement(tag, {
            fetchPattern: '/icons/%SYMBOL%.svg',
            createIntersectionObserver: false,
        });
        const element = document.createElement(tag);
        element.setAttribute('symbol', 'cart');
        document.body.append(element);
        await flush();
        element.dispatchEvent(new CustomEvent(`${tag}-reload`));
        await flush();

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('blocks an unsafe svg', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => svgResponse('<svg></svg><img src="x" onerror="alert(1)">')));
        const tag = nextTag();

        Iconly.createElement(tag, {
            fetchPattern: '/icons/%SYMBOL%.svg',
            createIntersectionObserver: false,
        });
        const element = document.createElement(tag);
        const error = new Promise<Event>((resolve) => {
            element.addEventListener(`${tag}-error`, resolve);
        });
        element.setAttribute('symbol', 'cart');
        document.body.append(element);
        await error;

        expect(element.classList.contains('has--error')).toBe(true);
        expect(element.querySelector('img')).toBeNull();
    });
});
