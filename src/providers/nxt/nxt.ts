import {Injectable, NgZone} from '@angular/core';
import {BluetoothProvider} from "../bluetooth/bluetooth";
import {File} from '@ionic-native/file';
import {AlertController, ModalController} from 'ionic-angular';
import {DirectCommand, DirectCommandResponse, NxtConstants, NXTFile, TelegramType} from "./nxt-constants";
import {Packet} from "./packets/packet";
import {StartProgram} from "./packets/direct/start-program";
import {Subject, Subscription} from "rxjs";


/**
 * This provide handles communication with a NXT device, and provides helper methods for uploading files and NXT I/O.
 */
@Injectable()
export class NxtProvider {
  public packetEvent$: Subject<Packet> = new Subject<Packet>();
  private currentProgram: string = null;
  private buffer: number[] = [];
  private uploadFile: Subscription;

  constructor(public bluetooth: BluetoothProvider, private file: File, public modalCtrl: ModalController, public alertCtrl: AlertController, private zone: NgZone) {
    //Clear state for the current device when it is disconnected.
    this.bluetooth.deviceDisconnect$.subscribe(() => {
      this.currentProgram = null;
    });
    //Start up a thread for reading packets
    setInterval(() => {
      let len: number = this.buffer[0] | this.buffer[1] << 8;
      if (this.buffer.length == 0 || this.buffer.length < len) {
        return;
      }
      this.buffer.splice(0, 2);
      this.readPacket();
    });
    //Listen to and handle responses from the NXT
    this.bluetooth.bluetoothSerial.subscribeRawData().subscribe(data => {
      this.buffer.push(...Array.from(new Uint8Array(data)));
    });
    this.bluetooth.deviceConnect$.subscribe(() => {
      this.writePacket(true, StartProgram.createPacket(NxtConstants.MOTOR_PROGRAM));
    });

    this.uploadFile = this.packetEvent$
      .filter(packet => packet.id == DirectCommand.START_PROGRAM)
      .filter(packet => packet.status == DirectCommandResponse.OUT_OF_RANGE)
      .subscribe(this.missingFileHandler.bind(this));
  }

  readPacket() {
    let telegramType: number = this.buffer.shift();
    let messageType: number = this.buffer.shift();
    if (telegramType == TelegramType.REPLY) {
      //Look up this packet, and construct it from the available data.
      let packetCtor: new () => Packet = NxtConstants.COMMAND_MAP.get(messageType);
      let packet: Packet = new packetCtor();
      if (packet) {
        packet.readPacket(this.buffer);
        this.packetEvent$.next(packet);
      } else {
        console.log("Unknown packet id: " + messageType.toString(16));
      }
    }
  }

  private missingFileHandler() {
    this.uploadFile.unsubscribe();
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
            let file: NXTFile = new NXTFile(NxtConstants.MOTOR_PROGRAM);
            file.autoStart = true;
            this.writeFile(file);
          }
        }
      ]
    });
    alert.present();
  }


  /**
   * Write a file to the NXT device
   * @param {string} fileName the file to write
   * @param {boolean} autoStart if true, the file will be started on the NXT if it is a program once uploaded.
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
}
