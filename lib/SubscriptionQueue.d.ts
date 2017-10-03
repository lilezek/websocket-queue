/// <reference types="ws" />
import * as WebSocket from "ws";
import { WebSocketQueue } from "./WebSocketQueue";
export declare class SubscriptionQueue extends WebSocketQueue {
    private subscriptions;
    constructor(ws: WebSocket, psk: string);
    subscribe(topic: string, cb: (data: string) => any): void;
    unsubscribe(topic: string, cb: (data: string) => any): void;
}
