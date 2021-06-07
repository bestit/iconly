import { encodeCssUrl } from '../utils/encode-svg';
import { IconService } from '../index';
import { ElementData } from './element-data';

export const ATTRIBUTE_SYMBOL = 'symbol';
export const ATTRIBUTE_PACK = 'pack';
export const ATTRIBUTE_NAMESPACE = 'namespace';

export const ATTRIBUTE_ROTATE = 'rotate';
export const ATTRIBUTE_FLIP = 'flip';

export const ATTRIBUTE_MODE = 'mode';
export const ATTRIBUTE_MODE_INLINE = 'inline';
export const ATTRIBUTE_MODE_WRAP = 'wrap';

export const ATTRIBUTE_LOADING = 'loading';
export const ATTRIBUTE_LOADING_LAZY = 'lazy';
export const ATTRIBUTE_LOADING_EAGER = 'eager';

export interface AttributesInterface extends Object {
    [ATTRIBUTE_SYMBOL]: string|null,
    [ATTRIBUTE_PACK]: string|null,
    [ATTRIBUTE_NAMESPACE]: string|null,

    [ATTRIBUTE_ROTATE]: string|null,
    [ATTRIBUTE_FLIP]: string|null,

    [ATTRIBUTE_MODE]: string|null,
    [ATTRIBUTE_LOADING]: string|null,
}

export class CustomElement extends HTMLElement {
    // Custom element tag name
    #elementName: string|null = null;
    #elementData: ElementData;

    // Attributes
    #attributes: AttributesInterface = {
        [ATTRIBUTE_SYMBOL]: null,
        [ATTRIBUTE_PACK]: null,
        [ATTRIBUTE_NAMESPACE]: null,

        [ATTRIBUTE_ROTATE]: null,
        [ATTRIBUTE_FLIP]: null,

        [ATTRIBUTE_MODE]: null,
        [ATTRIBUTE_LOADING]: null,
    };

    // Intersection observer state
    #isIntersected: boolean = false;

    // Timeout to prevent redundant attribtue callbacks with simultaneous attribute modifications
    #attributeChangedTimeout = null;

    constructor() {
        super();

        this.#elementName = this.tagName.toLowerCase();
        this.#elementData = IconService.getElement(this.#elementName);

        this.#attributes[ATTRIBUTE_MODE] = this.getAttribute(ATTRIBUTE_MODE);
        this.#attributes[ATTRIBUTE_LOADING] = this.getAttribute(ATTRIBUTE_LOADING);

        this.registerEvents();
    }

    private registerEvents(): void {
        this.addEventListener(`${this.#elementName}-intersection`, this.onIntersection);
    }

    static get observedAttributes() {
        return [
            ATTRIBUTE_SYMBOL,
            ATTRIBUTE_PACK,
            ATTRIBUTE_NAMESPACE,
            ATTRIBUTE_ROTATE,
            ATTRIBUTE_FLIP
        ];
    }

    private attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (oldValue === newValue) {
            return;
        }

        this.#attributes[name] = newValue;

        if ([ATTRIBUTE_SYMBOL, ATTRIBUTE_PACK, ATTRIBUTE_NAMESPACE].includes(name)) {
            if (this.getAttributes()[ATTRIBUTE_LOADING] === ATTRIBUTE_LOADING_EAGER || this.#isIntersected) {
                this.onIconChange();
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
        if (this.#attributeChangedTimeout) {
            clearTimeout(this.#attributeChangedTimeout);
        }

        this.#attributeChangedTimeout = setTimeout(
            () => {
                this.getIcon();
            },
            1
        );
    }

    private onIntersection(): void {
        this.#isIntersected = true;
        this.getIcon();
    }

    private getAttributes(): AttributesInterface {
        const attributes = this.#attributes;
        const config = this.#elementData.getConfig();

        if (attributes[ATTRIBUTE_NAMESPACE] === null) {
            attributes[ATTRIBUTE_NAMESPACE] = config.defaultNamespace;
        }

        if (attributes[ATTRIBUTE_PACK] === null) {
            attributes[ATTRIBUTE_PACK] = config.defaultPack;
        }

        if (attributes[ATTRIBUTE_MODE] !== ATTRIBUTE_MODE_WRAP) {
            attributes[ATTRIBUTE_MODE] = ATTRIBUTE_MODE_INLINE;
        }

        if (attributes[ATTRIBUTE_LOADING] !== ATTRIBUTE_LOADING_LAZY) {
            attributes[ATTRIBUTE_LOADING] = ATTRIBUTE_LOADING_EAGER;
        }

        return attributes;
    }

    private getIcon(): void {
        this.#elementData
            .getIcon(this.getAttributes())
            .then(data => {
                this.iconLoadedSuccess(data);
            }).catch((error) => {
                this.iconLoadedError(error);
            });
    }

    private iconLoadedSuccess(data: string): void {
        this.classList.remove('has--error');

        if (this.getAttributes()[ATTRIBUTE_MODE] === ATTRIBUTE_MODE_INLINE) {
            this.innerHTML = data;
        }

        if (this.getAttributes()[ATTRIBUTE_MODE] === ATTRIBUTE_MODE_WRAP) {
            this.style.setProperty('--icon', encodeCssUrl(data));
        }

        this.dispatchEvent(new CustomEvent<any>(`${this.#elementName}-loaded`, {
            bubbles: true,
            detail: {
                success: true,
                attributes: this.getAttributes(),
            }
        }));
    }

    private iconLoadedError(error: Error): void {
        this.classList.add('has--error');
        this.dispatchEvent(new CustomEvent<any>(`${this.#elementName}-loaded`, {
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
}
