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
var events_1 = require("events");
var crypto = require("crypto");
var QueuePeer = (function (_super) {
    __extends(QueuePeer, _super);
    /**
     * @param ws A WebSocket already connected to a client.
     */
    function QueuePeer(ws, psk) {
        var _this = _super.call(this) || this;
        _this.ws = ws;
        _this.psk = psk;
        _this.secure = false;
        var once = ~~(Math.random() * 2147483647);
        var packet = {
            t: "h",
            o: once,
        };
        var derivedKey = crypto.createHash("sha256").update(psk + once.toString(16)).digest("base64");
        ws.on("message", function (d) {
            var packet = JSON.parse(d.toString());
            // Hello packet
            if (packet.t === "h" && packet.a) {
                // Correct key
                if (packet.a === derivedKey) {
                    _this.secure = true;
                    _this.emit("open");
                }
                else {
                    ws.close();
                    _this.emit("close");
                }
            }
            else {
                // Only if secured
                if (_this.secure) {
                    if (packet.t === "m") {
                        _this.emit("message", {
                            message: packet.d,
                            topic: packet.s,
                        });
                    }
                }
                else {
                    // Close because not secure and not a hello packet. 
                    _this.emit("close");
                }
            }
        });
        ws.on("close", function () {
            _this.emit("close");
        });
        ws.send(packet);
        return _this;
    }
    return QueuePeer;
}(events_1.EventEmitter));
exports.QueuePeer = QueuePeer;
//# sourceMappingURL=WebSocketQueue.js.map