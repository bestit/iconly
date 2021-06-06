import { IconHandler, IconHandlerInterface } from '../handler/icon-handler';
import { FetchHandler } from '../handler/fetch-handler';
import { LibraryRemoteHandler } from '../handler/library-remote-handler';
import { LibraryInlineHandler } from '../handler/library-inline-handler';
import { NullHandler } from '../handler/null-handler';
import { ConfigService } from './config-service';

export interface IconHandlerInstances {
    [propName: string]: IconHandler;
}

export class IconHandlerService {
    private static instances: IconHandlerInstances = {};

    public static getIcon(element: string, attributes: Object): Promise<string> {
        if (typeof IconHandlerService.instances[element] === 'undefined') {
            IconHandlerService.instances[element] = IconHandlerService.getHandlers(element);
        }

        return IconHandlerService.instances[element].getIcon(element, attributes);
    }

    public static getHandlers(element: string) {
        let handlers: IconHandlerInterface[] = [
            new NullHandler(),
            new LibraryInlineHandler(),
            new LibraryRemoteHandler(),
            new FetchHandler()
        ];

        const callback = ConfigService.getConfig(element).handlerCallback;
        if (typeof callback === 'function') {
            handlers = ConfigService.getConfig(element).handlerCallback(...handlers);
        }

        return new IconHandler(...handlers);
    }
}
