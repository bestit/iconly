import { Iconly } from '../index';
import { ConfigInterface, ElementData, defaultConfig } from './element-data';
import { LibraryTreeInterface } from './library';

const ENCODE_SVG_SYMBOLS: RegExp = /[\r\n%#()<>?[\\\]^`{|}]/g;

export const ATTRIBUTE_SYMBOL = 'symbol';
export const ATTRIBUTE_PACK = 'pack';
export const ATTRIBUTE_NAMESPACE = 'namespace';
export const ATTRIBUTE_FETCH_PATTERN = 'fetchPattern';

export const ATTRIBUTE_ROTATE = 'rotate';
export const ATTRIBUTE_FLIP = 'flip';

export const ATTRIBUTE_MODE = 'mode';
export const ATTRIBUTE_MODE_INLINE = 'inline';
export const ATTRIBUTE_MODE_REPLACE = 'replace';
export const ATTRIBUTE_MODE_WRAP = 'wrap';
export const ATTRIBUTE_MODE_PREPEND = 'prepend';
export const ATTRIBUTE_MODE_APPEND = 'append';

export const ATTRIBUTE_LOADING = 'loading';
export const ATTRIBUTE_LOADING_LAZY = 'lazy';
export const ATTRIBUTE_LOADING_EAGER = 'eager';

export interface AttributesInterface extends Object {
    [ATTRIBUTE_SYMBOL]: string|null,
    [ATTRIBUTE_PACK]: string|null,
    [ATTRIBUTE_NAMESPACE]: string|null,
    [ATTRIBUTE_FETCH_PATTERN]: string|null,

    [ATTRIBUTE_ROTATE]: string|null,
    [ATTRIBUTE_FLIP]: string|null,

    [ATTRIBUTE_MODE]: string|null,
    [ATTRIBUTE_LOADING]: string|null,
}

export class CustomElement extends HTMLElement {
    // Custom element tag name
    private elementName: string;
    protected elementData: ElementData;

    // Attributes
    private elementAttributes: AttributesInterface = {
        [ATTRIBUTE_SYMBOL]: null,
        [ATTRIBUTE_PACK]: null,
        [ATTRIBUTE_NAMESPACE]: null,
        [ATTRIBUTE_FETCH_PATTERN]: null,

        [ATTRIBUTE_ROTATE]: null,
        [ATTRIBUTE_FLIP]: null,

        [ATTRIBUTE_MODE]: null,
        [ATTRIBUTE_LOADING]: null,
    };

    // Intersection observer state
    private isIntersected: boolean = false;

    // Timeout to prevent redundant attribtue callbacks with simultaneous attribute modifications
    private attributeChangedTimeout = null;

    constructor() {
        super();

        this.elementName = this.tagName.toLowerCase();

        this.elementAttributes[ATTRIBUTE_MODE] = this.getAttribute(ATTRIBUTE_MODE);
        this.elementAttributes[ATTRIBUTE_LOADING] = this.getAttribute(ATTRIBUTE_LOADING);

        this.registerEvents();

        if (typeof Iconly.getElement(this.elementName) !== 'undefined') {
            this.elementData = Iconly.getElement(this.elementName);
        }
    }

    public initializeCustomElement(
        element: string,
        config: ConfigInterface = {},
        libraryTree: LibraryTreeInterface = {},
        defineCustomElement: boolean = true
    ): void {
        Iconly.createElement(element, config, libraryTree, defineCustomElement);

        this.elementData = Iconly.getElement(element);
    }

    private registerEvents(): void {
        this.addEventListener(`${this.elementName}-intersection`, this.onIntersection);
        this.addEventListener(`${this.elementName}-reload`, this.onReload);
    }

    private connectedCallback() {
        if (this.elementData.getIntersectionObserver() !== null &&
            this.getAttribute(ATTRIBUTE_LOADING) === ATTRIBUTE_LOADING_LAZY
        ) {
            this.elementData.getIntersectionObserver().observe(this);
        }
    }

    private disconnectedCallback() {
        if (this.elementData.getIntersectionObserver() !== null) {
            this.elementData.getIntersectionObserver().unobserve(this);
        }
    }

    static get observedAttributes(): string[] {
        return [
            ATTRIBUTE_SYMBOL,
            ATTRIBUTE_PACK,
            ATTRIBUTE_NAMESPACE,
            ATTRIBUTE_FETCH_PATTERN,
            ATTRIBUTE_ROTATE,
            ATTRIBUTE_FLIP,
            ATTRIBUTE_LOADING
        ];
    }

    private attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (oldValue === newValue) {
            return;
        }

        this.elementAttributes[name] = newValue;

        if ([ATTRIBUTE_SYMBOL, ATTRIBUTE_PACK, ATTRIBUTE_NAMESPACE, ATTRIBUTE_LOADING].includes(name)) {
            if (this.getAttributes()[ATTRIBUTE_LOADING] === ATTRIBUTE_LOADING_EAGER || this.isIntersected) {
                this.onIconChange();
            }
        }

        if (name === ATTRIBUTE_LOADING && newValue === ATTRIBUTE_LOADING_LAZY) {
            if (this.elementData.getIntersectionObserver() !== null) {
                this.elementData.getIntersectionObserver().observe(this);
            }
        }

        if (name === ATTRIBUTE_LOADING && newValue === ATTRIBUTE_LOADING_EAGER) {
            if (this.elementData.getIntersectionObserver() !== null) {
                this.elementData.getIntersectionObserver().unobserve(this);
            }
        }

        if (name === ATTRIBUTE_ROTATE) {
            this.style.setProperty(`--icon-${name}`, newValue);
        }

        if (name === ATTRIBUTE_FLIP) {
            this.style.setProperty(`--icon-${name}`, this.flip(newValue));
        }
    }

    private onIconChange(): void {
        if (this.attributeChangedTimeout) {
            clearTimeout(this.attributeChangedTimeout);
        }

        this.attributeChangedTimeout = setTimeout(
            () => {
                this.getIcon();
            },
            1
        );
    }

    private onIntersection(): void {
        this.isIntersected = true;
        this.getIcon();
    }

    private onReload(): void {
        this.getIcon();
    }

    public getElementData(): ElementData {
        return this.elementData;
    }

    public getAttributes(): AttributesInterface {
        const attributes = this.elementAttributes;
        const config = typeof this.elementData !== 'undefined' ? this.elementData.getConfig() : defaultConfig;

        if (attributes[ATTRIBUTE_NAMESPACE] === null) {
            attributes[ATTRIBUTE_NAMESPACE] = config.defaultNamespace;
        }

        if (attributes[ATTRIBUTE_PACK] === null) {
            attributes[ATTRIBUTE_PACK] = config.defaultPack;
        }

        if (attributes[ATTRIBUTE_FETCH_PATTERN] === null) {
            attributes[ATTRIBUTE_FETCH_PATTERN] = config.defaultFetchPattern;
        }

        if (attributes[ATTRIBUTE_MODE] !== ATTRIBUTE_MODE_WRAP &&
            attributes[ATTRIBUTE_MODE] !== ATTRIBUTE_MODE_INLINE &&
            attributes[ATTRIBUTE_MODE] !== ATTRIBUTE_MODE_PREPEND &&
            attributes[ATTRIBUTE_MODE] !== ATTRIBUTE_MODE_APPEND
        ) {
            attributes[ATTRIBUTE_MODE] = ATTRIBUTE_MODE_REPLACE;
        }

        if (attributes[ATTRIBUTE_LOADING] !== ATTRIBUTE_LOADING_LAZY) {
            attributes[ATTRIBUTE_LOADING] = ATTRIBUTE_LOADING_EAGER;
        }

        return attributes;
    }

    private getIcon(): void {
        if (this.getAttributes()[ATTRIBUTE_MODE] === ATTRIBUTE_MODE_INLINE || typeof this.elementData === 'undefined') {
            return;
        }

        this.elementData
            .getIcon(this)
            .then(data => {
                this.iconLoadedSuccess(data);
            }).catch((error) => {
                this.iconLoadedError(error);
            });
    }

    private iconLoadedSuccess(data: string): void {
        this.classList.remove('has--error');

        if (this.getAttributes()[ATTRIBUTE_MODE] === ATTRIBUTE_MODE_REPLACE) {
            this.innerHTML = data;
        }

        if (this.getAttributes()[ATTRIBUTE_MODE] === ATTRIBUTE_MODE_PREPEND) {
            if (this.innerHTML.indexOf(data) === -1) {
                this.innerHTML = data + this.innerHTML;
            }
        }

        if (this.getAttributes()[ATTRIBUTE_MODE] === ATTRIBUTE_MODE_APPEND) {
            if (this.innerHTML.indexOf(data) === -1) {
                this.innerHTML = this.innerHTML + data;
            }
        }

        if (this.getAttributes()[ATTRIBUTE_MODE] === ATTRIBUTE_MODE_WRAP) {
            this.style.setProperty('--icon', this.encodeCssUrl(data));
        }

        this.dispatchEvent(new CustomEvent<any>(`${this.elementName}-loaded`, {
            bubbles: true,
            detail: {
                success: true,
                attributes: this.getAttributes(),
            }
        }));
    }

    private iconLoadedError(error: Error): void {
        this.classList.add('has--error');
        this.dispatchEvent(new CustomEvent<any>(`${this.elementName}-loaded`, {
            bubbles: true,
            detail: {
                success: false,
                message: error.message,
                attributes: this.getAttributes(),
            }
        }));
        console.error(error);
    }

    private flip(value: string): string|null {
        let flipDirection: string|null;

        switch (value) {
        case 'horizontal':
            flipDirection = 'scaleX(-1)';
            break;
        case 'vertical':
            flipDirection = 'scaleY(-1)';
            break;
        case 'both':
            flipDirection = 'scaleX(-1) scaleY(-1)';
            break;
        default:
            flipDirection = null;
        }

        return flipDirection;
    }

    private encodeCssUrl(inlineSvg: string): string {
        inlineSvg = inlineSvg.replace(/"/g, '\'');
        inlineSvg = inlineSvg.replace(/>\s+</g, '><');
        inlineSvg = inlineSvg.replace(/\s{2,}/g, ' ');

        return `url("data:image/svg+xml,${inlineSvg.replace(ENCODE_SVG_SYMBOLS, encodeURIComponent)}")`;
    }
}
