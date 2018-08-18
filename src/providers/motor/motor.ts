import {Injectable} from "@angular/core";
import {NxtPacketProvider} from "../nxt/nxt-packet";
import {BluetoothProvider, ConnectionStatus} from "../bluetooth/bluetooth";
import {AlertController, ModalController} from "ionic-angular";
import {DirectCommand} from "../nxt/packets/direct-command";
import {DirectCommandResponse} from "../nxt/packets/direct-command-response";
import {MessageWrite} from "../nxt/packets/direct/message-write";
import {StartProgram} from "../nxt/packets/direct/start-program";
import {SetOutputState} from "../nxt/packets/direct/set-output-state";
import {NXTFile} from "../nxt/nxt-file";
import {File} from "@ionic-native/file";
import {
  MultiOutputPort,
  OutputMode,
  OutputPort,
  OutputRegulationMode,
  OutputRunState,
  SingleOutputPort,
  SteeringConfig,
  SystemOutputPortUtils
} from "./motor-constants";

@Injectable()
export class MotorProvider {
  private static MOTOR_PROGRAM: string = "SteeringControl.rxe";
  private targetAngle: number = 0;
  private hasAngle: boolean = false;
  private power: number = 0;
  private motorTimer: number = 0;
  private _xFlip: number = 1;
  private _yFlip: number = 1;
  private _aFlip: number = 1;
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

  constructor(public bluetooth: BluetoothProvider, private alertCtrl: AlertController, private file: File, private modalController: ModalController, public nxt: NxtPacketProvider) {
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
    power *= this._yFlip;
    this.power = Math.round(power);
  }

  public setSteering(angle: number) {
    angle = Math.min(1, angle);
    angle = Math.max(-1, angle);
    angle *= this._xFlip;
    this.targetAngle = Math.round(angle * this._steeringAngle);
    this.hasAngle = true;
  }

  public setAux(power: number) {
    if (this.auxiliaryPort && this.auxiliaryPort != "None") {
      this.nxt.writePacket(false, SetOutputState.createPacket(
        SystemOutputPortUtils.fromOutputPort(this.auxiliaryPort)[0],
        Math.round(power * this._aFlip), OutputMode.MOTOR_ON,
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
    this._xFlip = Number.parseFloat(localStorage.getItem("steering.xDirection") || "1");
    this._yFlip = Number.parseFloat(localStorage.getItem("steering.yDirection") || "1");
    this._aFlip = Number.parseFloat(localStorage.getItem("steering.auxDirection") || "1");
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

  get xFlip(): boolean {
    return this._xFlip == -1;
  }

  get yFlip(): boolean {
    return this._yFlip == -1;
  }

  get aFlip(): boolean {
    return this._aFlip == -1;
  }

  set xFlip(value: boolean) {
    this._xFlip = value ? -1 : 1;
  }

  set yFlip(value: boolean) {
    this._yFlip = value ? -1 : 1;
  }

  set aFlip(value: boolean) {
    this._aFlip = value ? -1 : 1;
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


