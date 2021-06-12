import { HandlerInterface } from '../classes/icon-handler';
import { ConfigInterface } from '../classes/element-data';
import { CustomElement } from '../classes/custom-element';

/* eslint-disable no-unused-vars */
export abstract class AbstractHandler implements HandlerInterface {
    #priority: number = 0;

    constructor(priority: number) {
        this.#priority = priority;
    }

    public abstract supports(
        element: CustomElement
    ): boolean

    public abstract getIcon(
        element: CustomElement
    ): Promise<string>

    public getPriority(): number {
        return this.#priority;
    }

    public setPriority(priority: number): void {
        this.#priority = priority;
    }

    /**
     * @throws {Error}
     */
    public async fetchSvg(url: string): Promise<string> {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText} for ${url}`);
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
