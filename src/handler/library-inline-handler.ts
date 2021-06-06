import { IconHandlerInterface } from './icon-handler';
import { ElementAttributesInterface } from '../classes/custom-element';
import { LibraryService } from '../service/library-service';
import { isUrlSource } from '../utils/fetch-svg';

export class LibraryInlineHandler implements IconHandlerInterface {
    public supports(element: string, attributes: ElementAttributesInterface): boolean {
        const symbol = LibraryService.getSymbol(element, attributes);

        if (symbol === null) {
            return false;
        }

        return !isUrlSource(element, symbol);
    }

    /**
     * @throws {Error}
     */
    public getIcon(element: string, attributes: ElementAttributesInterface): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                const library = LibraryService.getLibrary(element);
                const source = library[attributes.namespace][attributes.pack][attributes.symbol];

                resolve(source);
            } catch (error) {
                reject(error);
            }
        });
    }
}
