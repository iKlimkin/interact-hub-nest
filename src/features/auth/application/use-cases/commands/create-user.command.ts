import { InputUserModel } from '../../../../admin/api/models/create.userAdmin.model';

export class CreateUserCommand {
  constructor(public inputUserDto: InputUserModel) {}
}
