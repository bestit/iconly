import { Library, LibraryInterface } from '../classes/library';
import { ElementAttributesInterface } from '../classes/custom-element';
import { ConfigService } from './config-service';

export const LIBRARY_DEFAULT_NAMESPACE: string = 'storefront';
export const LIBRARY_DEFAULT_PACK: string = 'default';

interface LibraryInstances {
    [propName: string]: Library;
}

export class LibraryService {
    private static instances: LibraryInstances = {};

    public static getInstance(element: string): Library {
        if (typeof LibraryService.instances[element] === 'undefined') {
            LibraryService.instances[element] = new Library({
                [LibraryService.getDefaultNamespace(element)]: {
                    [LibraryService.getDefaultPack(element)]: {}
                }
            });
        }
        return LibraryService.instances[element];
    }

    public static getLibrary(element: string): LibraryInterface {
        return LibraryService.getInstance(element).getLibrary();
    }

    public static getSymbol(element: string, attributes: ElementAttributesInterface): string|null {
        if (!LibraryService.isInLibrary(element, attributes)) {
            return null;
        }

        return LibraryService.getLibrary(element)[attributes.namespace][attributes.pack][attributes.symbol];
    }

    public static isInLibrary(element: string, attributes: ElementAttributesInterface): boolean {
        const library = LibraryService.getLibrary(element);

        if (typeof library[attributes.namespace] === 'undefined') {
            return false;
        }

        if (typeof library[attributes.namespace][attributes.pack] === 'undefined') {
            return false;
        }

        return typeof library[attributes.namespace][attributes.pack][attributes.symbol] !== 'undefined';
    }

    public static getDefaultNamespace(element: string): string {
        return ConfigService.getConfig(element).defaultNamespace || LIBRARY_DEFAULT_NAMESPACE;
    }

    public static getDefaultPack(element: string): string {
        return ConfigService.getConfig(element).defaultPack || LIBRARY_DEFAULT_PACK;
    }
}
