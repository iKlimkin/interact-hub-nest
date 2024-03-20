import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { BcryptAdapter } from '../../../../infra/adapters/bcrypt-adapter';
import { LayerNoticeInterceptor } from '../../../../infra/utils/interlayer-error-handler.ts/error-layer-interceptor';
import { CreateUserErrors } from '../../../../infra/utils/interlayer-error-handler.ts/user-errors';
import { validateOrRejectModel } from '../../../../infra/validators/validate-or-reject.model';
import { CreateUserResultData } from '../../../admin/application/user.admins.service';
import { UsersSQLRepository } from '../../../admin/infrastructure/users.sql-repository';
import { CreateUserSQLCommand } from './commands/create-user-sql.command';
import { EmailNotificationEvent } from './events/email-notification-event';
import { UsersSQLDto } from '../../api/models/auth.output.models/auth-sql.output.models';
import { UserAccountsRepo } from '../../../admin/infrastructure/users.typeorm-repo';

@CommandHandler(CreateUserSQLCommand)
export class CreateUserSQLUseCase
  implements ICommandHandler<CreateUserSQLCommand>
{
  constructor(
    private usersSQLRepository: UsersSQLRepository,
    private userAccountsRepo: UserAccountsRepo,
    private bcryptAdapter: BcryptAdapter,
    private eventBus: EventBus,
  ) {}

  async execute(
    command: CreateUserSQLCommand,
  ): Promise<LayerNoticeInterceptor<CreateUserResultData> | null> {
    const { email, login, password } = command.inputUserDto;
    try {
      const notice = new LayerNoticeInterceptor<CreateUserResultData>();

      await validateOrRejectModel(command, CreateUserSQLCommand);

      const { passwordSalt, passwordHash } =
        await this.bcryptAdapter.createHash(password);

      const userDto: UsersSQLDto = {
        login,
        email,
        password_salt: passwordSalt,
        password_hash: passwordHash,
        confirmation_code: uuidv4(),
        confirmation_expiration_date: add(new Date(), {
          hours: 1,
          minutes: 15,
        }),
        is_confirmed: false,
      };

      const result = await this.userAccountsRepo.createUser(userDto);

      if (!result) {
        notice.addError(
          'Could not create user',
          'db',
          CreateUserErrors.DatabaseFail,
        );
      } else {
        notice.addData({ userId: result.userId });
      }

      const event = new EmailNotificationEvent(
        email,
        userDto.confirmation_code,
      );

      this.eventBus.publish(event);

      return notice;
    } catch (e) {
      console.error(`Error during user registration: ${e.message}`);
      return null;
    }
  }
}
