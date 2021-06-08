import { AbstractHandler } from './abstract-handler';
import { ConfigInterface } from '../classes/element-data';
import { Library } from '../classes/library';
import { AttributesInterface } from '../classes/custom-element';

export class LibraryInlineHandler extends AbstractHandler {
    public supports(
        attributes: AttributesInterface,
        config: ConfigInterface,
        library: Library
    ): boolean {
        const symbol = library.getValue(attributes);

        if (symbol === null) {
            return false;
        }

        return !this.isUrlSource(config, symbol);
    }

    /**
     * @throws {Error}
     */
    public getIcon(
        attributes: AttributesInterface,
        config: ConfigInterface,
        library: Library
    ): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                resolve(library.getValue(attributes));
            } catch (error) {
                reject(error);
            }
        });
    }
}
