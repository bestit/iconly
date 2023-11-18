import { FetchHandler } from '../handler/fetch-handler.js';
import { LibraryRemoteHandler } from '../handler/library-remote-handler.js';
import { LibraryInlineHandler } from '../handler/library-inline-handler.js';
import { NullHandler } from '../handler/null-handler.js';
import { CustomElement } from './custom-element.js';

/* eslint-disable no-unused-vars */
export interface HandlerInterface {
    supports(
        element: CustomElement
    ): boolean,
    getIcon(
        element: CustomElement
    ): Promise<string>,
    getPriority(): number,
    setPriority(priority: number): void,
}
/* eslint-enable no-unused-vars */

export class IconHandler {
    private handlerList: HandlerInterface[];

    constructor() {
        this.handlerList = [
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
        element: CustomElement
    ): Promise<string> {
        const iconHandler = this.handlerList.find((handler) => {
            return handler.supports(element);
        });

        if (typeof iconHandler === 'undefined') {
            throw new Error('No handler found');
        }

        return iconHandler.getIcon(element);
    }

    public getHandlerList(): HandlerInterface[] {
        return this.handlerList;
    }

    public setHandlerList(...handlerList: HandlerInterface[]): this {
        this.handlerList = handlerList;
        this.order();

        return this;
    }

    public getHandler(index: number): HandlerInterface {
        return this.handlerList[index];
    }

    public addHandler(handler: HandlerInterface): this {
        this.handlerList.push(handler);
        this.order();

        return this;
    }

    public removeHandler(index: number): this {
        this.handlerList.splice(index);
        this.order();

        return this;
    }

    public order(): this {
        this.handlerList.sort((handlerA, handlerB) => handlerA.getPriority() - handlerB.getPriority());

        return this;
    }
}
