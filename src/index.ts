/* eslint-disable max-classes-per-file */
import { ATTRIBUTE_LOADING, ATTRIBUTE_LOADING_LAZY, CustomElement } from './classes/custom-element';
import { ElementData, ConfigInterface } from './classes/element-data';
import { LibraryTreeInterface } from './classes/library';

export class Iconly {
    private static elements: ElementData[] = [];

    public static createElement(
        element: string,
        config: ConfigInterface = {},
        libraryTree: LibraryTreeInterface = {},
        defineCustomElement: boolean = true
    ): void {
        Iconly.elements[element] = new ElementData(element, config, libraryTree);

        /**
         * Define new element and use anonymous class extended from CustomElement,
         * this allows multiple definitions with the "same" class
         */
        if (defineCustomElement) {
            window.customElements.define(element, class extends CustomElement {});
        }
    }

    public static getElement(element: string): ElementData {
        return Iconly.elements[element];
    }

    public static registerIntersectionObserver(element: string, config: ConfigInterface = {}): void {
        if ('IntersectionObserver' in window) {
            const customElements = Array.from(
                document.querySelectorAll(
                    `${element}[${ATTRIBUTE_LOADING}="${ATTRIBUTE_LOADING_LAZY}"]`
                )
            );

            const customElementObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const customElement = entry.target;

                        customElement.dispatchEvent(new CustomEvent(
                            `${element}-intersection`,
                            {
                                bubbles: true,
                            }
                        ));

                        observer.unobserve(customElement);
                    }
                });
            }, config.intersectionObserver);

            customElements.forEach(customElement => customElementObserver.observe(customElement));
        }
    }
}
/* eslint-enable max-classes-per-file */
