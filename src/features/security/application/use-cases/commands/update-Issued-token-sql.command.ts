export class UpdateIssuedTokenSqlCommand {
  constructor(
    public deviceId: string,
    public issuedAt: string,
  ) {}
}
