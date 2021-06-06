import { ELEMENT_LAZY_LOADING_ATTRIBUTE, ELEMENT_LAZY_LOADING_VALUE } from '../classes/custom-element';
import { ConfigService } from '../service/config-service';

export const createIntersectionObserver = function(elementName: string): void {
    'use strict';

    if ('IntersectionObserver' in window) {
        const customElements = Array.from(
            document.querySelectorAll(
                `${elementName}[${ELEMENT_LAZY_LOADING_ATTRIBUTE}="${ELEMENT_LAZY_LOADING_VALUE}"]`
            )
        );

        const customElementObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const customElement = entry.target;

                    customElement.dispatchEvent(new CustomEvent(
                        `${elementName}-intersection`,
                        {
                            bubbles: true,
                        }
                    ));

                    observer.unobserve(customElement);
                }
            });
        }, ConfigService.getConfig(elementName).intersectionObserver);

        customElements.forEach(customElement => customElementObserver.observe(customElement));
    }
};
