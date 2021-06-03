import { Library, LibraryInterface } from '../classes/library';
import { ElementAttributesInterface } from '../classes/custom-element';

export class LibraryService {
    private static instance: Library;

    public static getInstance(): Library {
        if (!LibraryService.instance) {
            LibraryService.instance = new Library();
        }
        return LibraryService.instance;
    }

    public static getLibrary(): LibraryInterface {
        return LibraryService.getInstance().getLibrary();
    }

    public static merge(library: LibraryInterface) {
        LibraryService.getInstance().merge(library);
    }

    public static getSymbol(attributes: ElementAttributesInterface): string|null {
        if (!LibraryService.isInLibrary(attributes)) {
            return null;
        }

        return LibraryService.getLibrary()[attributes.namespace][attributes.pack][attributes.symbol];
    }

    public static isInLibrary(attributes: ElementAttributesInterface): boolean {
        const library = LibraryService.getLibrary();

        if (typeof library[attributes.namespace] === 'undefined') {
            return false;
        }

        if (typeof library[attributes.namespace][attributes.pack] === 'undefined') {
            return false;
        }

        return typeof library[attributes.namespace][attributes.pack][attributes.symbol] !== 'undefined';
    }
}
