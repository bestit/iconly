import { ElementAttributesInterface } from '../classes/custom-element';

export interface IconHandlerInterface {
    // eslint-disable-next-line no-unused-vars
    supports(attributes: ElementAttributesInterface): boolean,
    // eslint-disable-next-line no-unused-vars
    getIcon(attributes: ElementAttributesInterface): Promise<string|null>
}

export class IconHandler {
    private iconHandlers: IconHandlerInterface[] = [];

    constructor(...params: IconHandlerInterface[]) {
        this.iconHandlers = [...params];
    }

    async getIcon(attributes: ElementAttributesInterface): Promise<string|null> {
        let iconHandler: IconHandlerInterface|null = null;

        this.iconHandlers.forEach((handler) => {
            if (handler.supports(attributes) && iconHandler === null) {
                iconHandler = handler;
            }
        });

        // eslint-disable-next-line no-return-await
        return await iconHandler.getIcon(attributes);
    }
}
