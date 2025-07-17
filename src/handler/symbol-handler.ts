import { AbstractHandler } from './abstract-handler.js';
import { type ConfigInterface } from '../classes/element-data.js';
import { Attributes, type AttributesInterface, CustomElement } from '../classes/custom-element.js';

export class SymbolHandler extends AbstractHandler {
    public supports(
        element: CustomElement,
    ): boolean {
        const config: ConfigInterface = element.getElementData().getConfig();
        const attributes: AttributesInterface = element.getAttributes();

        return !!attributes[Attributes.Symbol] && !!config.fetchPattern;
    }

    public getIcon(
        element: CustomElement,
    ): Promise<string> {
        return this.fetchSvg(SymbolHandler.getUrl(element), element);
    }

    private static getUrl(element: CustomElement): string {
        const config: ConfigInterface = element.getElementData().getConfig();
        const attributes: AttributesInterface = element.getAttributes();
        let url = config.fetchPattern;

        if (typeof url !== 'undefined') {
            url = url.replace('%NAMESPACE%', attributes.namespace ?? '');
            url = url.replace('%PACK%', attributes.pack ?? '');
            url = url.replace('%SYMBOL%', attributes.symbol ?? '');
        }

        return url || '';
    }
}
