import { ConfigInterface } from '../classes/element-data';

/**
 * @throws {Error}
 */
export const fetchSvg = async function(url: string): Promise<string> {
    'use strict';

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText} for ${url}`);
    }

    return response.text();
};

export const isUrlSource = function(config: ConfigInterface, source: string): boolean {
    'use strict';

    if (!(config.urlTestPattern instanceof RegExp)) {
        return false;
    }

    return source.match(config.urlTestPattern) !== null;
};
