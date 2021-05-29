import { LibraryService } from '../service/library-service';

export class CustomElement extends HTMLElement {
    static get observedAttributes() {
        return ['symbol', 'pack'];
    }

    private pack: string|null = null;
    private symbol: string|null = null;

    constructor() {
        super();

        this.pack = this.getAttribute('pack');
        this.symbol = this.getAttribute('symbol');

        this.getIcon(this.symbol, this.pack);
    }

    attributeChangedCallback() {
        this.onIconChange();
    }

    onIconChange() {
        let symbolChanged = false;
        let packChanged = false;

        if (this.symbol !== this.getAttribute('symbol')) {
            symbolChanged = true;
            this.symbol = this.getAttribute('symbol');
        }

        if (this.pack !== this.getAttribute('pack')) {
            packChanged = true;
            this.pack = this.getAttribute('pack');
        }

        if (symbolChanged || packChanged) {
            this.getIcon(this.symbol, this.pack);
        }
    }

    getIcon(symbol: string|null, pack: string|null) {
        LibraryService.getInstance()
            .get(
                symbol,
                pack
            ).then(data => {
                this.innerHTML = data;
            }).catch(() => {
                this.innerHTML = '';
            });
    }
};
