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
var WebSocketQueue = (function (_super) {
    __extends(WebSocketQueue, _super);
    /**
     * @param ws A WebSocket already connected to a client.
     */
    function WebSocketQueue(ws, psk) {
        var _this = _super.call(this) || this;
        _this.ws = ws;
        _this.psk = psk;
        _this.pSecure = false;
        var once = ~~(Math.random() * 2147483647);
        var sendPacket = {
            t: "h",
            o: once,
        };
        var derivedKey = crypto.createHash("sha256").update(psk + once.toString(16)).digest("base64");
        ws.send(sendPacket);
        ws.on("message", function (d) {
            var recvPacket = JSON.parse(d.toString());
            // Hello packet
            if (recvPacket.t === "h" && recvPacket.a) {
                // Correct key
                if (recvPacket.a === derivedKey) {
                    _this.pSecure = true;
                    // After having a secure connection, destroy psk to avoid improbable security issues:
                    delete _this.psk;
                    _this.emit("open");
                }
                else {
                    // If we are going to close the connection, destroy psk to avoid improbable security issues:
                    delete _this.psk;
                    ws.close();
                    _this.emit("error");
                }
            }
            else if (recvPacket.t === "h" && recvPacket.o) {
                var sendKey = crypto.createHash("sha256").update(psk + recvPacket.o).digest("base64");
                ws.send({ t: "h", a: sendKey });
            }
            else {
                // Only if secured
                if (_this.pSecure) {
                    if (recvPacket.t === "m") {
                        _this.emit("message", {
                            message: recvPacket.d,
                            topic: recvPacket.s,
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
        return _this;
    }
    Object.defineProperty(WebSocketQueue.prototype, "secure", {
        get: function () {
            return this.pSecure;
        },
        enumerable: true,
        configurable: true
    });
    WebSocketQueue.prototype.send = function (data) {
        if (this.pSecure) {
            this.ws.send(data);
        }
        else {
            throw new Error("Trying to send data before the connection finished hello protocol.");
        }
    };
    return WebSocketQueue;
}(events_1.EventEmitter));
exports.WebSocketQueue = WebSocketQueue;
//# sourceMappingURL=WebSocketQueue.js.map