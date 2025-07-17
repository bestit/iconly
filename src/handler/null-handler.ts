import { AbstractHandler } from './abstract-handler.js';

export class NullHandler extends AbstractHandler {
    public supports(): boolean {
        return true;
    }

    /**
     * @throws {Error}
     */
    public getIcon(): Promise<string | undefined> {
        return new Promise((resolve) => {
            resolve(undefined);
        });
    }
}
