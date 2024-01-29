import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { BcryptAdapter } from '../../../../infra/adapters/bcrypt-adapter';
import {
  UserAccount,
  UserAccountDocument,
  UserAccountModelType,
} from '../../../admin/domain/entities/userAccount.schema';
import { AuthUsersRepository } from '../../infrastructure/authUsers-repository';
import { CreateUserCommand } from './commands/create-user.command';
import { UserCreatedEvent } from './events/user-created-event';
import { validateOrRejectModel } from '../../../../infra/validators/validate-or-reject.model';

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    @InjectModel(UserAccount.name)
    private UserAccountModel: UserAccountModelType,
    private authUsersRepository: AuthUsersRepository,
    private bcryptAdapter: BcryptAdapter,
    private eventBus: EventBus,
  ) {}

  async execute(
    command: CreateUserCommand,
  ): Promise<UserAccountDocument | null> {
    const { email, login, password } = command.inputUserDto;
    try {
      validateOrRejectModel(command, CreateUserCommand);

      const { passwordSalt, passwordHash } =
        await this.bcryptAdapter.createHash(password);

      const smartUserModel = this.UserAccountModel.makeInstance({
        login,
        email,
        passwordHash,
        passwordSalt,
      });

      const user = await this.authUsersRepository.save(smartUserModel);

      const event = new UserCreatedEvent(
        email,
        user.emailConfirmation.confirmationCode,
      );

      this.eventBus.publish(event);

      return user;
    } catch (e) {
      console.error(`Error during user registration: ${e.message}`);
      return null;
    }
  }
}
