export enum ConnectionStatus {
  CONNECTED, CONNECTING, DISCONNECTED
}
export class ConnectionUpdate {
  readonly status: ConnectionStatus;
  readonly statusMessage: string;

  constructor(status: ConnectionStatus, statusMessage?: string) {
    this.status = status;
    this.statusMessage = statusMessage;
  }
}

export enum TelegramType {
  DIRECT_COMMAND_RESPONSE = 0x00,
  SYSTEM_COMMAND_RESPONSE = 0x01,
  REPLY = 0x02,
  DIRECT_COMMAND_NO_RESPONSE = 0x80,
  SYSTEM_COMMAND_NO_RESPONSE = 0x81
}
