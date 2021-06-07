import { IconHandlerInterface } from '../classes/icon-handler';
import { AttributesInterface, ATTRIBUTE_NAMESPACE, ATTRIBUTE_PACK, ATTRIBUTE_SYMBOL } from '../classes/custom-element';

export class NullHandler implements IconHandlerInterface {
    public supports(
        attributes: AttributesInterface,
    ): boolean {
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
        attributes: AttributesInterface,
    ): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            reject(new Error(`Can't find icon matching attributes: ${JSON.stringify(attributes)}`));
        });
    }
}
