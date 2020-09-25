export class Library {
    library: any = {};

    constructor(library: any = {}) {
        this.library = library;
    }

    async get(symbol: string): Promise<string|null> {
        const entry = this.library[symbol];

        if (entry?.type === 'internal') {
            return entry.source;
        } else if (entry?.type === 'id') {
            return Library.getSvgDef(entry.source);
        } else if (entry?.type === 'url') {
            // eslint-disable-next-line no-return-await
            return await Library.getSvgUrl(entry.source).then(data => data);
        }

        return null;
    }

    add(symbol: string, source: string) {
        this.library[symbol] = source;
    }

    merge(symbols: any) {
        this.library = {
            ...this.library,
            ...symbols
        };
    }

    static getSvgDef(id: string) {
        const svgDef = document.getElementById(id).innerHTML;
        const inlineSvg = document.createElement('svg');
        inlineSvg.setAttribute('version', '1.1');
        inlineSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        inlineSvg.setAttribute('width', '16');
        inlineSvg.setAttribute('height', '16');
        inlineSvg.setAttribute('viewBox', '0 0 16 16');
        inlineSvg.innerHTML = svgDef;

        return inlineSvg.outerHTML;
    }

    static async getSvgUrl(url: string) {
        const response = await fetch(url);
        const data = await response.text();
        const temp = document.createElement('div');
        temp.innerHTML = data;
        return temp.querySelector('svg').outerHTML;
    }
}
