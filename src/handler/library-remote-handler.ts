import { IconHandlerInterface } from './icon-handler';
import { ElementAttributesInterface } from '../classes/custom-element';
import { LibraryService } from '../service/library-service';
import { fetchSvg, isUrlSource } from '../utils/fetch-svg';

export class LibraryRemoteHandler implements IconHandlerInterface {
    public supports(element: string, attributes: ElementAttributesInterface): boolean {
        const symbol = LibraryService.getSymbol(element, attributes);

        if (symbol === null) {
            return false;
        }

        return isUrlSource(element, symbol);
    }

    public getIcon(element: string, attributes: ElementAttributesInterface): Promise<string> {
        const library = LibraryService.getLibrary(element);
        const source = library[attributes.namespace][attributes.pack][attributes.symbol];

        return fetchSvg(source);
    }
}
