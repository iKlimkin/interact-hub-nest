import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OutputId } from '../../../../domain/likes.types';
import { validateOrRejectModel } from '../../../../infra/validators/validate-or-reject.model';
import { SecuritySqlRepository } from '../../infrastructure/security.sql-repository';
import { CreateSessionSQLCommand } from './commands/create-session.sql-command';
import { UserSqlSessionDTO } from '../../api/models/security.view.models/security.sql-view.types';

@CommandHandler(CreateSessionSQLCommand)
export class CreateUserSessionSQLUseCase
  implements ICommandHandler<CreateSessionSQLCommand>
{
  constructor(private securitySQLRepository: SecuritySqlRepository) {}

  async execute(command: CreateSessionSQLCommand): Promise<OutputId | null> {
    await validateOrRejectModel(command, CreateSessionSQLCommand);

    const { ip, browser, deviceType, refreshToken, userId, userPayload } =
      command.inputData;

    const sessionDto: UserSqlSessionDTO = {
      ip,
      user_agent_info: `Device type: ${deviceType}, Application: ${browser}`,
      user_id: userId,
      device_id: userPayload.deviceId,
      refresh_token: refreshToken,
      rt_issued_at: new Date(userPayload.iat! * 1000),
      rt_expiration_date: new Date(userPayload.exp! * 1000),
    };

    return this.securitySQLRepository.save(sessionDto);
  }
}
