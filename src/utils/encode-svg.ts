// eslint-disable-next-line
const symbols = /[\r\n%#()<>?\[\\\]^`{|}]/g;

export const encodeSvg = function(inlineSvg: string): string {
    'use strict';

    inlineSvg = inlineSvg.replace(/"/g, '\'');
    inlineSvg = inlineSvg.replace(/>\s+</g, '><');
    inlineSvg = inlineSvg.replace(/\s{2,}/g, ' ');

    return inlineSvg.replace(symbols, encodeURIComponent);
};

export const encodeCssUrl = function(inlineSvg: string): string {
    'use strict';
    const encodedSvg = encodeSvg(inlineSvg);

    return `url("data:image/svg+xml,${encodedSvg}")`;
};
