import { CustomElement } from './classes/custom-element';
import { Library, LibraryInterface } from './classes/library';
import { ConfigService, ConfigInterface } from './service/config-service';
import { LibraryService } from './service/library-service';
import { createIntersectionObserver } from './utils/intersection-observer';

/* eslint-disable no-unused-vars */
interface IconServiceInterface {
    setConfig(element: string, config: ConfigInterface): void;
    getConfig(element: string): ConfigInterface;
    createElement(name: string, config: ConfigInterface, library: LibraryInterface): void;
    setLibrary(element: string, library: LibraryInterface): void;
    getLibrary(element: string): Library;
}
/* eslint-enable no-unused-vars */

export const IconService: IconServiceInterface = {
    setConfig: function(element: string, config: ConfigInterface): void {
        'use strict';
        ConfigService.setConfig(element, config);
    },

    getConfig: function(element: string) {
        'use strict';
        return ConfigService.getConfig(element);
    },

    setLibrary: function(element: string, library: LibraryInterface): void {
        'use strict';
        const elementLibrary = LibraryService.getInstance(element);
        elementLibrary.merge(elementLibrary.getLibrary(), library);
    },

    getLibrary: function(element: string): Library {
        'use strict';
        return LibraryService.getInstance(element);
    },

    // eslint-disable-next-line strict
    createElement: function(element: string, config: ConfigInterface = {}, library: LibraryInterface = {}): void {
        // Abort if no element name is set
        if (typeof element !== 'string') {
            return;
        }

        this.setConfig(element, config);
        this.setLibrary(element, library);

        createIntersectionObserver(element);

        /**
         * Define new element and use anonymous class extended from CustomElement,
         * this allows multiple definitions with the "same" class
         */
        window.customElements.define(element, class extends CustomElement {});
    },
};
