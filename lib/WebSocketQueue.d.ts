/// <reference types="node" />
/// <reference types="ws" />
import * as WebSocket from "ws";
import { Packet } from "./messages";
import { EventEmitter } from "events";
export declare class WebSocketQueue extends EventEmitter {
    private ws;
    private psk;
    private pSecure;
    /**
     * @param ws A WebSocket already connected to a client.
     */
    constructor(ws: WebSocket, psk: string);
    readonly secure: boolean;
    send(data: Packet): void;
    close(): void;
}
export interface WebSocketQueue {
    /**
     * @event Message event.
     */
    on(ev: "message", cb: (data: {
        message: string;
        topic: string;
    }) => any): any;
    on(ev: "open", cb: () => any): any;
    on(ev: "close", cb: () => any): any;
    on(ev: "error", cb: () => any): any;
}
