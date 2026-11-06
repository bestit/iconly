import { Attributes } from '../attributes.js';
import type { CustomElement } from '../classes/custom-element.js';
import { loadIconText } from '../icon-request.js';
import { resolveIconUrl } from '../icon-url.js';
import { AbstractHandler } from './abstract-handler.js';

export class SrcHandler extends AbstractHandler {
    public supports(element: CustomElement): boolean {
        return Boolean(element.getAttributes()[Attributes.Src]);
    }

    public getIcon(element: CustomElement): Promise<string | undefined> {
        const attributes = element.getAttributes();
        const src = attributes[Attributes.Src];
        const config = element.getElementData().getConfig();

        if (src === undefined) {
            return Promise.resolve(undefined);
        }

        return loadIconText(resolveIconUrl(src, config.allowedOrigins), config.cacheTimeout);
    }
}
