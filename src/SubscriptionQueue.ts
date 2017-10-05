import * as WebSocket from "ws";
import { IMessage } from "./messages";
import { WebSocketQueue } from "./WebSocketQueue";

export class SubscriptionQueue extends WebSocketQueue {
  private subscriptions: { [key: string]: Array<(data: string) => any> } = {};

  constructor(ws: WebSocket, psk: string) {
    super(ws, psk);
    this.on("message", (data) => {
      if (data.topic in this.subscriptions) {
        this.subscriptions[data.topic].forEach((cb) => cb(data.message));
      }
    });
  }

  public subscribe(topic: string, cb: (data: string) => any) {
    this.subscriptions[topic] = this.subscriptions[topic] || [];
    this.subscriptions[topic].push(cb);
  }

  public unsubscribe(topic: string, cb: (data: string) => any) {
    if (topic in this.subscriptions) {
      this.subscriptions[topic] = this.subscriptions[topic].filter((cb2) => cb2 !== cb);
      if (this.subscriptions[topic].length === 0) {
        delete this.subscriptions[topic];
      }
    }
  }
}
