import {Injectable} from '@angular/core';
import {NxtPacketProvider} from "../nxt/nxt-packet";
import {BluetoothProvider, ConnectionStatus} from "../bluetooth/bluetooth";
import {MessageWrite} from "../nxt/packets/direct/message-write";
import {SetOutputState} from "../nxt/packets/direct/set-output-state";
import {StartProgram} from "../nxt/packets/direct/start-program";
import {AlertController, ModalController} from "ionic-angular";
import {NXTFile} from "../nxt/nxt-file";
import {DirectCommand} from "../nxt/packets/direct-command";
import {DirectCommandResponse} from "../nxt/packets/direct-command-response";
import {File} from "@ionic-native/file";

@Injectable()
export class MotorProvider {
  private static MOTOR_PROGRAM: string = "SteeringControl.rxe";
  private targetAngle: number = 0;
  private hasAngle: boolean = false;
  private power: number = 0;
  private motorTimer: number = 0;
  private _steeringConfig: SteeringConfig;
  private _steeringPort: SingleOutputPort;
  private _drivePorts: OutputPort;
  private _leftPort: SingleOutputPort;
  private _rightPort: SingleOutputPort;
  private _auxiliaryPort: SingleOutputPort | "None";
  private _steeringAngle: number;
  private static CONFIG_PACKET_ID = "B";
  private static DRIVE_PACKET_ID = "A";
  private static PACKET_MAILBOX = 0;
  //Angle specified by the instructions for the robot this is designed to control
  private static DEFAULT_ANGLE = "42";

  constructor(public nxt: NxtPacketProvider, public bluetooth: BluetoothProvider, private alertCtrl: AlertController, private file: File, private modalController: ModalController) {
    this.readConfigFromStorage();
    this.bluetooth.deviceStatus$
      .filter(status => status.status == ConnectionStatus.CONNECTED)
      .subscribe(this.startMotorProgram.bind(this));
    this.nxt.packetEvent$
      .filter(packet => packet.id == DirectCommand.START_PROGRAM)
      .filter(packet => packet.status == DirectCommandResponse.OUT_OF_RANGE)
      .subscribe(this.missingFileHandler.bind(this));
    this.nxt.packetEvent$
      .filter(packet => packet.id == DirectCommand.START_PROGRAM)
      .filter(packet => packet.status == DirectCommandResponse.SUCCESS)
      .subscribe(() => {
        this.writeConfigToNXT();
        clearInterval(this.motorTimer);
        this.motorTimer = setInterval(() => {
          //If the motors are misconfigured, reset the positions and kill the motors.
          if (this.steeringConfig == SteeringConfig.TANK &&
            !MotorProvider.portAssigned(this.leftPort) &&
            !MotorProvider.portAssigned(this.rightPort)) {
            this.targetAngle = 0;
            this.power = 0;
          } else if (this.steeringConfig == SteeringConfig.FRONT_STEERING &&
            !MotorProvider.portAssigned(this.drivePorts) &&
            !MotorProvider.portAssigned(this.steeringPort)) {
            this.targetAngle = 0;
            this.power = 0;
          }
          if (this.hasAngle) {
            this.hasAngle = false;
            this.nxt.writePacket(false, MessageWrite.createPacket(
              MotorProvider.PACKET_MAILBOX,
              MotorProvider.DRIVE_PACKET_ID +
              MotorProvider.numberToNXT(this.targetAngle) +
              MotorProvider.numberToNXT(this.power)));
          }
        }, 100);
      });
  }

  public startMotorProgram() {
    this.nxt.writePacket(true, StartProgram.createPacket(MotorProvider.MOTOR_PROGRAM));
  }

  public static numberToNXT(number) {
    let start = number < 0 ? "-" : "0";
    number = Math.abs(number);
    return start + Array(Math.max(3 - String(number).length + 1, 0)).join('0') + number;
  }

  public setThrottle(power: number) {
    this.power = Math.round(power);
  }

  public setSteering(angle: number) {
    angle = Math.min(1, angle);
    angle = Math.max(-1, angle);
    this.targetAngle = Math.round(angle * this._steeringAngle);
    this.hasAngle = true;
  }

  public setAux(power: number) {
    if (this.auxiliaryPort && this.auxiliaryPort != "None") {
      this.nxt.writePacket(false, SetOutputState.createPacket(
        SystemOutputPortUtils.fromOutputPort(this.auxiliaryPort)[0],
        Math.round(power), OutputMode.MOTOR_ON,
        OutputRegulationMode.IDLE,
        0, OutputRunState.RUNNING,
        0)
      );
    }
  }

  public readConfigFromStorage() {
    this._steeringConfig = localStorage.getItem("steering.config") as SteeringConfig;
    this._steeringPort = localStorage.getItem("steering.steering") as SingleOutputPort;
    let drivePorts = localStorage.getItem("steering.drive");
    this._drivePorts = drivePorts as SingleOutputPort || drivePorts as MultiOutputPort;
    this._leftPort = localStorage.getItem("steering.left") as SingleOutputPort;
    this._rightPort = localStorage.getItem("steering.right") as SingleOutputPort;
    this._auxiliaryPort = localStorage.getItem("steering.aux") as SingleOutputPort | "None";
    this._steeringAngle = Number.parseFloat(localStorage.getItem("steering.angle") || MotorProvider.DEFAULT_ANGLE);
  }

  private writeConfigToNXT() {
    //Note that writing a malformed configuration will result in the program crashing, so this needs to be avoided.
    if (this.steeringConfig == SteeringConfig.TANK && MotorProvider.portAssigned(this.leftPort) && MotorProvider.portAssigned(this.rightPort)) {
      this.nxt.writePacket(false, MessageWrite.createPacket(
        MotorProvider.PACKET_MAILBOX,
        MotorProvider.CONFIG_PACKET_ID +
        this._steeringConfig +
        this._leftPort +
        this._rightPort
      ));
    } else if (this.steeringConfig == SteeringConfig.FRONT_STEERING && MotorProvider.portAssigned(this.steeringPort) && MotorProvider.portAssigned(this.drivePorts)) {
      this.nxt.writePacket(false, MessageWrite.createPacket(
        MotorProvider.PACKET_MAILBOX,
        MotorProvider.CONFIG_PACKET_ID +
        this._steeringConfig +
        this._steeringPort +
        this._drivePorts
      ));
    }
  }

  get steeringConfig(): SteeringConfig {
    return this._steeringConfig;
  }

  get steeringPort(): SingleOutputPort {
    return this._steeringPort;
  }

  get drivePorts(): OutputPort {
    return this._drivePorts;
  }

  get leftPort(): SingleOutputPort {
    return this._leftPort;
  }

  get rightPort(): SingleOutputPort {
    return this._rightPort;
  }

  get auxiliaryPort(): SingleOutputPort | "None" {
    return this._auxiliaryPort;
  }

  get steeringAngle(): number {
    return this._steeringAngle;
  }

  set steeringAngle(value: number) {
    this._steeringAngle = Math.min(360, Math.max(0, value));
    localStorage.setItem("steering.angle", this._steeringAngle + "");
  }

  set steeringConfig(value: SteeringConfig) {
    this._steeringConfig = value;
    localStorage.setItem("steering.config", value);
    this.writeConfigToNXT();
  }

  set steeringPort(value: SingleOutputPort) {
    this._steeringPort = value;
    localStorage.setItem("steering.steering", value);
    if (!value) {
      return;
    }
    if (this._auxiliaryPort == value) {
      this.auxiliaryPort = null;
    }
    this.disableDriveConflicts(value);
    this.writeConfigToNXT();
  }

  set drivePorts(value: OutputPort) {
    this._drivePorts = value;
    localStorage.setItem("steering.drive", value);
    if (!value) {
      return;
    }
    if (value == MultiOutputPort.A_B || value == MultiOutputPort.A_C) {
      if (this._steeringPort == SingleOutputPort.A) {
        this.steeringPort = null;
      }
      if (this._auxiliaryPort == SingleOutputPort.A) {
        this.auxiliaryPort = null;
      }
    }
    if (value == MultiOutputPort.A_B || value == MultiOutputPort.B_C) {
      if (this._steeringPort == SingleOutputPort.B) {
        this.steeringPort = null;
      }
      if (this._auxiliaryPort == SingleOutputPort.B) {
        this.auxiliaryPort = null;
      }
    }
    if (value == MultiOutputPort.B_C || value == MultiOutputPort.A_C) {
      if (this._steeringPort == SingleOutputPort.C) {
        this.steeringPort = null;
      }
      if (this._auxiliaryPort == SingleOutputPort.C) {
        this.auxiliaryPort = null;
      }
    }
    this.writeConfigToNXT();
  }

  set leftPort(value: SingleOutputPort) {
    this._leftPort = value;
    localStorage.setItem("steering.left", value);
    if (!value) {
      return;
    }
    if (this._rightPort == value) {
      this.rightPort = null;
    }
    if (this._auxiliaryPort == value) {
      this.auxiliaryPort = null;
    }
    this.writeConfigToNXT();
  }

  set rightPort(value: SingleOutputPort) {
    this._rightPort = value;
    localStorage.setItem("steering.right", value);
    if (!value) {
      return;
    }
    if (this._leftPort == value) {
      this.leftPort = null;
    }
    if (this._auxiliaryPort == value) {
      this.auxiliaryPort = null;
    }
    this.writeConfigToNXT();
  }

  set auxiliaryPort(value: SingleOutputPort | "None") {
    this._auxiliaryPort = value;
    localStorage.setItem("steering.aux", value);
    if (!value) {
      return;
    }
    if (this._leftPort == value) {
      this.leftPort = null;
    }
    if (this._rightPort == value) {
      this.rightPort = null;
    }
    if (this._steeringPort == value) {
      this.steeringPort = null;
    }
    if (value != "None") {
      this.disableDriveConflicts(value);
    }
    this.writeConfigToNXT();
  }

  /**
   * Check if a set port conflicts with any of the drive ports
   * If it does, clear the drive ports
   * @param value the port to check
   */
  private disableDriveConflicts(value: SingleOutputPort) {
    if (value == SingleOutputPort.A) {
      if (this._drivePorts == SingleOutputPort.A || MultiOutputPort.A_B || MultiOutputPort.A_C) {
        this.drivePorts = null;
      }
    }
    if (value == SingleOutputPort.B) {
      if (this._drivePorts == SingleOutputPort.B || MultiOutputPort.A_B || MultiOutputPort.B_C) {
        this.drivePorts = null;
      }
    }
    if (value == SingleOutputPort.C) {
      if (this._drivePorts == SingleOutputPort.C || MultiOutputPort.A_C || MultiOutputPort.B_C) {
        this.drivePorts = null;
      }
    }
  }

  /**
   * Since we use localStorage, we have to deal with the fact that port can be null, "null" or undefined.
   * @param port the port to check
   */
  private static portAssigned(port: string) {
    return port && port != "null";
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
            let file: NXTFile = new NXTFile(MotorProvider.MOTOR_PROGRAM, this.nxt, this.file);
            file.autoStart = true;
            file.readFromFileSystem().then(() => {
              let uploadModal = this.modalController.create("file-upload", {file: file});
              uploadModal.present();
            }, console.log);
          }
        }
      ]
    });
    alert.present();
  }

}

export enum SteeringConfig {
  FRONT_STEERING = "0", TANK = "1"
}

export enum SystemOutputPort {
  A = 0x00,
  B = 0x01,
  C = 0x02,
  ALL = 0xFF
}


export enum OutputRegulationMode {
  IDLE = 0x00,
  MOTOR_SPEED = 0x01,
  MOTOR_SYNC = 0x02
}

export enum OutputMode {
  MOTOR_ON = 0x01,
  BRAKE = 0x02,
  REGULATED = 0x04
}

export enum MultiOutputPort {
  A_B = "4",
  A_C = "5",
  B_C = "6",
  A_B_C = "7"
}

export enum SingleOutputPort {
  A = "1",
  B = "2",
  C = "3"
}

export type OutputPort = SingleOutputPort | MultiOutputPort;

export class SystemOutputPortUtils {
  static fromOutputPort(port: OutputPort): SystemOutputPort[] {
    let ports: SystemOutputPort[] = [];
    if (port == SingleOutputPort.A || port == MultiOutputPort.A_B || port == MultiOutputPort.A_C || port == MultiOutputPort.A_B_C) {
      ports.push(SystemOutputPort.A);
    }
    if (port == SingleOutputPort.B || port == MultiOutputPort.A_B || port == MultiOutputPort.B_C || port == MultiOutputPort.A_B_C) {
      ports.push(SystemOutputPort.B);
    }
    if (port == SingleOutputPort.C || port == MultiOutputPort.A_C || port == MultiOutputPort.B_C || port == MultiOutputPort.A_B_C) {
      ports.push(SystemOutputPort.C);
    }
    return ports;
  }
}

export enum OutputRunState {
  IDLE = 0x00,
  RAMP_UP = 0x10,
  RUNNING = 0x20,
  RAMP_DOWN = 0x40
}
