import { SymbolHandler } from '../handler/symbol-handler.js';
import { NullHandler } from '../handler/null-handler.js';
import { SrcHandler } from '../handler/src-handler.js';
import { CustomElement } from './custom-element.js';

export interface HandlerInterface {
    supports(
        element: CustomElement
    ): boolean;
    getIcon(
        element: CustomElement
    ): Promise<string | undefined>;
    getPriority(): number;
    setPriority(priority: number): void;
}

export class IconHandler {
    private handlerList: HandlerInterface[];

    constructor() {
        this.handlerList = [
            new SymbolHandler(2),
            new SrcHandler(1),
            new NullHandler(0),
        ];
    }

    /**
     * @throws {Error}
     */
    public getIcon(
        element: CustomElement,
    ): Promise<string | undefined> {
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
        this.handlerList.sort((handlerA, handlerB) => handlerB.getPriority() - handlerA.getPriority());

        return this;
    }
}
