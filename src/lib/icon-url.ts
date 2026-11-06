export interface IconUrlInput {
    symbol?: string;
    pack?: string;
    namespace?: string;
    src?: string;
    fetchPattern?: string;
    allowedOrigins?: readonly string[];
}

function assertIconToken(value: string): string {
    if (value.includes('/') || value.includes('\\') || value.includes('..')) {
        throw new Error(`Invalid icon token "${value}"`);
    }

    return encodeURIComponent(value);
}

export function resolveIconUrl(raw: string, allowedOrigins?: readonly string[]): string {
    const url = new URL(raw, window.location.href);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error(`Unsupported icon URL protocol "${url.protocol}"`);
    }

    if (url.username !== '' || url.password !== '') {
        throw new Error('Icon URLs cannot include credentials');
    }

    if (allowedOrigins !== undefined && allowedOrigins.length > 0 && !allowedOrigins.includes(url.origin)) {
        throw new Error(`Icon origin "${url.origin}" is not allowed`);
    }

    return url.href;
}

export function buildSymbolUrl(
    pattern: string,
    namespace: string,
    pack: string,
    symbol: string,
    allowedOrigins?: readonly string[],
): string {
    const url = pattern
        .replaceAll('%NAMESPACE%', assertIconToken(namespace))
        .replaceAll('%PACK%', assertIconToken(pack))
        .replaceAll('%SYMBOL%', assertIconToken(symbol));

    return resolveIconUrl(url, allowedOrigins);
}

export function resolveIconRequestUrl(input: IconUrlInput): string | undefined {
    if (input.symbol && input.fetchPattern) {
        return buildSymbolUrl(
            input.fetchPattern,
            input.namespace ?? '',
            input.pack ?? '',
            input.symbol,
            input.allowedOrigins,
        );
    }

    if (input.src) {
        return resolveIconUrl(input.src, input.allowedOrigins);
    }

    return undefined;
}
