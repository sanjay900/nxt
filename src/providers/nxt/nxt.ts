import {Injectable, NgZone} from '@angular/core';
import {BluetoothProvider} from "../bluetooth/bluetooth";
import {File} from '@ionic-native/file';
import {AlertController, ModalController} from 'ionic-angular';
import {
  DirectCommand,
  DirectCommandResponse, InputSensorMode,
  InputSensorType,
  NxtConstants,
  NXTFile,
  TelegramType
} from "./nxt-constants";
import {Packet} from "./packets/packet";
import {StartProgram} from "./packets/direct/start-program";
import {Subject, Subscription} from "rxjs";
import {SetInputMode} from "./packets/direct/set-input-mode";
import {LsRead} from "./packets/direct/ls-read";
import {LsWrite} from "./packets/direct/ls-write";
import {LsGetStatus} from "./packets/direct/ls-get-status";


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
      while (this.buffer.length > len+2) {
        this.buffer.splice(0, 2);
        this.readPacket(this.buffer.splice(0, len));
        len = this.buffer[0] | this.buffer[1] << 8;
      }
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
    this.packetEvent$.subscribe(console.log);
    // this.writePacket(true, SetInputMode.createPacket(0, InputSensorType.LOW_SPEED, InputSensorMode.RAW));
    this.writePacket(true, LsWrite.createPacket(0, [0x02, 0x41, 0x02], 0));
    setTimeout(()=>{
      this.writePacket(true, LsWrite.createPacket(0, [0x02, 0x42], 1));
      setInterval(()=>{
        this.writePacket(true, LsGetStatus.createPacket(0));
      },100)
    },100);
  }

  readPacket(data: number[]) {
    let telegramType: number = data.shift();
    let messageType: number = data.shift();
    if (telegramType == TelegramType.REPLY) {
      //Look up this packet, and construct it from the available data.
      let packetCtor: new () => Packet = NxtConstants.COMMAND_MAP.get(messageType);
      let packet: Packet = new packetCtor();
      if (packet) {
        packet.readPacket(data);
        //Emit events inside the angular thread so things update correctly
        this.zone.run(()=>{
          this.packetEvent$.next(packet);
        });
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
      console.log(packet);
      console.log(new Uint8Array(packet.writePacket(expectResponse)));
      this.bluetooth.write(new Uint8Array(packet.writePacket(expectResponse)));
    }
  }
}
