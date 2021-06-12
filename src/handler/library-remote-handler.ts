import { AbstractHandler } from './abstract-handler';
import { ConfigInterface } from '../classes/element-data';
import { Library } from '../classes/library';
import { AttributesInterface, CustomElement } from '../classes/custom-element';

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

        return this.fetchSvg(library.getValue(attributes));
    }
}
