import { CustomElement } from './classes/custom-element';
import { Library, LibraryInterface } from './classes/library';
import { ConfigService, ConfigInterface } from './service/config-service';
import { LibraryService } from './service/library-service';
import { createIntersectionObserver } from './utils/intersection-observer';

interface IconServiceInterface {
    // eslint-disable-next-line no-unused-vars
    config(config: ConfigInterface): void;
    createElement(): void;
    setLibrary(): void;
    getLibrary(): Library;
}

export const IconService: IconServiceInterface = {
    config: function(config: ConfigInterface): void {
        'use strict';
        ConfigService.setConfig(config);
    },

    setLibrary: function(library?: LibraryInterface): void {
        'use strict';
        LibraryService.merge(library);
    },

    getLibrary: function(): Library {
        'use strict';
        return LibraryService.getInstance();
    },

    createElement: function(): void {
        'use strict';

        const elementName = ConfigService.getConfig().elementName;

        // Abort if no element name is set
        if (typeof elementName !== 'string') {
            return;
        }

        createIntersectionObserver(elementName);

        window.customElements.define(elementName, CustomElement);
    },
};
