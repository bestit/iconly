import { ElementAttributesInterface } from './custom-element';

export interface LibraryInterface {
    [index: string]: {
        [index: string]: {
            [index: string]: string
        }
    }
}

export class Library {
    private library: LibraryInterface;

    constructor(library: LibraryInterface = {}) {
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
