export const Attributes = {
    Symbol: 'symbol',
    Pack: 'pack',
    Namespace: 'namespace',
    Src: 'src',
    Loading: 'loading',
} as const;

export type AttributeName = typeof Attributes[keyof typeof Attributes];

export const Loading = {
    Lazy: 'lazy',
    Eager: 'eager',
} as const;

export type LoadingMode = typeof Loading[keyof typeof Loading];

export interface AttributesInterface {
    [Attributes.Symbol]?: string;
    [Attributes.Pack]?: string;
    [Attributes.Namespace]?: string;
    [Attributes.Src]?: string;
    [Attributes.Loading]?: string;
}

export interface IconlyLoadedDetail {
    success: true;
    attributes: AttributesInterface;
    element: HTMLElement;
    fetch: (attributes: AttributesInterface) => Promise<string | undefined>;
}

export interface IconlyErrorDetail {
    success: false;
    error: Error;
    attributes: AttributesInterface;
    element: HTMLElement;
    fetch: (attributes: AttributesInterface) => Promise<string | undefined>;
}
