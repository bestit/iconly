import { FetchHandler } from '../handler/fetch-handler';
import { LibraryRemoteHandler } from '../handler/library-remote-handler';
import { LibraryInlineHandler } from '../handler/library-inline-handler';
import { NullHandler } from '../handler/null-handler';
import { ConfigInterface } from './element-data';
import { Library } from './library';
import { AttributesInterface } from './custom-element';

/* eslint-disable no-unused-vars */
export interface IconHandlerInterface {
    supports(
        attributes: AttributesInterface,
        config: ConfigInterface,
        library: Library
    ): boolean,
    getIcon(
        attributes: AttributesInterface,
        config: ConfigInterface,
        library: Library
    ): Promise<string>
}
/* eslint-enable no-unused-vars */

export class IconHandler {
    #iconHandlerList: IconHandlerInterface[];

    constructor() {
        this.#iconHandlerList = [
            new NullHandler(),
            new LibraryInlineHandler(),
            new LibraryRemoteHandler(),
            new FetchHandler()
        ];
    }

    /**
     * @throws {Error}
     */
    public getIcon(
        attributes: AttributesInterface,
        config: ConfigInterface,
        library: Library
    ): Promise<string> {
        let iconHandler: IconHandlerInterface|null = null;

        this.#iconHandlerList.forEach((handler) => {
            if (handler.supports(attributes, config, library) && iconHandler === null) {
                iconHandler = handler;
            }
        });

        if (iconHandler === null) {
            throw new Error('No handler found');
        }

        return iconHandler.getIcon(attributes, config, library);
    }
}
