import { InputSessionDataValidator } from "../../../api/models/security-input.models/create-session.model";

export class CreateUserSessionCommand {
    constructor(public inputData: InputSessionDataValidator) {}
  }