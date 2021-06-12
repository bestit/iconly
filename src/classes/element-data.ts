import { Library, LibraryTreeInterface } from './library';
import { IconHandler } from './icon-handler';
import { ATTRIBUTE_LOADING, ATTRIBUTE_LOADING_LAZY, CustomElement } from './custom-element';

/* eslint-disable no-unused-vars, no-undef */
export interface ConfigInterface {
    elementName?: string,
    fetchPattern?: string,
    urlTestPattern?: RegExp,
    intersectionObserver?: IntersectionObserverInit,
    defaultNamespace?: string,
    defaultPack?: string,
}
/* eslint-enable no-unused-vars, no-undef */

const defaultConfig: ConfigInterface = {
    defaultNamespace: 'storefront',
    defaultPack: 'default',
    urlTestPattern:
        /^(https?:\/\/(www\.)?)?[-a-zA-Z0-9@:%._+~#=/]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/,
    intersectionObserver: {},
};

export class ElementData {
    #element: string;
    #config: ConfigInterface;
    #library: Library;
    #iconHandler: IconHandler;

    constructor(
        element: string,
        config: ConfigInterface = {},
        libraryTree: LibraryTreeInterface = {}
    ) {
        this.#element = element;
        this.#config = {
            ...defaultConfig,
            ...config
        };
        this.#library = new Library(libraryTree);
        this.#iconHandler = new IconHandler();

        this.createIntersectionObserver();
    }

    public getConfig(): ConfigInterface {
        return this.#config;
    }

    public getIconHander(): IconHandler {
        return this.#iconHandler;
    }

    public getLibrary(): Library {
        return this.#library;
    }

    public getIcon(element: CustomElement): Promise<string> {
        return this.#iconHandler.getIcon(element);
    }

    private createIntersectionObserver(): void {
        if ('IntersectionObserver' in window) {
            const customElements = Array.from(
                document.querySelectorAll(
                    `${this.#element}[${ATTRIBUTE_LOADING}="${ATTRIBUTE_LOADING_LAZY}"]`
                )
            );

            const customElementObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const customElement = entry.target;

                        customElement.dispatchEvent(new CustomEvent(
                            `${this.#element}-intersection`,
                            {
                                bubbles: true,
                            }
                        ));

                        observer.unobserve(customElement);
                    }
                });
            }, this.getConfig().intersectionObserver);

            customElements.forEach(customElement => customElementObserver.observe(customElement));
        }
    }
}
