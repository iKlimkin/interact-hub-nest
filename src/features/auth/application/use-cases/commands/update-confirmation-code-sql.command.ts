import { UserAccount } from '../../../../admin/domain/entities/user-account.entity';
import { UsersResponseModel } from '../../../api/models/auth.output.models/auth-sql.output.models';
import { UserAccountViewModel } from '../../../api/models/auth.output.models/auth.output.models';

export class UpdateConfirmationCodeSqlCommand {
  constructor(public inputModel: UserAccountViewModel) {}
}
