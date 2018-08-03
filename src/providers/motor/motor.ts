import {Injectable} from '@angular/core';
import {NxtProvider} from "../nxt/nxt";
import {DirectCommand, NxtModel, OutputMode, OutputPort} from "../nxt/nxt.model";
import {ClassicMotorCommand} from "../nxt/packets/motorcontrol/classic-motor-command";
import {GetOutputState} from "../nxt/packets/direct/get-output-state";
import {Subscription} from "rxjs";
import {SetOutputState} from "../nxt/packets/direct/set-output-state";
import {ControlledMotorCommand} from "../nxt/packets/motorcontrol/controlled-motor-command";

/*
  Generated class for the MotorProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class MotorProvider {

  public motors: GetOutputState[] = [new GetOutputState(), new GetOutputState(), new GetOutputState()];
  private intervalId: number;
  private packetReciever: Subscription;

  constructor(public nxt: NxtProvider) {
    this.intervalId = setInterval(() => {
      this.nxt.writePacket(true, ...GetOutputState.createMultiple(OutputPort.A_B_C));
    }, 10);

    this.packetReciever = this.nxt.packetEvent$
      .filter(packet => packet.id == DirectCommand.GET_OUTPUT_STATE)
      .subscribe(this.motorUpdate.bind(this));
  }

  motorUpdate(packet: GetOutputState) {
    this.motors[packet.port] = packet;
  }

  public setMotorPower(ports: OutputPort, power: number) {
    this.nxt.writePacket(false, ClassicMotorCommand.createMotorPacket(ports, power, 0, false));
  }

  public rotateTowards(port: OutputPort, angle: number) {
    this.nxt.writePacket(false, SetOutputState.createPacket(NxtModel.outputToSystemOutput(port)[0],0,0,0,0,0,0));
    this.nxt.writePacket(false, ControlledMotorCommand.createMotorPacket(port, 100, this.motors[port].rotationCount,OutputMode.MOTOR_ON | OutputMode.BRAKE | OutputMode.REGULATED));
  }
}
