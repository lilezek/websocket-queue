/// <reference types="node" />
/// <reference types="ws" />
import * as WebSocket from "ws";
import { EventEmitter } from "events";
export declare class QueuePeer extends EventEmitter {
    private ws;
    private psk;
    private secure;
    /**
     * @param ws A WebSocket already connected to a client.
     */
    constructor(ws: WebSocket, psk: string);
}
