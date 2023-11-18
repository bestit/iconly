import { AbstractHandler } from './abstract-handler.js';
import { type ConfigInterface } from '../classes/element-data.js';
import { Library } from '../classes/library.js';
import { type AttributesInterface, CustomElement } from '../classes/custom-element.js';

export class LibraryRemoteHandler extends AbstractHandler {
    public supports(
        element: CustomElement
    ): boolean {
        const config: ConfigInterface = element.getElementData().getConfig();
        const library: Library = element.getElementData().getLibrary();
        const attributes: AttributesInterface = element.getAttributes();

        const symbol = library.getValue(attributes);

        if (symbol === null) {
            return false;
        }

        return this.isUrlSource(config, symbol);
    }

    public getIcon(
        element: CustomElement
    ): Promise<string> {
        const library: Library = element.getElementData().getLibrary();
        const attributes: AttributesInterface = element.getAttributes();
        const value = library.getValue(attributes);

        if (value === null) {
            return new Promise<string>((resolve, reject) => {
                reject(new Error(`Can't find icon matching attributes: ${JSON.stringify(attributes)}`));
            });
        }

        return this.fetchSvg(value);
    }
}
