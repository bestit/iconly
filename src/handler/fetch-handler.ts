import { IconHandlerInterface } from './icon-handler';
import { ElementAttributesInterface } from '../classes/custom-element';
import { ConfigService } from '../service/config-service';
import { LibraryService } from '../service/library-service';
import { fetchSvg } from '../utils/fetch-svg';

export class FetchHandler implements IconHandlerInterface {
    public supports(attributes: ElementAttributesInterface): boolean {
        const config = ConfigService.getConfig();

        if (config.fetchPattern === null) {
            return false;
        }

        return !LibraryService.isInLibrary(attributes);
    }

    /**
     * @throws {Error}
     */
    public getIcon(attributes: ElementAttributesInterface): Promise<string> {
        const config = ConfigService.getConfig();
        let url = config.fetchPattern;
        url = url.replace('%NAMESPACE%', attributes.namespace);
        url = url.replace('%PACK%', attributes.pack);
        url = url.replace('%SYMBOL%', attributes.symbol);

        return fetchSvg(url);
    }
}
