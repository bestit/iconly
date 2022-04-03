import { Library, LibraryTreeInterface } from './library';
import { IconHandler } from './icon-handler';
import { CustomElement } from './custom-element';

/* eslint-disable no-unused-vars, no-undef */
export interface ConfigInterface {
    fetchPattern?: string,
    urlTestPattern?: RegExp,
    intersectionObserver?: IntersectionObserverInit,
    defaultNamespace?: string,
    defaultPack?: string,
    defaultFetchPattern?: string,
    createIntersectionObserver?: boolean
}
/* eslint-enable no-unused-vars, no-undef */

export const defaultConfig: ConfigInterface = {
    defaultNamespace: 'storefront',
    defaultPack: 'default',
    defaultFetchPattern: null,
    urlTestPattern:
        /^(https?:\/\/(www\.)?)?[-a-zA-Z0-9@:%._+~#=/]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/,
    intersectionObserver: {},
    createIntersectionObserver: true,
};

export class ElementData {
    private element: string;
    private config: ConfigInterface;
    private library: Library;
    private iconHandler: IconHandler;
    private intersectionObserver: IntersectionObserver | null;

    constructor(
        element: string,
        config: ConfigInterface = {},
        libraryTree: LibraryTreeInterface = {}
    ) {
        this.element = element;
        this.config = {
            ...defaultConfig,
            ...config
        };
        this.library = new Library(libraryTree);
        this.iconHandler = new IconHandler();
        this.intersectionObserver = null;

        if (typeof this.config.createIntersectionObserver !== 'undefined' &&
            this.config.createIntersectionObserver !== null &&
            this.config.createIntersectionObserver
        ) {
            this.createIntersectionObserver();
        }
    }

    public getConfig(): ConfigInterface {
        return this.config;
    }

    public setConfig(config: ConfigInterface): this {
        this.config = {
            ...defaultConfig,
            ...config
        };

        return this;
    }

    public getIconHandler(): IconHandler {
        return this.iconHandler;
    }

    public getLibrary(): Library {
        return this.library;
    }

    public getIcon(element: CustomElement): Promise<string> {
        return this.iconHandler.getIcon(element);
    }

    public getIntersectionObserver(): IntersectionObserver {
        return this.intersectionObserver;
    }

    public setIntersectionObserver(intersectionObserver: IntersectionObserver | null) {
        this.intersectionObserver = intersectionObserver;
    }

    public createIntersectionObserver(): void {
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const customElement = entry.target;

                        customElement.dispatchEvent(new CustomEvent(
                            `${this.element}-intersection`,
                            {
                                bubbles: true,
                            }
                        ));

                        observer.unobserve(customElement);
                    }
                });
            }, this.getConfig().intersectionObserver);
        }
    }
}
