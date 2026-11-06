import type { HandlerInterface } from '../classes/icon-handler.js';
import type { CustomElement } from '../classes/custom-element.js';

export abstract class AbstractHandler implements HandlerInterface {
    private priority: number = 0;

    constructor(priority: number) {
        this.priority = priority;
    }

    public abstract supports(element: CustomElement): boolean;

    public abstract getIcon(element: CustomElement): Promise<string | undefined>;

    public getPriority(): number {
        return this.priority;
    }

    public setPriority(priority: number): void {
        this.priority = priority;
    }
}
