import { UsersResponseModel } from "../../../api/models/auth.output.models/auth.output.models";

export class UpdateConfirmationCodeSqlCommand {
  constructor(public inputModel: UsersResponseModel) {}
}
