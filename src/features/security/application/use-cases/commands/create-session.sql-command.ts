import { InputSessionDataValidator } from '../../../api/models/security-input.models/create-session.model';

export class CreateSessionSQLCommand {
  constructor(public inputData: InputSessionDataValidator) {}
}
