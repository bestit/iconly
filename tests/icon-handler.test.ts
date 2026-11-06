import { describe, expect, it } from 'vitest';
import type { CustomElement } from '../src/lib/classes/custom-element.js';
import { ElementData } from '../src/lib/classes/element-data.js';
import { IconHandler, type HandlerInterface } from '../src/lib/classes/icon-handler.js';

function elementFor(config: ConstructorParameters<typeof ElementData>[1], symbol?: string, src?: string): CustomElement {
    const data = new ElementData('iconly-handler', config);
    return {
        getElementData: () => data,
        getAttributes: () => ({
            symbol,
            src,
            namespace: 'storefront',
            pack: 'default',
        }),
    } as CustomElement;
}

class TestHandler implements HandlerInterface {
    private priorityValue: number;

    public constructor(priority: number, private readonly symbol: string) {
        this.priorityValue = priority;
    }

    public supports(element: CustomElement): boolean {
        return element.getAttributes().symbol === this.symbol;
    }

    public getIcon(): Promise<string | undefined> {
        return Promise.resolve(this.symbol);
    }

    public getPriority(): number {
        return this.priorityValue;
    }

    public setPriority(priority: number): void {
        this.priorityValue = priority;
    }
}

describe('IconHandler', () => {
    it('selects the symbol handler before src when a fetch pattern exists', async () => {
        const handler = new ElementData('iconly-handler', {
            fetchPattern: '/icons/%SYMBOL%.svg',
        }).getIconHandler();
        const element = elementFor({ fetchPattern: '/icons/%SYMBOL%.svg' }, 'cart', '/fallback.svg');

        expect(handler.getHandlerList()[0]?.getPriority()).toBeGreaterThan(handler.getHandlerList()[1]?.getPriority() ?? 0);
        expect(handler.getHandler(0)?.supports(element)).toBe(true);
    });

    it('removes one handler and replaces the list from an array', () => {
        const handler = new IconHandler();
        const initial = handler.getHandlerList().length;

        handler.removeHandler(0);

        expect(handler.getHandlerList()).toHaveLength(initial - 1);

        handler.setHandlerList([new TestHandler(5, 'cart'), new TestHandler(1, 'bag')]);

        expect(handler.getHandlerList()).toHaveLength(2);
        expect(handler.getHandler(0)?.getPriority()).toBe(5);
        expect(handler.getHandler(9)).toBeUndefined();
    });
});
