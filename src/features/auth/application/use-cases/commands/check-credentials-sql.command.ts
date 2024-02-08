import { InputCredentialsModel } from '../../../api/models/auth-input.models.ts/input-credentials.model';

export class CheckCredentialsSQLCommand {
  constructor(public inputData: InputCredentialsModel) {}
}
