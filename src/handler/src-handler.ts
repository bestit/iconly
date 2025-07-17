import { AbstractHandler } from './abstract-handler.js';
import { Attributes, type AttributesInterface, CustomElement } from '../classes/custom-element.js';

export class SrcHandler extends AbstractHandler {
    public supports(
        element: CustomElement,
    ): boolean {
        const attributes: AttributesInterface = element.getAttributes();

        return !!attributes[Attributes.Src];
    }

    public getIcon(
        element: CustomElement,
    ): Promise<string> {
        return this.fetchSvg(SrcHandler.getUrl(element), element);
    }

    private static getUrl(element: CustomElement): string {
        const attributes: AttributesInterface = element.getAttributes();

        return attributes[Attributes.Src] || '';
    }
}
