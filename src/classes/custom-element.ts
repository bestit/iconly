import { LIBRARY_DEFAULT_NAMESPACE } from './library';
import { LIBRARY_DEFAULT_PACK } from './library';
import { LibraryService } from '../service/library-service';

export class CustomElement extends HTMLElement {
    static get observedAttributes() {
        return ['symbol', 'pack'];
    }
    
    private namespace: string|null = null;
    private pack: string|null = null;
    private symbol: string|null = null;

    constructor() {
        super();

        this.namespace = this.getAttributeValue('namespace', LIBRARY_DEFAULT_NAMESPACE);
        this.pack = this.getAttributeValue('pack', LIBRARY_DEFAULT_PACK);
        this.symbol = this.getAttribute('symbol');

        this.getIcon(this.symbol, this.pack, this.namespace);
    }

    attributeChangedCallback() {
        this.onIconChange();
    }

    onIconChange() {
        let symbolChanged = false;
        let packChanged = false;
        let namespaceChanged = false;

        const namespace = this.getAttributeValue('namespace', LIBRARY_DEFAULT_NAMESPACE);
        const pack = this.getAttributeValue('namespace', LIBRARY_DEFAULT_PACK);
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
            this.getIcon(this.symbol, this.pack, this.namespace);
        }
    }

    getAttributeValue(name: string, fallback: string): string {
        let attributeValue = this.getAttribute(name);

        if (attributeValue === null) {
            attributeValue = fallback
        }

        return attributeValue;
    }

    getIcon(symbol: string, pack: string, namespace: string) {
        LibraryService.getInstance()
            .get(
                symbol,
                pack,
                namespace
            ).then(data => {
                this.innerHTML = data;
            }).catch(() => {
                this.innerHTML = '';
            });
    }
};
