import {MessageWrite} from "../direct/message-write";

export class MotorControlPacket extends MessageWrite {
  public static convertPower(power: number): number {
    power = Math.round(power);
    if (power < 0) power = 100 + Math.abs(power);
    power = Math.max(power, 0);
    power = Math.min(power, 200);
    return power;
  }

  public static padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join('0') + number;
  }
}
