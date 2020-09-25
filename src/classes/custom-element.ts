import { Library } from './library';

export const createCustomElement = (name: string, library: Library) => {
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
