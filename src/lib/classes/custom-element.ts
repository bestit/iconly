import {
    Attributes,
    type AttributeName,
    type AttributesInterface,
    type IconlyErrorDetail,
    type IconlyLoadedDetail,
    Loading,
} from '../attributes.js';
import { defaultConfig, ElementData, type ConfigInterface } from './element-data.js';
import { dropIconRequest } from '../icon-request.js';
import { resolveIconRequestUrl } from '../icon-url.js';
import { getRegisteredElement, registerElement } from '../registry.js';
import { sanitizeSvg } from '../sanitize-svg.js';

export type { AttributesInterface, IconlyErrorDetail, IconlyLoadedDetail, LoadingMode } from '../attributes.js';
export { Attributes, Loading } from '../attributes.js';

function elementBase(): typeof HTMLElement {
    if (typeof globalThis.HTMLElement === 'function') {
        return globalThis.HTMLElement;
    }

    return class {} as unknown as typeof HTMLElement;
}

export function defineIconlyElement(
    element: string,
    config: Partial<ConfigInterface> = {},
    defineCustomElement: boolean = true,
): void {
    registerElement(element, config);

    if (defineCustomElement) {
        window.customElements.define(element, class extends CustomElement {});
    }
}

export class CustomElement extends elementBase() {
    private readonly elementName: string;
    protected elementData: ElementData;
    private elementAttributes: AttributesInterface = {};
    private isIntersected: boolean = false;
    private attributeChangedTimeout: number | null = null;
    private requestId: number = 0;

    constructor() {
        super();

        this.elementName = this.tagName.toLowerCase();
        this.elementAttributes[Attributes.Loading] = this.getAttribute(Attributes.Loading) ?? Loading.Lazy;
        this.elementData = getRegisteredElement(this.elementName) ?? new ElementData(this.elementName);
        this.registerEvents();
    }

    public initializeCustomElement(
        element: string,
        config: Partial<ConfigInterface> = {},
        defineCustomElement: boolean = true,
    ): void {
        defineIconlyElement(element, config, defineCustomElement);
        const registered = getRegisteredElement(element);

        if (registered !== undefined) {
            this.elementData = registered;
        }
    }

    public static get observedAttributes(): string[] {
        return [
            Attributes.Symbol,
            Attributes.Pack,
            Attributes.Namespace,
            Attributes.Src,
            Attributes.Loading,
        ];
    }

    public connectedCallback(): void {
        const observer = this.elementData.getIntersectionObserver();
        const loading = this.getAttributes()[Attributes.Loading];

        if (loading === Loading.Eager || observer === null) {
            this.onIconChange();
            return;
        }

        observer.observe(this);
    }

    public disconnectedCallback(): void {
        if (this.attributeChangedTimeout !== null) {
            clearTimeout(this.attributeChangedTimeout);
            this.attributeChangedTimeout = null;
        }

        this.elementData.getIntersectionObserver()?.unobserve(this);
    }

    public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
        if (oldValue === newValue) {
            return;
        }

        this.writeAttribute(name, newValue);

        this.syncObserver();

        const loading = this.getAttributes()[Attributes.Loading];
        const observerMissing = this.elementData.getIntersectionObserver() === null;

        if (loading === Loading.Eager || this.isIntersected || observerMissing) {
            this.onIconChange();
        }
    }

    private writeAttribute(name: string, value: string | null): void {
        if (!(Object.values(Attributes) as readonly string[]).includes(name)) {
            return;
        }

        const key = name as AttributeName;

        if (value === null) {
            delete this.elementAttributes[key];
            return;
        }

        this.elementAttributes[key] = value;
    }

    public getElementData(): ElementData {
        return this.elementData;
    }

    public getAttributes(): AttributesInterface {
        const config = this.elementData.getConfig() ?? defaultConfig;
        const attributes: AttributesInterface = { ...this.elementAttributes };

        if (attributes[Attributes.Namespace] == null) {
            attributes[Attributes.Namespace] = config.defaultNamespace;
        }

        if (attributes[Attributes.Pack] == null) {
            attributes[Attributes.Pack] = config.defaultPack;
        }

        if (attributes[Attributes.Loading] !== Loading.Eager) {
            attributes[Attributes.Loading] = Loading.Lazy;
        }

        return attributes;
    }

    private registerEvents(): void {
        this.addEventListener(`${this.elementName}-intersection`, this.onIntersection);
        this.addEventListener(`${this.elementName}-reload`, this.onReload);
    }

    private syncObserver(): void {
        const observer = this.elementData.getIntersectionObserver();

        if (observer === null) {
            return;
        }

        if (this.getAttributes()[Attributes.Loading] === Loading.Eager) {
            observer.unobserve(this);
            return;
        }

        observer.observe(this);
    }

    private onIconChange(): void {
        if (this.attributeChangedTimeout !== null) {
            clearTimeout(this.attributeChangedTimeout);
        }

        this.attributeChangedTimeout = window.setTimeout(() => {
            this.attributeChangedTimeout = null;
            this.getIcon();
        }, 1);
    }

    private onIntersection(): void {
        this.isIntersected = true;
        this.getIcon();
    }

    private onReload(): void {
        const attributes = this.getAttributes();
        const config = this.elementData.getConfig();
        let url: string | undefined;

        try {
            url = resolveIconRequestUrl({
                symbol: attributes[Attributes.Symbol],
                pack: attributes[Attributes.Pack],
                namespace: attributes[Attributes.Namespace],
                src: attributes[Attributes.Src],
                fetchPattern: config.fetchPattern,
                allowedOrigins: config.allowedOrigins,
            });
        }
        catch {
            url = undefined;
        }

        void (async () => {
            if (url !== undefined) {
                await dropIconRequest(url);
            }

            this.getIcon();
        })();
    }

    private getIcon(): void {
        const requestId = ++this.requestId;
        const attributes = this.getAttributes();

        if (!(attributes[Attributes.Symbol] || attributes[Attributes.Src])) {
            return;
        }

        this.elementData
            .getIcon(this)
            .then((data) => {
                if (requestId !== this.requestId || typeof data !== 'string') {
                    return;
                }

                const svg = sanitizeSvg(data, this.elementData.getConfig().svgDisallowed);

                if (svg === null) {
                    this.iconLoadedError(new Error('Unsafe SVG was blocked'));
                    return;
                }

                this.iconLoadedSuccess(svg);
            })
            .catch((error: unknown) => {
                if (requestId !== this.requestId) {
                    return;
                }

                this.iconLoadedError(error instanceof Error ? error : new Error(String(error)));
            });
    }

    private getIconByAttributes(attributes: AttributesInterface): Promise<string | undefined> {
        const tempElement = document.createElement(this.elementName) as CustomElement;

        for (const [key, value] of Object.entries(attributes)) {
            if (typeof value === 'string') {
                tempElement.setAttribute(key, value);
            }
        }

        return this.elementData.getIcon(tempElement);
    }

    private iconLoadedSuccess(svg: SVGElement): void {
        this.classList.remove('has--error');
        this.replaceChildren(document.importNode(svg, true));
        this.dispatchEvent(new CustomEvent<IconlyLoadedDetail>(`${this.elementName}-loaded`, {
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
        this.dispatchEvent(new CustomEvent<IconlyErrorDetail>(`${this.elementName}-error`, {
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
}
