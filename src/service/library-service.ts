import { Library } from '../classes/library';
import { FetchIcon } from '../classes/fetch-icon';

export interface LibraryInterface {
    [propName: string]: any;

    // eslint-disable-next-line no-unused-vars
    get(symbol: string|null, pack: string, namespace: string): Promise<string|null>;
}

export class LibraryService {
    private static instance: LibraryInterface;

    public static setInstance(type: string|null = null) {
        if (type === 'fetch-icon') {
            LibraryService.instance = new FetchIcon();
            return;
        }

        LibraryService.instance = new Library();
    }

    public static getInstance(): LibraryInterface {
        if (!LibraryService.instance) {
            LibraryService.setInstance();
        }
        return LibraryService.instance;
    }
}
