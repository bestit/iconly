import { ElementAttributesInterface } from '../classes/custom-element';

export interface IconHandlerInterface {
    // eslint-disable-next-line no-unused-vars
    supports(attributes: ElementAttributesInterface): boolean,
    // eslint-disable-next-line no-unused-vars
    getIcon(attributes: ElementAttributesInterface): Promise<string>
}

export class IconHandler {
    private iconHandlers: IconHandlerInterface[] = [];

    constructor(...params: IconHandlerInterface[]) {
        this.iconHandlers = [...params];
    }

    /**
     * @throws {Error}
     */
    public getIcon(attributes: ElementAttributesInterface): Promise<string> {
        let iconHandler: IconHandlerInterface|null = null;

        this.iconHandlers.forEach((handler) => {
            if (handler.supports(attributes) && iconHandler === null) {
                iconHandler = handler;
            }
        });

        if (iconHandler === null) {
            throw new Error('No handler found');
        }

        return iconHandler.getIcon(attributes);
    }
}
