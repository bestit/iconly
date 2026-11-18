import type { SanitizerMode } from '../sanitize-svg.js';
import type { CustomElement } from './custom-element.js';
import { IconHandler } from './icon-handler.js';

export type { SanitizerMode } from '../sanitize-svg.js';

export interface ConfigInterface {
    fetchPattern?: string;
    intersectionObserver: IntersectionObserverInit;
    defaultNamespace: string;
    defaultPack: string;
    createIntersectionObserver: boolean;
    cacheTimeout: number;
    sanitizer: SanitizerMode;
    allowedOrigins?: string[];
}

export const defaultConfig: ConfigInterface = {
    fetchPattern: undefined,
    defaultNamespace: 'storefront',
    defaultPack: 'default',
    intersectionObserver: {},
    createIntersectionObserver: true,
    cacheTimeout: 60 * 60 * 1000,
    sanitizer: 'strict',
};

function configFrom(config: Partial<ConfigInterface> = {}): ConfigInterface {
    return {
        ...defaultConfig,
        ...config,
        intersectionObserver: {
            ...defaultConfig.intersectionObserver,
            ...config.intersectionObserver,
        },
        sanitizer: config.sanitizer ?? defaultConfig.sanitizer,
    };
}

export class ElementData {
    private readonly element: string;
    private config: ConfigInterface;
    private readonly iconHandler: IconHandler;
    private intersectionObserver: IntersectionObserver | null;

    constructor(
        element: string,
        config: Partial<ConfigInterface> = {},
    ) {
        this.element = element;
        this.config = configFrom(config);
        this.iconHandler = new IconHandler();
        this.intersectionObserver = null;

        if (this.config.createIntersectionObserver) {
            this.createIntersectionObserver();
        }
    }

    public getConfig(): ConfigInterface {
        return this.config;
    }

    public setConfig(config: Partial<ConfigInterface>): this {
        this.config = configFrom(config);
        this.intersectionObserver?.disconnect();
        this.intersectionObserver = null;

        if (this.config.createIntersectionObserver) {
            this.createIntersectionObserver();
        }

        return this;
    }

    public getIconHandler(): IconHandler {
        return this.iconHandler;
    }

    public getIcon(element: CustomElement): Promise<string | undefined> {
        return this.iconHandler.getIcon(element);
    }

    public getIntersectionObserver(): IntersectionObserver | null {
        return this.intersectionObserver;
    }

    public setIntersectionObserver(intersectionObserver: IntersectionObserver | null): void {
        this.intersectionObserver = intersectionObserver;
    }

    public createIntersectionObserver(): void {
        if (typeof window === 'undefined' || typeof window.IntersectionObserver !== 'function') {
            return;
        }

        this.intersectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const customElement = entry.target;

                    customElement.dispatchEvent(new CustomEvent(
                        `${this.element}-intersection`,
                        {
                            bubbles: true,
                        },
                    ));

                    observer.unobserve(customElement);
                }
            });
        }, this.getConfig().intersectionObserver);
    }
}
