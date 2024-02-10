import { InputRegistrationCodeModel } from '../../../api/models/auth-input.models.ts/input-registration-code.model';

export class ConfirmEmailSqlCommand {
  constructor(public inputModel: InputRegistrationCodeModel) {}
}
