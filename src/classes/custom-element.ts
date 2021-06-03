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

    private namespace: string;
    private pack: string;
    private symbol: string|null = null;
    private mode: string;

    constructor() {
        super();

        this.namespace = this.getAttributeValue('namespace', LIBRARY_DEFAULT_NAMESPACE);
        this.pack = this.getAttributeValue('pack', LIBRARY_DEFAULT_PACK);
        this.symbol = this.getAttribute('symbol');
        this.mode = this.getAttributeValue('mode', ELEMENT_DEFAULT_MODE);

        this.getIcon();
    }

    attributeChangedCallback() {
        this.onIconChange();
    }

    onIconChange() {
        let symbolChanged = false;
        let packChanged = false;
        let namespaceChanged = false;

        const namespace = this.getAttributeValue('namespace', LIBRARY_DEFAULT_NAMESPACE);
        const pack = this.getAttributeValue('pack', LIBRARY_DEFAULT_PACK);
        const symbol = this.getAttribute('symbol');

        if (this.namespace !== namespace) {
            namespaceChanged = true;
            this.namespace = namespace;
        }

        if (this.pack !== pack) {
            packChanged = true;
            this.pack = pack;
        }

        if (this.symbol !== symbol) {
            symbolChanged = true;
            this.symbol = symbol;
        }

        if (symbolChanged || packChanged || namespaceChanged) {
            this.getIcon();
        }
    }

    getAttributeValue(name: string, fallback: string): string {
        let attributeValue = this.getAttribute(name);

        if (attributeValue === null) {
            attributeValue = fallback;
        }

        return attributeValue;
    }

    getIcon() {
        IconHandlerService
            .getIcon({
                symbol: this.symbol,
                pack: this.pack,
                namespace: this.namespace
            })
            .then(data => {
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
