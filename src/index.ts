import { CustomElement } from './classes/custom-element.js';
import { ElementData, type ConfigInterface } from './classes/element-data.js';

export class Iconly {
    private static elements: { [key: string]: ElementData } = {};

    public static createElement(
        element: string,
        config: Partial<ConfigInterface> = {},
        defineCustomElement: boolean = true,
    ): void {
        Iconly.elements[element] = new ElementData(element, config);

        /**
         * Define a new element and use an anonymous class extended from CustomElement,
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
