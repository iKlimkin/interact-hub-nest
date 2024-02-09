import { InputUserModel } from '../../../../admin/api/models/create-user.model';

export class CreateUserSQLCommand {
  constructor(public inputUserDto: InputUserModel) {}
}
