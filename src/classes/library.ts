export const LIBRARY_DEFAULT_PACK = 'default';

export interface LibraryConfig {
    [LIBRARY_DEFAULT_PACK]?: object,
}

export class Library {
    library: LibraryConfig;

    constructor(library: LibraryConfig = { default: {} }) {
        this.library = library;
    }

    async get(symbol: string|null, pack:string|null): Promise<string|null> {
        if (symbol === null) {
            return null;
        }

        if (pack === null) {
            pack = LIBRARY_DEFAULT_PACK;
        }

        const source = this.library[pack][symbol];

        if (typeof source === 'string') {
            // eslint-disable-next-line no-return-await
            return await Library.getSvgUrl(source).then(data => data);
        }

        return null;
    }

    add(symbol: string, source: string, pack: string = LIBRARY_DEFAULT_PACK): this {
        this.library[pack][symbol] = source;
        return this;
    }

    remove(symbol: string, pack: string = LIBRARY_DEFAULT_PACK): this {
        delete this.library[pack][symbol];
        return this;
    }

    merge(library: LibraryConfig) {
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
        const temp = document.createElement('div');
        temp.innerHTML = data;

        return temp.querySelector('svg').outerHTML;
    }
}
