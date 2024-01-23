export class UpdateIssuedTokenCommand {
  constructor(
    public deviceId: string,
    public issuedAt: string,
  ) {}
}
