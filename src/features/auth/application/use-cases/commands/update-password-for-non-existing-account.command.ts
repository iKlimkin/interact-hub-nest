import { InputRecoveryPassModel } from "../../../api/models/auth-input.models.ts/input-recovery.model";

export class UpdatePasswordForNonExistAccountCommand {
    constructor(public inputDto: InputRecoveryPassModel) {}
}
