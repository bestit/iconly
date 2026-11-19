export type SanitizerMode = 'off' | 'basic' | 'strict';

const ALLOWED_ELEMENTS = new Set([
    'svg',
    'g',
    'path',
    'rect',
    'circle',
    'ellipse',
    'line',
    'polyline',
    'polygon',
    'title',
    'desc',
    'defs',
    'clippath',
    'mask',
    'lineargradient',
    'radialgradient',
    'stop',
    'text',
    'tspan',
]);

const ALLOWED_ATTRIBUTES = new Set([
    'viewbox',
    'fill',
    'stroke',
    'd',
    'cx',
    'cy',
    'r',
    'rx',
    'ry',
    'x',
    'y',
    'x1',
    'y1',
    'x2',
    'y2',
    'width',
    'height',
    'points',
    'transform',
    'opacity',
    'fill-opacity',
    'stroke-opacity',
    'fill-rule',
    'stroke-width',
    'stroke-linecap',
    'stroke-linejoin',
    'stroke-miterlimit',
    'stroke-dasharray',
    'stroke-dashoffset',
    'class',
    'id',
    'preserveaspectratio',
    'offset',
    'stop-color',
    'stop-opacity',
    'gradientunits',
    'gradienttransform',
    'spreadmethod',
    'clip-path',
    'clip-rule',
    'mask',
    'fx',
    'fy',
    'role',
    'aria-hidden',
    'aria-label',
    'focusable',
    'color',
    'display',
    'visibility',
    'style',
]);

const BASIC_REMOVED_ELEMENTS = new Set([
    'script',
    'foreignobject',
    'iframe',
    'object',
    'embed',
]);

const URL_VALUE = /url\s*\(\s*(['"]?)([^'")]+)\1\s*\)/gi;

function isStrictlyUnsafeAttribute(name: string, value: string): boolean {
    const normalized = name.toLowerCase();

    if (normalized.startsWith('on')) {
        return true;
    }

    if (normalized === 'src' || normalized === 'href' || normalized.endsWith(':href')) {
        return true;
    }

    if (normalized.startsWith('xmlns')) {
        return false;
    }

    if (!ALLOWED_ATTRIBUTES.has(normalized)) {
        return true;
    }

    if (value.toLowerCase().includes('javascript:')) {
        return true;
    }

    URL_VALUE.lastIndex = 0;
    const urls = value.matchAll(URL_VALUE);
    for (const match of urls) {
        const target = match[2]?.trim() ?? '';
        if (!target.startsWith('#')) {
            return true;
        }
    }

    return false;
}

function cleanStrict(element: Element): void {
    for (const attribute of [...element.attributes]) {
        if (isStrictlyUnsafeAttribute(attribute.name, attribute.value)) {
            element.removeAttribute(attribute.name);
        }
    }

    for (const child of [...element.children]) {
        if (!ALLOWED_ELEMENTS.has(child.localName.toLowerCase())) {
            child.remove();
            continue;
        }

        cleanStrict(child);
    }
}

function cleanBasic(element: Element): void {
    for (const attribute of [...element.attributes]) {
        const name = attribute.name.toLowerCase();

        if (name.startsWith('on') || attribute.value.toLowerCase().includes('javascript:')) {
            element.removeAttribute(attribute.name);
        }
    }

    for (const child of [...element.children]) {
        if (BASIC_REMOVED_ELEMENTS.has(child.localName.toLowerCase())) {
            child.remove();
            continue;
        }

        cleanBasic(child);
    }
}

export function sanitizeSvg(svgText: string, mode: SanitizerMode = 'strict'): SVGElement | null {
    const document = new DOMParser().parseFromString(svgText, 'image/svg+xml');
    const root = document.documentElement;

    if (root.localName.toLowerCase() === 'parsererror' || document.querySelector('parsererror') !== null) {
        return null;
    }

    if (root.localName.toLowerCase() !== 'svg') {
        return null;
    }

    if (mode === 'strict') {
        cleanStrict(root);
    }
    else if (mode === 'basic') {
        cleanBasic(root);
    }

    if (!(root instanceof SVGElement)) {
        return null;
    }

    return root;
}
