export class UpdateIssuedTokenSqlCommand {
  constructor(
    public deviceId: string,
    public issuedAt: Date,
    public expirationDate: Date,
  ) {}
}
