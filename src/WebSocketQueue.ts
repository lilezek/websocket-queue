import * as WebSocket from "ws";
import { IHello, Packet, IMessage } from "./messages";
import { EventEmitter } from "events";
import crypto = require("crypto");

export class WebSocketQueue extends EventEmitter {
  private pSecure = false;

  /**
   * @param ws A WebSocket already connected to a client.
   */
  constructor(private ws: WebSocket, private psk: string) {
    super();
    const once = ~~(Math.random()*2147483647);
    const sendPacket: IHello = {
      t: "h",
      o: once,
    };
    
    const derivedKey = crypto.createHash("sha256").update(psk + once.toString(16)).digest("base64");
    ws.send(JSON.stringify(sendPacket));

    ws.on("message", (d) => {
      const recvPacket = JSON.parse(d.toString()) as Packet;
      // Hello packet
      if (recvPacket.t === "h" && recvPacket.a) {
        // Correct key
        if (recvPacket.a === derivedKey) {
          this.pSecure = true;
          // After having a secure connection, destroy psk to avoid improbable security issues:
          delete this.psk;
          this.emit("open");
        } else {
          // If we are going to close the connection, destroy psk to avoid improbable security issues:
          delete this.psk;
          ws.close();
          this.emit("error");
        }
      } else if (recvPacket.t === "h" && recvPacket.o) {
        const sendKey = crypto.createHash("sha256").update(psk + recvPacket.o.toString(16)).digest("base64");
        ws.send(JSON.stringify({t: "h", a: sendKey}));
      } else {
        // Only if secured
        if (this.pSecure) {
          if (recvPacket.t === "m") {
            this.emit("message", {
              message: recvPacket.d,
              topic: recvPacket.s,
            });
          }
        } else {
          // Close because not secure and not a hello packet. 
          this.emit("close");
        }
      }
    });

    ws.on("close", () => {
      this.emit("close");
    });
  }

  public get secure() {
    return this.pSecure;
  }

  public send(data: Packet) {
    if (this.pSecure) {
      this.ws.send(JSON.stringify(data));
    } else {
      throw new Error("Trying to send data before the connection finished hello protocol.");
    }
  }

  public close() {
    this.ws.close();
  }
}

export interface WebSocketQueue {
  /**
   * @event Message event.
   */
  on(ev: "message", cb: (data: {message: string, topic: string}) => any): any;
  on(ev: "open", cb: () => any): any;
  on(ev: "close", cb: () => any): any;
  on(ev: "error", cb: () => any): any;
}
