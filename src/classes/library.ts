import { ElementAttributesInterface } from './custom-element';

export const LIBRARY_DEFAULT_NAMESPACE: string = 'storefront';
export const LIBRARY_DEFAULT_PACK: string = 'default';

export interface LibraryInterface {
    [index: string]: {
        [index: string]: {
            [index: string]: string
        }
    };
    storefront: {
        default: {}
    }
}

const defaultLibrary: LibraryInterface = {
    storefront: {
        default: {}
    }
};

export class Library {
    private library: LibraryInterface;

    constructor(library: LibraryInterface = defaultLibrary) {
        this.library = library;
    }

    public getLibrary(): LibraryInterface {
        return this.library;
    }

    public add(
        attributes: ElementAttributesInterface,
        source: string,
    ): this {
        this.library[attributes.namespace][attributes.pack][attributes.symbol] = source;
        return this;
    }

    public remove(attributes: ElementAttributesInterface): this {
        delete this.library[attributes.namespace][attributes.pack][attributes.symbol];
        return this;
    }

    public merge(library: LibraryInterface) {
        this.library = {
            ...this.library,
            ...library
        };
    }
}
