/**
 * @throws {Error}
 */
export const fetchSvg = async function(url: string): Promise<string> {
    'use strict';

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`${response.status}`);
    }

    return response.text();
};
