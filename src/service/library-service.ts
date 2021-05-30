import { Library, LibraryInterface } from '../classes/library';

export class LibraryService {
    private static instance: Library;

    public static getInstance(): Library {
        if (!LibraryService.instance) {
            LibraryService.instance = new Library();
        }
        return LibraryService.instance;
    }

    public static getLibrary(): LibraryInterface {
        return this.getInstance().getLibrary();
    }

    public static merge(library: LibraryInterface) {
        this.getInstance().merge(library);
    }
}
