import { LIBRARY_DEFAULT_NAMESPACE, LIBRARY_DEFAULT_PACK } from './library';
import { IconHandlerService } from '../service/icon-handler-service';
import { encodeSvg } from '../utils/encode-svg';

export const ELEMENT_DEFAULT_MODE = 'inline';

export interface ElementAttributesInterface extends Object {
    symbol?: string|null,
    pack?: string|null,
    namespace?: string|null,
}

export class CustomElement extends HTMLElement {
    static get observedAttributes() {
        return ['symbol', 'pack', 'namespace'];
    }

    private namespace: string|null = null;
    private pack: string|null = null;
    private symbol: string|null = null;
    private mode: string;
    // Timeout to prevent multiple calls on multiple attribute modifications
    private attributeChangedTimeout = null;

    constructor() {
        super();

        this.mode = this.getAttribute('mode') || ELEMENT_DEFAULT_MODE;
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (oldValue !== newValue && ['namespace', 'pack', 'symbol'].includes(name)) {
            this[name] = newValue;

            this.onIconChange();
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
            }).catch((error) => {
                this.classList.add('has--error');
                console.error(error);
            });
    }

    getCssUrl(inlineSvg: string): string {
        const encodedSvg = encodeSvg(inlineSvg);

        return `url("data:image/svg+xml,${encodedSvg}")`;
    }
}
