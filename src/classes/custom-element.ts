import { LIBRARY_DEFAULT_NAMESPACE, LIBRARY_DEFAULT_PACK } from './library';
import { IconHandlerService } from '../service/icon-handler-service';

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

    constructor() {
        super();

        this.namespace = this.getAttributeValue('namespace', LIBRARY_DEFAULT_NAMESPACE);
        this.pack = this.getAttributeValue('pack', LIBRARY_DEFAULT_PACK);
        this.symbol = this.getAttribute('symbol');

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
                this.innerHTML = data;
            }).catch((error) => {
                this.classList.add('has--error');
                console.error(error);
            });
    }
}
