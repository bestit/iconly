import { type AttributesInterface, ATTRIBUTE_NAMESPACE, ATTRIBUTE_PACK, ATTRIBUTE_SYMBOL } from './custom-element.js';

export interface LibraryTreeInterface {
    [propName: string]: {
        [propName: string]: {
            [propName: string]: string
        }
    }
}

export class Library {
    private libraryTree: LibraryTreeInterface;

    constructor(libraryTree: LibraryTreeInterface = {}) {
        this.libraryTree = libraryTree;
    }

    public getTree(): LibraryTreeInterface {
        return this.libraryTree;
    }

    public setTree(libraryTree: LibraryTreeInterface): this {
        this.libraryTree = libraryTree;
        return this;
    }

    public add(
        attributes: AttributesInterface,
        value: string,
    ): this {
        if (!Library.validAttributes(attributes)) {
            return this;
        }

        this.mergeTree(
            this.libraryTree,
            {
                [attributes[ATTRIBUTE_NAMESPACE] as string]: {
                    [attributes[ATTRIBUTE_PACK] as string]: {
                        [attributes[ATTRIBUTE_SYMBOL] as string]: value,
                    }
                }
            }
        );
        return this;
    }

    public remove(attributes: AttributesInterface): this {
        if (!Library.validAttributes(attributes)) {
            return this;
        }

        delete this.libraryTree[
            attributes[ATTRIBUTE_NAMESPACE] as string][attributes[ATTRIBUTE_PACK] as string][attributes[ATTRIBUTE_SYMBOL] as string
        ];
        return this;
    }

    public mergeTree(targetTree: any, sourceTree: any): this {
        for (const key of Object.keys(sourceTree)) {
            if (sourceTree[key] instanceof Object && typeof targetTree[key] === 'undefined') {
                targetTree[key] = {};
                this.mergeTree(targetTree[key], sourceTree[key]);
            }

            if (sourceTree[key] instanceof Object && typeof targetTree[key] !== 'undefined') {
                this.mergeTree(targetTree[key], sourceTree[key]);
            }

            if (typeof sourceTree[key] === 'string') {
                targetTree[key] = sourceTree[key];
            }
        }

        return this;
    }

    public getValue(attributes: AttributesInterface): string|null {
        if (!this.isInLibrary(attributes)) {
            return null;
        }

        return this.libraryTree[attributes[ATTRIBUTE_NAMESPACE] as string][attributes[ATTRIBUTE_PACK] as string][attributes[ATTRIBUTE_SYMBOL] as string];
    }

    public isInLibrary(attributes: AttributesInterface): boolean {
        if (typeof this.libraryTree[attributes[ATTRIBUTE_NAMESPACE] as string] === 'undefined') {
            return false;
        }

        if (typeof this.libraryTree[attributes[ATTRIBUTE_NAMESPACE] as string][attributes[ATTRIBUTE_PACK] as string] === 'undefined') {
            return false;
        }

        return typeof this.libraryTree[
            attributes[ATTRIBUTE_NAMESPACE] as string][attributes[ATTRIBUTE_PACK] as string][attributes[ATTRIBUTE_SYMBOL] as string] !== 'undefined';
    }

    private static validAttributes(attributes: AttributesInterface): boolean {
        return !(typeof attributes === 'undefined' ||
            typeof attributes[ATTRIBUTE_NAMESPACE] === 'undefined' ||
            typeof attributes[ATTRIBUTE_PACK] === 'undefined' ||
            typeof attributes[ATTRIBUTE_SYMBOL] === 'undefined');
    }
}
