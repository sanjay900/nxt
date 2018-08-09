import {Injectable} from '@angular/core';
import {NxtProvider} from "../nxt/nxt";
import {ConnectionStatus, DirectCommand, DirectCommandResponse, OutputPort} from "../nxt/nxt.model";
import {BluetoothProvider} from "../bluetooth/bluetooth";
import {MessageWrite} from "../nxt/packets/direct/message-write";

@Injectable()
export class MotorProvider {
  private targetAngle: number = 0;
  private hasAngle: boolean = false;
  private power: number = 0;
  private motorTimer: number = 0;

  public static padDigits(number, digits) {
    let start = number < 0? "-":"0";
    number = Math.abs(number);
    return start+Array(Math.max(digits - String(number).length + 1, 0)).join('0') + number;
  }

  constructor(public nxt: NxtProvider, public bluetooth: BluetoothProvider) {
    this.nxt.packetEvent$
      .filter(packet => packet.id == DirectCommand.START_PROGRAM)
      .filter(packet => packet.status == DirectCommandResponse.SUCCESS)
      .subscribe(()=>{
        clearInterval(this.motorTimer);
        this.writeTankSteeringConfig(OutputPort.B, OutputPort.C);
        this.motorTimer = setInterval(() => {
          this.nxt.writePacket(false, MessageWrite.createPacket(0, "A" +
            MotorProvider.padDigits(this.targetAngle, 3) +
            MotorProvider.padDigits(this.power,3)));
        }, 100);
      });
  }

  public setMotorPower(ports: OutputPort, power: number) {
    this.power = power;
  }

  public rotateTowards(port: OutputPort, angle: number) {
    this.targetAngle = angle;
    this.hasAngle = true;
  }

  public writeTankSteeringConfig(leftPort: OutputPort, rightPort: OutputPort) {
    //A = writeMotor (FRONT,DRIVE) | (LEFT,RIGHT)
    //B = writeConfig (0,FRONT,DRIVE) | (1,LEFT,RIGHT)
    if (leftPort > OutputPort.C || rightPort > OutputPort.C) {
      console.log("This command only accepts a single drive motor");
      return;
    }
    this.nxt.writePacket(false, MessageWrite.createPacket(0, "B" + SteeringConfig.TANK + leftPort + rightPort));
  }

  public writeFrontSteeringConfig(steeringPort: OutputPort, drivePorts: OutputPort) {
    //A = writeMotor (STEERING,POWER)
    //B = writeConfig (0,FRONT,DRIVE) | (1,LEFT,RIGHT)
    if (steeringPort > OutputPort.C) {
      console.log("This command only accepts a single steering motor");
      return;
    }
    this.nxt.writePacket(false, MessageWrite.createPacket(0, "B" + SteeringConfig.FRONT_STEERING + steeringPort + drivePorts));
  }
}

export enum SteeringConfig {
  FRONT_STEERING = "0", TANK = "1"
}
