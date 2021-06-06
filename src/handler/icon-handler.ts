import { ElementAttributesInterface } from '../classes/custom-element';

/* eslint-disable no-unused-vars */
export interface IconHandlerInterface {
    supports(element: string, attributes: ElementAttributesInterface): boolean,
    getIcon(element: string, attributes: ElementAttributesInterface): Promise<string>
}
/* eslint-enable no-unused-vars */

export class IconHandler {
    private iconHandlers: IconHandlerInterface[] = [];

    constructor(...params: IconHandlerInterface[]) {
        this.iconHandlers = [...params];
    }

    /**
     * @throws {Error}
     */
    public getIcon(element: string, attributes: ElementAttributesInterface): Promise<string> {
        let iconHandler: IconHandlerInterface|null = null;

        this.iconHandlers.forEach((handler) => {
            if (handler.supports(element, attributes) && iconHandler === null) {
                iconHandler = handler;
            }
        });

        if (iconHandler === null) {
            throw new Error('No handler found');
        }

        return iconHandler.getIcon(element, attributes);
    }
}
