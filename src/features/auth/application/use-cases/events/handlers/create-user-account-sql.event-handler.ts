import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CreateUserAccountEvent } from '../create-user-account-event';
import { CreateUserSQLCommand } from '../../commands/create-user-sql.command';
import { validateOrRejectModel } from '../../../../../../infra/validators/validate-or-reject.model';

@EventsHandler(CreateUserAccountEvent)
export class CreateUserAccountEventHandler
  implements IEventHandler<CreateUserAccountEvent>
{
  constructor(private commandBus: CommandBus) {}
  async handle(event: CreateUserAccountEvent) {
    try {
      await validateOrRejectModel(event, CreateUserAccountEvent);

      const command = new CreateUserSQLCommand(event.userDto);
      await this.commandBus.execute(command);
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
