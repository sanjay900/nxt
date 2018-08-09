import {Injectable} from '@angular/core';
import {NxtProvider} from "../nxt/nxt";
import {
  DirectCommand,
  DirectCommandResponse,
  MultiOutputPort,
  NxtModel,
  OutputMode,
  OutputPort,
  OutputRegulationMode, OutputRunState,
  SingleOutputPort
} from "../nxt/nxt.model";
import {BluetoothProvider} from "../bluetooth/bluetooth";
import {MessageWrite} from "../nxt/packets/direct/message-write";
import {SetOutputState} from "../nxt/packets/direct/set-output-state";

@Injectable()
export class MotorProvider {
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

  constructor(public nxt: NxtProvider, public bluetooth: BluetoothProvider) {
    this.readConfigFromStorage();
    this.nxt.packetEvent$
      .filter(packet => packet.id == DirectCommand.START_PROGRAM)
      .filter(packet => packet.status == DirectCommandResponse.SUCCESS)
      .subscribe(() => {
        clearInterval(this.motorTimer);
        this.writeConfigToNXT();
        this.motorTimer = setInterval(() => {
          if (this.hasAngle) {
            this.hasAngle = false;
            this.nxt.writePacket(false, MessageWrite.createPacket(0, "A" +
              MotorProvider.numberToNXT(this.targetAngle) +
              MotorProvider.numberToNXT(this.power)));
          }
        }, 100);
      });
  }

  public static numberToNXT(number) {
    let start = number < 0 ? "-" : "0";
    number = Math.abs(number);
    return start + Array(Math.max(3 - String(number).length + 1, 0)).join('0') + number;
  }

  public setThrottle(power: number) {
    this.power = power;
  }

  public setSteering(angle: number) {
    this.targetAngle = angle;
    this.hasAngle = true;
  }

  public setAux(power: number) {
    if (this.auxiliaryPort && this.auxiliaryPort != "None") {
      this.nxt.writePacket(false, SetOutputState.createPacket(NxtModel.outputToSystemOutput(this.auxiliaryPort)[0], power, OutputMode.MOTOR_ON, OutputRegulationMode.IDLE, 0, OutputRunState.RUNNING, 0))
    }
  }

  public readConfigFromStorage() {
    this.steeringConfig = localStorage.getItem("steering.config") as SteeringConfig;
    this.steeringPort = localStorage.getItem("steering.steering") as SingleOutputPort;
    this.drivePorts = localStorage.getItem("steering.drive") as OutputPort;
    this.leftPort = localStorage.getItem("steering.left") as SingleOutputPort;
    this.rightPort = localStorage.getItem("steering.right") as SingleOutputPort;
    this.auxiliaryPort = localStorage.getItem("steering.aux") as SingleOutputPort | "None";
  }

  private writeConfigToNXT() {
    if (this.steeringConfig == SteeringConfig.TANK) {
      if (!this.rightPort || !this.leftPort) return;
      this.nxt.writePacket(false, MessageWrite.createPacket(0, "B" + SteeringConfig.TANK + this._leftPort + this._rightPort));
    } else if (this.steeringConfig == SteeringConfig.FRONT_STEERING) {
      if (!this.steeringPort || !this.drivePorts) return;
      this.nxt.writePacket(false, MessageWrite.createPacket(0, "B" + SteeringConfig.FRONT_STEERING + this._steeringPort + this._drivePorts));
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


  set steeringConfig(value: SteeringConfig) {
    this._steeringConfig = value;
    localStorage.setItem("steering.config", value);
    this.writeConfigToNXT();
  }

  set steeringPort(value: SingleOutputPort) {
    this._steeringPort = value;
    localStorage.setItem("steering.steering", value);
    if(!value) {
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
    if(!value) {
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
    if(!value) {
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
    if(!value) {
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
    if(!value) {
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

  private disableDriveConflicts(value: SingleOutputPort) {
    if (value == SingleOutputPort.A) {
      if (this._drivePorts == SingleOutputPort.A || MultiOutputPort.A_B || MultiOutputPort.A_B) {
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
}

export enum SteeringConfig {
  FRONT_STEERING = "0", TANK = "1"
}
