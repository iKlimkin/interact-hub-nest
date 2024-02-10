import { InputUserModel } from "../../../../admin/api/models/create-user.model";

export class CreateUserAccountEvent {
  constructor(
    public userDto: InputUserModel
  ) {}
}

