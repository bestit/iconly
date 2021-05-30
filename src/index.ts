import { LibraryConfig } from './classes/library';
import { FetchIconConfig } from './classes/fetch-icon';
import { CustomElement } from './classes/custom-element';
import { LibraryService } from './service/library-service';

export const IconElementService = {
    setLibrary: function(library: FetchIconConfig | LibraryConfig) {
        'use strict';

        if (library.fetchPattern) {
            LibraryService.setInstance('fetch-icon');
            return;
        }

        LibraryService.getInstance().merge(library);
    },

    createElement: function(name: string) {
        'use strict';

        window.customElements.define(name, class extends CustomElement {});
    },

    getUrlEncodedIcon: function(symbol, pack, namespace, color, rotaion) {
        'use strict';

        // TODO: load icon url encoded, replace currentColor with param color
        // Use custom element as wrapper
        // Css variable:
        /*
        let root = document.documentElement;
        root.style.setProperty('--variable-name', '')
        */

        /*
        // Helper functions to URI encode SVGs
        const symbols = /[\r\n%#()<>?\[\\\]^`{|}]/g;
        function encodeSVG( data ) {
            data = data.replace( /"/g, '\'' );
            data = data.replace( />\s{1,}</g, "><" );
            data = data.replace( /\s{2,}/g, " " );

            return data.replace( symbols, encodeURIComponent );
        }

        // Find background-icon elements
        const backgroundIcons = document.querySelectorAll('.background-icon');

        // Add URI encoded SVGs to style
        backgroundIcons.forEach((element) => {
        if (element.dataset.backgroundIcon) {
            let encodedSVG = encodeSVG(icons[element.dataset.backgroundIcon]);

            if (element.dataset.backgroundIconColor) {
            // Replace currentColor values with passed color
            encodedSVG = encodedSVG.replace(
                'currentColor',element.dataset.backgroundIconColor
            );
            }

            element.setAttribute(
            'style',
            `background-image: url("data:image/svg+xml,${encodedSVG}");`
            );
        }
        });

        */
    },
};




