import { LIBRARY_DEFAULT_NAMESPACE, LIBRARY_DEFAULT_PACK } from './library';
import { IconHandlerService } from '../service/icon-handler-service';
import { ConfigService } from '../service/config-service';
import { encodeSvg } from '../utils/encode-svg';

export const ELEMENT_DEFAULT_MODE = 'inline';
export const ELEMENT_LAZY_LOADING_ATTRIBUTE = 'loading';
export const ELEMENT_LAZY_LOADING_VALUE = 'lazy';

export interface ElementAttributesInterface extends Object {
    symbol?: string|null,
    pack?: string|null,
    namespace?: string|null,
}

export class CustomElement extends HTMLElement {
    static get observedAttributes() {
        return ['symbol', 'pack', 'namespace'];
    }

    private elementName: string|null = null;
    private namespace: string|null = null;
    private pack: string|null = null;
    private symbol: string|null = null;
    private mode: string;
    private lazyLoading: boolean = false;
    private isIntersected: boolean = false;
    // Timeout to prevent multiple calls on multiple attribute modifications
    private attributeChangedTimeout = null;

    constructor() {
        super();
        this.elementName = ConfigService.getConfig().elementName;
        this.mode = this.getAttribute('mode') || ELEMENT_DEFAULT_MODE;
        this.lazyLoading =
            this.getAttribute(ELEMENT_LAZY_LOADING_ATTRIBUTE) === ELEMENT_LAZY_LOADING_VALUE &&
            'IntersectionObserver' in window;

        this.registerEvents();
    }

    registerEvents() {
        this.addEventListener(`${this.elementName}-intersection`, this.onIntersection);
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (oldValue !== newValue && ['namespace', 'pack', 'symbol'].includes(name)) {
            this[name] = newValue;

            if (!this.lazyLoading || this.isIntersected) {
                this.onIconChange();
            }
        }
    }

    onIconChange() {
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

    onIntersection() {
        this.isIntersected = true;
        this.getIcon();
    }

    getIcon() {
        IconHandlerService
            .getIcon({
                symbol: this.symbol,
                pack: this.pack || LIBRARY_DEFAULT_PACK,
                namespace: this.namespace || LIBRARY_DEFAULT_NAMESPACE
            })
            .then(data => {
                this.classList.remove('has--error');

                if (this.mode === 'inline') {
                    this.innerHTML = data;
                }

                if (this.mode === 'wrap') {
                    this.style.setProperty('--icon', this.getCssUrl(data));
                }

                this.dispatchEvent(new CustomEvent<any>(`${this.elementName}-loaded`, {
                    bubbles: true,
                    detail: {
                        success: true,
                        attributes: {
                            symbol: this.symbol,
                            pack: this.pack || LIBRARY_DEFAULT_PACK,
                            namespace: this.namespace || LIBRARY_DEFAULT_NAMESPACE
                        },
                    }
                }));
            }).catch((error) => {
                this.classList.add('has--error');
                this.dispatchEvent(new CustomEvent<any>(`${this.elementName}-loaded`, {
                    bubbles: true,
                    detail: {
                        success: false,
                        message: error.message,
                        attributes: {
                            symbol: this.symbol,
                            pack: this.pack || LIBRARY_DEFAULT_PACK,
                            namespace: this.namespace || LIBRARY_DEFAULT_NAMESPACE
                        },
                    }
                }));
                console.error(error);
            });
    }

    getCssUrl(inlineSvg: string): string {
        const encodedSvg = encodeSvg(inlineSvg);

        return `url("data:image/svg+xml,${encodedSvg}")`;
    }
}
