import { InputRegistrationCodeModel } from '../../../api/models/auth-input.models.ts/input-registration-code.model';

export class ConfirmEmailCommand {
  constructor(public inputModel: InputRegistrationCodeModel) {}
}
