import { CustomElement } from './classes/custom-element';
import { ConfigService, ConfigInterface } from './service/config-service';
import { createIntersectionObserver } from './utils/intersection-observer';

export const IconService = {
    config: function(config: ConfigInterface) {
        'use strict';
        ConfigService.setConfig(config);
    },

    createElement: function() {
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
