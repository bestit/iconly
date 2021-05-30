import { IconHandlerInterface } from './icon-handler';
import { ElementAttributesInterface } from '../classes/custom-element';
import { ConfigService } from '../service/config-service';
import { LibraryService } from '../service/library-service';

export class FetchHandler implements IconHandlerInterface {
    // eslint-disable-next-line class-methods-use-this
    public supports(attributes: ElementAttributesInterface): boolean {
        const library = LibraryService.getLibrary();
        const config = ConfigService.getConfig();

        if (config.fetchPattern === null) {
            return false;
        }

        if (typeof library[attributes.namespace] === 'undefined') {
            return true;
        }

        if (typeof library[attributes.namespace][attributes.pack] === 'undefined') {
            return true;
        }

        return typeof library[attributes.namespace][attributes.pack][attributes.symbol] === 'undefined';
    }

    // eslint-disable-next-line class-methods-use-this
    public async getIcon(attributes: ElementAttributesInterface): Promise<string|null> {
        const config = ConfigService.getConfig();
        let url = config.fetchPattern;
        url = url.replace('%NAMESPACE%', attributes.namespace);
        url = url.replace('%PACK%', attributes.pack);
        url = url.replace('%SYMBOL%', attributes.symbol);

        // eslint-disable-next-line no-return-await
        return await FetchHandler.getSvgUrl(url).then(data => data);
    }

    static async getSvgUrl(url: string): Promise<string> {
        const response = await fetch(url);

        if (!response.ok) {
            return '';
        }

        // eslint-disable-next-line no-return-await
        return await response.text();
    }
}
