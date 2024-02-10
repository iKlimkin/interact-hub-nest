import { InputRecoveryPassModel } from "../../../api/models/auth-input.models.ts/input-recovery.model";

export class UpdatePasswordTemporaryAccountSqlCommand {
    constructor(public inputDto: InputRecoveryPassModel) {}
}
