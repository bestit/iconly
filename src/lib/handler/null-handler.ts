import { AbstractHandler } from './abstract-handler.js';

export class NullHandler extends AbstractHandler {
    public supports(): boolean {
        return true;
    }

    public getIcon(): Promise<string | undefined> {
        return Promise.resolve(undefined);
    }
}
