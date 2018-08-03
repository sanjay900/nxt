import {Injectable, NgZone} from '@angular/core';
import {BluetoothProvider} from "../bluetooth/bluetooth";
import {File} from '@ionic-native/file';
import {AlertController, ModalController} from 'ionic-angular';
import {
  ConnectionStatus,
  DirectCommand,
  DirectCommandResponse,
  NxtModel,
  NXTFile,
  TelegramType
} from "./nxt.model";
import {Packet} from "./packets/packet";
import {StartProgram} from "./packets/direct/start-program";
import {Subject, Subscription} from "rxjs";


/**
 * This provide handles communication with a NXT device, and provides helper methods for uploading files and NXT I/O.
 */
@Injectable()
export class NxtProvider {
  public packetEvent$: Subject<Packet> = new Subject<Packet>();
  private buffer: number[] = [];
  private uploadFile: Subscription;

  constructor(private bluetooth: BluetoothProvider, private file: File, private modalCtrl: ModalController, private alertCtrl: AlertController, private zone: NgZone) {
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
    this.bluetooth.deviceStatus$
      .filter(status => status.status == ConnectionStatus.CONNECTED)
      .subscribe(()=>{
        this.writePacket(true, StartProgram.createPacket(NxtModel.MOTOR_PROGRAM));
      });
    this.uploadFile = this.packetEvent$
      .filter(packet => packet.id == DirectCommand.START_PROGRAM)
      .filter(packet => packet.status == DirectCommandResponse.OUT_OF_RANGE)
      .subscribe(this.missingFileHandler.bind(this));
  }

  readPacket(data: number[]) {
    let telegramType: number = data.shift();
    let messageType: number = data.shift();
    if (telegramType == TelegramType.REPLY) {
      //Look up this packet, and construct it from the available data.
      let packetCtor: new () => Packet = NxtModel.COMMAND_MAP.get(messageType);
      let packet: Packet = new packetCtor();
      if (packet) {
        packet.readPacket(data);
        //Emit events inside the angular thread so things update correctly
        this.zone.run(() => {
          this.packetEvent$.next(packet);
        });
      } else {
        console.log("Unknown packet id: " + messageType.toString(16));
      }
    }
  }

  /**
   * Write a file to the NXT device
   * @param {NXTFile} file the file to write
   */
  writeFile(file: NXTFile) {
    this.file.readAsArrayBuffer(this.file.applicationDirectory, "www/assets/" + file.name).then(contents => {
      file.readData(Array.from(new Uint8Array(contents)));
      file.size = contents.byteLength;
      let uploadModal = this.modalCtrl.create("file-upload", {file: file});
      uploadModal.present();
    });

  }

  writePacket(expectResponse: boolean, ...packets: Packet[]) {
    for (let packet of packets) {
      this.bluetooth.write(new Uint8Array(packet.writePacket(expectResponse)));
    }
  }

  private missingFileHandler() {
    let alert = this.alertCtrl.create({
      title: 'Motor Control Program Missing',
      message: `The program for controlling NXT motors is missing on your NXT Device.<br/>
                Would you like to upload the NXT motor control program?<br/>
                Note that without this program, motor control will not work.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Upload',
          handler: () => {
            let file: NXTFile = new NXTFile(NxtModel.MOTOR_PROGRAM);
            file.autoStart = true;
            this.writeFile(file);
          }
        }
      ]
    });
    alert.present();
  }
}
