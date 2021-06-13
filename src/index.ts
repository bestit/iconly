/* eslint-disable max-classes-per-file */
import { CustomElement } from './classes/custom-element';
import { ElementData, ConfigInterface } from './classes/element-data';
import { LibraryTreeInterface } from './classes/library';

export class Iconly {
    private static elements: ElementData[] = [];

    public static createElement(
        element: string,
        config: ConfigInterface = {},
        libraryTree: LibraryTreeInterface = {}
    ): void {
        Iconly.elements[element] = new ElementData(element, config, libraryTree);

        /**
         * Define new element and use anonymous class extended from CustomElement,
         * this allows multiple definitions with the "same" class
         */
        window.customElements.define(element, class extends CustomElement {});
    }

    public static getElement(element: string): ElementData {
        return Iconly.elements[element];
    }
}
/* eslint-enable max-classes-per-file */
