import { InputRecoveryEmailModel } from '../../../api/models/auth-input.models.ts/input-password-rec.type';

export class PasswordRecoverySqlCommand {
  constructor(public inputData: InputRecoveryEmailModel) {}
}
