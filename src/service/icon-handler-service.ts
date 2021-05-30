import { IconHandler } from '../handler/icon-handler';
import { FetchHandler } from '../handler/fetch-handler';
import { LibraryHandler } from '../handler/library-handler';

export class IconHandlerService {
    private static instance: IconHandler;

    public static async getIcon(attributes: Object): Promise<string|null> {
        if (!IconHandlerService.instance) {
            IconHandlerService.instance = new IconHandler(
                new FetchHandler(),
                new LibraryHandler()
            );
        }

        // eslint-disable-next-line no-return-await
        return await IconHandlerService.instance.getIcon(attributes);
    }
}
