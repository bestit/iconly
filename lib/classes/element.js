"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SvgIconElement = void 0;
var SvgIconElement = /** @class */ (function (_super) {
    __extends(SvgIconElement, _super);
    function SvgIconElement() {
        var _this = _super.call(this) || this;
        _this.innerHTML = 'Test';
        if (_this.hasAttribute('icon')) {
            _this.innerHTML = _this.getIcon(_this.getAttribute('icon'));
        }
        return _this;
    }
    SvgIconElement.prototype.getIcon = function (name) {
        return name;
    };
    return SvgIconElement;
}(HTMLElement));
exports.SvgIconElement = SvgIconElement;
//# sourceMappingURL=element.js.map