import { UserAccountViewModel } from "../../../api/models/auth.output.models/auth.output.models";

export class UpdateConfirmationCodeCommand {
  constructor(public inputModel: UserAccountViewModel) {}
}
