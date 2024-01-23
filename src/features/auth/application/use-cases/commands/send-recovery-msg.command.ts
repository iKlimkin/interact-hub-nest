export class SendRecoveryMsgCommand {
  constructor(public inputData: { email: string; recoveryCode: string }) {}
}
