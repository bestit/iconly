import type { ConfigInterface, ElementData } from './lib/classes/element-data.js';
import { defineIconlyElement } from './lib/classes/custom-element.js';
import { getRegisteredElement } from './lib/registry.js';

export type { ConfigInterface, ElementData } from './lib/classes/element-data.js';
export type { HandlerInterface } from './lib/classes/icon-handler.js';
export { CustomElement } from './lib/classes/custom-element.js';
export { IconHandler } from './lib/classes/icon-handler.js';
export type {
    AttributesInterface,
    IconlyErrorDetail,
    IconlyLoadedDetail,
    LoadingMode,
} from './lib/attributes.js';
export { Attributes, Loading } from './lib/attributes.js';

export class Iconly {
    public static createElement(
        element: string,
        config: Partial<ConfigInterface> = {},
        defineCustomElement: boolean = true,
    ): void {
        defineIconlyElement(element, config, defineCustomElement);
    }

    public static getElement(element: string): ElementData | undefined {
        return getRegisteredElement(element);
    }
}
