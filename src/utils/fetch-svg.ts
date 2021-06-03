import { ConfigService } from '../service/config-service';

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

export const isUrlSource = function(source: string): boolean {
    'use strict';

    const config = ConfigService.getConfig();

    if (!(config.urlTestPattern instanceof RegExp)) {
        return false;
    }

    return source.match(config.urlTestPattern) !== null;
};
