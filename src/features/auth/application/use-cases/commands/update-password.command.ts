import { InputRecoveryPassModel } from "../../../api/models/auth-input.models.ts/input-recovery.model";

export class UpdatePasswordForExistingAccountCommand {
  constructor(public inputData: InputRecoveryPassModel) {}
}
