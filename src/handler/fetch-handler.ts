import { AbstractHandler } from './abstract-handler';
import { ConfigInterface } from '../classes/element-data';
import { Library } from '../classes/library';
import { AttributesInterface } from '../classes/custom-element';

export class FetchHandler extends AbstractHandler {
    public supports(
        attributes: AttributesInterface,
        config: ConfigInterface,
        library: Library
    ): boolean {
        if (config.fetchPattern === null) {
            return false;
        }

        const isUrl = this.isUrlSource(config, FetchHandler.getUrl(attributes, config));
        return !library.isInLibrary(attributes) && isUrl;
    }

    public getIcon(
        attributes: AttributesInterface,
        config: ConfigInterface
    ): Promise<string> {
        return this.fetchSvg(FetchHandler.getUrl(attributes, config));
    }

    private static getUrl(attributes: AttributesInterface, config: ConfigInterface): string {
        let url = config.fetchPattern;

        url = url.replace('%NAMESPACE%', attributes.namespace);
        url = url.replace('%PACK%', attributes.pack);
        url = url.replace('%SYMBOL%', attributes.symbol);

        return url;
    }
}
