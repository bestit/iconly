"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomElement = void 0;
exports.createCustomElement = (name, library) => {
    'use strict';
    const element = class extends HTMLElement {
        static get observedAttributes() {
            return ['symbol'];
        }
        attributeChangedCallback(attributeName) {
            if (attributeName === 'symbol') {
                library.get(this.getAttribute('symbol')).then(data => {
                    this.innerHTML = data;
                });
            }
        }
    };
    window.customElements.define(name, element);
};
//# sourceMappingURL=custom-element.js.map