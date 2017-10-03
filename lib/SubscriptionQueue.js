"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocketQueue_1 = require("./WebSocketQueue");
var SubscriptionQueue = (function (_super) {
    __extends(SubscriptionQueue, _super);
    function SubscriptionQueue(ws, psk) {
        var _this = _super.call(this, ws, psk) || this;
        _this.on("message", function (data) {
            if (data.topic in _this.subscriptions) {
                _this.subscriptions[data.topic].forEach(function (cb) { return cb(data.message); });
            }
        });
        return _this;
    }
    SubscriptionQueue.prototype.subscribe = function (topic, cb) {
        this.subscriptions[topic] = this.subscriptions[topic] || [];
        this.subscriptions[topic].push(cb);
    };
    SubscriptionQueue.prototype.unsubscribe = function (topic, cb) {
        if (topic in this.subscriptions) {
            this.subscriptions[topic] = this.subscriptions[topic].filter(function (cb2) { return cb2 !== cb; });
            if (this.subscriptions[topic].length === 0) {
                delete this.subscriptions[topic];
            }
        }
    };
    return SubscriptionQueue;
}(WebSocketQueue_1.WebSocketQueue));
exports.SubscriptionQueue = SubscriptionQueue;
//# sourceMappingURL=SubscriptionQueue.js.map