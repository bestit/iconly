import { IconHandlerInterface } from '../classes/icon-handler';
import { fetchSvg, isUrlSource } from '../utils/fetch-svg';
import { ConfigInterface } from '../classes/element-data';
import { Library } from '../classes/library';
import { AttributesInterface } from '../classes/custom-element';

export class LibraryRemoteHandler implements IconHandlerInterface {
    public supports(
        attributes: AttributesInterface,
        config: ConfigInterface,
        library: Library
    ): boolean {
        const symbol = library.getSymbol(attributes);

        if (symbol === null) {
            return false;
        }

        return isUrlSource(config, symbol);
    }

    public getIcon(
        attributes: AttributesInterface,
        config: ConfigInterface,
        library: Library
    ): Promise<string> {
        return fetchSvg(library.getSymbol(attributes));
    }
}
