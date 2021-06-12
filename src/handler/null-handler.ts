import { AbstractHandler } from './abstract-handler';
import {
    AttributesInterface,
    ATTRIBUTE_NAMESPACE,
    ATTRIBUTE_PACK,
    ATTRIBUTE_SYMBOL,
    CustomElement
} from '../classes/custom-element';

export class NullHandler extends AbstractHandler {
    public supports(
        element: CustomElement
    ): boolean {
        const attributes: AttributesInterface = element.getAttributes();

        if (attributes[ATTRIBUTE_NAMESPACE] === null) {
            return true;
        }

        if (attributes[ATTRIBUTE_PACK] === null) {
            return true;
        }

        return attributes[ATTRIBUTE_SYMBOL] === null || attributes[ATTRIBUTE_SYMBOL] === '';
    }

    /**
     * @throws {Error}
     */
    public getIcon(
        element: CustomElement
    ): Promise<string> {
        const attributes: AttributesInterface = element.getAttributes();

        return new Promise<string>((resolve, reject) => {
            reject(new Error(`Can't find icon matching attributes: ${JSON.stringify(attributes)}`));
        });
    }
}
