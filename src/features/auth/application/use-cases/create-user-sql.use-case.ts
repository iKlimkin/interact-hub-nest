import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { BcryptAdapter } from '../../../../infra/adapters/bcrypt-adapter';
import { LayerNoticeInterceptor } from '../../../../infra/utils/error-layer-interceptor';
import { CreateUserErrors } from '../../../../infra/utils/interlayer-error-handler.ts/user-errors';
import { validateOrRejectModel } from '../../../../infra/validators/validate-or-reject.model';
import { CreateUserResultData } from '../../../admin/application/user.admins.service';
import { UsersSQLRepository } from '../../../admin/infrastructure/users.sql-repository';
import { UsersSQLDto } from '../../api/models/auth.output.models/auth.output.models';
import { CreateUserSQLCommand } from './commands/create-user-sql.command copy';
import { EmailNotificationEvent } from './events/user-created-event';

@CommandHandler(CreateUserSQLCommand)
export class CreateUserSQLUseCase
  implements ICommandHandler<CreateUserSQLCommand>
{
  constructor(
    private usersSQLRepository: UsersSQLRepository,
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
        passwordSalt,
        passwordHash,
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), { hours: 1, minutes: 15 }),
        isConfirmed: false,
      };

      const result = await this.usersSQLRepository.save(userDto);

      if (!result) {
        notice.addError(
          'Could not create user',
          'db',
          CreateUserErrors.DatabaseFail,
        );
      } else {
        notice.addData({ userId: result.userId });
      }

      const event = new EmailNotificationEvent(email, userDto.confirmationCode);

      this.eventBus.publish(event);

      return notice;
    } catch (e) {
      console.error(`Error during user registration: ${e.message}`);
      return null;
    }
  }
}
