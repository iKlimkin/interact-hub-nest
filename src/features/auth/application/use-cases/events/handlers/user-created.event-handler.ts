import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EmailNotificationEvent } from '../email-notification-event';
import { EmailManager } from '../../../../../../infra/application/managers/email-manager';

@EventsHandler(EmailNotificationEvent)
export class UserCreatedEventHandler
  implements IEventHandler<EmailNotificationEvent>
{
  constructor(private emailManager: EmailManager) {}
  handle(event: EmailNotificationEvent) {
    this.emailManager.sendEmailConfirmationMessage(
      event.email,
      event.confirmationCode,
    );
  }
}
