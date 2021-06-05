import { ElementAttributesInterface } from './custom-element';

export interface LibraryInterface extends Object {
    [propName: string]: {
        [propName: string]: {
            [propName: string]: string
        }
    }|string|Function
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
        if (!this.validAttributes(attributes)) {
            return this;
        }

        this.merge(
            this.library,
            {
                [attributes.namespace]: {
                    [attributes.pack]: {
                        [attributes.symbol]: source,
                    }
                }
            }
        );
        return this;
    }

    public remove(attributes: ElementAttributesInterface): this {
        if (!this.validAttributes(attributes)) {
            return this;
        }

        delete this.library[attributes.namespace][attributes.pack][attributes.symbol];
        return this;
    }

    public merge(target: Object, source: Object): this {
        for (const key of Object.keys(source)) {
            if (source[key] instanceof Object && typeof target[key] === 'undefined') {
                target[key] = {};
                this.merge(target[key], source[key]);
            }

            if (source[key] instanceof Object && typeof target[key] !== 'undefined') {
                this.merge(target[key], source[key]);
            }

            if (typeof source[key] === 'string') {
                target[key] = source[key];
            }
        }

        return this;
    }

    private validAttributes(attributes: ElementAttributesInterface): boolean {
        if (
            typeof attributes === 'undefined' ||
            typeof attributes.namespace === 'undefined' ||
            typeof attributes.pack === 'undefined' ||
            typeof attributes.symbol === 'undefined'
        ) {
            return false;
        }

        return true;
    }
}
