import { IconHandlerInterface } from './icon-handler';
import { ElementAttributesInterface } from '../classes/custom-element';
import { LibraryService } from '../service/library-service';

export class LibraryHandler implements IconHandlerInterface {
    // eslint-disable-next-line class-methods-use-this
    public supports(attributes: ElementAttributesInterface): boolean {
        const library = LibraryService.getLibrary();

        if (typeof library[attributes.namespace] === 'undefined') {
            return false;
        }

        if (typeof library[attributes.namespace][attributes.pack] === 'undefined') {
            return false;
        }

        return typeof library[attributes.namespace][attributes.pack][attributes.symbol] !== 'undefined';
    }

    // eslint-disable-next-line class-methods-use-this
    public async getIcon(attributes: ElementAttributesInterface): Promise<string|null> {
        const library = LibraryService.getLibrary();
        const source = library[attributes.namespace][attributes.pack][attributes.symbol];

        if (typeof source === 'string') {
            // eslint-disable-next-line no-return-await
            return await LibraryHandler.getSvgUrl(source).then(data => data);
        }

        return null;
    }

    static async getSvgUrl(url: string): Promise<string> {
        const response = await fetch(url);

        if (!response.ok) {
            return '';
        }

        // eslint-disable-next-line no-return-await
        return await response.text();
    }
}
