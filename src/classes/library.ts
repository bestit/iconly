import { AttributesInterface, ATTRIBUTE_NAMESPACE, ATTRIBUTE_PACK, ATTRIBUTE_SYMBOL } from './custom-element';

export interface LibraryTreeInterface extends Object {
    [propName: string]: {
        [propName: string]: {
            [propName: string]: string
        }
    }|string|Function
}

export class Library {
    #libraryTree: LibraryTreeInterface;

    constructor(libraryTree: LibraryTreeInterface = {}) {
        this.#libraryTree = libraryTree;
    }

    public getTree(): LibraryTreeInterface {
        return this.#libraryTree;
    }

    public setTree(libraryTree: LibraryTreeInterface): this {
        this.#libraryTree = libraryTree;
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
            this.#libraryTree,
            {
                [attributes[ATTRIBUTE_NAMESPACE]]: {
                    [attributes[ATTRIBUTE_PACK]]: {
                        [attributes[ATTRIBUTE_SYMBOL]]: value,
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

        delete this.#libraryTree[
            attributes[ATTRIBUTE_NAMESPACE]][attributes[ATTRIBUTE_PACK]][attributes[ATTRIBUTE_SYMBOL]
        ];
        return this;
    }

    public mergeTree(targetTree: Object, sourceTree: Object): this {
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

        return this.#libraryTree[
            attributes[ATTRIBUTE_NAMESPACE]][attributes[ATTRIBUTE_PACK]][attributes[ATTRIBUTE_SYMBOL]
        ];
    }

    public isInLibrary(attributes: AttributesInterface): boolean {
        if (typeof this.#libraryTree[attributes[ATTRIBUTE_NAMESPACE]] === 'undefined') {
            return false;
        }

        if (typeof this.#libraryTree[attributes[ATTRIBUTE_NAMESPACE]][attributes[ATTRIBUTE_PACK]] === 'undefined') {
            return false;
        }

        return typeof this.#libraryTree[
            attributes[ATTRIBUTE_NAMESPACE]][attributes[ATTRIBUTE_PACK]][attributes[ATTRIBUTE_SYMBOL]
        ] !== 'undefined';
    }

    private static validAttributes(attributes: AttributesInterface): boolean {
        return !(typeof attributes === 'undefined' ||
            typeof attributes[ATTRIBUTE_NAMESPACE] === 'undefined' ||
            typeof attributes[ATTRIBUTE_PACK] === 'undefined' ||
            typeof attributes[ATTRIBUTE_SYMBOL] === 'undefined');
    }
}
