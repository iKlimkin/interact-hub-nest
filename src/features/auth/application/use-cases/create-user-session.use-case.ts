import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { OutputId } from '../../../../domain/likes.types';
import { validateOrRejectModel } from '../../../../infra/validators/validate-or-reject.model';
import {
  Security,
  SecurityModelType,
} from '../../../security/domain/entities/security.schema';
import { SecurityRepository } from '../../../security/infrastructure/security.repository';
import { CreateSessionCommand } from './commands/create-session.command';

@CommandHandler(CreateSessionCommand)
export class CreateUserSessionUseCase
  implements ICommandHandler<CreateSessionCommand>
{
  constructor(
    @InjectModel(Security.name) private SecurityModel: SecurityModelType,
    private securityRepository: SecurityRepository,
  ) {}

  async execute(command: CreateSessionCommand): Promise<OutputId> {
    validateOrRejectModel(command, CreateSessionCommand);

    const sessionModel = this.SecurityModel.makeInstance(command.inputData);

    return this.securityRepository.addDeviceSession(sessionModel);
  }
}
