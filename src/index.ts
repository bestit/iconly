/* eslint-disable max-classes-per-file */
import { CustomElement } from './classes/custom-element.js';
import { ElementData, type ConfigInterface } from './classes/element-data.js';
import { type LibraryTreeInterface } from './classes/library.js';

export class Iconly {
    private static elements: { [key: string]: ElementData } = {};

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
}
/* eslint-enable max-classes-per-file */
