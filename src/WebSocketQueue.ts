import * as WebSocket from "ws";
import { IHello, Packet, IMessage } from "./messages";
import { EventEmitter } from "events";
import crypto = require("crypto");

export class WebSocketQueue extends EventEmitter {
  private secure = false;

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
    ws.send(sendPacket);

    ws.on("message", (d) => {
      const recvPacket = JSON.parse(d.toString()) as Packet;
      // Hello packet
      if (recvPacket.t === "h" && recvPacket.a) {
        // Correct key
        if (recvPacket.a === derivedKey) {
          this.secure = true;
          this.emit("open");
        } else {
          ws.close();
          this.emit("close");
        }
      } else if (recvPacket.t === "h" && recvPacket.o) {
        const sendKey = crypto.createHash("sha256").update(psk + recvPacket.o).digest("base64");
        ws.send({t: "h", a: sendKey});
      } else {
        // Only if secured
        if (this.secure) {
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

  public send(data: Packet) {
    if (this.secure) {
      this.ws.send(data);
    } else {
      throw new Error("Trying to send data before opened connection.");
    }
  }
}

export interface WebSocketQueue {
  /**
   * @event Message event.
   */
  on(ev: "message", cb: (data: {message: string, topic: string}) => any): any;
}
