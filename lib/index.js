"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SvgIconSystem = void 0;
const library_1 = require("./classes/library");
const custom_element_1 = require("./classes/custom-element");
const library = new library_1.Library();
class SvgIconSystem {
    constructor(options) {
        this.config = options;
        library.merge(this.config.library);
        custom_element_1.createCustomElement(this.config.name, library);
    }
}
exports.SvgIconSystem = SvgIconSystem;
//# sourceMappingURL=index.js.map