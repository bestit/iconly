import { IconHandlerInterface } from './icon-handler';
import { ElementAttributesInterface } from '../classes/custom-element';
import { LibraryService } from '../service/library-service';
import { isUrlSource } from '../utils/fetch-svg';

export class LibraryInlineHandler implements IconHandlerInterface {
    public supports(attributes: ElementAttributesInterface): boolean {
        const symbol = LibraryService.getSymbol(attributes);

        if (symbol === null) {
            return false;
        }

        return !isUrlSource(symbol);
    }

    /**
     * @throws {Error}
     */
    public getIcon(attributes: ElementAttributesInterface): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                const library = LibraryService.getLibrary();
                const source = library[attributes.namespace][attributes.pack][attributes.symbol];

                resolve(source);
            } catch (error) {
                reject(error);
            }
        });
    }
}
