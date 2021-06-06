import { IconHandlerService } from '../service/icon-handler-service';
import { LibraryService } from '../service/library-service';
import { encodeCssUrl } from '../utils/encode-svg';

export const ELEMENT_DEFAULT_MODE = 'inline';
export const ELEMENT_LAZY_LOADING_ATTRIBUTE = 'loading';
export const ELEMENT_LAZY_LOADING_VALUE = 'lazy';

export interface ElementAttributesInterface extends Object {
    symbol?: string|null,
    pack?: string|null,
    namespace?: string|null,
}

export class CustomElement extends HTMLElement {
    // Custom element tag name
    private elementName: string|null = null;

    // Defaults
    private defaultNamespace: string;
    private defaultPack: string;

    // Attributes
    private namespace: string|null = null;
    private pack: string|null = null;
    private symbol: string|null = null;
    private mode: string;
    private lazyLoading: boolean = false;

    // Intersection observer state
    private isIntersected: boolean = false;

    // Timeout to prevent redundant attribtue callbacks with simultaneous attribute modifications
    private attributeChangedTimeout = null;

    constructor() {
        super();

        this.elementName = this.tagName.toLowerCase();

        this.defaultNamespace = LibraryService.getDefaultNamespace(this.elementName);
        this.defaultPack = LibraryService.getDefaultPack(this.elementName);
        this.mode = this.getAttribute('mode') || ELEMENT_DEFAULT_MODE;
        this.lazyLoading =
            this.getAttribute(ELEMENT_LAZY_LOADING_ATTRIBUTE) === ELEMENT_LAZY_LOADING_VALUE &&
            'IntersectionObserver' in window;

        this.registerEvents();
    }

    private registerEvents(): void {
        this.addEventListener(`${this.elementName}-intersection`, this.onIntersection);
    }

    static get observedAttributes() {
        return ['symbol', 'pack', 'namespace', 'rotate', 'flip'];
    }

    private attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (oldValue === newValue) {
            return;
        }

        if (['namespace', 'pack', 'symbol'].includes(name)) {
            this[name] = newValue;

            if (!this.lazyLoading || this.isIntersected) {
                this.onIconChange();
            }
        }

        if (name === 'rotate') {
            this.style.setProperty(`--icon-${name}`, newValue);
        }

        if (name === 'flip') {
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

    private getIcon(): void {
        IconHandlerService
            .getIcon(this.elementName, {
                symbol: this.symbol,
                pack: this.pack || this.defaultPack,
                namespace: this.namespace || this.defaultNamespace,
            })
            .then(data => {
                this.iconLoadedSuccess(data);
            }).catch((error) => {
                this.iconLoadedError(error);
            });
    }

    private iconLoadedSuccess(data: string): void {
        this.classList.remove('has--error');

        if (this.mode === 'inline') {
            this.innerHTML = data;
        }

        if (this.mode === 'wrap') {
            this.style.setProperty('--icon', encodeCssUrl(data));
        }

        this.dispatchEvent(new CustomEvent<any>(`${this.elementName}-loaded`, {
            bubbles: true,
            detail: {
                success: true,
                attributes: {
                    symbol: this.symbol,
                    pack: this.pack || this.defaultPack,
                    namespace: this.namespace || this.defaultNamespace
                },
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
                attributes: {
                    symbol: this.symbol,
                    pack: this.pack || this.defaultPack,
                    namespace: this.namespace || this.defaultNamespace
                },
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
}
