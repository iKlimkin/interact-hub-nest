import { InputRecoveryPassModel } from '../../../api/models/auth-input.models.ts/input-recovery.model';

export class UpdatePasswordSqlCommand {
  constructor(public inputData: InputRecoveryPassModel) {}
}
