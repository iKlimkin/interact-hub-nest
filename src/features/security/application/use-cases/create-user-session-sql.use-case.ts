import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OutputId } from '../../../../domain/likes.types';
import { validateOrRejectModel } from '../../../../infra/validators/validate-or-reject.model';
import { SecuritySQLRepository } from '../../infrastructure/security.sql-repository';
import { CreateSessionSQLCommand } from './commands/create-session.sql-command';
import { UserSQLSessionDTO } from '../../api/models/security.view.models/security.view.types';

@CommandHandler(CreateSessionSQLCommand)
export class CreateUserSessionSQLUseCase
  implements ICommandHandler<CreateSessionSQLCommand>
{
  constructor(private securitySQLRepository: SecuritySQLRepository) {}

  async execute(command: CreateSessionSQLCommand): Promise<OutputId | null> {
    await validateOrRejectModel(command, CreateSessionSQLCommand);

    const { ip, browser, deviceType, refreshToken, userId, userPayload } =
      command.inputData;

    const sessionDto: UserSQLSessionDTO = {
      ip,
      title: `Device type: ${deviceType}, Application: ${browser}`,
      userId,
      deviceId: userPayload.deviceId,
      refresh_token: refreshToken,
      rt_issued_at: new Date(userPayload.iat! * 1000),
      rt_expiration_date: new Date(userPayload.exp! * 1000),
    };

    return this.securitySQLRepository.save(sessionDto);
  }
}
