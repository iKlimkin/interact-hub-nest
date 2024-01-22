import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { OutputId } from '../../../../infra/likes.types';
import { validateOrRejectModel } from '../../../../infra/validators/validate-model.helper';
import {
  Security,
  SecurityModelType,
} from '../../domain/entities/security.schema';
import { SecurityRepository } from '../../infrastructure/security.repository';
import { CreateUserSessionCommand } from './commands/create-session.command';

@CommandHandler(CreateUserSessionCommand)
export class CreateUserSessionUseCase
  implements ICommandHandler<CreateUserSessionCommand>
{
  constructor(
    @InjectModel(Security.name) private SecurityModel: SecurityModelType,
    private securityRepository: SecurityRepository,
  ) {}

  async execute(command: CreateUserSessionCommand): Promise<OutputId> {
    validateOrRejectModel(command, CreateUserSessionCommand);

    const sessionModel = this.SecurityModel.makeInstance(command.inputData);

    return this.securityRepository.addDeviceSession(sessionModel);
  }
}
