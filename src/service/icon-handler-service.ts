import { IconHandler } from '../handler/icon-handler';
import { FetchHandler } from '../handler/fetch-handler';
import { LibraryRemoteHandler } from '../handler/library-remote-handler';
import { LibraryInlineHandler } from '../handler/library-inline-handler';
import { NullHandler } from '../handler/null-handler';

export class IconHandlerService {
    private static instance: IconHandler;

    public static getIcon(attributes: Object): Promise<string> {
        if (!IconHandlerService.instance) {
            IconHandlerService.instance = new IconHandler(
                new NullHandler(),
                new LibraryInlineHandler(),
                new LibraryRemoteHandler(),
                new FetchHandler()
            );
        }

        return IconHandlerService.instance.getIcon(attributes);
    }
}
