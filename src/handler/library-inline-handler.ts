import { AbstractHandler } from './abstract-handler';
import { ConfigInterface } from '../classes/element-data';
import { Library } from '../classes/library';
import { AttributesInterface, CustomElement } from '../classes/custom-element';

export class LibraryInlineHandler extends AbstractHandler {
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

        return !this.isUrlSource(config, symbol);
    }

    /**
     * @throws {Error}
     */
    public getIcon(
        element: CustomElement
    ): Promise<string> {
        const library: Library = element.getElementData().getLibrary();
        const attributes: AttributesInterface = element.getAttributes();

        return new Promise<string>((resolve, reject) => {
            try {
                resolve(library.getValue(attributes));
            } catch (error) {
                reject(error);
            }
        });
    }
}
