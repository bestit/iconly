import { IconHandlerInterface } from './icon-handler';
import { ElementAttributesInterface } from '../classes/custom-element';
import { LibraryService } from '../service/library-service';
import { fetchSvg, isUrlSource } from '../utils/fetch-svg';

export class LibraryRemoteHandler implements IconHandlerInterface {
    public supports(attributes: ElementAttributesInterface): boolean {
        const symbol = LibraryService.getSymbol(attributes);

        if (symbol === null) {
            return false;
        }

        return isUrlSource(symbol);
    }

    public getIcon(attributes: ElementAttributesInterface): Promise<string> {
        const library = LibraryService.getLibrary();
        const source = library[attributes.namespace][attributes.pack][attributes.symbol];

        return fetchSvg(source);
    }
}
