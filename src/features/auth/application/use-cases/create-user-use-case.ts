import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { BcryptAdapter } from '../../../../infra/adapters/bcrypt-adapter';
import { EmailManager } from '../../../../infra/application/managers/email-manager';
import { InputUserModel } from '../../../admin/api/models/create.userAdmin.model';
import {
    UserAccount,
    UserAccountDocument,
    UserAccountModelType,
} from '../../../admin/domain/entities/userAccount.schema';
import { AuthRepository } from '../../infrastructure/authUsers-repository';

export class CreateUserCommand {
  constructor(public inputUserDto: InputUserModel) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    @InjectModel(UserAccount.name)
    private UserAccountModel: UserAccountModelType,
    private authUsersRepository: AuthRepository,
    private bcryptAdapter: BcryptAdapter,
    private emailManager: EmailManager,
  ) {}

  async execute(
    command: CreateUserCommand,
  ): Promise<UserAccountDocument | null> {
    const { email, login, password } = command.inputUserDto;

    const { passwordSalt, passwordHash } =
      await this.bcryptAdapter.createHash(password);

    const foundUserByEmail = await this.authUsersRepository.findByLoginOrEmail({
      email,
    });

    if (foundUserByEmail) return null;

    const smartUserModel = this.UserAccountModel.makeInstance({
      login,
      email,
      passwordHash,
      passwordSalt,
    });

    const result = await this.authUsersRepository.save(smartUserModel);

    try {
      if (result)
        this.emailManager.sendEmailConfirmationMessage(
          email,
          result.emailConfirmation.confirmationCode,
        );
    } catch (error) {
      await this.authUsersRepository.deleteUser(smartUserModel.id);
      return null;
    }

    return result;
  }
}
