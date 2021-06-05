import { IconHandlerInterface } from './icon-handler';
import { ElementAttributesInterface } from '../classes/custom-element';
import { ConfigService } from '../service/config-service';
import { LibraryService } from '../service/library-service';
import { fetchSvg, isUrlSource } from '../utils/fetch-svg';

export class FetchHandler implements IconHandlerInterface {
    public supports(attributes: ElementAttributesInterface): boolean {
        if (ConfigService.getConfig().fetchPattern === null) {
            return false;
        }

        const isUrl = isUrlSource(FetchHandler.getUrl(attributes));

        return !LibraryService.isInLibrary(attributes) && isUrl;
    }

    public getIcon(attributes: ElementAttributesInterface): Promise<string> {
        return fetchSvg(FetchHandler.getUrl(attributes));
    }

    private static getUrl(attributes: ElementAttributesInterface): string {
        let url = ConfigService.getConfig().fetchPattern;

        url = url.replace('%NAMESPACE%', attributes.namespace);
        url = url.replace('%PACK%', attributes.pack);
        url = url.replace('%SYMBOL%', attributes.symbol);

        return url;
    }
}
