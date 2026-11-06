import type { CustomElement } from './custom-element.js';
import { NullHandler } from '../handler/null-handler.js';
import { SrcHandler } from '../handler/src-handler.js';
import { SymbolHandler } from '../handler/symbol-handler.js';

export interface HandlerInterface {
    supports(element: CustomElement): boolean;
    getIcon(element: CustomElement): Promise<string | undefined>;
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
        this.order();
    }

    public getIcon(element: CustomElement): Promise<string | undefined> {
        try {
            const iconHandler = this.handlerList.find(handler => handler.supports(element));

            if (iconHandler === undefined) {
                return Promise.reject(new Error('No handler found'));
            }

            return Promise.resolve(iconHandler.getIcon(element));
        }
        catch (error) {
            return Promise.reject(error instanceof Error ? error : new Error(String(error)));
        }
    }

    public getHandlerList(): HandlerInterface[] {
        return this.handlerList;
    }

    public setHandlerList(handlerList: HandlerInterface[]): this {
        this.handlerList = [...handlerList];
        this.order();

        return this;
    }

    public getHandler(index: number): HandlerInterface | undefined {
        return this.handlerList[index];
    }

    public addHandler(handler: HandlerInterface): this {
        this.handlerList.push(handler);
        this.order();

        return this;
    }

    public removeHandler(index: number): this {
        this.handlerList.splice(index, 1);
        this.order();

        return this;
    }

    public order(): this {
        this.handlerList.sort((handlerA, handlerB) => handlerB.getPriority() - handlerA.getPriority());

        return this;
    }
}
