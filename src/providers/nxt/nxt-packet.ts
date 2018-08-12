import {Injectable, NgZone} from '@angular/core';
import {BluetoothProvider} from "../bluetooth/bluetooth";
import {File} from '@ionic-native/file';
import {ModalController} from 'ionic-angular';
import {Packet} from "./packets/packet";
import {Subject} from "rxjs";
import {PacketFactory} from "./packets/packet-factory";


/**
 * This provide handles communication with a NXT device, and provides helper methods for uploading files and NXT I/O.
 */
@Injectable()
export class NxtPacketProvider {
  public packetEvent$: Subject<Packet> = new Subject<Packet>();
  private buffer: number[] = [];

  constructor(private bluetooth: BluetoothProvider, private file: File, private modalCtrl: ModalController, private zone: NgZone) {
    //Start up a thread for reading packets
    setInterval(() => {
      let len: number = this.buffer[0] | this.buffer[1] << 8;
      while (this.buffer.length >= len + 2) {
        this.buffer.splice(0, 2);
        this.readPacket(this.buffer.splice(0, len));
        len = this.buffer[0] | this.buffer[1] << 8;
      }
    });
    //Listen to and handle responses from the NXT
    this.bluetooth.bluetoothSerial.subscribeRawData().subscribe(data => {
      this.buffer.push(...Array.from(new Uint8Array(data)));
    });
  }

  readPacket(data: number[]) {
    let telegramType: number = data.shift();
    if (telegramType == TelegramType.REPLY) {
      //Look up this packet, and construct it from the available data.
      let packet: Packet = PacketFactory.readPacket(data);
      if (packet) {
        //Emit events inside the angular thread so things update correctly
        this.zone.run(() => {
          this.packetEvent$.next(packet);
        });
      }
    }
  }

  writePacket(expectResponse: boolean, ...packets: Packet[]) {
    for (let packet of packets) {
      this.bluetooth.write(new Uint8Array(packet.writePacket(expectResponse)));
    }
  }
}

export enum TelegramType {
  DIRECT_COMMAND_RESPONSE = 0x00,
  SYSTEM_COMMAND_RESPONSE = 0x01,
  REPLY = 0x02,
  DIRECT_COMMAND_NO_RESPONSE = 0x80,
  SYSTEM_COMMAND_NO_RESPONSE = 0x81
}
