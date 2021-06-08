import { FetchHandler } from '../handler/fetch-handler';
import { LibraryRemoteHandler } from '../handler/library-remote-handler';
import { LibraryInlineHandler } from '../handler/library-inline-handler';
import { NullHandler } from '../handler/null-handler';
import { ConfigInterface } from './element-data';
import { Library } from './library';
import { AttributesInterface } from './custom-element';

/* eslint-disable no-unused-vars */
export interface HandlerInterface {
    supports(
        attributes: AttributesInterface,
        config: ConfigInterface,
        library: Library
    ): boolean,
    getIcon(
        attributes: AttributesInterface,
        config: ConfigInterface,
        library: Library
    ): Promise<string>,
    getPriority(): number,
    setPriority(priority: number): void,
}
/* eslint-enable no-unused-vars */

export class IconHandler {
    #handlerList: HandlerInterface[];

    constructor() {
        this.#handlerList = [
            new NullHandler(0),
            new LibraryInlineHandler(1),
            new LibraryRemoteHandler(2),
            new FetchHandler(3)
        ];
    }

    /**
     * @throws {Error}
     */
    public getIcon(
        attributes: AttributesInterface,
        config: ConfigInterface,
        library: Library
    ): Promise<string> {
        let iconHandler: HandlerInterface|null = null;

        this.#handlerList.forEach((handler) => {
            if (handler.supports(attributes, config, library) && iconHandler === null) {
                iconHandler = handler;
            }
        });

        if (iconHandler === null) {
            throw new Error('No handler found');
        }

        return iconHandler.getIcon(attributes, config, library);
    }

    public getHandlerList(): HandlerInterface[] {
        return this.#handlerList;
    }

    public setHandlerList(...handlerList: HandlerInterface[]): this {
        this.#handlerList = handlerList;
        this.order();

        return this;
    }

    public getHandler(index: number): HandlerInterface {
        return this.#handlerList[index];
    }

    public addHandler(handler: HandlerInterface): this {
        this.#handlerList.push(handler);
        this.order();

        return this;
    }

    public removeHandler(index: number): this {
        this.#handlerList.splice(index);
        this.order();

        return this;
    }

    public order(): this {
        this.#handlerList.sort((handlerA, handlerB) => handlerA.getPriority() - handlerB.getPriority());

        return this;
    }
}
