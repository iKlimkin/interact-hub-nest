import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BcryptAdapter } from '../../../../infra/adapters/bcrypt-adapter';
import { validateOrRejectModel } from '../../../../infra/validators/validate-or-reject.model';
import { AuthUsersSqlRepository } from '../../infrastructure/auth-users.sql-repository';
import { UpdatePasswordSqlCommand } from './commands/update-password.command';

@CommandHandler(UpdatePasswordSqlCommand)
export class UpdatePasswordSqlUseCase
  implements ICommandHandler<UpdatePasswordSqlCommand>
{
  constructor(
    private authUsersSqlRepository: AuthUsersSqlRepository,
    private bcryptAdapter: BcryptAdapter,
  ) {}

  async execute(command: UpdatePasswordSqlCommand): Promise<boolean> {
    await validateOrRejectModel(command, UpdatePasswordSqlCommand);

    const { recoveryCode, newPassword } = command.inputData;

    const { passwordHash, passwordSalt } = await this.bcryptAdapter.createHash(
      newPassword,
    );

    return this.authUsersSqlRepository.updateUserPassword({
      passwordSalt,
      passwordHash,
      recoveryCode,
    });
  }
}
