export class UserCreatedEvent {
  constructor(
    public email: string,
    public confirmationCode: string,
  ) {}
}
