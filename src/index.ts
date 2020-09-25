import { Library } from './classes/library';
import { createCustomElement } from './classes/custom-element';
import { Config } from './interfaces';

const library = new Library();

export class SvgIconSystem {
    config: Config;

    constructor(options: Config) {
        this.config = options;
        library.merge(this.config.library);
        createCustomElement(this.config.name, library);
    }
}
