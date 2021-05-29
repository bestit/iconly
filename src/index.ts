import { LibraryConfig } from './classes/library';
import { CustomElement } from './classes/custom-element';
import { LibraryService } from './service/library-service';

export function createLibrary(library: LibraryConfig) {
    LibraryService.getInstance().merge(library);
};

export function createElement(name: string) {     
    CustomElementRegistry 
    window.customElements.define(name, class extends CustomElement {});
};

export function getUrlEncodedIcon(symbol, pack, color, rotaion) {
    // TODO: load icon url encoded, replace currentColor with param color
};