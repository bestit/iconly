import { Attributes } from '../attributes.js';
import type { CustomElement } from '../classes/custom-element.js';
import { loadIconText } from '../icon-request.js';
import { buildSymbolUrl } from '../icon-url.js';
import { AbstractHandler } from './abstract-handler.js';

export class SymbolHandler extends AbstractHandler {
    public supports(element: CustomElement): boolean {
        const config = element.getElementData().getConfig();
        const attributes = element.getAttributes();

        return Boolean(attributes[Attributes.Symbol] && config.fetchPattern);
    }

    public getIcon(element: CustomElement): Promise<string | undefined> {
        const config = element.getElementData().getConfig();
        const attributes = element.getAttributes();
        const symbol = attributes[Attributes.Symbol];

        if (symbol === undefined || config.fetchPattern === undefined) {
            return Promise.resolve(undefined);
        }

        const url = buildSymbolUrl(
            config.fetchPattern,
            attributes[Attributes.Namespace] ?? '',
            attributes[Attributes.Pack] ?? '',
            symbol,
            config.allowedOrigins,
        );

        return loadIconText(url, config.cacheTimeout);
    }
}
