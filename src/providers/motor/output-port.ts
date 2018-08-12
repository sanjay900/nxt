export type OutputPort = SingleOutputPort | MultiOutputPort;

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

export enum SystemOutputPort {
  A = 0x00,
  B = 0x01,
  C = 0x02,
  ALL = 0xFF
}

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
