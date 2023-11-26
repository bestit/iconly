import { type HandlerInterface } from '../classes/icon-handler.js';
import { type ConfigInterface } from '../classes/element-data.js';
import { CustomElement } from '../classes/custom-element.js';

/* eslint-disable no-unused-vars */
export abstract class AbstractHandler implements HandlerInterface {
    private priority: number = 0;

    private caches: { [url: string]: Promise<Cache> } = {};

    constructor(priority: number) {
        this.priority = priority;
    }

    public abstract supports(
        element: CustomElement
    ): boolean

    public abstract getIcon(
        element: CustomElement
    ): Promise<string>

    public getPriority(): number {
        return this.priority;
    }

    public setPriority(priority: number): void {
        this.priority = priority;
    }

    /**
     * @throws {Error}
     */
    public async fetchSvg(url: string): Promise<string> {
        let response = null;

        try {
            if (typeof this.caches[url] === 'undefined') {
                this.caches[url] = new Promise((resolve, reject) => {
                    caches.open('iconly').then(cache => {
                        cache.add(url).then(() => resolve(cache)).catch((error) => reject(error));
                    });
                });
            }

            const cache = await this.caches[url];
            response = await cache.match(url);
        } catch (error) {
            // empty
        }

        if (!response) {
            throw new Error(`${url} not found`);
        }

        return response.text();
    }

    public isUrlSource(config: ConfigInterface, source: string): boolean {
        if (!(config.urlTestPattern instanceof RegExp)) {
            return false;
        }

        return source.match(config.urlTestPattern) !== null;
    }
}
/* eslint-enable no-unused-vars */
