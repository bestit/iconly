import { describe, expect, it } from 'vitest';
import { sanitizeSvg } from '../src/lib/sanitize-svg.js';

const icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0h10v10z"/></svg>';

describe('sanitizeSvg', () => {
    it('keeps a graphic icon', () => {
        const svg = sanitizeSvg(icon);

        expect(svg?.querySelector('path')?.getAttribute('d')).toBe('M0 0h10v10z');
    });

    it('rejects markup that is not a single svg document', () => {
        expect(sanitizeSvg('<svg></svg><img src="x" onerror="alert(1)">')).toBeNull();
        expect(sanitizeSvg('<img src="x" onerror="alert(1)">')).toBeNull();
        expect(sanitizeSvg('not svg')).toBeNull();
    });

    it('removes event handlers from nested elements', () => {
        const svg = sanitizeSvg('<svg xmlns="http://www.w3.org/2000/svg"><g onclick="alert(1)"><rect width="10" height="10"/></g></svg>');

        expect(svg?.querySelector('g')?.hasAttribute('onclick')).toBe(false);
        expect(svg?.querySelector('rect')).not.toBeNull();
    });

    it('removes script, links, use, and foreignObject', () => {
        const svg = sanitizeSvg([
            '<svg xmlns="http://www.w3.org/2000/svg">',
            '<script>alert(1)</script>',
            '<a href="javascript:alert(1)"><path d="M0 0"/></a>',
            '<use href="/sprite.svg#icon"/>',
            '<foreignObject><iframe src="https://evil.test"></iframe></foreignObject>',
            '<path d="M1 1"/></svg>',
        ].join(''));

        expect(svg?.querySelector('script')).toBeNull();
        expect(svg?.querySelector('a')).toBeNull();
        expect(svg?.querySelector('use')).toBeNull();
        expect(svg?.querySelector('foreignObject')).toBeNull();
        expect(svg?.querySelector('path')?.getAttribute('d')).toBe('M1 1');
    });

    it('removes external urls and keeps internal paint references', () => {
        const svg = sanitizeSvg('<svg xmlns="http://www.w3.org/2000/svg"><path fill="url(#paint)" stroke="url(https://evil.test/a)" d="M0 0"/></svg>');
        const path = svg?.querySelector('path');

        expect(path?.getAttribute('fill')).toBe('url(#paint)');
        expect(path?.hasAttribute('stroke')).toBe(false);
    });

    it('applies the extra denylist on top of the allowlist', () => {
        const svg = sanitizeSvg(icon, ['path']);

        expect(svg?.querySelector('path')).toBeNull();
    });
});
