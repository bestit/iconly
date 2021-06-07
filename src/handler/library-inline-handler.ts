import { IconHandlerInterface } from '../classes/icon-handler';
import { isUrlSource } from '../utils/fetch-svg';
import { ConfigInterface } from '../classes/element-data';
import { Library } from '../classes/library';
import { AttributesInterface } from '../classes/custom-element';

export class LibraryInlineHandler implements IconHandlerInterface {
    public supports(
        attributes: AttributesInterface,
        config: ConfigInterface,
        library: Library
    ): boolean {
        const symbol = library.getSymbol(attributes);

        if (symbol === null) {
            return false;
        }

        return !isUrlSource(config, symbol);
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
                resolve(library.getSymbol(attributes));
            } catch (error) {
                reject(error);
            }
        });
    }
}
