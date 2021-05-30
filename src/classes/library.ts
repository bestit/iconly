import { LibraryInterface } from '../service/library-service';

export const LIBRARY_DEFAULT_NAMESPACE: string = 'storefront';
export const LIBRARY_DEFAULT_PACK: string = 'default';
export const LIBRARY_DEFAULT_ICON: string = '';

export interface LibraryConfig {
    [index: string]: {
        [index: string]: {
            [index: string]: string
        }
    };
    storefront: {
        default: {}
    }
}

const defaultLibrary: LibraryConfig = {
    storefront: {
        default: {}
    }
};

export class Library implements LibraryInterface {
    private library: LibraryConfig;

    constructor(library: LibraryConfig = defaultLibrary) {
        this.library = library;
    }

    public async get(
        symbol: string|null,
        pack: string = LIBRARY_DEFAULT_PACK,
        namespace: string = LIBRARY_DEFAULT_NAMESPACE
    ): Promise<string|null> {
        const source = this.library[namespace][pack][symbol];

        if (typeof source === 'string') {
            // eslint-disable-next-line no-return-await
            return await Library.getSvgUrl(source).then(data => data);
        }

        return null;
    }

    public add(
        symbol: string,
        source: string,
        pack: string = LIBRARY_DEFAULT_PACK,
        namespace: string = LIBRARY_DEFAULT_NAMESPACE
    ): this {
        this.library[namespace][pack][symbol] = source;
        return this;
    }

    public remove(
        symbol: string,
        pack: string = LIBRARY_DEFAULT_PACK,
        namespace: string = LIBRARY_DEFAULT_NAMESPACE
    ): this {
        delete this.library[namespace][pack][symbol];
        return this;
    }

    public merge(library: LibraryConfig) {
        this.library = {
            ...this.library,
            ...library
        };
    }

    static async getSvgUrl(url: string): Promise<string> {
        const response = await fetch(url);

        if (!response.ok) {
            return '';
        }

        const data = await response.text();
       
        return data;
    }
}
