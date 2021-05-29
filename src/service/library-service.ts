import { Library } from '../classes/library';

export class LibraryService {
    private static instance: Library;

    public static getInstance(): Library {
        if (!LibraryService.instance) {
            LibraryService.instance = new Library();
        }
        return LibraryService.instance;
    }
}
