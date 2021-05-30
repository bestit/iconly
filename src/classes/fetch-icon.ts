import { LibraryInterface } from '../service/library-service';

export interface FetchIconConfig {
    fetchPattern: string
}

const defaultConfig: FetchIconConfig = {
    fetchPattern: '/public/icons/%NAMESPACE%/%PACK%/%SYMBOL%.svg',
}

export class FetchIcon implements LibraryInterface {
    private config: FetchIconConfig;

    constructor(config: FetchIconConfig = defaultConfig) {
        this.config = config;
    }

    // eslint-disable-next-line class-methods-use-this
    public async get(
        symbol: string|null,
        pack: string,
        namespace: string
    ): Promise<string|null> {
        let url = this.config.fetchPattern;
        url = url.replace('%NAMESPACE%', namespace);
        url = url.replace('%PACK%', pack);
        url = url.replace('%SYMBOL%', symbol);

        if (typeof url === 'string') {
            // eslint-disable-next-line no-return-await
            return await FetchIcon.getSvgUrl(url).then(data => data);
        }

        return null;
    }

    static async getSvgUrl(url: string): Promise<string> {
        const response = await fetch(url);

        if (!response.ok) {
            return '';
        }

        const data = await response.text();
        const temp = document.createElement('div');
        temp.innerHTML = data;

        return temp.querySelector('svg').outerHTML;
    }
}
