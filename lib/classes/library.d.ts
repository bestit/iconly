export declare class Library {
    library: any;
    constructor(library?: any);
    get(symbol: string): Promise<string | null>;
    add(symbol: string, source: string): void;
    merge(symbols: any): void;
    static getSvgDef(id: string): string;
    static getSvgUrl(url: string): Promise<string>;
}
