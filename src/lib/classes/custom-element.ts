import {
    Attributes,
    type AttributeName,
    type AttributesInterface,
    type IconlyErrorDetail,
    type IconlyLoadedDetail,
    Loading,
    type LoadingMode,
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

function loadingMode(value: string | null): LoadingMode {
    return value === Loading.Eager ? Loading.Eager : Loading.Lazy;
}

function attributesWithDefaults(attributes: AttributesInterface, config: ConfigInterface): AttributesInterface {
    const resolved: AttributesInterface = { ...attributes };

    if (resolved[Attributes.Namespace] == null) {
        resolved[Attributes.Namespace] = config.defaultNamespace;
    }

    if (resolved[Attributes.Pack] == null) {
        resolved[Attributes.Pack] = config.defaultPack;
    }

    if (resolved[Attributes.Loading] !== Loading.Eager) {
        resolved[Attributes.Loading] = Loading.Lazy;
    }

    return resolved;
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
        this.elementAttributes[Attributes.Loading] = loadingMode(this.getAttribute(Attributes.Loading));
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

        if (key === Attributes.Loading) {
            this.elementAttributes[key] = loadingMode(value);
            return;
        }

        this.elementAttributes[key] = value;
    }

    public getElementData(): ElementData {
        return this.elementData;
    }

    public getAttributes(): AttributesInterface {
        return attributesWithDefaults(this.elementAttributes, this.elementData.getConfig() ?? defaultConfig);
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
        const resolved = attributesWithDefaults(attributes, this.elementData.getConfig() ?? defaultConfig);
        const source = {
            getElementData: () => this.elementData,
            getAttributes: () => resolved,
        } as CustomElement;

        return this.elementData.getIcon(source);
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
