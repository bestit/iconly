import { CustomElement } from './classes/custom-element';
import { ConfigService, ConfigInterface } from './service/config-service';

export const IconService = {
    config: function(config: ConfigInterface) {
        'use strict';
        ConfigService.setConfig(config);
    },

    createElement: function(name: string) {
        'use strict';

        window.customElements.define(name, class extends CustomElement {});
    },
};
