import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OutputId } from '../../../../domain/likes.types';
import { validateOrRejectModel } from '../../../../infra/validators/validate-or-reject.model';
import { UserSessionDto } from '../../../auth/api/models/user-account.sql.dto';
import { SecuritySqlRepository } from '../../infrastructure/security.sql-repository';
import { CreateSessionSQLCommand } from './commands/create-session.sql-command';
import { SecurityTORRepository } from '../../infrastructure/security.tor-repository';

@CommandHandler(CreateSessionSQLCommand)
export class CreateUserSessionSQLUseCase
  implements ICommandHandler<CreateSessionSQLCommand>
{
  constructor(
    private securitySQLRepository: SecuritySqlRepository,
    private securityRepo: SecurityTORRepository
    ) {}

  async execute(command: CreateSessionSQLCommand): Promise<OutputId | null> {
    await validateOrRejectModel(command, CreateSessionSQLCommand);

    const { ip, browser, deviceType, refreshToken, userId, userPayload } =
      command.inputData;

    const sessionDto = new UserSessionDto(
      ip,
      `Device type: ${deviceType}, Application: ${browser}`,
      userId,
      userPayload,
      refreshToken,
    );

    return this.securityRepo.save(sessionDto);
  }
}
