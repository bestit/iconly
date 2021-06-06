import { IconHandlerInterface } from './icon-handler';
import { ElementAttributesInterface } from '../classes/custom-element';
import { ConfigService } from '../service/config-service';
import { LibraryService } from '../service/library-service';
import { fetchSvg, isUrlSource } from '../utils/fetch-svg';

export class FetchHandler implements IconHandlerInterface {
    public supports(element: string, attributes: ElementAttributesInterface): boolean {
        if (ConfigService.getConfig(element).fetchPattern === null) {
            return false;
        }

        const isUrl = isUrlSource(element, FetchHandler.getUrl(element, attributes));
        return !LibraryService.isInLibrary(element, attributes) && isUrl;
    }

    public getIcon(element: string, attributes: ElementAttributesInterface): Promise<string> {
        return fetchSvg(FetchHandler.getUrl(element, attributes));
    }

    private static getUrl(element: string, attributes: ElementAttributesInterface): string {
        let url = ConfigService.getConfig(element).fetchPattern;

        url = url.replace('%NAMESPACE%', attributes.namespace);
        url = url.replace('%PACK%', attributes.pack);
        url = url.replace('%SYMBOL%', attributes.symbol);

        return url;
    }
}
