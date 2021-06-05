import { Library, LibraryInterface } from '../classes/library';
import { ElementAttributesInterface } from '../classes/custom-element';
import { ConfigService } from './config-service';

export const LIBRARY_DEFAULT_NAMESPACE: string = 'storefront';
export const LIBRARY_DEFAULT_PACK: string = 'default';

export class LibraryService {
    private static instance: Library;

    public static getInstance(): Library {
        if (!LibraryService.instance) {
            LibraryService.instance = new Library({
                [LibraryService.getDefaultNamespace()]: {
                    [LibraryService.getDefaultPack()]: {}
                }
            });
        }
        return LibraryService.instance;
    }

    public static getLibrary(): LibraryInterface {
        return LibraryService.getInstance().getLibrary();
    }

    public static merge(library: LibraryInterface) {
        LibraryService.getInstance().merge(LibraryService.getLibrary(), library);
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

    public static getDefaultNamespace(): string {
        return ConfigService.getConfig().defaultNamespace || LIBRARY_DEFAULT_NAMESPACE;
    }

    public static getDefaultPack(): string {
        return ConfigService.getConfig().defaultPack || LIBRARY_DEFAULT_PACK;
    }
}
