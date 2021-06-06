import { IconHandlerInterface } from './icon-handler';
import { ElementAttributesInterface } from '../classes/custom-element';

export class NullHandler implements IconHandlerInterface {
    public supports(element: string, attributes: ElementAttributesInterface): boolean {
        if (attributes.namespace === null) {
            return true;
        }

        if (attributes.pack === null) {
            return true;
        }

        return attributes.symbol === null || attributes.symbol === '';
    }

    /**
     * @throws {Error}
     */
    public getIcon(element: string, attributes: ElementAttributesInterface): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            reject(new Error(`Can't find icon matching attributes: ${JSON.stringify(attributes)}`));
        });
    }
}
