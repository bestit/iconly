import { IconHandlerInterface } from './icon-handler';
import { ElementAttributesInterface } from '../classes/custom-element';
import { LibraryService } from '../service/library-service';
import { fetchSvg } from '../utils/fetch-svg';

export class LibraryHandler implements IconHandlerInterface {
    public supports(attributes: ElementAttributesInterface): boolean {
        return LibraryService.isInLibrary(attributes);
    }

    /**
     * @throws {Error}
     */
    public getIcon(attributes: ElementAttributesInterface): Promise<string> {
        const library = LibraryService.getLibrary();
        const source = library[attributes.namespace][attributes.pack][attributes.symbol];

        return fetchSvg(source);
    }
}
