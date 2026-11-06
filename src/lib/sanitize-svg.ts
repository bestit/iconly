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
]);

const URL_VALUE = /url\s*\(\s*(['"]?)([^'")]+)\1\s*\)/gi;

function isUnsafeAttribute(name: string, value: string): boolean {
    const normalized = name.toLowerCase();

    if (normalized.startsWith('on')) {
        return true;
    }

    if (normalized === 'style' || normalized === 'src' || normalized === 'href' || normalized.endsWith(':href')) {
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

function isAllowedElement(element: Element, disallowed: readonly string[]): boolean {
    const name = element.localName.toLowerCase();

    if (!ALLOWED_ELEMENTS.has(name)) {
        return false;
    }

    return !disallowed.some(entry => entry.toLowerCase() === name);
}

function cleanElement(element: Element, disallowed: readonly string[]): void {
    for (const attribute of [...element.attributes]) {
        if (isUnsafeAttribute(attribute.name, attribute.value)) {
            element.removeAttribute(attribute.name);
        }
    }

    for (const child of [...element.children]) {
        if (!isAllowedElement(child, disallowed)) {
            child.remove();
            continue;
        }

        cleanElement(child, disallowed);
    }
}

export function sanitizeSvg(svgText: string, disallowed: readonly string[] = []): SVGElement | null {
    const document = new DOMParser().parseFromString(svgText, 'image/svg+xml');
    const root = document.documentElement;

    if (root.localName.toLowerCase() === 'parsererror' || document.querySelector('parsererror') !== null) {
        return null;
    }

    if (!isAllowedElement(root, disallowed)) {
        return null;
    }

    cleanElement(root, disallowed);

    if (!(root instanceof SVGElement)) {
        return null;
    }

    return root;
}
