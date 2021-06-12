import { AbstractHandler } from './abstract-handler';
import { ConfigInterface } from '../classes/element-data';
import { AttributesInterface, CustomElement } from '../classes/custom-element';
import { Library } from '../classes/library';

export class FetchHandler extends AbstractHandler {
    public supports(
        element: CustomElement
    ): boolean {
        const config: ConfigInterface = element.getElementData().getConfig();
        const library: Library = element.getElementData().getLibrary();
        const attributes: AttributesInterface = element.getAttributes();

        if (config.fetchPattern === null) {
            return false;
        }

        const isUrl = this.isUrlSource(config, FetchHandler.getUrl(attributes, config));
        return !library.isInLibrary(attributes) && isUrl;
    }

    public getIcon(
        element: CustomElement
    ): Promise<string> {
        const config: ConfigInterface = element.getElementData().getConfig();
        const attributes: AttributesInterface = element.getAttributes();

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
