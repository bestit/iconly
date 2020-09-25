"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Library = void 0;
class Library {
    constructor(library = {}) {
        this.library = {};
        this.library = library;
    }
    get(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            const entry = this.library[symbol];
            if ((entry === null || entry === void 0 ? void 0 : entry.type) === 'internal') {
                return entry.source;
            }
            else if ((entry === null || entry === void 0 ? void 0 : entry.type) === 'id') {
                return Library.getSvgDef(entry.source);
            }
            else if ((entry === null || entry === void 0 ? void 0 : entry.type) === 'url') {
                // eslint-disable-next-line no-return-await
                return yield Library.getSvgUrl(entry.source).then(data => data);
            }
            return null;
        });
    }
    add(symbol, source) {
        this.library[symbol] = source;
    }
    merge(symbols) {
        this.library = Object.assign(Object.assign({}, this.library), symbols);
    }
    static getSvgDef(id) {
        const svgDef = document.getElementById(id).innerHTML;
        const inlineSvg = document.createElement('svg');
        inlineSvg.setAttribute('version', '1.1');
        inlineSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        inlineSvg.setAttribute('width', '16');
        inlineSvg.setAttribute('height', '16');
        inlineSvg.setAttribute('viewBox', '0 0 16 16');
        inlineSvg.innerHTML = svgDef;
        return inlineSvg.outerHTML;
    }
    static getSvgUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(url);
            const data = yield response.text();
            const temp = document.createElement('div');
            temp.innerHTML = data;
            return temp.querySelector('svg').outerHTML;
        });
    }
}
exports.Library = Library;
//# sourceMappingURL=library.js.map