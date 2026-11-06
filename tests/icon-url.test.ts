import { describe, expect, it } from 'vitest';
import { buildSymbolUrl, resolveIconUrl } from '../src/lib/icon-url.js';

describe('icon urls', () => {
    it('encodes symbol tokens and resolves a relative pattern', () => {
        const url = buildSymbolUrl(
            '/icons/%NAMESPACE%/%PACK%/%SYMBOL%.svg',
            'store front',
            'default',
            'my icon',
        );

        expect(url).toBe(`${window.location.origin}/icons/store%20front/default/my%20icon.svg`);
    });

    it('rejects tokens that leave the icon directory', () => {
        expect(() => buildSymbolUrl('/icons/%SYMBOL%.svg', '', '', '../secret')).toThrow(/Invalid icon token/);
        expect(() => buildSymbolUrl('/icons/%SYMBOL%.svg', '', '', 'a/b')).toThrow(/Invalid icon token/);
        expect(() => buildSymbolUrl('/icons/%SYMBOL%.svg', '', '', 'a\\b')).toThrow(/Invalid icon token/);
    });

    it('accepts only http and https urls', () => {
        expect(() => resolveIconUrl('javascript:alert(1)')).toThrow(/protocol/);
        expect(() => resolveIconUrl('data:image/svg+xml,<svg></svg>')).toThrow(/protocol/);
        expect(resolveIconUrl('https://cdn.example/icon.svg')).toBe('https://cdn.example/icon.svg');
    });

    it('rejects credentials and origins outside the allowlist', () => {
        expect(() => resolveIconUrl('https://user:pass@cdn.example/icon.svg')).toThrow(/credentials/);
        expect(() => resolveIconUrl('https://cdn.example/icon.svg', ['https://icons.example'])).toThrow(/not allowed/);
        expect(resolveIconUrl('https://cdn.example/icon.svg', ['https://cdn.example'])).toBe('https://cdn.example/icon.svg');
    });
});
