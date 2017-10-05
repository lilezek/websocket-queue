export interface IPacket {
  /**
   * Type of message.
   */
  t: string;
}

/**
 * Hello packet. First hello won't have a field. Last hello won't have o field.
 */
export interface IHello extends IPacket {
  t: "h";

  /**
   * Random number, used to derive a secret number.
   */
  o?: number;

  /**
   * Answer to random number. This must be SHA256(psk + hex(o))
   */
  a?: string;
}

/**
 * Data packet.
 */
export interface IMessage extends IPacket {
  t: "m";

  /**
   * Data string. 
   */
  d: string;

  /**
   * Topic of this message. 
   */
  s: string;
}

/**
 * Subscription packet.
 */
export interface ISubscribe extends IPacket {
  t: "s";

  /**
   * Topic to subscribe to.
   */
  s: string;
}

/**
 * Unsubscription packet.
 */
export interface IUnsubscribe extends IPacket {
  t: "u";

  /**
   * Topic to unsubscribe.
   */
  s: string;
}

export type Packet = ISubscribe | IUnsubscribe | IMessage | IHello;
