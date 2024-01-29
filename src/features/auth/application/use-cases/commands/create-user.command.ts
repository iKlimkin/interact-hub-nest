import { InputUserModel } from '../../../../admin/api/models/create-user.model';

export class CreateUserCommand {
  constructor(public inputUserDto: InputUserModel) {}
}
