import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { BcryptAdapter } from '../../../../infra/adapters/bcrypt-adapter';
import { LayerNoticeInterceptor } from '../../../../infra/utils/interlayer-error-handler.ts/error-layer-interceptor';
import { CreateUserErrors } from '../../../../infra/utils/interlayer-error-handler.ts/user-errors';
import { UsersSQLRepository } from '../../infrastructure/users.sql-repository';
import { CreateUserResultData } from '../user.admins.service';
import { CreateSACommand } from './commands/create-sa.command';
import { validateOrRejectModel } from '../../../../infra/validators/validate-or-reject.model';
import { UsersSQLDto } from '../../../auth/api/models/auth.output.models/auth-sql.output.models';
import { UserAccountsTORRepo } from '../../infrastructure/users.typeorm-repo';

@CommandHandler(CreateSACommand)
export class CreateSAUseCase implements ICommandHandler<CreateSACommand> {
  constructor(
    private usersSQLRepository: UsersSQLRepository,
    private bcryptAdapter: BcryptAdapter,
    private userAccountsRepo: UserAccountsTORRepo
  ) {}

  async execute(
    command: CreateSACommand,
  ): Promise<LayerNoticeInterceptor<CreateUserResultData>> {
    await validateOrRejectModel(command, CreateSACommand);

    const { email, login, password } = command.saDTO;

    let notice = new LayerNoticeInterceptor<CreateUserResultData>();

    const { passwordSalt, passwordHash } = await this.bcryptAdapter.createHash(
      password,
    );

    const userAdminSQLDto: UsersSQLDto = {
      login,
      email,
      password_salt: passwordSalt,
      password_hash: passwordHash,
      confirmation_code: uuidv4(),
      confirmation_expiration_date: add(new Date(), { hours: 1, minutes: 15 }),
      is_confirmed: true,
    };

    const userAdminId = await this.userAccountsRepo.createUser(userAdminSQLDto);

    if (!userAdminId) {
      notice.addError(
        'Could not create sa',
        'db',
        CreateUserErrors.DatabaseFail,
      );
    } else {
      notice.addData({ userId: userAdminId.userId });
    }

    return notice;
  }
}
