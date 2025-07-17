import { Iconly } from '../index.js';
import { type ConfigInterface, ElementData, defaultConfig } from './element-data.js';

export enum Attributes {
    Symbol = 'symbol',
    Pack = 'pack',
    Namespace = 'namespace',
    Src = 'src',
    Loading = 'loading',
}

export enum Loading {
    Lazy = 'lazy',
    Eager = 'eager',
}

export interface AttributesInterface {
    [Attributes.Symbol]?: string;
    [Attributes.Pack]?: string;
    [Attributes.Namespace]?: string;
    [Attributes.Src]?: string;
    [Attributes.Loading]?: string;
    [x: string]: unknown;
}

export class CustomElement extends HTMLElement {
    // Custom element tag name
    private readonly elementName: string;
    protected elementData: ElementData;

    // Attributes
    private elementAttributes: AttributesInterface = {
        [Attributes.Symbol]: undefined,
        [Attributes.Pack]: undefined,
        [Attributes.Namespace]: undefined,
        [Attributes.Src]: undefined,
        [Attributes.Loading]: undefined,
    };

    // Intersection observer state
    private isIntersected: boolean = false;

    // Timeout to prevent redundant attribute callbacks with simultaneous attribute modifications
    private attributeChangedTimeout: number | null = null;

    constructor() {
        super();

        this.elementName = this.tagName.toLowerCase();
        this.elementAttributes[Attributes.Loading] = this.getAttribute(Attributes.Loading) ?? Loading.Lazy;

        this.registerEvents();

        if (typeof Iconly.getElement(this.elementName) !== 'undefined') {
            this.elementData = Iconly.getElement(this.elementName);
        }
        else {
            this.elementData = new ElementData(this.elementName);
        }
    }

    public initializeCustomElement(
        element: string,
        config: Partial<ConfigInterface> = {},
        defineCustomElement: boolean = true,
    ): void {
        Iconly.createElement(element, config, defineCustomElement);

        this.elementData = Iconly.getElement(element);
    }

    private registerEvents(): void {
        this.addEventListener(`${this.elementName}-intersection`, this.onIntersection);
        this.addEventListener(`${this.elementName}-reload`, this.onReload);
    }

    private connectedCallback() {
        if (this.elementData.getIntersectionObserver() !== null
            && this.getAttribute(Attributes.Loading) !== Loading.Eager
        ) {
            this.elementData.getIntersectionObserver()?.observe(this);
        }
    }

    private disconnectedCallback() {
        if (this.elementData.getIntersectionObserver() !== null) {
            this.elementData.getIntersectionObserver()?.unobserve(this);
        }
    }

    static get observedAttributes(): string[] {
        return [
            Attributes.Symbol,
            Attributes.Pack,
            Attributes.Namespace,
            Attributes.Src,
            Attributes.Loading,
        ];
    }

    private attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (oldValue === newValue) {
            return;
        }

        this.elementAttributes[name] = newValue;

        if (([Attributes.Symbol, Attributes.Pack, Attributes.Namespace, Attributes.Src, Attributes.Loading] as string[]).includes(name)) {
            if (this.getAttributes()[Attributes.Loading] === Loading.Eager || this.isIntersected) {
                this.onIconChange();
            }
        }

        if (name === Attributes.Loading && newValue === Loading.Eager) {
            if (this.elementData.getIntersectionObserver() !== null) {
                this.elementData.getIntersectionObserver()?.unobserve(this);
            }
        }
        else {
            if (this.elementData.getIntersectionObserver() !== null) {
                this.elementData.getIntersectionObserver()?.observe(this);
            }
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
            1,
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

        if (attributes[Attributes.Namespace] === null) {
            attributes[Attributes.Namespace] = config.defaultNamespace;
        }

        if (attributes[Attributes.Pack] === null) {
            attributes[Attributes.Pack] = config.defaultPack;
        }

        if (attributes[Attributes.Loading] !== Loading.Eager) {
            attributes[Attributes.Loading] = Loading.Lazy;
        }

        return attributes;
    }

    private getIcon(): void {
        const attributes = this.getAttributes();
        if ((attributes[Attributes.Symbol] || attributes[Attributes.Src]) && typeof this.elementData !== 'undefined') {
            this.elementData
                .getIcon(this)
                .then((data) => {
                    if (typeof data === 'string' && this.sanitizeSvg(data) === null) {
                        this.iconLoadedError(new Error(`Unsafe SVG was blocked from ${this.outerHTML}`));
                    }
                    else if (typeof data === 'string') {
                        this.iconLoadedSuccess(data);
                    }
                }).catch((error) => {
                    this.iconLoadedError(error);
                });
        }
    }

    private getIconByAttributes(attributes: AttributesInterface) {
        const tempElement = document.createElement(this.elementName) as CustomElement;

        for (const [key, value] of Object.entries(attributes)) {
            if (typeof value === 'string') {
                tempElement.setAttribute(key, value);
            }
        }

        return this.elementData.getIcon(tempElement);
    }

    private iconLoadedSuccess(data: string): void {
        this.classList.remove('has--error');

        this.innerHTML = data;

        this.dispatchEvent(new CustomEvent(`${this.elementName}-loaded`, {
            bubbles: true,
            detail: {
                success: true,
                attributes: this.getAttributes(),
                element: this,
                fetch: this.getIconByAttributes.bind(this),
            },
        }));
    }

    private iconLoadedError(error: Error): void {
        this.classList.add('has--error');
        this.dispatchEvent(new CustomEvent(`${this.elementName}-error`, {
            bubbles: true,
            detail: {
                success: false,
                error: error,
                attributes: this.getAttributes(),
                element: this,
                fetch: this.getIconByAttributes.bind(this),
            },
        }));
        console.error(error);
    }

    private sanitizeSvg(svgText: string): string | null {
        const sandbox = window.document.createElement('template');
        sandbox.innerHTML = svgText;
        const svgEl = sandbox.content.firstElementChild!;
        const attributes = Array.from(svgEl.attributes).map(({ name }) => name);
        const hasScriptAttr = !!attributes.find(attr => attr.startsWith('on'));
        const disallowedSvgElements = svgEl.querySelectorAll(this.getElementData().getConfig().svgDisallowed.join(','));
        return disallowedSvgElements.length === 0 && !hasScriptAttr ? svgText : null;
    }
}
