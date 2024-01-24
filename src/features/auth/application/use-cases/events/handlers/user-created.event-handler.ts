import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserCreatedEvent } from '../user-created-event';
import { EmailManager } from '../../../../../../infra/application/managers/email-manager';

@EventsHandler(UserCreatedEvent)
export class UserCreatedEventHandler
  implements IEventHandler<UserCreatedEvent>
{
  constructor(private emailManager: EmailManager) {}
  handle(event: UserCreatedEvent) {
    this.emailManager
      .sendEmailConfirmationMessage(event.email, event.confirmationCode)
  }
}
