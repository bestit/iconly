import { IconHandler } from '../handler/icon-handler';
import { FetchHandler } from '../handler/fetch-handler';
import { LibraryHandler } from '../handler/library-handler';

export class IconHandlerService {
    private static instance: IconHandler;

    /**
     * @throws {Error}
     */
    public static getIcon(attributes: Object): Promise<string> {
        if (!IconHandlerService.instance) {
            IconHandlerService.instance = new IconHandler(
                new FetchHandler(),
                new LibraryHandler()
            );
        }

        return IconHandlerService.instance.getIcon(attributes);
    }
}
