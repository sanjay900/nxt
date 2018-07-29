import {DirectCommand, DirectCommandResponse, SystemCommand, SystemCommandResponse} from "../nxt-constants";

export class PacketConstants {
  static FILE_NAME_LENGTH: number = 20;
  static S_WORD_LENGTH: number = 20;
}

export abstract class Packet {
  public status: DirectCommandResponse | SystemCommandResponse;

  protected constructor(protected _id: SystemCommand | DirectCommand) {
  }

  get id(): SystemCommand | DirectCommand {
    return this._id;
  }

  protected static readSWord(data: number[]): number {
    return Packet.readUWord(data) - PacketConstants.S_WORD_LENGTH;
  }

  protected static readUWord(data: number[]): number {
    return data.shift() | data.shift() << 8;
  }

  protected static writeWord(short: number, data: number[]) {
    data.push(short, short >> 8);
  }

  protected static writeLong(long: number, data: number[]) {
    data.push(long, long >> 8, long >> 16, long >> 24);
  }

  protected static readLong(data: number[]): number {
    return data.shift() | data.shift() << 8 | data.shift() << 16 | data.shift() << 24;
  }

  protected static writeBoolean(bool: boolean, data: number[]) {
    data.push(bool ? 1 : 0);
  }

  protected static readBoolean(data: number[]): boolean {
    return data.shift() == 1;
  }

  protected static readAsciiz(data: number[], size: number): string {
    let message: string = "";
    for (let i = 0; i < size; i++) {
      message += String.fromCharCode(data.shift());
    }
    return message;
  }

  protected static writeAsciiz(message: string, data: number[]) {
    for (let i = 0; i < message.length; i++) {
      data.push(message.charCodeAt(i));
    }
    data.push(0);
  }

  protected static writeFileName(fileName: string, data: number[]) {
    fileName.padEnd(PacketConstants.FILE_NAME_LENGTH, '\0');
    this.writeAsciiz(fileName, data);
  }

  public readPacket(data: number[]) {
    this.status = data.shift();
  }

  public writePacket(expectResponse: boolean): Uint8Array {
    let data: number[] = [];
    this.writePacketData(expectResponse, data);
    let header: number[] = [];
    Packet.writeWord(data.length, header);
    data.unshift(...header);
    return new Uint8Array(data);
  }

  protected abstract writePacketData(expectResponse: boolean, data: number[]);
}
